package domain

// PostStatistics は投稿統計を表す
type PostStatistics struct {
	TotalPostCount     int64   `json:"totalPostNumber"`
	TotalReactionCount int64   `json:"totalReactionNumber"`
	TotalViewCount     int64   `json:"totalViewNumber"`
	EngagementRate     float64 `json:"engagementRate"`
}

// StatisticsResponse はダッシュボード統計のレスポンス
type StatisticsResponse struct {
	TotalPostNumber     int64   `json:"totalPostNumber"`
	TotalReactionNumber int64   `json:"totalReactionNumber"`
	TotalViewNumber     int64   `json:"totalViewNumber"`
	EngagementRate      float64 `json:"engagementRate"`
}

// TopReactionPost は高リアクション投稿を表す
type TopReactionPost struct {
	PostID         string `json:"postId"`
	ReactionNumber int64  `json:"reactionNumber"`
}
