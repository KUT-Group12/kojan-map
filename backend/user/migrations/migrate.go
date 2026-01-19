package migrations

import (
	"log"

	"gorm.io/gorm"
)

// RunMigrations すべてのマイグレーションを実行
func RunMigrations(db *gorm.DB) error {
	// テーブルを順に作成（外部キー制約を考慮）
	if err := createGenresTable(db); err != nil {
		return err
	}
	if err := createPlacesTable(db); err != nil {
		return err
	}
	if err := createUsersTable(db); err != nil {
		return err
	}
	if err := createSessionsTable(db); err != nil {
		return err
	}
	if err := createPostsTable(db); err != nil {
		return err
	}
	if err := createUserReactionsTable(db); err != nil {
		return err
	}
	if err := createUserBlocksTable(db); err != nil {
		return err
	}
	if err := createReportsTable(db); err != nil {
		return err
	}
	if err := createContactsTable(db); err != nil {
		return err
	}
	if err := createBusinessApplicationsTable(db); err != nil {
		return err
	}

	log.Println("✓ All migrations completed")
	return nil
}

// createGenresTable ジャンルテーブルを作成
func createGenresTable(db *gorm.DB) error {
	// テーブル作成
	if err := db.Exec(`
	CREATE TABLE IF NOT EXISTS genre (
		genre_id INT PRIMARY KEY AUTO_INCREMENT,
		genre_name VARCHAR(50) NOT NULL UNIQUE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error; err != nil {
		return err
	}

	// 初期データ投入（既にデータがある場合はスキップ）
	var count int64
	db.Raw("SELECT COUNT(*) FROM genre").Scan(&count)
	if count == 0 {
		if err := db.Exec(`
		INSERT INTO genre (genre_id, genre_name) VALUES
		(1, 'グルメ'),
		(2, 'イベント'),
		(3, '景色'),
		(4, 'お店'),
		(5, '緊急情報'),
		(6, 'その他');
		`).Error; err != nil {
			return err
		}
		log.Println("✓ Genre initial data inserted")
	}

	return nil
}

// createPlacesTable 場所テーブルを作成
func createPlacesTable(db *gorm.DB) error {
	return db.Exec(`
	CREATE TABLE IF NOT EXISTS place (
		place_id INT PRIMARY KEY AUTO_INCREMENT,
		num_post INT NOT NULL DEFAULT 0,
		latitude DOUBLE NOT NULL,
		longitude DOUBLE NOT NULL,
		KEY idx_location (latitude, longitude)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createUsersTable ユーザーテーブルを作成
func createUsersTable(db *gorm.DB) error {
	return db.Exec(`
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
func createSessionsTable(db *gorm.DB) error {
	return db.Exec(`
	CREATE TABLE IF NOT EXISTS sessions (
		sessionId VARCHAR(255) PRIMARY KEY,
		googleId VARCHAR(50) NOT NULL,
		expiry DATETIME NOT NULL,
		KEY idx_googleId (googleId)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createPostsTable 投稿テーブルを作成
func createPostsTable(db *gorm.DB) error {
	return db.Exec(`
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
func createUserReactionsTable(db *gorm.DB) error {
	return db.Exec(`
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
func createUserBlocksTable(db *gorm.DB) error {
	return db.Exec(`
	CREATE TABLE IF NOT EXISTS user_blocks (
		blockId INT AUTO_INCREMENT PRIMARY KEY,
		blockerId VARCHAR(36) NOT NULL,
		blockedId VARCHAR(36) NOT NULL,
		deletedAt TIMESTAMP NULL,
		UNIQUE KEY unique_block (blockerId, blockedId),
		KEY idx_blockerId (blockerId),
		KEY idx_blockedId (blockedId),
		KEY idx_deletedAt (deletedAt),
		FOREIGN KEY (blockerId) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (blockedId) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createReportsTable 通報テーブルを作成
func createReportsTable(db *gorm.DB) error {
	return db.Exec(`
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
func createContactsTable(db *gorm.DB) error {
	return db.Exec(`
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
func createBusinessApplicationsTable(db *gorm.DB) error {
	return db.Exec(`
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
