package utilities

import (
	"fmt"
	"log"
	"basai/config"
	"strings"
)

func Printer(tag string, message string, color string) bool{
	if config.AppConfig.Env != "production"{

	
	colorCodes := map[string]string{
		"orange":      "\033[0;33m", // No standard ANSI code for orange, using yellow as a substitute
		"sky_blue":    "\033[0;36m", // Cyan is often substituted for sky blue
		"green":       "\x1b[32m",   // Correct
		"magenta":     "\x1b[35m",   // Corrected from \x1b[36m (cyan) to \x1b[35m (magenta)
		"red":         "\033[0;31m", // Correct
		"cyan":        "\033[0;36m", // 
		"violet":      "\033[38;5;93m",   // Violet
		"pink":        "\033[38;5;205m",
		"yellow":      "\033[0;33m", // Correct
		"blue":        "\033[0;34m", // Correct
		"purple":      "\033[0;35m", // Correct
		"white":       "\033[0;37m", // Correct
		"gold":        "\033[1;33m", // Bright yellow can be used as a substitute for gold
		"bold_black":  "\033[1;30m", // Correct
		"bold_red":    "\033[1;31m", // Correct
		"bold_green":  "\033[1;32m", // Correct
		"bold_yellow": "\033[1;33m", // Correct
		"bold_blue":   "\033[1;34m", // Correct
		"bold_purple": "\033[1;35m", // Correct
		"bold_cyan":   "\033[1;36m", // Correct
		"bold_white":  "\033[1;37m", // Correct
		"reset":       "\033[0m",    // Correct
	}

	colorCode := colorCodes[strings.ToLower(color)]
	if colorCode == "" {
		colorCode = colorCodes["white"]
	}
	message= fmt.Sprintf("%s%s", tag, message)
	coloredMessage := fmt.Sprintf("%s%s%s\n", colorCode, message, colorCodes["reset"])
	log.Println(coloredMessage)
	return true
}
return true
}
