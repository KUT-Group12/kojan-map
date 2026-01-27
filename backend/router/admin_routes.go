package router

import (
	"kojan-map/admin/handler"
	adminrepo "kojan-map/admin/repository"
	"kojan-map/admin/service"
	"kojan-map/shared/config"
	"kojan-map/shared/middleware"
	sharedrepo "kojan-map/shared/repository"
	"kojan-map/user/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupAdminRoutes configures all admin API routes
func SetupAdminRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Initialize shared repositories
	userRepo := sharedrepo.NewUserRepository(db)
	postRepo := sharedrepo.NewPostRepository(db)

	authService := services.NewAuthService(db, cfg.GoogleClientID, cfg.JWTSecret, cfg.AppEnv)

	// Initialize admin repositories
	reportRepo := adminrepo.NewReportRepository(db)
	businessRequestRepo := adminrepo.NewBusinessRequestRepository(db)
	askRepo := adminrepo.NewAskRepository(db)
	businessMemberRepo := adminrepo.NewBusinessMemberRepository(db)

	// Initialize services
	dashboardService := service.NewAdminDashboardService(userRepo, postRepo, reportRepo, businessMemberRepo)
	reportService := service.NewAdminReportService(reportRepo, db)
	businessService := service.NewAdminBusinessService(db, businessRequestRepo, userRepo, businessMemberRepo)
	userService := service.NewAdminUserService(userRepo)
	contactService := service.NewAdminContactService(askRepo)
	postService := service.NewAdminPostService(db)

	// Initialize handlers
	dashboardHandler := handler.NewAdminDashboardHandler(dashboardService)
	reportHandler := handler.NewAdminReportHandler(reportService)
	businessHandler := handler.NewAdminBusinessHandler(businessService)
	userHandler := handler.NewAdminUserHandler(userService)
	contactHandler := handler.NewAdminContactHandler(contactService)
	postHandler := handler.NewAdminPostHandler(postService)

	// Apply middleware
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(authService))
	admin.Use(middleware.AdminOnlyMiddleware())

	// Admin API routes - 統一されたパス構造
	{
		// Dashboard
		admin.GET("/summary", dashboardHandler.GetSummary)

		// Report Management (通報管理)
		admin.GET("/reports", reportHandler.GetReports)
		admin.GET("/reports/:id", reportHandler.GetReportDetail)
		admin.PUT("/reports/:id/handle", reportHandler.HandleReport)

		// Business Application Management (事業者申請管理)
		admin.GET("/applications", businessHandler.GetApplications)
		admin.PUT("/applications/:id/approve", businessHandler.ApproveApplication)
		admin.PUT("/applications/:id/reject", businessHandler.RejectApplication)

		// User Management (ユーザー管理)
		admin.GET("/users", userHandler.GetUsers)
		admin.DELETE("/users/:userId", userHandler.DeleteUser)

		// Post Management (投稿管理)
		admin.GET("/posts/:postId", postHandler.GetPostByID)
		admin.DELETE("/posts/:postId", postHandler.DeletePost)

		// Contact/Inquiry Management (問い合わせ管理)
		admin.GET("/inquiries", contactHandler.GetInquiries)
		admin.PUT("/inquiries/:id/approve", contactHandler.ApproveInquiry)
		admin.PUT("/inquiries/:id/reject", contactHandler.RejectInquiry)
	}
}
