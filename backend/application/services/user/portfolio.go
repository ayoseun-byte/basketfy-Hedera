package services

import (
	"basai/api/models"
	"basai/domain/portfolio"
	"basai/infrastructure/database"
	"basai/infrastructure/trading"
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

const USDC_SOL = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

func CreateUserBuyBasketService(ctx context.Context, buyBasketDataModel models.BuyBasketRequest) (interface{}, error) {
	var (
		service          trading.PriceService = &trading.Client{}
		swap             trading.SwapService  = &trading.Client{}
		totalWeightValue float64
		priceData        struct {
			Solana struct {
				Usd float64 `json:"usd"`
			} `json:"solana"`
		}
	)

	basketImage := "https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png"
	if buyBasketDataModel.BasketData.Image != "" {
		basketImage = buyBasketDataModel.BasketData.Image
	}

	// Initialize TokenInfo slice
	tokenInfos := make([]portfolio.TokenInfo, 0, len(buyBasketDataModel.BasketData.Tokens))

	for _, tokenItem := range buyBasketDataModel.BasketData.Tokens {
		if tokenItem.EntryPrice == 0.0 {

			resp, err := service.GetOKXPriceWithFallback(tokenItem.TokenAddress)
			if err != nil {
				return nil, err
			}
			respData, err := json.Marshal(resp)
			if err != nil {
				return nil, err
			}

			err = json.Unmarshal(respData, &priceData)
			if err != nil {
				return nil, err
			}
			tokenItem.EntryPrice = priceData.Solana.Usd
		}
		tokenAmount := buyBasketDataModel.BasketData.InvestmentAmount / tokenItem.Weight

		qp := []trading.QuoteParams{{
			Amount:            fmt.Sprintf("%f", tokenAmount),
			FromTokenAddress:  USDC_SOL, // usdt
			ToTokenAddress:    tokenItem.TokenAddress,
			UserWalletAddress: buyBasketDataModel.UserId,
		}}
		resp, err := swap.OKXSwapToken(qp)
		if err != nil {
			return nil, err
		}
		swapRespData, err := json.Marshal(resp)
		if err != nil {
			return nil, err
		}
		print(swapRespData)
		tokenInfos = append(tokenInfos, portfolio.TokenInfo{
			Name:         tokenItem.Token,
			Symbol:       tokenItem.TokenSymbol,
			Amount:       tokenAmount,
			EntryPrice:   tokenItem.EntryPrice,
			Description:  tokenItem.Description,
			Weight:       tokenItem.Weight,
			ClosingPrice: tokenItem.EntryPrice,
			IsNative:     tokenItem.IsNative,
			TokenAddress: tokenItem.TokenAddress,
		})

		totalWeightValue += tokenItem.Weight
	}

	// Construct a single BasketInvestment entry
	basketInvestment := portfolio.BasketInvestment{
		BasketName:             buyBasketDataModel.BasketData.BasketName,
		BasketReferenceId:      buyBasketDataModel.BasketData.BasketReferenceId,
		TokenInfo:              tokenInfos,
		Description:            buyBasketDataModel.BasketData.Description,
		TotalRebalanceSessions: 0,
		TotalWeight:            float64(totalWeightValue),
		Image:                  basketImage,
		Category:               buyBasketDataModel.BasketData.Category,
		CreatedAt:              time.Now(),
		UpdatedAt:              time.Now(),
	}

	collection := database.Collections.UserBaskets
	filter := bson.M{"userId": buyBasketDataModel.UserId}

	// Check for existing user
	var existing portfolio.UserBasket
	err := collection.FindOne(ctx, filter).Decode(&existing)

	if err == mongo.ErrNoDocuments {
		// User doesn't exist → create new document
		newUserBasket := portfolio.UserBasket{
			UserId:            buyBasketDataModel.UserId,
			BasketInvestments: []portfolio.BasketInvestment{basketInvestment},
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		}

		insertRes, insertErr := collection.InsertOne(ctx, newUserBasket)
		if insertErr != nil {
			return nil, insertErr
		}
		return insertRes, nil

	} else if err != nil {
		// Other unexpected error
		return nil, err
	}

	// User exists → push to BasketInvestments
	update := bson.M{
		"$push": bson.M{"basketInvestments": basketInvestment},
		"$set":  bson.M{"updatedAt": time.Now()},
	}
	updateRes, updateErr := collection.UpdateOne(ctx, filter, update)
	if updateErr != nil {
		return nil, updateErr
	}

	return updateRes, nil
}

func CreateBasketService(ctx context.Context, basketModel models.CreateBasketRequest) (*mongo.InsertOneResult, error) {
	// Map basketModel to Basket
	basket := portfolio.BasketCatalogue{
		ID:                uuid.New().String()[:9],
		BasketReferenceId: basketModel.BasketReferenceId,
		Tokens:            make([]portfolio.BasketToken, len(basketModel.Tokens)),
		Description:       basketModel.Description,
		Name:              basketModel.Name,
		Image:             basketModel.Image,
		Creator:           basketModel.Creator,
		UserId:            basketModel.UserId,
		Category:          basketModel.Category,
		URI:               basketModel.URI,
		Symbol:            basketModel.Symbol,
		Address:           basketModel.Address,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}
	for i, tokenInfo := range basketModel.Tokens {
		basket.Tokens[i] = portfolio.BasketToken{
			Name:         tokenInfo.Name,
			Ticker:       tokenInfo.Ticker,
			Price:        tokenInfo.Price,
			Weight:       tokenInfo.Weight,
			IsNative:     tokenInfo.IsNative,
			TokenAddress: tokenInfo.TokenAddress,
		}
	}

	res, err := database.Collections.Baskets.InsertOne(ctx, basket)

	return res, err
}

func GetUserBasketByIdService(ctx context.Context, userBasketDataModel models.UserBasketRequest) (*portfolio.UserBasket, error) {

	// Create filter criteria for the database query
	filter := bson.M{"user_id": userBasketDataModel.UserId, "basketInvestments.basketReferenceId": userBasketDataModel.BasketId}

	var basket portfolio.UserBasket
	err := database.Collections.UserBaskets.FindOne(ctx, filter).Decode(&basket)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("basket with ID %s not found", userBasketDataModel.UserId)
		}
		return nil, err
	}

	return &basket, nil
}

