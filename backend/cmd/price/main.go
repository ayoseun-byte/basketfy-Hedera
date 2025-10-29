package main

import (
	"basai/infrastructure/trading"
	"encoding/json"
)

func main() {

		var service trading.PriceService = &trading.Client{}
		r, err := service.GetOKXPriceWithFallback("UNI")
		if err != nil {
			print("\n\n >>> ", err.Error())
		}
		b, _ := json.Marshal(r)
		println(string(b))
	

}
