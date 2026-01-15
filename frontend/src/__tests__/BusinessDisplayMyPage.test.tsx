// 1. vitest からのインポートを削除
import { render, screen } from '@testing-library/react';
import { BusinessDisplayMyPage } from '../components/BusinessDisplayMyPage';
import { User, Pin } from '../types';
import { MOCK_BUSINESS_USER } from '../lib/mockData';
// import { expect, describe, it, vi } from 'vitest'; // ← これを削除

// 2. モックデータの作成
const mockUser: User = {
  ...MOCK_BUSINESS_USER,
  name: 'テスト商店',
  email: 'test@example.com',
};

const mockPins: Pin[] = [];

describe('BusinessDisplayMyPage', () => {
  const defaultProps = {
    user: mockUser,
    pins: mockPins,
    onPinClick: jest.fn(), // vi.fn() ではなく jest.fn()
    onDeletePin: jest.fn(),
    onUpdateUser: jest.fn(),
    onNavigateToDeleteAccount: jest.fn(),
  };

  it('タイトルの「事業者マイページ」が表示されていること', () => {
    render(<BusinessDisplayMyPage {...defaultProps} />);
    expect(screen.getByText('事業者マイページ')).toBeInTheDocument();
  });

  // ...他のテストケースも同様（describe, it, expect は Jest が自動で提供するので import 不要）
});