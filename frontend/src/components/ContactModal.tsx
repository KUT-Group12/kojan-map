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
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error('件名とメッセージを入力してください');
      return;
    }

    // 実際のアプリでは、ここでメール送信APIを呼び出す
    toast.success('お問い合わせを送信しました。運営から返信をお待ちください。');
    onClose();
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
            <Button type="submit" className="flex-1">
              送信する
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
