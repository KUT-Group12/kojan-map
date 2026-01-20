// src/__tests__/AdminDashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminDashboard } from '../components/AdminDashboard';
import { User, Report } from '../types';


globalThis.fetch = jest.fn();

describe('AdminDashboard', () => {
    const user: User = {
        googleId: 'g123',
        fromName: 'テスト太郎',
        gmail: 'test@example.com',
        registrationDate: '2026-01-21',
        role: 'general',
    };
    const onLogout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockImplementation((url) => {
            // 簡易モックデータ返す
            if (url.endsWith('/admin/summary')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            stats: {
                                totalUsers: 100,
                                activeUsers: 50,
                                totalPosts: 200,
                                totalReactions: 300,
                                businessUsers: 20,
                                pendingReports: 5,
                            },
                            activity: [{ date: '2026-01-21', posts: 5, reactions: 10 }],
                            genres: [{ name: '音楽', value: 30, color: '#ff0000' }],
                        }),
                });
            }
            if (url.endsWith('/admin/reports')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve([{ reportId: 1, postId: 1, reportFlag: false, text: '通報内容' }]),
                });
            }
            if (url.endsWith('/users')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve([{ googleId: 'g123', fromName: 'テスト太郎', email: 'test@example.com' }]),
                });
            }
            if (url.endsWith('/internal/asks')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve([
                            {
                                askId: 1,
                                fromName: '田中 太郎',
                                email: 'tanaka@example.com',
                                role: 'general',
                                subject: '問い合わせ1',
                                text: '本文',
                                askFlag: false,
                                date: '2026-01-21',
                                userId: 'u1',
                            },
                        ]),
                });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });
    });

    test('概要タブの初期表示とAPI呼び出し', async () => {
        render(<AdminDashboard user={user} onLogout={onLogout} />);

        // 初期は概要タブ
        expect(screen.getByText(/ダッシュボード概要/)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('100')).toBeInTheDocument(); // 総ユーザー数
            expect(screen.getByText('50')).toBeInTheDocument(); // アクティブユーザー
            expect(screen.getByText('200')).toBeInTheDocument(); // 総投稿数
        });
    });

    test('タブ切り替えで各子コンポーネントが表示される', async () => {
        render(<AdminDashboard user={user} onLogout={onLogout} />);

        // 通報管理タブ
        fireEvent.click(screen.getByText('通報管理'));
        await waitFor(() => {
            expect(screen.getByText('通報管理')).toBeInTheDocument();
        });

        // ユーザー管理タブ
        fireEvent.click(screen.getByText('ユーザー管理'));
        await waitFor(() => {
            expect(screen.getByText('テスト太郎')).toBeInTheDocument();
        });

        // お問い合わせタブ
        fireEvent.click(screen.getByText('お問い合わせ'));
        await waitFor(() => {
            expect(screen.getByText('田中 太郎')).toBeInTheDocument();
            expect(screen.getByText('問い合わせ1')).toBeInTheDocument();
        });
    });

    test('ログアウトボタンが動作する', () => {
        render(<AdminDashboard user={user} onLogout={onLogout} />);
        const logoutBtn = screen.getByRole('button', { name: /ログアウト/i });
        fireEvent.click(logoutBtn);
        expect(onLogout).toHaveBeenCalled();
    });
});