func GetAllUserBasketsByIdService(ctx context.Context, limit int64, userId string) ([]portfolio.UserBasket, error) {

	// Create filter criteria for the database query
	filter := bson.M{"user_id": userId}
	findOptions := options.Find().SetLimit(limit)
	cursor, err := database.Collections.UserBaskets.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var baskets []portfolio.UserBasket
	if err := cursor.All(ctx, &baskets); err != nil {
		return nil, err
	}
	return baskets, nil
}

func GetAllBasketService(ctx context.Context, assignDataModel models.Allbasket) ([]portfolio.BasketCatalogue, error) {
	limit := assignDataModel.Limit

	findOptions := options.Find().SetLimit(limit)
	cursor, err := database.Collections.Baskets.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var baskets []portfolio.BasketCatalogue
	if err := cursor.All(ctx, &baskets); err != nil {
		return nil, err
	}
	return baskets, nil
}

func GetBasketByIdService(ctx context.Context, basketId string) (*portfolio.BasketCatalogue, error) {
	// Assuming Collections.Baskets is the MongoDB collection for baskets
	filter := bson.M{"id": basketId}

	var basket portfolio.BasketCatalogue
	err := database.Collections.Baskets.FindOne(ctx, filter).Decode(&basket)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("basket with ID %s not found", basketId)
		}
		return nil, err
	}

	return &basket, nil
}

// UpdateUserBasketToken updates the token amount and weight in a user's basket by token address and user ID.
func UpdateUserBasketToken(ctx context.Context, userId string, tokenAddress string, newAmount float64, newWeight float64) error {
	filter := bson.M{
		"user_id":                               userId,
		"basketInvestments.tokens.tokenAddress": tokenAddress,
	}

	update := bson.M{
		"$set": bson.M{
			"basketInvestments.tokens.$.amount": newAmount,
			"basketInvestments.tokens.$.weight": newWeight,
		},
	}

	result, err := database.Collections.UserBaskets.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return fmt.Errorf("no user basket found for user_id %s with token_address %s", userId, tokenAddress)
	}
	return nil
}

func GetAllUserBasketsTransactionsByIdService(ctx context.Context, limit int64, userId string) ([]portfolio.UserBasket, error) {

	// Create filter criteria for the database query
	filter := bson.M{"user_id": userId}
	findOptions := options.Find().SetLimit(limit)
	cursor, err := database.Collections.UserBaskets.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var baskets []portfolio.UserBasket
	if err := cursor.All(ctx, &baskets); err != nil {
		return nil, err
	}
	return baskets, nil
}
