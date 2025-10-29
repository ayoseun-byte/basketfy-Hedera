package config

import (
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"os"
	"path"
	"path/filepath"
	"runtime"
)

// Config stores the application configuration from environment variables
type ConfigApplication struct {
	Env                string
	APIKey             string
	PORT               string
	GeminiAPIKey       string
	DBName             string
	DBConnURL          string
	OKXURL             string
	PRICEURL           string
	OKXSecret          string
	OKXAPIKey          string // Added OKXAPIKey
	OKXPassphrase      string // Added OKXPassphrase
	JWTSecret          string
	OKXProjectID       string
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURI  string
	// Hedera Config
	HederaOperatorID  string
	HederaOperatorKey string
	HederaNetwork     string
	MirrorNodeURL     string

	// Contract IDs
	FactoryContractID string
	AuditTopicID      string
}

var AppConfig ConfigApplication

// findRootDir finds the project root directory by looking for go.mod
func findRootDir() (string, error) {
	// Get the directory of the current file
	_, filename, _, _ := runtime.Caller(0)
	currentDir := path.Dir(filename)

	// Walk up until we find go.mod
	for {
		if _, err := os.Stat(filepath.Join(currentDir, "go.mod")); err == nil {
			return currentDir, nil
		}

		parentDir := filepath.Dir(currentDir)
		if parentDir == currentDir {
			return "", fmt.Errorf("could not find project root (no go.mod found)")
		}
		currentDir = parentDir
	}
}

// init function is used to initialize the application configuration.
// It loads environment variables from .env files located at different paths.
// The function iterates over the paths and loads the first .env file it finds.
// If it fails to load an .env file from any of the paths, it logs a fatal error.
// After successfully loading the .env file, it assigns the environment variables to the AppConfig struct.
func init() {
	// Find project root and load .env
	rootDir, err := findRootDir()
	if err != nil {
		log.Fatal(err)
	}

	var (
		present bool
	)
	err = godotenv.Load(filepath.Join(rootDir, ".env"))
	if err != nil {
		log.Fatal(err)
	}

	AppConfig.Env, present = os.LookupEnv("GO_ENV")
	if !present {
		panic("GO_ENV environment variable is not set")
	}

	AppConfig.PORT, present = os.LookupEnv("GO_PORT")
	if !present {
		panic("GO_PORT environment variable is not set")
	}

	AppConfig.APIKey, present = os.LookupEnv("API_KEY") // Load API_KEY
	if !present {
		panic("API_KEY environment variable is not set")
	}

	AppConfig.OKXURL, present = os.LookupEnv("OKX_URL") // Load OKXURL
	if !present {
		panic("OKXURL environment variable is not set")
	}

	AppConfig.OKXSecret, present = os.LookupEnv("OKX_API_SECRET") // Load OKXSecret
	if !present {
		panic("OKXSecret environment variable is not set")
	}

	AppConfig.OKXAPIKey, present = os.LookupEnv("OKX_API_KEY") // Load OKXAPIKey
	if !present {
		panic("OKX_API_KEY environment variable is not set")
	}

	AppConfig.OKXPassphrase, present = os.LookupEnv("OKX_PASSPHRASE") // Load OKXPassphrase
	if !present {
		panic("OKX_PASSPHRASE environment variable is not set")
	}

	AppConfig.OKXProjectID, present = os.LookupEnv("OKX_API_PROJECT_ID") // Load OKXProjectID
	if !present {
		panic("OKX_ProjectID environment variable is not set")
	}

	AppConfig.PRICEURL, present = os.LookupEnv("PRICE_URL") // Load OKXURL
	if !present {
		panic("PRICEURL environment variable is not set")
	}

	AppConfig.DBName, present = os.LookupEnv("DB_NAME")
	if !present {
		panic("DB_NAME environment variable is not set")
	}

	AppConfig.DBConnURL, present = os.LookupEnv("DB_CONN_URL")
	if !present {
		panic("DB_CONN_URL environment variable is not set")
	}
	AppConfig.GeminiAPIKey, present = os.LookupEnv("GEMINI_API_KEY")
	if !present {
		panic("GEMINI_API_KEY environment variable is not set")
	}
	AppConfig.JWTSecret, present = os.LookupEnv("JWT_SECRET")
	if !present {
		panic("JWT_SECRET environment variable is not set")
	}
	AppConfig.GoogleClientID, present = os.LookupEnv("GOOGLE_CLIENT_ID")
	if !present {
		panic("GOOGLE_CLIENT_ID environment variable is not set")
	}
	AppConfig.GoogleClientSecret, present = os.LookupEnv("GOOGLE_CLIENT_SECRET")
	if !present {
		panic("GOOGLE_CLIENT_SECRET environment variable is not set")
	}
	AppConfig.GoogleRedirectURI, present = os.LookupEnv("GOOGLE_REDIRECT_URI")
	if !present {
		panic("GOOGLE_REDIRECT_URI environment variable is not set")
	}
	AppConfig.HederaOperatorID, present = os.LookupEnv("HEDERA_OPERATOR_ID")
	if !present {
		panic("HEDERA_OPERATOR_ID environment variable is not set")
	}
	AppConfig.HederaOperatorKey, present = os.LookupEnv("HEDERA_OPERATOR_KEY")
	if !present {
		panic("HEDERA_OPERATOR_KEY environment variable is not set")
	}
	AppConfig.HederaNetwork, present = os.LookupEnv("HEDERA_NETWORK")
	if !present {
		panic("HEDERA_NETWORK environment variable is not set")
	}
}
