import { render, screen } from '@testing-library/react';
import { DisplayUserSetting } from '../components/DisplayUserSetting'; // パスは適宜調整してください

describe('DisplayUserSetting コンポーネント', () => {
  const defaultProps = {
    title: 'アカウント設定',
    description: 'プロフィールの情報を変更できます。',
  };

  test('タイトルと説明文が正しく表示されること', () => {
    render(
      <DisplayUserSetting {...defaultProps}>
        <div data-testid="child-element">設定内容</div>
      </DisplayUserSetting>
    );

    // タイトルの確認
    expect(screen.getByText('アカウント設定')).toBeInTheDocument();
    // 説明文の確認
    expect(screen.getByText('プロフィールの情報を変更できます。')).toBeInTheDocument();
  });

  test('子要素（children）が正しくレンダリングされること', () => {
    render(
      <DisplayUserSetting {...defaultProps}>
        <button>保存する</button>
      </DisplayUserSetting>
    );

    // children内の要素が取得できるか確認
    expect(screen.getByRole('button', { name: '保存する' })).toBeInTheDocument();
  });

  test('説明文（description）がない場合に表示されないこと', () => {
    render(
      <DisplayUserSetting title="説明なしタイトル">
        <div>Content</div>
      </DisplayUserSetting>
    );

    // タイトルは存在する
    expect(screen.getByText('説明なしタイトル')).toBeInTheDocument();
    // description要素が存在しないことを確認 (queryByTextは存在しない場合にnullを返す)
    expect(screen.queryByText(defaultProps.description)).not.toBeInTheDocument();
  });

  test('カスタムクラス名が適用されていること', () => {
    const customClass = 'custom-card-class';
    const { container } = render(
      <DisplayUserSetting {...defaultProps} className={customClass}>
        <div>Content</div>
      </DisplayUserSetting>
    );

    // Card (一番外側のdiv) にクラスが含まれているか確認
    // container.firstChild は CardコンポーネントのDOMを指します
    expect(container.firstChild).toHaveClass(customClass);
  });
});
