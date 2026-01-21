<<<<<<< HEAD
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DisplayPostHistory } from '../components/DisplayPostHistory';
import { Post } from '../types';

describe('DisplayPostHistory', () => {
  const mockPost: Post = {
    postId: 101,
    title: '歴史ある投稿',
    text: 'この投稿は履歴に表示されるためのものです。',
    genreId: 2,
    genreName: 'イベント', // DBからの値
    genreColor: '#3b82f6', // DBからの値 (Blue-500)
    postDate: '2024-01-21T10:00:00Z',
    numReaction: 15,
    numView: 120,
    userId: 'user-123',
    placeId: 5,
  };

  const mockOnPinClick = vi.fn();
  const mockFormatDate = vi.fn((date: Date) => '2024年1月21日');

  it('投稿内容とDBから取得したジャンル情報が正しく表示されること', () => {
    render(
      <DisplayPostHistory
        post={mockPost}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={<button>削除</button>}
      />
    );

    // 基本情報の確認
    expect(screen.getByText('歴史ある投稿')).toBeInTheDocument();
    expect(screen.getByText('この投稿は履歴に表示されるためのものです。')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // numReaction
    expect(screen.getByText(/120 閲覧/)).toBeInTheDocument(); // numView

    // DBから取得したジャンル名と色が適用されているか
    const badge = screen.getByText('イベント');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ backgroundColor: '#3b82f6' });
  });

  it('カード本体（コンテンツ部分）をクリックしたときに onPinClick が呼ばれること', () => {
    render(
      <DisplayPostHistory
        post={mockPost}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={<button>削除</button>}
=======
import { render, screen, fireEvent } from '@testing-library/react';
import { DisplayPostHistory } from '../components/DisplayPostHistory';

describe('DisplayPostHistory コンポーネント', () => {
  const mockPost = {
    postId: 1,
    title: 'テストの投稿タイトル',
    text: 'これはテストの投稿本文です。',
    // 修正：GENRE_MAP の定義に合わせる
    // もし 0 がグルメ、1 がイベントなら、期待する値と合わせる必要があります
    genreId: 0,
    numReaction: 10,
    postDate: '2024-01-20T12:00:00Z',
  };

  const mockOnPinClick = jest.fn();
  const mockFormatDate = jest.fn((date: Date) => '2024/01/20');
  const MockDeleteButton = <button data-testid="delete-btn">削除</button>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('投稿の情報が正しく表示されていること', () => {
    render(
      <DisplayPostHistory
        post={mockPost as any}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={MockDeleteButton}
      />
    );

    expect(screen.getByText('テストの投稿タイトル')).toBeInTheDocument();

    // GENRE_MAP[genreId] に対応するラベルを正しく指定する
    // genreId: 0 なら 'グルメ'、genreId: 1 なら 'イベント'
    expect(screen.getByText('グルメ')).toBeInTheDocument();
  });

  test('カードのメインエリアをクリックすると onPinClick が呼ばれること', () => {
    render(
      <DisplayPostHistory
        post={mockPost as any}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={MockDeleteButton}
>>>>>>> main
      />
    );

    // タイトル部分をクリック（cursor-pointerが付いているエリア）
<<<<<<< HEAD
    const clickableArea = screen.getByText('歴史ある投稿').closest('.cursor-pointer');
    if (!clickableArea) throw new Error('Clickable area not found');

    fireEvent.click(clickableArea);
=======
    fireEvent.click(screen.getByText('テストの投稿タイトル'));
>>>>>>> main

    expect(mockOnPinClick).toHaveBeenCalledWith(mockPost);
  });

<<<<<<< HEAD
  it('propsで渡された deleteButton が正しくレンダリングされること', () => {
    const deleteText = '消去する';
    render(
      <DisplayPostHistory
        post={mockPost}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={<button>{deleteText}</button>}
      />
    );

    expect(screen.getByRole('button', { name: deleteText })).toBeInTheDocument();
  });

  it('日付が props の formatDate 関数を通じて表示されること', () => {
    render(
      <DisplayPostHistory
        post={mockPost}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={<button>削除</button>}
      />
    );

    // formatDate が呼ばれた結果が表示されているか
    expect(screen.getByText(/2024年1月21日/)).toBeInTheDocument();
    expect(mockFormatDate).toHaveBeenCalled();
=======
  test('Propsとして渡した削除ボタンがレンダリングされていること', () => {
    render(
      <DisplayPostHistory
        post={mockPost as any}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={MockDeleteButton}
      />
    );

    expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
  });

  test("ジャンルIDが未知の場合でも default ('other') が適用されること", () => {
    const unknownPost = { ...mockPost, genreId: 999 };

    render(
      <DisplayPostHistory
        post={unknownPost as any}
        onPinClick={mockOnPinClick}
        formatDate={mockFormatDate}
        deleteButton={MockDeleteButton}
      />
    );

    // mockDataの定義に基づき、otherラベル（その他）が表示されることを確認
    expect(screen.getByText('その他')).toBeInTheDocument();
>>>>>>> main
  });
});
