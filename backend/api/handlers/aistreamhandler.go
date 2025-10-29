package handlers

import (
	"basai/api/models"
	"basai/application/services"
	"basai/config"
	agent "basai/domain/ai/agent"
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/go-playground/validator"
	"github.com/labstack/echo/v4"
)

type PortfolioToken struct {
	Name         string  `json:"name"`
	Ticker       string  `json:"ticker"`
	TokenAddress string `json:"tokenAddress"`
	ClosingPrice float64 `json:"closing_price"`
	Quantity     float64 `json:"quantity"`
	TargetWeight float64 `json:"target_weight"`
}

// Helper function to send end events
func sendEndEvents(w http.ResponseWriter, flusher http.Flusher) error {
	if _, err := fmt.Fprint(w, message_end_event); err != nil {
		return err
	}

	if _, err := fmt.Fprint(w, end_stream_event); err != nil {
		return err
	}
	flusher.Flush()

	return nil
}


func rebalanceProcessing(c echo.Context, w http.ResponseWriter, flusher http.Flusher, rebalanceDataModel models.UserBasketRequest, sb, answerSb *strings.Builder, verbose bool) error {
	requestCtx := c.Request().Context() // Context for cancellation
		// done channel for this function's select, separate from requestCtx.Done()
		// but requestCtx.Done() will be used by goroutines.
		// clientDisconnected := requestCtx.Done()
	streamProcessingFinished := make(chan bool)      // Signals sseChannel loop completion
	feedbackGoroutineDone := make(chan struct{}) // Signals feedback goroutine has completed all its writes
	rebalanceResultStreamGoroutineDone := make(chan struct{}) // Signals answer stream goroutine has completed all its writes

	// Initialize feedback struct with channel
	feedbackStruct := &agent.FeedbackStruct{
		IsFeedback:   true,
		FeedbackChan: make(chan string, 1), // Buffered
	}
	// Start a goroutine to handle feedback
	go func() {
		defer close(feedbackGoroutineDone)
		// It's crucial that the feedback goroutine also respects requestCtx.Done() to avoid writing to a closed connection if the client disconnects.
		for {
			select {
			case <-requestCtx.Done():
				log.Println("Feedback goroutine: client disconnected.")
				return
			case feedback, ok := <-feedbackStruct.FeedbackChan:
				if !ok { // Channel closed
					return
				}
				if feedback != "" {
					if _, err := fmt.Fprint(w, tool_feedback_event); err != nil {
						log.Printf("Error sending feedback: %v", err)
						return
					}
					if _, err := fmt.Fprintf(w, "data: %s\n\n", feedback); err != nil {
						log.Printf("Error sending feedback data: %v", err)
						return
					}
					flusher.Flush()
				}
			}
		}
	}()

	agentSynapse := agent.Synapse{
		UserId:     rebalanceDataModel.UserId,
		UserPrompt: "Begin!",
		TimeZone:   "Africa/Lagos, UTC+1",
	}
	llmProvider := []string{"gemini", "gemini-1.5-pro"}

	// Use rebalanceDataModel.BasketDataId to get token array from collections.UserBasket
	basketData, err := services.GetUserBasketByIdService(c.Request().Context(), rebalanceDataModel)

	if err != nil {
		// Flush an SSE error event to the client if basket retrieval fails
		if _, streamErr := fmt.Fprintf(w, error_event); streamErr != nil {
			return streamErr
		}
		flusher.Flush()
		if _, err := fmt.Fprint(w,"\ndata: Failed to retrieve basket: "+err.Error()+"\n\n"); err == nil {
			return err
		}
		flusher.Flush()
	}
	tokenData := basketData.BasketInvestments[0].TokenInfo
	// Map tokenData (slice of map[string]interface{}) to []portfolioToken
	var portfolioTokens []PortfolioToken
	for _, t := range tokenData {
		pt := PortfolioToken{}
		pt.Name = t.Name
		pt.Ticker = t.Symbol
		pt.ClosingPrice = t.ClosingPrice
		pt.Quantity = t.Quantity
		pt.TargetWeight = t.Weight
		pt.TokenAddress = t.TokenAddress
		portfolioTokens = append(portfolioTokens, pt)
	}

	sseChannel, sseChannelError := agent.RebalancerAgentStream(requestCtx, agentSynapse, llmProvider, portfolioTokens, feedbackStruct, verbose)
	if sseChannelError != nil {
		// Log the error
		log.Println(sseChannelError.Error())
		// Flush an SSE error event to the client if basket retrieval fails
		if _, streamErr := fmt.Fprintf(w, error_event); streamErr != nil {
			return streamErr
		}
		flusher.Flush()
		// Send error response to the client
		if _, err := fmt.Fprint(w, "\ndata: SSE channel error occurred\n\n"+err.Error()); err != nil {
			log.Printf("Error sending SSE channel error: %v", err)
		}
		flusher.Flush()
		close(streamProcessingFinished) // Signal that sseChannel won't produce data
		// Close the response writer
		return sseChannelError
	}

	// Goroutine to handle the main answer stream
	go func() {
		defer close(streamProcessingFinished)
		defer close(rebalanceResultStreamGoroutineDone)
		// Wait for feedback to be processed before starting message stream
		<-feedbackGoroutineDone

		for msg := range sseChannel {

			if strings.Contains(msg, message_start_event_marker) {
				// Handle the message_start event
				_, err := fmt.Fprint(w, message_start_event)
				if err != nil {
					return
				}
				if flusher == nil {
					log.Println("flusher is nil already")
				}
				flusher.Flush()
				continue
			}
			sb.WriteString(msg)

			answerSb.WriteString(msg)
			_, err := fmt.Fprintf(w, "data: %s\n\n", strings.TrimSuffix(strings.TrimSuffix(answerSb.String(), "\\n\\n\\n"), `","`))
			if err != nil {
				log.Printf("Error sending main stream data: %v", err)
				return
			}
			flusher.Flush()
		}
	}()

	// Wait for either completion or disconnection
	select {
	case <-requestCtx.Done():
		// Wait for goroutines to acknowledge shutdown, preventing premature return
		<-feedbackGoroutineDone
		<-rebalanceResultStreamGoroutineDone
		// "Main handler: Goroutines cleaned up after disconnect."
		return requestCtx.Err() // Return context error (e.g., context.Canceled)
	case <-streamProcessingFinished:
		// Wait for both goroutines to complete all their writes and exit.
		<-feedbackGoroutineDone
		<-rebalanceResultStreamGoroutineDone
		// "Main handler: All stream processing goroutines finished."

		// Handle end events
		if err := sendEndEvents(w, flusher); err != nil {
			return err
		}
		answerSb.Reset()
		sb.Reset()
		return nil
	}
	
}

