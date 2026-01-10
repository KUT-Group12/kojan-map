package router

import (
	"kojan-map/handler"
	"kojan-map/middleware"
	"kojan-map/repository"
	"kojan-map/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupAdminRoutes configures all admin API routes
func SetupAdminRoutes(r *gin.Engine, db *gorm.DB) {
	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	reportRepo := repository.NewReportRepository(db)
	businessRequestRepo := repository.NewBusinessRequestRepository(db)
	askRepo := repository.NewAskRepository(db)
	postRepo := repository.NewPostRepository(db)
	businessMemberRepo := repository.NewBusinessMemberRepository(db)

	// Initialize services
	dashboardService := service.NewAdminDashboardService(userRepo, postRepo, reportRepo, businessMemberRepo)
	reportService := service.NewAdminReportService(reportRepo)
	businessService := service.NewAdminBusinessService(businessRequestRepo, userRepo, businessMemberRepo)
	userService := service.NewAdminUserService(userRepo)
	contactService := service.NewAdminContactService(askRepo)

	// Initialize handlers
	dashboardHandler := handler.NewAdminDashboardHandler(dashboardService)
	reportHandler := handler.NewAdminReportHandler(reportService)
	businessHandler := handler.NewAdminBusinessHandler(businessService)
	userHandler := handler.NewAdminUserHandler(userService)
	contactHandler := handler.NewAdminContactHandler(contactService)

	// Apply middleware
	admin := r.Group("/")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.AdminOnlyMiddleware())

	// Admin API routes
	api := admin.Group("/api")
	{
		// Dashboard
		api.GET("/admin/summary", dashboardHandler.GetSummary)

		// Report Management
		api.GET("/admin/reports", reportHandler.GetReports)
		api.PUT("/admin/reports/:id/handle", reportHandler.HandleReport)

		// Business Application Management
		api.GET("/admin/request", businessHandler.GetApplications)

		// User Management
		api.GET("/users", userHandler.GetUsers)
	}

	// Application routes (slightly different path)
	applications := admin.Group("/api/applications")
	{
		applications.PUT("/:id/approve", businessHandler.ApproveApplication)
		applications.PUT("/:id/reject", businessHandler.RejectApplication)
	}

	// Internal API routes
	internal := admin.Group("/internal")
	{
		// User deletion
		internal.POST("/users/:userId", userHandler.DeleteUser)

		// Contact/Inquiry Management
		internal.GET("/asks", contactHandler.GetInquiries)
		internal.POST("/requests/:requestId/approve", contactHandler.ApproveInquiry)
		internal.POST("/requests/:requestId/reject", contactHandler.RejectInquiry)
	}
}
