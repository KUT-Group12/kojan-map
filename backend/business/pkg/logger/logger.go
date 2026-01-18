package logger

import (
	"fmt"
	"log"
	"os"
)

// Logger はログを出力するインターフェース
type Logger interface {
	Info(msg string, args ...interface{})
	Warn(msg string, args ...interface{})
	Error(msg string, args ...interface{})
	Debug(msg string, args ...interface{})
}

// SimpleLogger はシンプルなログ実装
type SimpleLogger struct {
	infoLog  *log.Logger
	warnLog  *log.Logger
	errorLog *log.Logger
	debugLog *log.Logger
}

// NewSimpleLogger は新しいシンプルロガーを作成
func NewSimpleLogger() *SimpleLogger {
	return &SimpleLogger{
		infoLog:  log.New(os.Stdout, "[INFO] ", log.LstdFlags|log.Lshortfile),
		warnLog:  log.New(os.Stdout, "[WARN] ", log.LstdFlags|log.Lshortfile),
		errorLog: log.New(os.Stderr, "[ERROR] ", log.LstdFlags|log.Lshortfile),
		debugLog: log.New(os.Stdout, "[DEBUG] ", log.LstdFlags|log.Lshortfile),
	}
}

// Info はinfo レベルのログを出力
func (l *SimpleLogger) Info(msg string, args ...interface{}) {
	l.infoLog.Println(fmt.Sprintf(msg, args...))
}

// Warn はwarn レベルのログを出力
func (l *SimpleLogger) Warn(msg string, args ...interface{}) {
	l.warnLog.Println(fmt.Sprintf(msg, args...))
}

// Error はerror レベルのログを出力
func (l *SimpleLogger) Error(msg string, args ...interface{}) {
	l.errorLog.Println(fmt.Sprintf(msg, args...))
}

// Debug はdebug レベルのログを出力
func (l *SimpleLogger) Debug(msg string, args ...interface{}) {
	l.debugLog.Println(fmt.Sprintf(msg, args...))
}
