package contextkeys

import "context"

// Context キー定数（マジック文字列を避けるため）
const (
	// ContextKeyUserID はContext内のUserID（GoogleID）を取得するキー
	ContextKeyUserID = "userID"
	// ContextKeyBusinessID はContext内のBusinessIDを取得するキー
	ContextKeyBusinessID = "businessID"
	// ContextKeyGmail はContext内のGmailを取得するキー
	ContextKeyGmail = "gmail"
	// ContextKeyRole はContext内のRoleを取得するキー
	ContextKeyRole = "role"
)

// WithUserID はContextにUserIDを設定します
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, ContextKeyUserID, userID)
}

// GetUserID はContextからUserIDを取得します
func GetUserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(ContextKeyUserID).(string)
	return userID, ok
}

// WithBusinessID はContextにBusinessIDを設定します
func WithBusinessID(ctx context.Context, businessID int64) context.Context {
	return context.WithValue(ctx, ContextKeyBusinessID, businessID)
}

// GetBusinessID はContextからBusinessIDを取得します
func GetBusinessID(ctx context.Context) (int64, bool) {
	businessID, ok := ctx.Value(ContextKeyBusinessID).(int64)
	return businessID, ok
}

// WithGmail はContextにGmailを設定します
func WithGmail(ctx context.Context, gmail string) context.Context {
	return context.WithValue(ctx, ContextKeyGmail, gmail)
}

// GetGmail はContextからGmailを取得します
func GetGmail(ctx context.Context) (string, bool) {
	gmail, ok := ctx.Value(ContextKeyGmail).(string)
	return gmail, ok
}

// WithRole はContextにRoleを設定します
func WithRole(ctx context.Context, role string) context.Context {
	return context.WithValue(ctx, ContextKeyRole, role)
}

// GetRole はContextからRoleを取得します
func GetRole(ctx context.Context) (string, bool) {
	role, ok := ctx.Value(ContextKeyRole).(string)
	return role, ok
}

// WithAuthContext はContextにUserID, BusinessID, Gmail, Roleを全て設定します
// (便利メソッド)
func WithAuthContext(ctx context.Context, userID string, businessID int64, gmail, role string) context.Context {
	ctx = WithUserID(ctx, userID)
	ctx = WithBusinessID(ctx, businessID)
	ctx = WithGmail(ctx, gmail)
	ctx = WithRole(ctx, role)
	return ctx
}
