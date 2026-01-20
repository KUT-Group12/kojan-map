package domain

// PostStatistics は投稿統計を表す
// totalPostNumber: 合計投稿数
// totalReactionNumber: 合計リアクション数
// totalViewNumber: 合計閲覧数
// engagementRate: エンゲージメント率
type PostStatistics struct {
	TotalPostCount     int32   `json:"totalPostNumber"`
	TotalReactionCount int32   `json:"totalReactionNumber"`
	TotalViewCount     int32   `json:"totalViewNumber"`
	EngagementRate     float64 `json:"engagementRate"`
}

// StatisticsResponse はダッシュボード統計のレスポンス
// totalPostNumber: 合計投稿数
// totalReactionNumber: 合計リアクション数
// totalViewNumber: 合計閲覧数
// engagementRate: エンゲージメント率
type StatisticsResponse struct {
	TotalPostNumber     int32   `json:"totalPostNumber"`
	TotalReactionNumber int32   `json:"totalReactionNumber"`
	TotalViewNumber     int32   `json:"totalViewNumber"`
	EngagementRate      float64 `json:"engagementRate"`
}

// TopReactionPost は高リアクション投稿を表す
// postId: 投稿ID
// reactionNumber: リアクション数
type TopReactionPost struct {
	PostID         string `json:"postId"`
	ReactionNumber int32  `json:"reactionNumber"`
}

// StatsResponse は単一統計値のレスポンス
// total: 合計値
// label: ラベル
type StatsResponse struct {
	Total int32  `json:"total"`
	Label string `json:"label"`
}

// EngagementResponse はエンゲージメント率のレスポンス
// postCount: 投稿数
// reactionCount: リアクション数
// viewCount: 閲覧数
// engagementRate: エンゲージメント率
type EngagementResponse struct {
	PostCount      int32   `json:"postCount"`
	ReactionCount  int32   `json:"reactionCount"`
	ViewCount      int32   `json:"viewCount"`
	EngagementRate float64 `json:"engagementRate"`
}
