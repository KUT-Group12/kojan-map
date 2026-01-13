package migrations

import (
	"log"

	"kojan-map/user/config"
)

// RunMigrations すべてのマイグレーションを実行
func RunMigrations() error {
	// テーブルを順に作成（外部キー制約を考慮）
	if err := createUsersTable(); err != nil {
		return err
	}
	if err := createSessionsTable(); err != nil {
		return err
	}
	if err := createPostsTable(); err != nil {
		return err
	}
	if err := createUserReactionsTable(); err != nil {
		return err
	}
	if err := createUserBlocksTable(); err != nil {
		return err
	}
	if err := createReportsTable(); err != nil {
		return err
	}
	if err := createContactsTable(); err != nil {
		return err
	}
	if err := createBusinessApplicationsTable(); err != nil {
		return err
	}

	log.Println("✓ All migrations completed")
	return nil
}

// createUsersTable ユーザーテーブルを作成
func createUsersTable() error {
	return config.DB.Exec(`
	CREATE TABLE IF NOT EXISTS users (
		id VARCHAR(36) PRIMARY KEY,
		google_id VARCHAR(255) NOT NULL UNIQUE,
		email VARCHAR(255) NOT NULL UNIQUE,
		role VARCHAR(50) NOT NULL DEFAULT 'user',
		registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		deleted_at TIMESTAMP NULL,
		KEY idx_google_id (google_id),
		KEY idx_email (email),
		KEY idx_deleted_at (deleted_at)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createSessionsTable セッションテーブルを作成
func createSessionsTable() error {
	return config.DB.Exec(`
	CREATE TABLE IF NOT EXISTS sessions (
		id VARCHAR(36) PRIMARY KEY,
		user_id VARCHAR(36) NOT NULL,
		session_id VARCHAR(255) NOT NULL UNIQUE,
		expires_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		KEY idx_user_id (user_id),
		KEY idx_session_id (session_id),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createPostsTable 投稿テーブルを作成
func createPostsTable() error {
	return config.DB.Exec(`
	CREATE TABLE IF NOT EXISTS posts (
		id INT AUTO_INCREMENT PRIMARY KEY,
		place_id INT NOT NULL,
		genre_id INT NOT NULL,
		user_id VARCHAR(36) NOT NULL,
		title VARCHAR(255) NOT NULL,
		text LONGTEXT,
		post_image LONGTEXT,
		num_view INT DEFAULT 0,
		num_reaction INT DEFAULT 0,
		post_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		is_anonymized BOOLEAN DEFAULT FALSE,
		location JSON,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		deleted_at TIMESTAMP NULL,
		KEY idx_user_id (user_id),
		KEY idx_genre_id (genre_id),
		KEY idx_place_id (place_id),
		KEY idx_deleted_at (deleted_at),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createUserReactionsTable ユーザーリアクションテーブルを作成
func createUserReactionsTable() error {
	return config.DB.Exec(`
	CREATE TABLE IF NOT EXISTS user_reactions (
		id INT AUTO_INCREMENT PRIMARY KEY,
		post_id INT NOT NULL,
		user_id VARCHAR(36) NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		UNIQUE KEY unique_post_user (post_id, user_id),
		FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createUserBlocksTable ユーザーブロックテーブルを作成
func createUserBlocksTable() error {
	return config.DB.Exec(`
	CREATE TABLE IF NOT EXISTS user_blocks (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id VARCHAR(36) NOT NULL,
		blocker_id VARCHAR(36) NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		deleted_at TIMESTAMP NULL,
		UNIQUE KEY unique_block (user_id, blocker_id),
		KEY idx_user_id (user_id),
		KEY idx_blocker_id (blocker_id),
		KEY idx_deleted_at (deleted_at),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createReportsTable 通報テーブルを作成
func createReportsTable() error {
	return config.DB.Exec(`
	CREATE TABLE IF NOT EXISTS reports (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id VARCHAR(36) NOT NULL,
		post_id INT NOT NULL,
		reason VARCHAR(255) NOT NULL,
		report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		status VARCHAR(50) DEFAULT 'pending',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		deleted_at TIMESTAMP NULL,
		KEY idx_user_id (user_id),
		KEY idx_post_id (post_id),
		KEY idx_status (status),
		KEY idx_deleted_at (deleted_at),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createContactsTable 問い合わせテーブルを作成
func createContactsTable() error {
	return config.DB.Exec(`
	CREATE TABLE IF NOT EXISTS contacts (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id VARCHAR(36) NOT NULL,
		subject VARCHAR(255) NOT NULL,
		text LONGTEXT,
		status VARCHAR(50) DEFAULT 'pending',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		deleted_at TIMESTAMP NULL,
		KEY idx_user_id (user_id),
		KEY idx_status (status),
		KEY idx_deleted_at (deleted_at),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createBusinessApplicationsTable 事業者申請テーブルを作成
func createBusinessApplicationsTable() error {
	return config.DB.Exec(`
	CREATE TABLE IF NOT EXISTS business_applications (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id VARCHAR(36) NOT NULL,
		business_name VARCHAR(255) NOT NULL,
		address VARCHAR(255) NOT NULL,
		phone VARCHAR(20) NOT NULL,
		status VARCHAR(50) DEFAULT 'pending',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		deleted_at TIMESTAMP NULL,
		KEY idx_user_id (user_id),
		KEY idx_status (status),
		KEY idx_deleted_at (deleted_at),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}
