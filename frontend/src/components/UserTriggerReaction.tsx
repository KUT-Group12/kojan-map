import { Heart } from 'lucide-react';
import { Button } from './ui/button';

interface UserTriggerReactionProps {
  pinId: number;
  isReacted: boolean;
  userRole: string;
  isDisabled: boolean;
  onReaction: (pinId: number) => void;
}

export function UserTriggerReaction({
  pinId,
  isReacted,
  userRole,
  isDisabled,
  onReaction,
}: UserTriggerReactionProps) {
  const isBusiness = userRole === 'business';

  return (
    <Button
      onClick={() => {
        if (isDisabled || isBusiness) return;
        onReaction(pinId);
      }}
      variant={isReacted ? 'default' : 'outline'}
      className="flex-1"
      disabled={isDisabled || isBusiness}
    >
      <Heart className={`w-4 h-4 mr-2 ${isReacted ? 'fill-white' : ''}`} />
      {isBusiness ? '事業者はリアクション不可' : isReacted ? 'リアクション済み' : 'リアクション'}
    </Button>
  );
}
