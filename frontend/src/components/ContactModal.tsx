import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User } from '../types';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ContactModalProps {
  user: User;
  onClose: () => void;
}

export function ContactModal({ user, onClose }: ContactModalProps) {
  const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!subject.trim() || !message.trim()) {
      toast.error('件名とメッセージを入力してください');
      return;
    }

    try {
      const token = localStorage.getItem('kojanmap_jwt');
      if (!token) {
        toast.error('ログインが必要です');
        return;
      }

      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/contact/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          subject: subject.trim(),
          text: message.trim()
        })
      });

      if (!response.ok) throw new Error('送信に失敗しました');

      toast.success('お問い合わせを送信しました。運営から返信をお待ちください。');
      onClose();
    } catch (error) {
      console.error('Contact error:', error);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ご質問や要望は、登録されているメールアドレス（{user.email}）に返信されます。
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
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? '送信中…' : '送信する'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
