import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminReport from '../components/AdminReport';
import { Report } from '../types';

describe('AdminReport', () => {
  const mockReports: Report[] = [
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

  const mockOnDeletePost = vi.fn();
  const mockOnResolveReport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('通報がない場合にメッセージを表示する', () => {
    render(
      <AdminReport
        reports={[]}
        onDeletePost={mockOnDeletePost}
        onResolveReport={mockOnResolveReport}
      />
    );
    expect(screen.getByText('現在、未処理の通報はありません。')).toBeInTheDocument();
  });

  it('通報がある場合に正しく表示され、ステータスに応じてスタイルが変わる', () => {
    render(
      <AdminReport
        reports={mockReports}
        onDeletePost={mockOnDeletePost}
        onResolveReport={mockOnResolveReport}
      />
    );

    // 未処理通報 (reportFlag=false) のテキスト確認
    const unresolveText = screen.getByText('不適切な投稿');
    expect(unresolveText).toHaveClass('text-red-600');

    // 処理済み通報 (reportFlag=true) のテキスト確認
    const resolvedText = screen.getByText('スパム投稿');
    expect(resolvedText).toHaveClass('text-slate-500');

    // 削除済みフラグがある場合のバッジ確認
    expect(screen.getByText('投稿削除済み')).toBeInTheDocument();
  });

  it('ボタンをクリックすると正しいIDでコールバックが呼ばれる', () => {
    render(
      <AdminReport
        reports={mockReports}
        onDeletePost={mockOnDeletePost}
        onResolveReport={mockOnResolveReport}
      />
    );

    // 削除ボタンのテスト (postId を引数に取る想定)
    // 日付順でソートされている場合、一番上の「迷惑行為 (postId: 103)」の削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: /投稿削除/ });
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDeletePost).toHaveBeenCalledWith(103);

    // 却下ボタンのテスト (reportId を引数に取る想定)
    // 「不適切な投稿 (reportId: 1)」の却下ボタンをクリック
    const rejectButtons = screen.getAllByRole('button', { name: /却下/ });
    fireEvent.click(rejectButtons[1]);
    expect(mockOnResolveReport).toHaveBeenCalledWith(1);
  });

  it('通報が「未処理→処理済み」かつ「新しい順」に並んでいること', () => {
    render(
      <AdminReport
        reports={mockReports}
        onDeletePost={mockOnDeletePost}
        onResolveReport={mockOnResolveReport}
      />
    );

    // 1. 全ての「通報理由」のテキストを取得する
    // 「理由:」というテキストを含まない、純粋な理由（迷惑行為など）が書かれた要素を抽出
    const allReasons = ['迷惑行為', '不適切な投稿', 'スパム投稿'];
    const items = screen
      .getAllByText((content, element) => {
        return allReasons.includes(content) && element?.tagName.toLowerCase() === 'span';
      })
      .map((el) => el.textContent);

    // 2. 期待される並び順の検証
    // 期待値: 迷惑行為(未/01-22) > 不適切な投稿(未/01-21) > スパム投稿(済/01-20)
    expect(items[0]).toBe('迷惑行為');
    expect(items[1]).toBe('不適切な投稿');
    expect(items[2]).toBe('スパム投稿');
  });
});
