import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Trash2 } from 'lucide-react';
import { Pin } from '../types';
import { genreColors, genreLabels } from '../lib/mockData';
import { ReactNode } from 'react';

interface DisplayPostHistoryProps {
  pin: Pin;
  onPinClick: (pin: Pin) => void;
  onDeletePin: (pinId: string) => void;
  formatDate: (date: Date) => string;
  deleteButton: ReactNode;
}

export function DisplayPostHistory({
  pin,
  onPinClick,
  formatDate,
  deleteButton,
}: DisplayPostHistoryProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={() => onPinClick(pin)}>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium">{pin.title}</h3>
            <Badge style={{ backgroundColor: genreColors[pin.genre] }}>
              {genreLabels[pin.genre]}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{pin.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {pin.reactions}
            </span>
            <span>{formatDate(pin.createdAt)}</span>
          </div>
        </div>
        <div className="ml-4">{deleteButton}</div>
      </CardContent>
    </Card>
  );
}
