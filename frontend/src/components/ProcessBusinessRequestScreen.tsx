import { BusinessApplicationList } from './AdminDisplayBusinessApplicationList'; // 名前が変更されている場合は調整してください
import { AdminDisplayBusinessRequest } from './AdminDisplayBusinessApplicationList';

/**
 * 管理画面表示用の型定義
 * BusinessApplicationList と同じデータ構造を期待するため、ここで定義するか
 * 頻出するなら types/index.ts に移動しても良いでしょう。
 
interface AdminDisplayBusinessRequest extends BusinessRequest {
  gmail: string;
  applicationDate: string;
}*/

interface Props {
  // BusinessApplication から AdminDisplayBusinessRequest に変更
  applications: AdminDisplayBusinessRequest[];
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

/**
 * Render a processing screen that shows a header with a summary count and a list of business applications.
 *
 * @param applications - Array of business applications to display
 * @param onApprove - Callback invoked with an application's `id` when the application is approved
 * @param onReject - Callback invoked with an application's `id` when the application is rejected
 * @returns A React element that renders the business application processing screen
 */
export default function ProcessBusinessRequestScreen({ applications, onApprove, onReject }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">事業者申請の処理</h2>
          <p className="text-sm text-slate-500">
            M4-5 AdminGetBusinessApplications に基づく申請管理
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600">
            未処理案件: <span className="text-blue-600 text-lg">{applications.length}</span> 件
          </p>
        </div>
      </div>

      {/* 実際のリスト表示ロジック */}
      <BusinessApplicationList
        applications={applications}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}