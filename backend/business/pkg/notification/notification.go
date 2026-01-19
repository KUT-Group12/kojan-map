package notification

import (
	"fmt"
	"log"
	"os"
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

	// 本番環境: 実際のメール送信
	// TODO: AWS SES, SendGrid などの実装
	// 例:
	// return s.sesClient.SendEmail(email, "Your MFA Code", fmt.Sprintf("Your code is: %s", code))

	// 暫定: ログ出力（本番では削除）
	log.Printf("[PRODUCTION] Sending MFA code to %s (実装が必要)", email)
	
	// 実装例（AWS SESを使用する場合）:
	/*
	sess := session.Must(session.NewSession())
	svc := ses.New(sess)
	
	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			ToAddresses: []*string{aws.String(email)},
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Text: &ses.Content{
					Data: aws.String(fmt.Sprintf("Your MFA code is: %s", code)),
				},
			},
			Subject: &ses.Content{
				Data: aws.String("Your MFA Code"),
			},
		},
		Source: aws.String(os.Getenv("SES_FROM_EMAIL")),
	}
	
	_, err := svc.SendEmail(input)
	return err
	*/

	return fmt.Errorf("本番用メール送信の実装が必要です")
}
