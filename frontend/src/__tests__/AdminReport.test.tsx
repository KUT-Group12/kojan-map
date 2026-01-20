// src/__tests__/AdminReport.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import AdminReport, { AdminReportProps } from '../components/AdminReport';

describe('AdminReport', () => {
  const mockReports: AdminReportProps['reports'] = [
    {
      reportId: 1,
      userId: 'user1',
      reason: '不適切な投稿',
      postId: 101,
      reportFlag: false,
      removeFlag: false,
      date: '2026-01-21 12:00',
    },
    {
      reportId: 2,
      userId: 'user2',
      reason: 'スパム投稿',
      postId: 102,
      reportFlag: true,
      removeFlag: true,
      date: '2026-01-20 10:00',
    },
    {
      reportId: 3,
      userId: 'user3',
      reason: '迷惑行為',
      postId: 103,
      reportFlag: false,
      removeFlag: false,
      date: '2026-01-22 09:00',
    },
  ];

  it('通報がない場合にメッセージを表示する', () => {
    render(<AdminReport reports={[]} onDeletePost={jest.fn()} onResolveReport={jest.fn()} />);
    expect(screen.getByText('現在、未処理の通報はありません。')).toBeInTheDocument();
  });

  it('通報がある場合に正しく表示される', () => {
    render(
      <AdminReport reports={mockReports} onDeletePost={jest.fn()} onResolveReport={jest.fn()} />
    );

    // 未処理通報の理由が赤色クラスを持つ
    expect(screen.getByText('不適切な投稿')).toHaveClass('text-red-600');
    expect(screen.getByText('迷惑行為')).toHaveClass('text-red-600');

    // 処理済みの理由は灰色クラス
    expect(screen.getByText('スパム投稿')).toHaveClass('text-slate-500');

    // 削除済みバッジが表示される
    expect(screen.getByText('投稿削除済み')).toBeInTheDocument();

    // ボタンが未処理の通報にだけ表示される
    const deleteButtons = screen.getAllByText('投稿削除');
    expect(deleteButtons.length).toBe(2); // reportFlag=false の通報のみ
    const rejectButtons = screen.getAllByText('却下');
    expect(rejectButtons.length).toBe(2);
  });

  it('ボタンをクリックするとコールバックが呼ばれる', () => {
    const onDeletePost = jest.fn();
    const onResolveReport = jest.fn();
    render(
      <AdminReport
        reports={mockReports}
        onDeletePost={onDeletePost}
        onResolveReport={onResolveReport}
      />
    );

    fireEvent.click(screen.getAllByText('投稿削除')[0]);
    expect(onDeletePost).toHaveBeenCalledWith(103); // 未処理の最新の日付が先頭に来る

    fireEvent.click(screen.getAllByText('却下')[1]);
    expect(onResolveReport).toHaveBeenCalledWith(1);
  });

  it('通報が未処理→処理済み、新しい順にソートされる', () => {
    render(
      <AdminReport reports={mockReports} onDeletePost={jest.fn()} onResolveReport={jest.fn()} />
    );
    const displayedReasons = screen
      .getAllByText(/.+/)
      .filter((el) => ['不適切な投稿', 'スパム投稿', '迷惑行為'].includes(el.textContent || ''))
      .map((el) => el.textContent);
    // 未処理（最新）→未処理（古い）→処理済み
    expect(displayedReasons).toEqual(['迷惑行為', '不適切な投稿', 'スパム投稿']);
  });
});
