package services

import (
	"basai/domain/portfolio"
	"basai/infrastructure/database"
	"context"
	"fmt"
	models "basai/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func FetchAnalyticsDataService(ctx context.Context, userBasketDataModel models.UserBasketRequest) (*portfolio.UserBasket, error) {

	// Create filter criteria for the database query
	filter := bson.M{"user_id": userBasketDataModel.UserId,"basketInvestments.basketReferenceId": userBasketDataModel.BasketId}

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
