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
	if err := createAsksTable(db); err != nil {
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
	CREATE TABLE IF NOT EXISTS genres (
		genreId INT PRIMARY KEY AUTO_INCREMENT,
		genreName VARCHAR(50) NOT NULL UNIQUE,
		color VARCHAR(6) NOT NULL DEFAULT '000000'
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error; err != nil {
		return err
	}

	// 初期データ投入（既にデータがある場合はスキップ）
	var count int64
	if err := db.Raw("SELECT COUNT(*) FROM genres").Scan(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		if err := db.Exec(`
		INSERT INTO genres (genreName, color) VALUES
		('food', 'EF4444'),
		('event', 'F59E0B'),
		('scene', '10B981'),
		('store', '3B82F6'),
		('emergency', '8B5CF6'),
		('other', '6B7280');
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
	CREATE TABLE IF NOT EXISTS places (
		placeId INT PRIMARY KEY AUTO_INCREMENT,
		numPost INT NOT NULL DEFAULT 0,
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
		googleId VARCHAR(50) NOT NULL UNIQUE,
		gmail VARCHAR(100) NOT NULL UNIQUE,
		role ENUM('user', 'business', 'admin') NOT NULL DEFAULT 'user',
		registrationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		deletedAt DATETIME NULL,
		KEY idx_googleId (googleId),
		KEY idx_gmail (gmail),
		KEY idx_deletedAt (deletedAt)
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
		postId INT AUTO_INCREMENT PRIMARY KEY,
		placeId INT NOT NULL,
		userId VARCHAR(36) NOT NULL,
		postDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		title VARCHAR(50) NOT NULL,
		text TEXT,
		postImage BLOB,
		numReaction INT NOT NULL DEFAULT 0,
		numView INT NOT NULL DEFAULT 0,
		genreId INT NOT NULL,
		deletedAt DATETIME NULL,
		KEY idx_userId (userId),
		KEY idx_genreId (genreId),
		KEY idx_placeId (placeId),
		KEY idx_deletedAt (deletedAt),
		FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (genreId) REFERENCES genres(genreId) ON DELETE RESTRICT,
		FOREIGN KEY (placeId) REFERENCES places(placeId) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createUserReactionsTable ユーザーリアクションテーブルを作成
func createUserReactionsTable(db *gorm.DB) error {
	return db.Exec(`
	CREATE TABLE IF NOT EXISTS reactions (
		reactionId INT AUTO_INCREMENT PRIMARY KEY,
		postId INT NOT NULL,
		userId VARCHAR(36) NOT NULL,
		createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		UNIQUE KEY unique_post_user (postId, userId),
		FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
		FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
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
		createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		deletedAt DATETIME NULL,
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
		reportId INT AUTO_INCREMENT PRIMARY KEY,
		userId VARCHAR(36) NOT NULL,
		postId INT NOT NULL,
		reason TEXT NOT NULL,
		date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		reportFlag BOOLEAN NOT NULL DEFAULT FALSE,
		removeFlag BOOLEAN NOT NULL DEFAULT FALSE,
		deletedAt DATETIME NULL,
		KEY idx_userId (userId),
		KEY idx_postId (postId),
		KEY idx_deletedAt (deletedAt),
		FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createAsksTable 問い合わせテーブルを作成
func createAsksTable(db *gorm.DB) error {
	return db.Exec(`
	CREATE TABLE IF NOT EXISTS asks (
		askId INT AUTO_INCREMENT PRIMARY KEY,
		date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		subject VARCHAR(100) NOT NULL,
		text TEXT,
		userId VARCHAR(36) NOT NULL,
		askFlag BOOLEAN NOT NULL DEFAULT FALSE,
		deletedAt DATETIME NULL,
		KEY idx_userId (userId),
		KEY idx_askFlag (askFlag),
		KEY idx_deletedAt (deletedAt),
		FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}

// createBusinessApplicationsTable 事業者申請テーブルを作成
func createBusinessApplicationsTable(db *gorm.DB) error {
	return db.Exec(`
	CREATE TABLE IF NOT EXISTS business_applications (
		businessId INT AUTO_INCREMENT PRIMARY KEY,
		businessName VARCHAR(50) NOT NULL,
		kanaBusinessName VARCHAR(50) NOT NULL,
		zipCode VARCHAR(10) NOT NULL,
		address VARCHAR(100) NOT NULL,
		phone VARCHAR(20) NOT NULL,
		registDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		profileImage BLOB,
		userId VARCHAR(36) NOT NULL,
		placeId INT NULL,
		deletedAt DATETIME NULL,
		KEY idx_userId (userId),
		KEY idx_placeId (placeId),
		KEY idx_deletedAt (deletedAt),
		FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (placeId) REFERENCES places(placeId) ON DELETE SET NULL
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error
}
