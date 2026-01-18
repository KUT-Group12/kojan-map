package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"kojan-map/business/internal/api/handler"
	"kojan-map/business/internal/api/middleware"
	"kojan-map/business/internal/repository/impl"
	svcimpl "kojan-map/business/internal/service/impl"
	"kojan-map/business/pkg/jwt"
	"kojan-map/business/pkg/response"
)

// RegisterRoutes はビジネスバックエンドのルートグループを設定します
func RegisterRoutes(r *gin.Engine, db *gorm.DB) {
	api := r.Group("/api")

	// TokenManagerを初期化（サービスとミドルウェア間で共有）
	tokenManager := jwt.NewTokenManager()

	// リポジトリを初期化
	authRepo := impl.NewAuthRepoImpl(db)
	memberRepo := impl.NewBusinessMemberRepoImpl(db)
	statsRepo := impl.NewStatsRepoImpl(db)
	postRepo := impl.NewPostRepoImpl(db)
	blockRepo := impl.NewBlockRepoImpl(db)
	reportRepo := impl.NewReportRepoImpl(db)
	contactRepo := impl.NewContactRepoImpl(db)
	paymentRepo := impl.NewPaymentRepoImpl(db)

	// サービスを初期化
	authService := svcimpl.NewAuthServiceImpl(authRepo, tokenManager)
	memberService := svcimpl.NewMemberServiceImpl(memberRepo, authRepo)
	statsService := svcimpl.NewStatsServiceImpl(statsRepo)
	postService := svcimpl.NewPostServiceImpl(postRepo)
	blockService := svcimpl.NewBlockServiceImpl(blockRepo)
	reportService := svcimpl.NewReportServiceImpl(reportRepo)
	contactService := svcimpl.NewContactServiceImpl(contactRepo)
	paymentService := svcimpl.NewPaymentServiceImpl(paymentRepo)

	// ハンドラーを初期化
	authHandler := handler.NewAuthHandler(authService)
	memberHandler := handler.NewMemberHandler(memberService)
	statsHandler := handler.NewStatsHandler(statsService)
	postHandler := handler.NewPostHandler(postService)
	blockHandler := handler.NewBlockHandler(blockService)
	reportHandler := handler.NewReportHandler(reportService)
	contactHandler := handler.NewContactHandler(contactService)
	paymentHandler := handler.NewPaymentHandler(paymentService)

	// 認証ルート（公開）
	api.POST("/auth/google", authHandler.GoogleAuth)
	api.POST("/auth/business/login", authHandler.BusinessLogin)
	api.POST("/auth/refresh", authHandler.Refresh)

	// 認証ログアウトルート（保護 - 認証必須）
	logoutRoute := api.Group("/auth")
	logoutRoute.Use(middleware.AuthMiddleware(tokenManager))
	logoutRoute.POST("/logout", authHandler.Logout)

	// メンバールート（保護）
	memberRoutes := api.Group("/business")
	memberRoutes.Use(middleware.AuthMiddleware(tokenManager), middleware.BusinessRoleRequired())
	memberRoutes.GET("/mypage/details", memberHandler.GetBusinessDetails)
	memberRoutes.PUT("/member/name", memberHandler.UpdateBusinessName)
	memberRoutes.PUT("/member/icon", memberHandler.UpdateBusinessIcon)
	memberRoutes.PUT("/member/anonymize", memberHandler.AnonymizeMember)
	memberRoutes.GET("/member", memberHandler.GetMemberInfo)

	// ダッシュボード統計ルート（保護）
	statsRoutes := api.Group("/business")
	statsRoutes.Use(middleware.AuthMiddleware(tokenManager), middleware.BusinessRoleRequired())
	statsRoutes.GET("/post/total", statsHandler.GetTotalPosts)
	statsRoutes.GET("/reaction/total", statsHandler.GetTotalReactions)
	statsRoutes.GET("/view/total", statsHandler.GetTotalViews)
	statsRoutes.GET("/engagement", statsHandler.GetEngagementRate)

	// 投稿ルート（保護）
	postRoutes := api.Group("")
	postRoutes.Use(middleware.AuthMiddleware(tokenManager), middleware.BusinessRoleRequired())
	postRoutes.GET("/business/posts", postHandler.ListPosts)
	postRoutes.GET("/posts/:postId", postHandler.GetPost)
	postRoutes.POST("/posts", postHandler.CreatePost)
	postRoutes.PUT("/posts/anonymize", postHandler.AnonymizePost)
	postRoutes.GET("/posts/history", postHandler.GetPostHistory)

	// ブロックルート（保護）
	blockRoutes := api.Group("")
	blockRoutes.Use(middleware.AuthMiddleware(tokenManager), middleware.BusinessRoleRequired())
	blockRoutes.POST("/block", blockHandler.CreateBlock)
	blockRoutes.DELETE("/block", blockHandler.DeleteBlock)

	// 通報ルート（保護）
	reportRoutes := api.Group("")
	reportRoutes.Use(middleware.AuthMiddleware(tokenManager), middleware.BusinessRoleRequired())
	reportRoutes.POST("/report", reportHandler.CreateReport)

	// 問い合わせルート（保護）
	contactRoutes := api.Group("")
	contactRoutes.Use(middleware.AuthMiddleware(tokenManager), middleware.BusinessRoleRequired())
	contactRoutes.POST("/contact", contactHandler.CreateContact)

	// Stripeリダイレクトルート（保護）
	paymentRoutes := api.Group("/business")
	paymentRoutes.Use(middleware.AuthMiddleware(tokenManager), middleware.BusinessRoleRequired())
	paymentRoutes.POST("/stripe/redirect", paymentHandler.CreateRedirect)

	// ヘルスチェック
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
}

func notImplemented(c *gin.Context) {
	response.SendSuccess(c, http.StatusNotImplemented, gin.H{"message": "not implemented yet"})
}
