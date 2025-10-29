package handlers

import (

	"net/http"
	"regexp"

	"github.com/labstack/echo/v4"
)

// basicAttack is a regular expression that matches potential harmful strings in the user input
var basicAttack = regexp.MustCompile(`\[/?INST\]|<\|im_start\|>|<\|im_end\|>`)

// APIHome checks if the chat endpoint is active
func APIHome(c echo.Context) (err error) {
	return c.String(http.StatusOK, "pong")
}
