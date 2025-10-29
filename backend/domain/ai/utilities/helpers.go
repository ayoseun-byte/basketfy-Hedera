package utilities

import (
	"fmt"
	"strings"
	"time"
)

// GetCurrentDateTime returns the current date and time details in a different format.
// It returns six values: the current date in "YYYY-MM-DD" format, the current year, the current month,
// the current day, the current day of the week, and the current time in "03:04 PM MST" format.
// Returns:
// - string: Current date in "YYYY-MM-DD" format.
// - int: Current year.
// - int: Current month as an integer.
// - int: Current day of the month.
// - string: Current day of the week.
// - string: Current time in "03:04 PM MST" format.
func GetCurrentDateTimeWithTimeZoneShift(userTimeZone string) (string, int, int, int, string, int, int, int, string, string) {
	now := time.Now().UTC()
	location, err := time.LoadLocation(strings.Split(userTimeZone, ",")[0])
	if err != nil {
		fmt.Println("Error loading location, defaulting to UTC:", err)
		return now.Format("2006-01-02"), now.Year(), int(now.Month()), now.Day(), now.Weekday().String(), now.Hour(), now.Minute(), now.Second(), now.Format("03:04 PM MST"), now.Format("January, 2 2006")
	}

	// Convert the UTC time to the specified userTimeZone
	localTime := now.In(location)

	// Format the time components according to the local time
	date := localTime.Format("2006-01-02")
	year := localTime.Year()
	month := int(localTime.Month())
	day := localTime.Day()
	weekday := localTime.Weekday().String()
	hour := localTime.Hour()
	minute := localTime.Minute()
	second := localTime.Second()
	formattedTime := localTime.Format("03:04 PM MST")
	formattedDate := localTime.Format("January, 2 2006") // New field in the desired format

	return date, year, month, day, weekday, hour, minute, second, formattedTime, formattedDate
}
