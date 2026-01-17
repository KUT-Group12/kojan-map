import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export interface Inquiry {
  askId: number; // INT -> number
  date: string; // DATETIME -> ISO string
  subject: string; // VARCHAR(100) -> 件名
  text: string; // TEXT -> 本文 (messageから変更)
  userId: string; // VARCHAR(50) -> Google ID (fromNameやroleの代わり)
  askFlag: boolean; // BOOLEAN (false: 未対応, true: 対応済み)
  // 以下はフロントエンドの管理上必要なプロパティ
  email: string;
  fromName: string; // DBに名前カラムがない場合、userIdから引くか結合が必要
  role: 'general' | 'business';
  draft?: string; // 下書き
}

export interface AdminContactManagementProps {
  inquiries: Inquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
  onDeleteInquiry: (askId: number) => void; // string -> number
}

export default function AdminContactManagement({
  inquiries,
  setInquiries,
  onDeleteInquiry,
}: AdminContactManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingInquiry, setReplyingInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');

  // フィルタリングロジック
  const filteredInquiries = inquiries.filter((it) => {
    const q = searchQuery.trim().toLowerCase();
    // status !== 'open' -> askFlag (対応済み)
    if (showOnlyOpen && it.askFlag) return false;
    if (!q) return true;
    return (
      it.fromName.toLowerCase().includes(q) ||
      it.email.toLowerCase().includes(q) ||
      it.text.toLowerCase().includes(q) // message -> text
    );
  });

  const handleOpenReply = (inq: Inquiry) => {
    setReplyingInquiry(inq);
    setReplyText(inq.draft || ''); // 下書きがあればセット
    setReplyModalOpen(true);
  };

  const handleSendEmail = () => {
    if (!replyingInquiry) return;
    setInquiries((prev) =>
      prev.map((q) =>
        // id -> askId, status -> askFlag
        q.askId === replyingInquiry.askId ? { ...q, askFlag: true, draft: undefined } : q
      )
    );
    toast.success('メールを送信しました。問い合わせを対応済みにしました。');
    closeModal();
  };

  const handleSaveDraft = () => {
    if (!replyingInquiry) return;
    setInquiries((prev) =>
      prev.map((q) => (q.askId === replyingInquiry.askId ? { ...q, draft: replyText } : q))
    );
    toast.success('下書きを保存しました。');
    closeModal();
  };

  const closeModal = () => {
    setReplyModalOpen(false);
    setReplyingInquiry(null);
    setReplyText('');
  };

  return (
    <div className="max-w-5xl space-y-4">
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle>お問い合わせ一覧</CardTitle>
                <CardDescription>一般会員・事業者からの問い合わせを管理します</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white rounded shadow px-2 py-1 border">
                <input
                  className="w-64 px-2 py-1 text-sm outline-none"
                  placeholder="検索（名前・メール・件名・本文）"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                variant={showOnlyOpen ? 'default' : 'outline'}
                onClick={() => setShowOnlyOpen((v) => !v)}
                className="shadow-sm"
              >
                未対応のみ
              </Button>
              <Badge className="bg-emerald-500">{filteredInquiries.length}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredInquiries.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                条件に一致する問い合わせはありません。
              </div>
            ) : (
              filteredInquiries.map((inq) => (
                <Card key={inq.askId} className="shadow-sm border-slate-100">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-medium">{inq.fromName}</p>
                          <Badge
                            className={inq.role === 'business' ? 'bg-blue-600' : 'bg-slate-400'}
                          >
                            {inq.role === 'business' ? '事業者' : '一般'}
                          </Badge>
                          <span className="text-xs text-slate-500">{inq.date}</span>
                          {/* askFlag === false が「未処理」 */}
                          <Badge className={!inq.askFlag ? 'bg-red-500' : 'bg-slate-400'}>
                            {!inq.askFlag ? '未対応' : '対応済み'}
                          </Badge>
                          {inq.draft && (
                            <Badge className="bg-yellow-500 text-slate-900">下書きあり</Badge>
                          )}
                        </div>

                        {/* subject（件名）と text（本文）を表示 */}
                        <p className="text-sm font-bold text-slate-800 mb-1">{inq.subject}</p>
                        <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">
                          {inq.text}
                        </p>
                        <p className="text-xs text-slate-400">
                          {inq.email} <span className="ml-2">| UserID: {inq.userId}</span>
                        </p>
                      </div>

                      <div className="flex flex-col ml-4 space-y-2">
                        {/* 未対応（false）の場合のみ返信ボタンを表示 */}
                        {!inq.askFlag && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleOpenReply(inq)}
                          >
                            返信
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteInquiry(inq.askId)}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 返信モーダル */}
      {replyModalOpen && replyingInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg w-[640px] max-w-full p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold">{`返信: ${replyingInquiry.fromName} 様`}</h3>
                <p className="text-sm text-slate-500">
                  宛先: {replyingInquiry.email} | 件名: {replyingInquiry.subject}
                </p>
              </div>
              <button className="text-slate-400 hover:text-slate-600" onClick={closeModal}>
                ✕
              </button>
            </div>

            <textarea
              className="w-full h-48 p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="返信内容を入力してください..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="flex justify-end space-x-3 mt-5">
              <Button variant="ghost" onClick={closeModal}>
                キャンセル
              </Button>
              <Button variant="outline" onClick={handleSaveDraft}>
                下書き保存
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSendEmail}
              >
                メールで送信
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
