package main

import (
	"fmt"
	"kojan-map/config"
	"kojan-map/router"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db := config.ConnectDB(cfg)

	// Create Gin router
	r := gin.Default()

	// Health check endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "こじゃんとやまっぷ API サーバー起動中！🚀",
			"status":  "healthy",
		})
	})

	// Setup admin routes
	router.SetupAdminRoutes(r, db)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("Server is running on port %s...", cfg.ServerPort)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
