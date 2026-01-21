import { Card, CardContent } from './ui/card';
import { Pin } from '../types';
import { DisplayPostHistory } from './DisplayPostHistory';
import { SelectPostDeletion } from './SelectPostDeletion';

interface SelectPostHistoryProps {
  pins: Pin[];
  onPinClick: (pin: Pin) => void;
  onDeletePin: (pinId: string) => void;
}

export function SelectPostHistory({ pins, onPinClick, onDeletePin }: SelectPostHistoryProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (pins.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          まだ投稿がありません
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pins.map((pin) => (
        <DisplayPostHistory
          key={pin.id}
          pin={pin}
          onPinClick={onPinClick}
          onDeletePin={onDeletePin}
          formatDate={formatDate}
          /* 投稿削除 */
          deleteButton={
            <SelectPostDeletion
              pinId={pin.id}
              onDelete={(id) => onDeletePin(id)}
              onClose={() => { }}
            />
          }
        />
      ))}
    </div>
  );
}