package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	appServer "basai/api"
	"time"
	_ "basai/docs"

)

/*
|********************************
| Basketfy AI Backend Systems
*********************************
|
|
|
|
*/

// @title Basketfy AI API
// @version 1.0
// @description This is the API server for Basketfy AI application
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api/v1
// @schemes http https
func main() {

	defer func() {
		if err := recover(); err != nil {
			log.Print(fmt.Errorf("the system almost crashed due to: %v", err))
		}
	}()
	e := appServer.Start()
	//Wait for interrupt signal to gracefully shutdown the server with
	//a timeout of 10 seconds.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	// healthCheck = "unhealthy"
	time.Sleep(5 * time.Second)
	appServer.Stop(e)
}
