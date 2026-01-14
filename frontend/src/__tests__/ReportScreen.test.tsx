import { render, screen, fireEvent } from '@testing-library/react';
import { ReportScreen } from '../components/ReportScreen';
import { toast } from 'sonner';

// sonnerのtoastをモック化
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ReportScreen コンポーネント', () => {
  const mockSetIsReporting = jest.fn();
  const mockOnReportComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期状態で「通報」ボタンが表示されていること', () => {
    render(
      <ReportScreen 
        isReporting={false} 
        setIsReporting={mockSetIsReporting} 
        onReportComplete={mockOnReportComplete} 
      />
    );

    const reportButton = screen.getByRole('button', { name: /通報/i });
    expect(reportButton).toBeInTheDocument();
  });

  test('「通報」ボタンをクリックすると setIsReporting(true) が呼ばれること', () => {
    render(
      <ReportScreen 
        isReporting={false} 
        setIsReporting={mockSetIsReporting} 
        onReportComplete={mockOnReportComplete} 
      />
    );

    const reportButton = screen.getByRole('button', { name: /通報/i });
    fireEvent.click(reportButton);

    expect(mockSetIsReporting).toHaveBeenCalledWith(true);
  });

  test('isReportingがtrueのとき、通報フォームが表示されること', () => {
    render(
      <ReportScreen 
        isReporting={true} 
        setIsReporting={mockSetIsReporting} 
        onReportComplete={mockOnReportComplete} 
      />
    );

    expect(screen.getByText('通報理由：')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('理由を入力')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  test('理由を入力せずに送信するとエラーが表示されること', () => {
    render(
      <ReportScreen 
        isReporting={true} 
        setIsReporting={mockSetIsReporting} 
        onReportComplete={mockOnReportComplete} 
      />
    );

    const submitButton = screen.getByRole('button', { name: '送信' });
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith('通報理由を入力してください');
    expect(mockOnReportComplete).not.toHaveBeenCalled();
  });

  test('理由を入力して送信すると成功し、フォームが閉じること', () => {
    render(
      <ReportScreen 
        isReporting={true} 
        setIsReporting={mockSetIsReporting} 
        onReportComplete={mockOnReportComplete} 
      />
    );

    const textarea = screen.getByPlaceholderText('理由を入力');
    fireEvent.change(textarea, { target: { value: '不適切な内容が含まれています' } });

    const submitButton = screen.getByRole('button', { name: '送信' });
    fireEvent.click(submitButton);

    expect(toast.success).toHaveBeenCalledWith('通報を受け付けました。運営が確認いたします。');
    expect(mockSetIsReporting).toHaveBeenCalledWith(false);
    expect(mockOnReportComplete).toHaveBeenCalled();
  });

  test('キャンセルボタンを押すと setIsReporting(false) が呼ばれること', () => {
    render(
      <ReportScreen 
        isReporting={true} 
        setIsReporting={mockSetIsReporting} 
        onReportComplete={mockOnReportComplete} 
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(mockSetIsReporting).toHaveBeenCalledWith(false);
  });
});