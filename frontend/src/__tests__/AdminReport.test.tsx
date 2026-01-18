import { render, screen, fireEvent } from '@testing-library/react';
import AdminReport, { Report } from '../components/AdminReport';

const mockReports: Report[] = [
  {
    id: 'rep-1',
    pinId: 'pin-101',
    reporter: 'ユーザーA',
    reason: '不適切なコンテンツ',
    status: 'pending',
    date: '2023-10-01',
  },
  {
    id: 'rep-2',
    pinId: 'pin-102',
    reporter: 'ユーザーB',
    reason: '嫌がらせ',
    status: 'resolved',
    date: '2023-10-05',
  },
  {
    id: 'rep-3',
    pinId: 'pin-103',
    reporter: 'ユーザーC',
    reason: 'スパム',
    status: 'pending',
    date: '2023-10-10',
  },
];

describe('AdminReport コンポーネント', () => {
  const mockOnDeletePost = jest.fn();
  const mockOnResolveReport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('通報一覧が正しくレンダリングされ、未処理が優先的に表示されること', () => {
    render(
      <AdminReport
        reports={mockReports}
        onDeletePost={mockOnDeletePost}
        onResolveReport={mockOnResolveReport}
      />
    );

    // 全ての通報者が表示されているか
    expect(screen.getByText('ユーザーA')).toBeInTheDocument();
    expect(screen.getByText('ユーザーB')).toBeInTheDocument();
    expect(screen.getByText('ユーザーC')).toBeInTheDocument();

    // ソートの確認: pending の中で最新の 'ユーザーC' が最初に来ているか
    const reportCards = screen.getAllByText(/通報者:/).map(el => el.parentElement?.textContent);
    expect(reportCards[0]).toContain('ユーザーC'); // pending 且つ 日付が新しい
    expect(reportCards[1]).toContain('ユーザーA'); // pending
    expect(reportCards[2]).toContain('ユーザーB'); // resolved なので最後
  });

  test('「投稿削除」ボタンをクリックすると、正しい pinId で onDeletePost が呼ばれること', () => {
    render(
      <AdminReport
        reports={mockReports}
        onDeletePost={mockOnDeletePost}
        onResolveReport={mockOnResolveReport}
      />
    );

    // ユーザーAの通報カード内にある削除ボタンをクリック
    // getAllByRoleで取得し、期待する順番(1番目)のボタンを操作
    const deleteButtons = screen.getAllByRole('button', { name: /投稿削除/i });
    fireEvent.click(deleteButtons[1]); // ユーザーAは2番目(index 1)

    expect(mockOnDeletePost).toHaveBeenCalledWith('pin-101');
  });

  test('「却下」ボタンをクリックすると、正しい reportId で onResolveReport が呼ばれること', () => {
    render(
      <AdminReport
        reports={mockReports}
        onDeletePost={mockOnDeletePost}
        onResolveReport={mockOnResolveReport}
      />
    );

    const resolveButtons = screen.getAllByRole('button', { name: /却下/i });
    fireEvent.click(resolveButtons[0]); // ユーザーC(index 0)を却下

    expect(mockOnResolveReport).toHaveBeenCalledWith('rep-3');
  });

  test('処理済みの通報にはアクションボタンが表示されないこと', () => {
    render(
      <AdminReport
        reports={mockReports}
        onDeletePost={mockOnDeletePost}
        onResolveReport={mockOnResolveReport}
      />
    );

    // 処理済みのバッジを確認
    expect(screen.getByText('処理済み')).toBeInTheDocument();

    // 全体のボタン数をカウント (pendingは2件なので、削除2個、却下2個のはず)
    expect(screen.getAllByRole('button', { name: /投稿削除/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /却下/i })).toHaveLength(2);
  });
});