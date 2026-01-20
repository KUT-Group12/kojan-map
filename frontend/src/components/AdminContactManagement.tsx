import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Inquiry as BaseInquiry } from '../types';

export interface Inquiry extends BaseInquiry {
  email: string; // 表示用
  fromName: string; // 表示用
  role: 'general' | 'business'; // 表示用バッジ分岐用
  draft?: string; // UI管理用（下書き）
}

export interface AdminContactManagementProps {
  inquiries: Inquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
  onDeleteInquiry: (askId: number) => void;
  onApproveInquiry: (askId: number) => void;
}

export default function AdminContactManagement({
  inquiries,
  setInquiries,
  onDeleteInquiry,
  onApproveInquiry,
}: AdminContactManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingInquiry, setReplyingInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');

  // フィルタリングロジック
  const filteredInquiries = inquiries.filter((it) => {
    const q = searchQuery.trim().toLowerCase();
    // askFlag === true は「対応済み」なので、未対応のみ表示（showOnlyOpen）時は除外
    if (showOnlyOpen && it.askFlag) return false;
    if (!q) return true;
    return (
      it.fromName.toLowerCase().includes(q) ||
      it.email.toLowerCase().includes(q) ||
      it.subject.toLowerCase().includes(q) || // 件名検索を追加
      it.text.toLowerCase().includes(q)
    );
  });

  const handleOpenReply = (inq: Inquiry) => {
    setReplyingInquiry(inq);
    setReplyText(inq.draft || '');
    setReplyModalOpen(true);
  };

  const handleSendEmail = () => {
    if (!replyingInquiry) return;

    //API呼んでいる？
    onApproveInquiry(replyingInquiry.askId);

    setInquiries((prev) =>
      prev.map((q) =>
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
              <div className="flex items-center bg-white rounded shadow px-2 py-1 border border-slate-200">
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
                          <p className="font-medium text-slate-900">{inq.fromName}</p>
                          <Badge
                            className={
                              inq.role === 'business'
                                ? 'bg-blue-600 shadow-none'
                                : 'bg-slate-400 shadow-none'
                            }
                          >
                            {inq.role === 'business' ? '事業者' : '一般'}
                          </Badge>
                          <span className="text-xs text-slate-500">{inq.date}</span>
                          <Badge
                            className={
                              !inq.askFlag ? 'bg-red-500 shadow-none' : 'bg-slate-400 shadow-none'
                            }
                          >
                            {!inq.askFlag ? '未対応' : '対応済み'}
                          </Badge>
                          {inq.draft && (
                            <Badge className="bg-amber-400 text-slate-900 border-none shadow-none">
                              下書きあり
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm font-bold text-slate-800 mb-1">{inq.subject}</p>
                        <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap leading-relaxed">
                          {inq.text}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {inq.email} <span className="mx-2">|</span> UserID: {inq.userId}
                        </p>
                      </div>

                      <div className="flex flex-col ml-4 space-y-2">
                        {!inq.askFlag && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                            onClick={() => handleOpenReply(inq)}
                          >
                            返信
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600"
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

      {/* 返信モーダル（省略なし） */}
      {replyModalOpen && replyingInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl w-[640px] max-w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{`返信: ${replyingInquiry.fromName} 様`}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  宛先: {replyingInquiry.email} <span className="mx-1">/</span> 件名:{' '}
                  {replyingInquiry.subject}
                </p>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <textarea
              className="w-full h-48 p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm leading-relaxed"
              placeholder="返信内容を入力してください..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="ghost" onClick={closeModal} className="text-slate-600">
                キャンセル
              </Button>
              <Button variant="outline" onClick={handleSaveDraft} className="border-slate-200">
                下書き保存
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
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
