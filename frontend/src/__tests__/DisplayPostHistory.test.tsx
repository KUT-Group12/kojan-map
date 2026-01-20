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
      />
    );

    // タイトル部分をクリック（cursor-pointerが付いているエリア）
    fireEvent.click(screen.getByText('テストの投稿タイトル'));

    expect(mockOnPinClick).toHaveBeenCalledWith(mockPost);
  });

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
  });
});
