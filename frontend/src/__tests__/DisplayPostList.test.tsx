import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisplayPostList } from '../components/DisplayPostList';
import { Pin, User } from '../types';
import '@testing-library/jest-dom';

// 1. モックデータ：Pin (これまでのエラーに基づき全ての項目を網羅)
const mockPin: Pin = {
  id: 'p1',
  title: '高知のおいしいお店',
  description: 'ここのカツオのタタキは絶品です。',
  genre: 'food',
  reactions: 15,
  viewCount: 100,
  createdAt: new Date('2025-01-01T10:00:00'),
  latitude: 33.5597,
  longitude: 133.5311,
  userId: 'u1',
  userName: '高知太郎',
  userRole: 'business',
  images: ['https://example.com/image.jpg'],
};

// 2. モックデータ：User
const mockUser: User = {
  id: 'u2', // 投稿者とは別のユーザー
  name: '閲覧者A',
  email: 'viewer@example.com',
  role: 'general',
  createdAt: new Date(),
  businessIcon: '',
};

describe('DisplayPostList (PinDetailModal)', () => {
  const defaultProps = {
    pin: mockPin,
    currentUser: mockUser,
    isReacted: false,
    onClose: jest.fn(),
    onReaction: jest.fn(),
    onDelete: jest.fn(),
    onBlockUser: jest.fn(),
    pinsAtLocation: [mockPin],
    onOpenCreateAtLocation: jest.fn(),
    onSelectPin: jest.fn(),
  };

  it('投稿のタイトル、説明、位置情報が正しく表示されること', () => {
    render(<DisplayPostList {...defaultProps} />);

    expect(screen.getAllByText('高知のおいしいお店')[0]).toBeInTheDocument();
    expect(screen.getByText('ここのカツオのタタキは絶品です。')).toBeInTheDocument();
    // 座標の表示確認（toFixed(4)されているか）
    expect(screen.getByText(/33.5597/)).toBeInTheDocument();
    expect(screen.getByText(/133.5311/)).toBeInTheDocument();
  });

  it('閲覧数が表示されていること', () => {
    render(<DisplayPostList {...defaultProps} />);
    expect(screen.getByText(/100 閲覧/)).toBeInTheDocument();
  });

  it('画像が正しくレンダリングされていること', () => {
    render(<DisplayPostList {...defaultProps} />);
    const img = screen.getByAltText('投稿画像 1');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('「投稿を追加」ボタンをクリックすると onOpenCreateAtLocation が呼ばれること', () => {
    render(<DisplayPostList {...defaultProps} />);
    const addButton = screen.getByText('投稿を追加');
    fireEvent.click(addButton);

    expect(defaultProps.onOpenCreateAtLocation).toHaveBeenCalledWith(
      mockPin.latitude,
      mockPin.longitude
    );
  });

  it('他人の投稿の場合、通報ボタンが表示されること', () => {
    render(<DisplayPostList {...defaultProps} />);
    // ReportScreenコンポーネント内のテキストを探す
    // (注: ReportScreenの内部実装に依存しますが、一般的な「通報」ボタンを想定)
    expect(screen.getAllByText(/通報/i).length).toBeGreaterThan(0);
  });

  it('自分の投稿の場合、削除セクションが表示されること', () => {
    const ownPostProps = {
      ...defaultProps,
      pin: { ...mockPin, userId: 'u2' }, // currentUser.id と一致させる
      currentUser: { ...mockUser, id: 'u2' },
    };
    render(<DisplayPostList {...ownPostProps} />);
    // SelectPostDeletionが描画するはずのテキストを確認
    expect(screen.getByRole('button', { name: /削除/i })).toBeInTheDocument();
  });
});
