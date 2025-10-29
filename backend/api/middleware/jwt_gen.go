package middleware

import (
	"fmt"
	"time"
	"basai/config"

	"github.com/golang-jwt/jwt"
)

// generateJWTToken generates a JWT token.
func GenerateJWTToken(partnerID string, jwtSecret string) (string, error) {
	apiKey := config.AppConfig.APIKey
	// Set token claims
	claims := jwt.MapClaims{
		"PID":      partnerID,
		"ssAPIKey": apiKey,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
	}

	// Create a new token object with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	signedToken, err := token.SignedString([]byte(jwtSecret)) // Use the secret here
	if err != nil {
		return "", err
	}
	return signedToken, nil
}

// decodeJWTToken decodes a JWT token.
func decodeJWTToken(tokenString string, jwtSecret string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil //  Return the secret for verification
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, fmt.Errorf("invalid token")
	}
}
