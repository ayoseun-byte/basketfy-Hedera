package database

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"sync"
)

type MongoCollections struct {
	Baskets        *mongo.Collection
	UserBaskets    *mongo.Collection
	ChatMemory     *mongo.Collection
	LongTermMemory *mongo.Collection
	NotePad        *mongo.Collection
	Users          *mongo.Collection
	UserHistory    *mongo.Collection
	Mu             sync.RWMutex
	client         *mongo.Client
}

func initializeDatabase(dbConnectionString, dbName string) (*mongo.Database, *mongo.Client) {
	// Set up the MongoDB connection URL

	// Connect to the MongoDB database
	ctx := context.Background()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbConnectionString))
	if err != nil {
		log.Fatal(err)
	}
	// Ping the primary
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal(err)
	} else {
		log.Println("⚡️💾 \033[1;32mDatabase ::Connected\033[0m")
	}

	// Get a handle to the database and create collections
	db := client.Database(dbName)
	_ = db.CreateCollection(ctx, "userbasket", nil)
	_ = db.CreateCollection(ctx, "baskets", nil)
	_ = db.CreateCollection(ctx, "chatmemory", nil)
	_ = db.CreateCollection(ctx, "longtermmemory", nil)
	_ = db.CreateCollection(ctx, "notepad", nil)
	_ = db.CreateCollection(ctx, "users", nil)
	_ = db.CreateCollection(ctx, "userhistory", nil)

	return db, client
}
