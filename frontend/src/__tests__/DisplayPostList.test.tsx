import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisplayPostList } from '../components/DisplayPostList';
import { Pin, User } from '../types';
import '@testing-library/jest-dom';
import { mockPins, MOCK_GENERAL_USER } from '../lib/mockData';

// 1. モックデータ：Pin (既存のmockPinsから最初のピンを使用)
const mockPin: Pin = mockPins[0];

// 2. モックデータ：User (centralized mock dataを使用)
const mockUser: User = {
  ...MOCK_GENERAL_USER,
  id: 'u2', // 投稿者とは別のユーザー
  name: '閲覧者A',
  email: 'viewer@example.com',
} as User;

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
    
    expect(screen.getAllByText('美味しいラーメン店発見！')[0]).toBeInTheDocument();
    expect(screen.getByText('駅近くに新しくできたラーメン店。味噌ラーメンがとても美味しかったです！')).toBeInTheDocument();
    // 座標の表示確認（toFixed(4)されているか）
    expect(screen.getByText(/33.6762/)).toBeInTheDocument();
    expect(screen.getByText(/133.6503/)).toBeInTheDocument();
  });

  it('閲覧数が表示されていること', () => {
    render(<DisplayPostList {...defaultProps} />);
    expect(screen.getByText(/145 閲覧/)).toBeInTheDocument();
  });

  it('画像が正しくレンダリングされていること', () => {
    // mockPins[0] has empty images array, so skip this test or use a pin with images
    const pinWithImage: Pin = {
      ...mockPin,
      images: ['https://example.com/image.jpg'],
    };
    const propsWithImage = { ...defaultProps, pin: pinWithImage, pinsAtLocation: [pinWithImage] };
    render(<DisplayPostList {...propsWithImage} />);
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