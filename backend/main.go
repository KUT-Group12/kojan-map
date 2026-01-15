package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"kojan-map/router"
	"kojan-map/shared/config"

	"github.com/gin-gonic/gin"
)

// @title こじゃんとやまっぷ API
// @version 1.0
// @description 管理者用API
// @host localhost:8080
// @BasePath /
func main() {
	// 環境変数で起動するサービスを指定
	// デフォルト: business（現在実装済み）
	// 将来的に SERVICES=business,user,admin で複数サービス起動可能
	servicesStr := os.Getenv("SERVICES")
	if servicesStr == "" {
		servicesStr = "business"
	}

	services := strings.Split(strings.TrimSpace(servicesStr), ",")

	// ポートの割り当て
	portMap := map[string]string{
		"business": "8080",
		"user":     "8081",
		"admin":    "8082",
	}

	// DATABASE_URL を環境変数から取得
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "root:root@tcp(localhost:3306)/kojanmap?parseTime=true&charset=utf8mb4&loc=Local"
	}

	// 複数サービスを並行実行
	var wg sync.WaitGroup
	errors := make(chan error, len(services))
	availableServices := 0

	for _, service := range services {
		service = strings.TrimSpace(service)
		if service == "" {
			continue
		}

		port, exists := portMap[service]
		if !exists {
			fmt.Printf("Unknown service: %s\n", service)
			continue
		}

		// サービスディレクトリが存在するかをチェック
		cmdPath := filepath.Join(service, "cmd", "main.go")
		if _, err := os.Stat(cmdPath); err != nil {
			fmt.Printf("Skipping %s service - not found at %s\n", service, cmdPath)
			continue
		}

		availableServices++
		wg.Add(1)
		go func(svc string, port string) {
			defer wg.Done()

			fmt.Printf("Starting %s service on port %s...\n", svc, port)

			cmd := exec.Command("go", "run", "cmd/main.go")
			cmd.Dir = svc // サービスディレクトリ内で実行
			cmd.Env = append(
				os.Environ(),
				fmt.Sprintf("PORT=%s", port),
				fmt.Sprintf("DATABASE_URL=%s", databaseURL),
			)
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr

			if err := cmd.Run(); err != nil {
				errors <- fmt.Errorf("service %s failed: %w", svc, err)
			}
		}(service, port)
	}

	// 利用可能なサービスがない場合
	if availableServices == 0 {
		log.Fatal("No services available to run")
	}

	// すべてのゴルーチンが完了するまで待機
	go func() {
		wg.Wait()
		close(errors)
	}()

	// エラーハンドリング
	for err := range errors {
		if err != nil {
			log.Printf("Error: %v", err)
		}
	}

	// すべてのサービスが完了するまでメイン処理をブロック
	wg.Wait()
}
