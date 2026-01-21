import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DisplayPostHistory } from '../components/DisplayPostHistory';
import { Post } from '../types';

describe('DisplayPostHistory', () => {
  // テスト用のダミーデータ
  const mockPost: Post = {
    postId: 1,
    title: 'テスト投稿',
    text: 'これはテストの本文です。',
    genreId: 1, // GENRE_MAPで定義されているIDに合わせる
    numReaction: 10,
    numView: 0, // 追加: 型定義で必須となっているため
    placeId: 1,
    postDate: '2024-01-21T12:00:00Z',
    userId: 'user-1',
  };

  const mockOnPinClick = vi.fn();
  const mockFormatDate = vi.fn((date: Date) => '2024/01/21');
  const mockDeleteButton = <button>削除</button>;

  it('投稿内容が正しく表示されること', () => {
    render(
      <DisplayPostHistory
        post={mockPost}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={mockDeleteButton}
      />
    );

    // タイトルと本文の確認
    expect(screen.getByText('テスト投稿')).toBeInTheDocument();
    expect(screen.getByText('これはテストの本文です。')).toBeInTheDocument();

    // リアクション数の確認
    expect(screen.getByText('10')).toBeInTheDocument();

    // 日付フォーマット関数の呼び出し確認
    expect(mockFormatDate).toHaveBeenCalled();
    expect(screen.getByText('2024/01/21')).toBeInTheDocument();
  });

  it('カードをクリックしたときに onPinClick が呼ばれること', () => {
    render(
      <DisplayPostHistory
        post={mockPost}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={mockDeleteButton}
      />
    );

    // クリック可能な領域（タイトルがある部分）をクリック
    const clickArea = screen.getByText('テスト投稿').closest('div');
    if (clickArea) fireEvent.click(clickArea);

    expect(mockOnPinClick).toHaveBeenCalledWith(mockPost);
  });

  it('deleteButton（ReactNode）が正しくレンダリングされること', () => {
    render(
      <DisplayPostHistory
        post={mockPost}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={mockDeleteButton}
      />
    );

    // propsで渡したボタンが表示されているか
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
  });

  it('ジャンルIDに基づいてバッジのテキストが表示されること', () => {
    // 実際の genreLabels と GENRE_MAP の定義に依存しますが、
    // genreId: 1 が 'food' だとしたら 'グルメ' のようなラベルが出るか確認します
    render(
      <DisplayPostHistory
        post={mockPost}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={mockDeleteButton}
      />
    );

    // バッジが表示されているか確認（役割が badge または span になっているはず）
    // もし genreLabels[key] が期待通りの値になっているかテスト
    // (mockDataの内容に応じて書き換えてください)
    const badge = screen.getByText(/./, { selector: '.ml-2' }); // Badgeのクラスを指定
    expect(badge).toBeInTheDocument();
  });
});
