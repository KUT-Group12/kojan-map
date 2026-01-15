import { render, screen, fireEvent } from '@testing-library/react';
import { SelectPostHistory } from '../components/SelectPostHistory'; 
import { Pin } from '../types';
import { mockPins } from '../lib/mockData';

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
  // Use first two pins from centralized mock data
  const testPins: Pin[] = [mockPins[0], mockPins[1]];

  const mockOnPinClick = jest.fn();
  const mockOnDeletePin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ここに最低1つの test ブロックが必要です
  test('投稿がない場合に「まだ投稿がありません」と表示されること', () => {
    render(
      <SelectPostHistory 
        pins={[]} 
        onPinClick={mockOnPinClick} 
        onDeletePin={mockOnDeletePin} 
      />
    );
    expect(screen.getByText('まだ投稿がありません')).toBeInTheDocument();
  });

  test('投稿リストが正しくレンダリングされること', () => {
    render(
      <SelectPostHistory 
        pins={testPins} 
        onPinClick={mockOnPinClick} 
        onDeletePin={mockOnDeletePin} 
      />
    );
    const items = screen.getAllByTestId('post-history-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('美味しいラーメン店発見！')).toBeInTheDocument();
  });

  test('投稿をクリックすると onPinClick が呼ばれること', () => {
    render(
      <SelectPostHistory 
        pins={testPins} 
        onPinClick={mockOnPinClick} 
        onDeletePin={mockOnDeletePin} 
      />
    );
    fireEvent.click(screen.getByText('美味しいラーメン店発見！'));
    expect(mockOnPinClick).toHaveBeenCalledWith(testPins[0]);
  });

  test('削除を実行すると onDeletePin が呼ばれること', () => {
    render(
      <SelectPostHistory 
        pins={testPins} 
        onPinClick={mockOnPinClick} 
        onDeletePin={mockOnDeletePin} 
      />
    );
    const deleteButtons = screen.getAllByText('削除ボタンモック');
    fireEvent.click(deleteButtons[1]);
    expect(mockOnDeletePin).toHaveBeenCalledWith(testPins[1].id);
  });
});