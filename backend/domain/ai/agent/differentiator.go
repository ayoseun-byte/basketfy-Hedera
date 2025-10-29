package agent

import (
	"strings"

	"sync"
)

// StreamType represents the type of stream being processed
type StreamType int

const (
	Unknown StreamType = iota
	ToolCallType
	StreamAnswer
)

var (
	maxBufferSize   int  = 10
	firstToolhandle bool = false
)

const (
	toolCallKey = `"action":`
	// toolCallKeyAlt    = `"action": "`
	// toolCallKeyAlt2   = `\n"action":"`
	// toolCallKeyAlt3   = `\n"action": "`
	messageStartEvent = "event: message_start"
)

// StreamProcessor handles the processing of incoming stream data
type StreamProcessor struct {
	buffer     []string
	streamType StreamType
	content    strings.Builder
	mu         sync.Mutex
	toolFound  bool
}

// NewStreamProcessor creates a new StreamProcessor instance
func NewStreamProcessor() *StreamProcessor {
	return &StreamProcessor{
		buffer:     make([]string, 0, maxBufferSize),
		streamType: Unknown,
	}
}

// determineStreamType analyzes the buffer to determine the stream type
func (p *StreamProcessor) determineStreamType(model string) {
	if p.streamType != Unknown {
		return
	}

	// Adjust the maxBufferSize for the "gemini" model because the Gemini GenAI library
	// handles chunking differently compared to OpenAI. In OpenAI, the 10th stream token
	// length typically appears in the 10th stream, whereas in Gemini, it appears in the
	// 1st stream. Therefore, we set maxBufferSize to 1 for Gemini to accommodate this
	// difference in token distribution.

	bufferContent := strings.Join(p.buffer, "")

	p.mu.Lock()
	defer p.mu.Unlock()

	maxBufferSize = 4

	if strings.Contains(bufferContent, toolCallKey) {
		p.streamType = ToolCallType
		p.toolFound = true

	} else if len(p.buffer) > maxBufferSize {
		p.toolFound = false
		p.streamType = StreamAnswer

	}

}


// setupSSEStream initializes and returns an SSE stream channel
func setupSSEStream(buffer []string, remainingStream chan string) chan string {
	sseChannel := make(chan string)

	go func() {
		defer close(sseChannel)

		// Send initial SSE event
		sseChannel <- messageStartEvent

		// Send buffered content
		for _, msg := range buffer {
			sseChannel <- toRawStringLiteral(msg)
		}

		// Stream remaining content
		for msg := range remainingStream {
			sseChannel <- toRawStringLiteral(msg)
		}
	}()

	return sseChannel
}

// ProcessStream processes a stream of messages and determines the type of stream being processed.
//
// Parameters:
//   - streamChan: A channel of strings representing the incoming stream of messages to be processed.
//
// Returns:
//   - A channel of strings for SSE streaming if the stream type is determined to be StreamAnswer.
//   - A string containing the processed content if the stream type is determined to be ToolCall.
//   - A boolean indicating whether the stream was a ToolCall and has been completed.
//   - An error if any issues occur during processing, otherwise nil.
//
// The function initializes a StreamProcessor to handle the incoming messages. It buffers messages
// and determines the stream type by checking for specific tags or buffer size. If the stream type
// is ToolCall, it processes the message and checks for completion. If the stream type is StreamAnswer,
// it sets up an SSE stream channel to handle the buffered and remaining messages.
func ProcessStream(streamChan chan string, model string) (chan string, string, bool, error) {
	processor := NewStreamProcessor()

	for msg := range streamChan {

		if processor.streamType == Unknown {
			processor.buffer = append(processor.buffer, msg)
			processor.determineStreamType(model)
			// println("msg >>> ",msg)
			processor.content.WriteString(msg)
		}

		switch processor.streamType {
		case ToolCallType:

			if strings.Contains(processor.content.String(), msg) == false {
				processor.content.WriteString(msg)
			}
			// Ensure we only return when a valid JSON structure (likely) ends
			if strings.HasSuffix(processor.content.String(), "}}") {
				return nil, strings.ReplaceAll(processor.content.String(), `"":"`, `"`), true, nil
			}
			continue
		case StreamAnswer:
			return setupSSEStream(processor.buffer, streamChan), "", false, nil
		}
	}

	return nil, "", false, nil
}

func toRawStringLiteral(s string) string {
	replacer := strings.NewReplacer(
		// `\`, `\\`,
		"\n", `\n`,
		// "\r", `\r`,
		// "\t", `\t`,
		// `"`, `\"`,
	)
	return replacer.Replace(s)
}
