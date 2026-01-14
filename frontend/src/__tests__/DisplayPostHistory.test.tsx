import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisplayPostHistory } from '../components/DisplayPostHistory';
import { Pin } from '../types';
import '@testing-library/jest-dom';

// テスト用のモックデータ
const mockPin: Pin = {
    id: 'p1',
    title: 'テストの投稿',
    description: 'これはテスト用の説明文です。',
    genre: 'food', // エラーに出ていた "food" を使用
    reactions: 10,
    createdAt: new Date('2025-01-01'),
    latitude: 33.5,
    longitude: 133.5,
    userId: 'u1',
    // --- 足りなかったプロパティを追加 ---
    userName: 'テストユーザー',
    userRole: 'business', // または 'business'
    images: [], // 画像がない場合は空の配列を指定
  };

describe('DisplayPostHistory', () => {
  const mockOnPinClick = jest.fn();
  const mockOnDeletePin = jest.fn();
  const mockFormatDate = jest.fn((date) => '2025年1月1日');

  const defaultProps = {
    pin: mockPin,
    onPinClick: mockOnPinClick,
    onDeletePin: mockOnDeletePin,
    formatDate: mockFormatDate,
    // テスト用にシンプルな削除ボタンを渡す
    deleteButton: <button onClick={() => mockOnDeletePin(mockPin.id)}>削除</button>,
  };

  it('投稿のタイトルと説明が表示されていること', () => {
    render(<DisplayPostHistory {...defaultProps} />);
    expect(screen.getByText('テストの投稿')).toBeInTheDocument();
    expect(screen.getByText('これはテスト用の説明文です。')).toBeInTheDocument();
  });

  it('いいね数とフォーマットされた日付が表示されていること', () => {
    render(<DisplayPostHistory {...defaultProps} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2025年1月1日')).toBeInTheDocument();
  });

  it('クリックしたときに onPinClick が呼ばれること', () => {
    render(<DisplayPostHistory {...defaultProps} />);
    const clickableArea = screen.getByText('テストの投稿').parentElement?.parentElement;
    if (clickableArea) {
      fireEvent.click(clickableArea);
    }
    expect(mockOnPinClick).toHaveBeenCalledWith(mockPin);
  });

  it('外部から渡された削除ボタンが表示され、機能すること', () => {
    render(<DisplayPostHistory {...defaultProps} />);
    const deleteBtn = screen.getByText('削除');
    expect(deleteBtn).toBeInTheDocument();
    
    fireEvent.click(deleteBtn);
    expect(mockOnDeletePin).toHaveBeenCalledWith('p1');
  });
});