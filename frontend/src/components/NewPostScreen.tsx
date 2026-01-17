import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { MapPin, Upload } from 'lucide-react';
import { User, PinGenre } from '../types';
import { genreLabels } from '../lib/mockData';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreatePinModalProps {
  user: User;
  onClose: () => void;
  onCreate: (pin: {
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    genre: PinGenre;
    images: string[];
  }) => void;
  // optional initial coordinates to prefill the form when creating at a specific location
  initialLatitude?: number;
  initialLongitude?: number;
}

export function NewPostScreen({
  user,
  onClose,
  onCreate,
  initialLatitude,
  initialLongitude,
}: CreatePinModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState<PinGenre>('other');
  const [latitude, setLatitude] = useState(String(initialLatitude ?? 35.6762));
  const [longitude, setLongitude] = useState(String(initialLongitude ?? 139.6503));
  const [images, setImages] = useState<string[]>([]);

  /* 画像をアップロードするための処理 */
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const previewUrls: string[] = [];

    for (const file of Array.from(files)) {
      // プレビュー用
      previewUrls.push(URL.createObjectURL(file));

      // バックエンド送信用のBase64変換 (方法Aの場合)
      const base64 = await fileToBase64(file);
      newImages.push(base64);
    }

    // プレビューとデータ保持を分けるか、両方管理する必要があります
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = '';
  };

  // ボタンがクリックされた時に隠しinputをクリックさせる
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  /*
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    if (!description.trim()) {
      toast.error('説明を入力してください');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('有効な位置情報を入力してください');
      return;
    }

    onCreate({
      latitude: lat,
      longitude: lng,
      title,
      description,
      genre,
      images,
    });

    toast.success('投稿しました！');
  };*/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    if (!description.trim()) {
      toast.error('説明を入力してください');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('有効な位置情報を入力してください');
      return;
    }

    // 送信前に数値を確定させる
    //const lat = parseFloat(latitude);
    //const lng = parseFloat(longitude);

    // バックエンドへAPIリクエスト (onCreateの中でfetchを呼ぶ想定)
    try {
      await onCreate({
        latitude: lat,
        longitude: lng,
        title,
        description,
        genre,
        images, // Base64の配列
      });
      toast.success('投稿しました！');
      onClose();
    } catch (error) {
      toast.error('投稿に失敗しました');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規投稿</DialogTitle>
          <DialogDescription className="sr-only">新しいピン投稿を作成します</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タイトル */}
          <div>
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="投稿のタイトルを入力"
              required
            />
          </div>

          {/* 説明 */}
          <div>
            <Label htmlFor="description">説明 *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳しい説明を入力してください"
              rows={4}
              required
            />
          </div>

          {/* ジャンル */}
          <div>
            <Label htmlFor="genre">ジャンル *</Label>
            <Select value={genre} onValueChange={(value) => setGenre(value as PinGenre)}>
              <SelectTrigger>
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

          {/* 位置情報 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">緯度 *</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="35.6762"
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
                placeholder="139.6503"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>実際のアプリでは、地図上でクリックまたは店舗名検索で位置を指定できます</span>
            </p>
          </div>

          {/* 画像 */}
          <div>
            <Label>画像（任意）</Label>
            <div className="mt-2 space-y-2">
              {/* 非表示のファイル入力 */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple // 複数選択を許可
                className="hidden"
              />

              {/* プレビュー表示エリア */}
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

          {/* 投稿者情報表示 */}
          {user.role === 'business' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">事業者として投稿されます</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">一般ユーザーの投稿は匿名で表示されます</p>
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              投稿する
            </Button>
            {/*
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>*/}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
