package database

import (
	"basai/config"
	"fmt"
	"log"
	"sync"
)

var (
	Collections MongoCollections
	initialized bool
	initMutex   sync.Mutex
	IsTestMode  bool // New flag to indicate test mode
)

// InitializeComponents initializes all database components
func InitializeComponents() error {
	// initMutex.Lock()
	// defer initMutex.Unlock()

	if initialized {
		return nil
	}

	if IsTestMode {
		return initializeTestComponents()
	}

	return initializeProductionComponents()
}

// InitializeComponents initializes all database components
// Returns an error if initialization fails
func initializeProductionComponents() error {
	initMutex.Lock()
	defer initMutex.Unlock()

	if initialized {
		return nil // Already initialized
	}

	log.Println("⌛ Starting Basketfy AI Backend Server...")
	var _ = &Collections
	// Load configuration
	var _ = &config.ConfigApplication{}
	dbName := config.AppConfig.DBName
	dbConnURL := config.AppConfig.DBConnURL

	// Initialize MongoDB
	if err := initializeMongoDB(dbName, dbConnURL); err != nil {
		return fmt.Errorf("failed to initialize MongoDB: %v", err)
	}

	initialized = true
	return nil
}

// initializeMongoDB sets up MongoDB collections and client
func initializeMongoDB(dbName, dbConnURL string) error {
	db, dbClient := initializeDatabase(dbConnURL, dbName)

	Collections.Baskets = db.Collection("baskets")
	Collections.UserBaskets = db.Collection("userbasket")
	Collections.ChatMemory = db.Collection("chatmemory")
	Collections.LongTermMemory = db.Collection("longtermmemory")
	Collections.NotePad = db.Collection("notepad")
	Collections.Users = db.Collection("users")
	Collections.UserHistory = db.Collection("userhistory")
	Collections.Mu.Lock()
	Collections.client = dbClient
	Collections.Mu.Unlock()

	return nil
}

func initializeTestComponents() error {
	// Initialize with test configuration
	testConfig := config.ConfigApplication{
		DBName:       "test_db",
		DBConnURL:    config.AppConfig.DBConnURL,
		GeminiAPIKey: "efghjk-hgfdfg-fgh",
	}

	// Set the global config for tests
	config.AppConfig = testConfig

	// Initialize test MongoDB connection
	if err := initializeMongoDB(testConfig.DBName, testConfig.DBConnURL); err != nil {
		return err
	}

	initialized = true
	return nil
}

// TestSetup is a helper function for tests
func TestSetup() error {
	IsTestMode = true
	return InitializeComponents()
}

// TestTeardown cleans up after tests
func TestTeardown() {
	initMutex.Lock()
	defer initMutex.Unlock()

	// Clean up test resources
	if Collections.client != nil {
		Collections.client.Disconnect(nil)
	}

	initialized = false
	IsTestMode = false
}
