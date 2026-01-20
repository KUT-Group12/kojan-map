import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Upload } from 'lucide-react';
import { User, PinGenre, Business } from '../types';
import { genreLabels } from '../lib/mockData';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreatePinModalProps {
  user: User;
  businessData?: Business;
  onClose: () => void;
  onCreate: (pin: {
    latitude: number;
    longitude: number;
    title: string;
    text: string;
    genre: PinGenre;
    images: string[];
  }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export function NewPostScreen({
  user,
  businessData,
  onClose,
  onCreate,
  initialLatitude,
  initialLongitude,
}: CreatePinModalProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [genre, setGenre] = useState<PinGenre>('other');

  // 初期値の優先順位を設定（引数があればそれを使い、なければデフォルト値を設定）
  const [latitude, setLatitude] = useState(String(initialLatitude ?? 33.6071));
  const [longitude, setLongitude] = useState(String(initialLongitude ?? 133.6822));
  const [images, setImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイルをBase64に変換するユーティリティ
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch (error) {
        console.error('ファイルの読み込みに失敗しました', error);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = ''; // 同じファイルを再度選択できるようにリセット
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    if (title.length > 50) {
      toast.error('タイトルは50文字以内で入力してください');
      return;
    }

    if (!text.trim()) {
      toast.error('説明を入力してください');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('有効な位置情報を入力してください');
      return;
    }

    /* バックエンドなしでも動く */
    try {
      await onCreate({
        latitude: lat,
        longitude: lng,
        title,
        text,
        genre,
        images,
      });
      toast.success('投稿しました！');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('投稿に失敗しました');
    }
  };

  /* バックエンドあり 
    try {
      // 1. バックエンドと繋げる
      const response = await fetch('http://localhost:8080/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId: 1, // placeIdの算出 (今は1固定)
          genreId: GENRE_MAP[genre], // 文字列を数値IDに変換
          userId: user.googleId,
          title: title,
          text: text,
          postImage: images.length > 0 ? images[0] : '', // 仕様書の string 型に対応
        }),
      });

      if (!response.ok) throw new Error('サーバーへの投稿に失敗しました');

      const data = await response.json();
      console.log('Post created with ID:', data.postId);

      // 2. コンポーネントの呼び出し
      await onCreate({
        latitude: lat,
        longitude: lng,
        title,
        text,
        genre,
        images,
      });

      toast.success('投稿しました！');
      onClose();
    } catch (error) {
      console.error('投稿エラー:', error);
      toast.error('投稿に失敗しました。サーバーが起動しているか確認してください。');
    }
  };*/

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規投稿</DialogTitle>
          <DialogDescription className="sr-only">新しいピン投稿を作成します</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="new-post-form">
          {/* タイトル入力 */}
          <div>
            <Label htmlFor="title">タイトル *</Label>
            <span
              className={`text-[10px] ${title.length > 50 ? 'text-red-500 font-bold' : 'text-slate-400'}`}
            >
              {title.length} / 50文字
            </span>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="投稿のタイトルを入力"
              required
            />
          </div>

          {/* 説明入力 */}
          <div>
            <Label htmlFor="text">説明 *</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="詳しい説明を入力してください"
              rows={4}
              required
            />
          </div>

          {/* ジャンル選択 */}
          <div>
            <Label htmlFor="genre">ジャンル *</Label>
            <Select value={genre} onValueChange={(value) => setGenre(value as PinGenre)}>
              <SelectTrigger id="genre">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(genreLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 位置情報入力 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">緯度 *</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="33.6071"
                required
              />
            </div>
            <div>
              <Label htmlFor="longitude">経度 *</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="133.6822"
                required
              />
            </div>
          </div>

          {/* 画像アップロード */}
          <div>
            <Label>画像（任意）</Label>
            <div className="mt-2 space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
                data-testid="file-input"
              />

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <ImageWithFallback
                        src={image}
                        alt={`投稿画像 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`画像 ${index + 1} を削除`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button type="button" variant="outline" onClick={triggerFileInput} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                画像をアップロード
              </Button>
            </div>
          </div>

          {/* ユーザーロールに応じた表示 */}
          {user.role === 'business' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                事業者名「{businessData?.businessName || user?.fromName || '（未設定）'}
                」として投稿されます
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">一般ユーザーの投稿は匿名で表示されます</p>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              投稿する
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
