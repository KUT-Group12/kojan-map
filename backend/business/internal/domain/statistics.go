package domain

// PostStatistics は投稿統計を表す
// totalPostNumber: 合計投稿数
// totalReactionNumber: 合計リアクション数
// totalViewNumber: 合計閲覧数
// engagementRate: エンゲージメント率
type PostStatistics struct {
	TotalPostCount     int     `json:"totalPostNumber"`
	TotalReactionCount int     `json:"totalReactionNumber"`
	TotalViewCount     int     `json:"totalViewNumber"`
	EngagementRate     float64 `json:"engagementRate"`
}

// StatisticsResponse はダッシュボード統計のレスポンス
// totalPostNumber: 合計投稿数
// totalReactionNumber: 合計リアクション数
// totalViewNumber: 合計閲覧数
// engagementRate: エンゲージメント率
type StatisticsResponse struct {
	TotalPostNumber     int     `json:"totalPostNumber"`
	TotalReactionNumber int     `json:"totalReactionNumber"`
	TotalViewNumber     int     `json:"totalViewNumber"`
	EngagementRate      float64 `json:"engagementRate"`
}

// TopReactionPost は高リアクション投稿を表す
// postId: 投稿ID
// reactionNumber: リアクション数
type TopReactionPost struct {
	PostID         string `json:"postId"`
	ReactionNumber int    `json:"reactionNumber"`
}

// StatsResponse は単一統計値のレスポンス
// total: 合計値
// label: ラベル
type StatsResponse struct {
	Total int    `json:"total"`
	Label string `json:"label"`
}

// EngagementResponse はエンゲージメント率のレスポンス
// postCount: 投稿数
// reactionCount: リアクション数
// viewCount: 閲覧数
// engagementRate: エンゲージメント率
type EngagementResponse struct {
	PostCount      int     `json:"postCount"`
	ReactionCount  int     `json:"reactionCount"`
	ViewCount      int     `json:"viewCount"`
	EngagementRate float64 `json:"engagementRate"`
}
