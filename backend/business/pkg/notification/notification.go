package notification

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
)

// NotificationService はMFAコードなどの通知を送信するインターフェース
type NotificationService interface {
	SendMFACode(email string, code string) error
}

// EmailNotificationService はメール経由でMFAコードを送信します
type EmailNotificationService struct {
	// 本番環境では AWS SES, SendGrid などを使用
	enabled bool
}

// NewEmailNotificationService はメール通知サービスを生成します
func NewEmailNotificationService() *EmailNotificationService {
	// 本番環境でのみ有効化
	enabled := os.Getenv("GO_ENV") == "production" && os.Getenv("SMTP_ENABLED") == "true"
	return &EmailNotificationService{
		enabled: enabled,
	}
}

// SendMFACode はMFAコードをメールで送信します
func (s *EmailNotificationService) SendMFACode(email string, code string) error {
	if !s.enabled {
		// 開発環境ではログ出力のみ
		log.Printf("[DEV] MFA Code for %s: %s", email, code)
		return nil
	}

	// 本番環境: AWS SESを使用してメール送信
	sesRegion := os.Getenv("AWS_REGION")
	if sesRegion == "" {
		sesRegion = "ap-northeast-1" // デフォルトリージョン
	}

	sesFromEmail := os.Getenv("SES_FROM_EMAIL")
	if sesFromEmail == "" {
		return fmt.Errorf("SES_FROM_EMAIL environment variable not set")
	}

	// AWS SDKの設定
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(sesRegion))
	if err != nil {
		return fmt.Errorf("failed to load AWS config: %w", err)
	}

	sesClient := ses.NewFromConfig(cfg)

	// メール本文の作成
	subject := "Kojan-Map 多要素認証コード"
	body := fmt.Sprintf(`
Kojan-Mapをご利用いただきありがとうございます。

あなたの多要素認証コードは以下です：

%s

このコードは5分間有効です。
第三者と共有しないでください。

※このメールに心当たりがない場合は、削除してください。
`, code)

	// メール送信リクエストの作成
	input := &ses.SendEmailInput{
		Source: aws.String(sesFromEmail),
		Destination: &types.Destination{
			ToAddresses: []string{email},
		},
		Message: &types.Message{
			Subject: &types.Content{
				Data:    aws.String(subject),
				Charset: aws.String("UTF-8"),
			},
			Body: &types.Body{
				Text: &types.Content{
					Data:    aws.String(body),
					Charset: aws.String("UTF-8"),
				},
			},
		},
	}

	// メール送信
	_, err = sesClient.SendEmail(context.TODO(), input)
	if err != nil {
		return fmt.Errorf("failed to send email via SES: %w", err)
	}

	log.Printf("[PROD] MFA code sent to %s via AWS SES", email)
	return nil
