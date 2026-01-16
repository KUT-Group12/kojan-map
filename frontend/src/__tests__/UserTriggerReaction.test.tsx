import { render, screen, fireEvent } from '@testing-library/react';
import { UserTriggerReaction } from '../components/UserTriggerReaction';

describe('UserTriggerReaction コンポーネント', () => {
  const mockOnReaction = jest.fn();
  const pinId = 'pin-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('一般ユーザーで未リアクションの場合、正しく表示されクリックできること', () => {
    render(
      <UserTriggerReaction
        pinId={pinId}
        isReacted={false}
        userRole="general"
        isDisabled={false}
        onReaction={mockOnReaction}
      />
    );

    const button = screen.getByRole('button', { name: 'リアクション' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(mockOnReaction).toHaveBeenCalledWith(pinId);
  });

  test('リアクション済みの場合、テキストが「リアクション済み」に変わること', () => {
    render(
      <UserTriggerReaction
        pinId={pinId}
        isReacted={true}
        userRole="general"
        isDisabled={false}
        onReaction={mockOnReaction}
      />
    );

    expect(screen.getByText('リアクション済み')).toBeInTheDocument();
  });

  test('事業者の場合、ボタンが無効化され「事業者はリアクション不可」と表示されること', () => {
    render(
      <UserTriggerReaction
        pinId={pinId}
        isReacted={false}
        userRole="business"
        isDisabled={false}
        onReaction={mockOnReaction}
      />
    );

    const button = screen.getByRole('button', { name: '事業者はリアクション不可' });
    expect(button).toBeDisabled();

    // クリックしても関数が呼ばれないこと
    fireEvent.click(button);
    expect(mockOnReaction).not.toHaveBeenCalled();
  });

  test('isDisabled プロパティが true の場合、ボタンが無効化されること', () => {
    render(
      <UserTriggerReaction
        pinId={pinId}
        isReacted={false}
        userRole="general"
        isDisabled={true}
        onReaction={mockOnReaction}
      />
    );

    const button = screen.getByRole('button', { name: 'リアクション' });
    expect(button).toBeDisabled();
  });
});
