import { Heart } from 'lucide-react';
import { Button } from './ui/button';

interface UserTriggerReactionProps {
  pinId: string;
  isReacted: boolean;
  userRole: string;
  isDisabled: boolean;
  onReaction: (pinId: string) => void;
}

/**
 * Render a reaction button that lets non-business users trigger a heart reaction for a pin.
 *
 * @param pinId - The identifier of the pin associated with the reaction.
 * @param isReacted - Whether the current user has already reacted; controls appearance and label.
 * @param userRole - The role of the current user; users with the value `'business'` cannot react and the button is disabled.
 * @param isDisabled - When true, disables user interaction regardless of role.
 * @param onReaction - Callback invoked as `onReaction(pinId)` when a permitted user clicks the button.
 * @returns A Button element showing the reaction state, disabling interaction for business users or when `isDisabled` is true, and calling `onReaction(pinId)` on click.
 */
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