import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Heart } from 'lucide-react';
import { Pin } from '../types';
import { genreColors, genreLabels } from '../lib/mockData';

interface UserReactionViewScreenProps {
  reactedPins: Pin[];
  onPinClick: (pin: Pin) => void;
}

export function UserReactionViewScreen({ 
  reactedPins, 
  onPinClick 
}: UserReactionViewScreenProps) {
  
  if (reactedPins.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          まだリアクションがありません
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {reactedPins.map((pin) => (
        <Card 
          key={pin.id} 
          className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => onPinClick(pin)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium">{pin.title}</h3>
              <Badge style={{ backgroundColor: genreColors[pin.genre] }}>
                {genreLabels[pin.genre]}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {pin.description}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                  投稿者: {pin.userRole === 'business' ? pin.businessName : pin.userName}
                </span>
              </div>
              <div className="flex items-center text-red-500 font-medium">
                <Heart className="w-4 h-4 mr-1 fill-current" />
                {pin.reactions}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}