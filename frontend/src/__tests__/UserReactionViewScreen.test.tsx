import { render, screen, fireEvent } from '@testing-library/react';
import { UserReactionViewScreen } from '../components/UserReactionViewScreen';
import { Pin } from '../types';

describe('UserReactionViewScreen コンポーネント', () => {
  const mockOnPinClick = jest.fn();

  const mockReactedPins: Pin[] = [
    {
      id: 'pin-1',
      title: '美味しいカフェ',
      description: 'ここのコーヒーは最高です。',
      genre: 'food',
      userId: 'user-1',
      userName: '一般ユーザーA',
      userRole: 'general',
      reactions: 10,
      createdAt: new Date(),
      latitude: 0,
      longitude: 0,
      images: [],
    },
    {
      id: 'pin-2',
      title: '絶景スポット',
      description: '夕日が綺麗に見えます。',
      genre: 'scenery',
      userId: 'user-2',
      userName: '事業者スタッフ',
      businessName: '土佐観光観光協会', // 事業者の場合
      userRole: 'business',
      reactions: 25,
      createdAt: new Date(),
      latitude: 0,
      longitude: 0,
      images: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('リアクションがない場合に「まだリアクションがありません」と表示されること', () => {
    render(<UserReactionViewScreen reactedPins={[]} onPinClick={mockOnPinClick} />);
    expect(screen.getByText('まだリアクションがありません')).toBeInTheDocument();
  });

  test('リアクションした投稿リストが正しく表示されること', () => {
    render(<UserReactionViewScreen reactedPins={mockReactedPins} onPinClick={mockOnPinClick} />);

    // タイトルの確認
    expect(screen.getByText('美味しいカフェ')).toBeInTheDocument();
    expect(screen.getByText('絶景スポット')).toBeInTheDocument();

    // ジャンルラベルの確認（mockDataの定義に従う）
    expect(screen.getByText('グルメ')).toBeInTheDocument(); // food
    expect(screen.getByText('景色')).toBeInTheDocument(); // scenery

    // リアクション数の確認
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  test('投稿者の名前がロール（一般/事業者）に応じて正しく表示されること', () => {
    render(<UserReactionViewScreen reactedPins={mockReactedPins} onPinClick={mockOnPinClick} />);

    // 一般ユーザーは userName が表示される
    expect(screen.getByText(/投稿者: 一般ユーザーA/)).toBeInTheDocument();

    // 事業者ユーザーは businessName が表示される
    expect(screen.getByText(/投稿者: 土佐観光観光協会/)).toBeInTheDocument();
  });

  test('カードをクリックすると onPinClick が呼ばれること', () => {
    render(<UserReactionViewScreen reactedPins={mockReactedPins} onPinClick={mockOnPinClick} />);

    const card = screen.getByText('美味しいカフェ').closest('.cursor-pointer');
    if (card) fireEvent.click(card);

    expect(mockOnPinClick).toHaveBeenCalledWith(mockReactedPins[0]);
  });
});
