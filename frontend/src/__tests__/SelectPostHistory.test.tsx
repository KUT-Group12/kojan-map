import { render, screen, fireEvent } from '@testing-library/react';
import { SelectPostHistory } from '../components/SelectPostHistory';
import { Pin } from '../types';

// 子コンポーネントをモック化
jest.mock('../components/DisplayPostHistory', () => ({
  DisplayPostHistory: ({ pin, onPinClick, deleteButton }: any) => (
    <div data-testid="post-history-item">
      <span onClick={() => onPinClick(pin)}>{pin.title}</span>
      {deleteButton}
    </div>
  ),
}));

jest.mock('../components/SelectPostDeletion', () => ({
  SelectPostDeletion: ({ pinId, onDelete }: any) => (
    <button onClick={() => onDelete(pinId)}>削除ボタンモック</button>
  ),
}));

describe('SelectPostHistory コンポーネント', () => {
  const mockPins: Pin[] = [
    {
      id: 'pin-1',
      title: '桂浜の夕日',
      description: 'とても綺麗でした',
      latitude: 33.4971,
      longitude: 133.5711,
      genre: 'scenery',
      userId: 'user-1',
      userName: '田中 太郎',
      userRole: 'general' as const,
      images: [],
      reactions: 0,
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'pin-2',
      title: '美味しいカツオ',
      description: 'ひろめ市場で食べました',
      latitude: 33.5611,
      longitude: 133.5353,
      genre: 'food',
      userId: 'user-1',
      userName: '田中 太郎',
      userRole: 'general' as const,
      images: [],
      reactions: 0,
      createdAt: new Date('2026-01-02'),
    },
  ];

  const mockOnPinClick = jest.fn();
  const mockOnDeletePin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ここに最低1つの test ブロックが必要です
  test('投稿がない場合に「まだ投稿がありません」と表示されること', () => {
    render(
      <SelectPostHistory pins={[]} onPinClick={mockOnPinClick} onDeletePin={mockOnDeletePin} />
    );
    expect(screen.getByText('まだ投稿がありません')).toBeInTheDocument();
  });

  test('投稿リストが正しくレンダリングされること', () => {
    render(
      <SelectPostHistory
        pins={mockPins}
        onPinClick={mockOnPinClick}
        onDeletePin={mockOnDeletePin}
      />
    );
    const items = screen.getAllByTestId('post-history-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('桂浜の夕日')).toBeInTheDocument();
  });

  test('投稿をクリックすると onPinClick が呼ばれること', () => {
    render(
      <SelectPostHistory
        pins={mockPins}
        onPinClick={mockOnPinClick}
        onDeletePin={mockOnDeletePin}
      />
    );
    fireEvent.click(screen.getByText('桂浜の夕日'));
    expect(mockOnPinClick).toHaveBeenCalledWith(mockPins[0]);
  });

  test('削除を実行すると onDeletePin が呼ばれること', () => {
    render(
      <SelectPostHistory
        pins={mockPins}
        onPinClick={mockOnPinClick}
        onDeletePin={mockOnDeletePin}
      />
    );
    const deleteButtons = screen.getAllByText('削除ボタンモック');
    fireEvent.click(deleteButtons[1]);
    expect(mockOnDeletePin).toHaveBeenCalledWith('pin-2');
  });
});
