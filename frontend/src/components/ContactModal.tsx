// import { useState } from 'react';
import { getStoredJWT } from '../lib/auth';
import { useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User } from '../types';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { API_BASE_URL } from '../lib/apiBaseUrl';

interface ContactModalProps {
  user: User;
  onClose: () => void;
}

export function ContactModal({ user, onClose }: ContactModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中状態を追加

  // const handleSubmit = async (e: React.FormEvent) => {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error('件名とメッセージを入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getStoredJWT && getStoredJWT();
      // バックエンドAPI仕様に基づいたリクエスト
      const response = await fetch(`${API_BASE_URL}/api/contact/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          subject: subject,
          text: message, // 仕様書のリクエストパラメータ名は "text"
        }),
      });

      if (!response.ok) {
        throw new Error('送信に失敗しました');
      }

      const data = await response.json();
      const successMessage =
        data?.message ?? 'お問い合わせを送信しました。運営からの返信をお待ちください。';
      toast.success(successMessage);
      onClose();
    } catch (error) {
      console.error('Contact submit error:', error);
      toast.error('エラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            お問い合わせ
          </DialogTitle>
          <DialogDescription className="sr-only">運営へのお問い合わせフォーム</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="contact-form">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ご質問や要望は、登録されているメールアドレス（{user.gmail}）に返信されます。
            </p>
          </div>

          <div>
            <Label htmlFor="subject">件名 *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="お問い合わせの件名"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="message">メッセージ *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="お問い合わせ内容を詳しくご記入ください"
              rows={6}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            {/*
            <Button type="submit" className="flex-1">
              送信する
            </Button>*/}
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                '送信する'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
