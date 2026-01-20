// src/__tests__/BusinessApplicationList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDisplayBusinessRequest, BusinessApplicationList } from '../components/AdminDisplayBusinessApplicationList';

describe('BusinessApplicationList', () => {
    const mockApplications: AdminDisplayBusinessRequest[] = [
        {
            requestId: 1,
            name: 'テスト株式会社',
            userId: 'testuser1',
            gmail: 'test1@gmail.com',
            phone: '090-1234-5678',
            address: '東京都千代田区1-1-1',
            applicationDate: '2026-01-21 12:34',
            fromName: '山田太郎',
        },
        {
            requestId: 2,
            name: 'サンプル有限会社',
            userId: 'testuser2',
            gmail: 'test2@gmail.com',
            phone: '080-9876-5432',
            address: '大阪府大阪市2-2-2',
            applicationDate: '2026-01-20 15:20',
            fromName: '鈴木花子',
        },
    ];

    it('申請がない場合にメッセージを表示する', () => {
        render(<AdminDisplayBusinessApplicationList applications={[]} onApprove={jest.fn()} onReject={jest.fn()} />);
        expect(screen.getByText('現在、未処理の申請はありません。')).toBeInTheDocument();
    });

    it('申請がある場合にカードを表示する', () => {
        render(<AdminDisplayBusinessApplicationList applications={mockApplications} onApprove={jest.fn()} onReject={jest.fn()} />);

        // 各申請者の事業者名が表示される
        expect(screen.getByText('テスト株式会社')).toBeInTheDocument();
        expect(screen.getByText('サンプル有限会社')).toBeInTheDocument();

        // 各申請者の Gmail が表示される
        expect(screen.getByText('test1@gmail.com')).toBeInTheDocument();
        expect(screen.getByText('test2@gmail.com')).toBeInTheDocument();

        // 承認・却下ボタンがある
        expect(screen.getAllByText('承認').length).toBe(2);
        expect(screen.getAllByText('却下').length).toBe(2);
    });

    it('承認ボタンを押すと onApprove が呼ばれる', () => {
        const onApprove = jest.fn();
        render(<AdminDisplayBusinessApplicationList applications={mockApplications} onApprove={onApprove} onReject={jest.fn()} />);

        fireEvent.click(screen.getAllByText('承認')[0]);
        expect(onApprove).toHaveBeenCalledWith(1);

        fireEvent.click(screen.getAllByText('承認')[1]);
        expect(onApprove).toHaveBeenCalledWith(2);
    });

    it('却下ボタンを押すと onReject が呼ばれる', () => {
        const onReject = jest.fn();
        render(<BusinessApplicationList applications={mockApplications} onApprove={jest.fn()} onReject={onReject} />);

        fireEvent.click(screen.getAllByText('却下')[0]);
        expect(onReject).toHaveBeenCalledWith(1);

        fireEvent.click(screen.getAllByText('却下')[1]);
        expect(onReject).toHaveBeenCalledWith(2);
    });
});