// GenerateStreamingResponse godoc
// @Summary      Generate streaming AI response
// @Description  Streams an AI-generated response for a user's basket rebalance request.
// @Tags         AI
// @Accept       json
// @Produce      text/event-stream
// @Param        request body models.UserBasketRequest true "User basket rebalance request"
// @Success      200  {string} models.RebalanceResponse "Streamed AI response"
// @Failure      400  {object} map[string]interface{} "Invalid request payload"
// @Failure      500  {object} map[string]interface{} "Internal server error"
// @Router       /rebalance-ai-stream [post]
func GenerateStreamingResponse(c echo.Context) error {
	var (
		// Create a new chat struct
		rebalanceDataModel models.UserBasketRequest
		sb                 strings.Builder
		answerSb           strings.Builder
		verbose            bool
	)

	if config.AppConfig.Env != "production" && config.AppConfig.Env != "staging" {
		verbose = true
	}
	// Create a new validator
	v := validator.New()

	// Parse the request payload and map it to the rebalanceDataModel struct
	if err := c.Bind(&rebalanceDataModel); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": "Failed to bind request payload: " + err.Error()})
	}

	// Validate the user data
	if err := v.Struct(&rebalanceDataModel); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"error": err.Error() + " validation failed"})
	}

	// Get the response writer *once*
	w := c.Response().Writer // Get the underlying http.ResponseWriter
	flusher, ok := w.(http.Flusher)
	if !ok {
		// This should not happen with Echo's default response writer, but good to check
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": "Streaming not supported, Streaming not supported"})
	}

	c.Response().Header().Set("Content-Type", "text/event-stream")
	c.Response().Header().Set("Cache-Control", "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")
	c.Response().Header().Set("Transfer-Encoding", "chunked")
	c.Response().WriteHeader(http.StatusOK)

	// Send initial message
	if _, streamErr := fmt.Fprintf(w, start_stream_event); streamErr != nil {
		return streamErr
	}
	flusher.Flush()

	// Handle the message_start event
	if _, err := fmt.Fprint(w, boot_feedback_event); err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Start async feedback goroutine
	if w != nil {
		go func(ctx context.Context) {
			feedbacks := []string{
				"Initializing intelligent rebalancing engine... Gathering portfolio data and market context.",
				"Initializing intelligent rebalancing engine... Scanning token weights and historical performance.",
				"Initializing intelligent rebalancing engine... Connecting to market intelligence feeds.",
				"Initializing intelligent rebalancing engine... Syncing pricing data and volatility metrics.",
			}
			sent := 0

			// First delay: 420 milliseconds
			select {
			case <-ctx.Done():
				return
			case <-time.After(420 * time.Millisecond):
				msg := feedbacks[rand.Intn(len(feedbacks))]
				fmt.Fprintf(w, "data: %s\n\n", msg)
				flusher.Flush()
				sent++
			}

		}(ctx)

	}

	return rebalanceProcessing(c, w, flusher, rebalanceDataModel, &sb, &answerSb, verbose)

}
