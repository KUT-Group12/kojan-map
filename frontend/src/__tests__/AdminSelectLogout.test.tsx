import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminSelectLogout } from '../components/AdminSelectLogout';

// fetchのグローバルモック
vi.stubGlobal('fetch', vi.fn());

describe('AdminSelectLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.location.href のモック化
    // jsdomでは直接 location.href を書き換えられないため、deleteしてから再定義
    const location = window.location;
    delete (window as any).location;
    (window as any).location = { ...location, href: '' };
  });

  const getFetchMock = () => globalThis.fetch as any;

  it('ログアウトボタンをクリックするとAPIが呼ばれ、トップページへ遷移すること', async () => {
    // APIの成功をシミュレート
    getFetchMock().mockResolvedValueOnce({ ok: true });

    render(<AdminSelectLogout />);

    const logoutButton = screen.getByRole('button', { name: 'ログアウト' });
    fireEvent.click(logoutButton);

    // 1. API呼び出しの確認
    expect(getFetchMock()).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'PUT' })
    );

    // 2. 画面遷移の確認 (finallyブロックで実行されるため待機)
    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });
  });

  it('APIがエラーになってもトップページへ遷移すること (finallyブロックの動作)', async () => {
    // APIのエラーをシミュレート
    getFetchMock().mockRejectedValueOnce(new Error('Network Error'));

    render(<AdminSelectLogout />);

    const logoutButton = screen.getByRole('button', { name: 'ログアウト' });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });
  });
});
