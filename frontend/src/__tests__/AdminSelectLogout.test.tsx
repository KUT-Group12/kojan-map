beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
// src/__tests__/AdminSelectLogout.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminSelectLogout } from '../components/AdminSelectLogout';

describe('AdminSelectLogout', () => {
  beforeEach(() => {
    // fetch をモック
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      })
    ) as jest.Mock;

    // location.href をモック
    // @ts-ignore
    delete (window as any).location;
    window.location = {
      href: 'http://localhost/',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ログアウトボタンが表示される', () => {
    render(<AdminSelectLogout />);
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('クリックで fetch が呼ばれて画面遷移する', async () => {
    render(<AdminSelectLogout />);
    fireEvent.click(screen.getByText('ログアウト'));

    await waitFor(() => {
      // fetch が PUT メソッドで呼ばれる
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      // 画面遷移が発生
      expect(window.location.href).toBe('/');
    });
  });

  it('fetch が失敗しても画面遷移する', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject('error'));

    render(<AdminSelectLogout />);
    fireEvent.click(screen.getByText('ログアウト'));

    await waitFor(() => {
      expect(window.location.href).toContain('/');
    });
  });
});
