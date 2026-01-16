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
 * Render a reaction button that updates its appearance and interactivity based on the user's role and reaction state.
 *
 * @param pinId - Identifier of the pin to pass to `onReaction` when the button is activated
 * @param isReacted - `true` if the current user has reacted to the pin; affects button variant and icon fill
 * @param userRole - The user's role; when equal to `'business'` the button is disabled and interaction is prevented
 * @param isDisabled - When `true`, the button is disabled and does not invoke `onReaction`
 * @param onReaction - Callback invoked with `pinId` when a non-disabled, non-business user clicks the button
 * @returns A button element containing a heart icon and a label, with disabled state and styling reflecting the provided props
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