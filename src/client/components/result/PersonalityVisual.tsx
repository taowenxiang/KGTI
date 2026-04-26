import { useMemo, useState } from 'react';
import type { Personality } from '@shared/types';
import { cn } from '../../lib/utils';
import PixelAvatar from './PixelAvatar';

type VisualVariant = 'hero' | 'card' | 'share';

interface PersonalityVisualProps {
  personality: Personality;
  variant?: VisualVariant;
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
}

export default function PersonalityVisual({
  personality,
  variant = 'hero',
  className,
  imageClassName,
  iconClassName,
}: PersonalityVisualProps) {
  const [failed, setFailed] = useState(false);

  const imageSrc = useMemo(() => {
    if (variant === 'share' && personality.shareImageFallback) {
      return personality.shareImageFallback;
    }

    if (!personality.heroImage) {
      return null;
    }

    if (variant === 'card') {
      return personality.heroImage.replace('/hero.png', '/card.png');
    }

    return personality.heroImage;
  }, [personality.heroImage, personality.shareImageFallback, variant]);

  const showImage = imageSrc && !failed;

  return (
    <div
      className={cn('overflow-hidden rounded-2xl', className)}
      style={{ backgroundColor: `${personality.color}18` }}
    >
      {showImage ? (
        <img
          src={imageSrc}
          alt={`${personality.id} · ${personality.name}`}
          className={cn('h-full w-full object-cover', imageClassName)}
          onError={() => setFailed(true)}
        />
      ) : personality.pixelArt ? (
        <div className="flex h-full w-full items-center justify-center">
          <PixelAvatar pixelArt={personality.pixelArt} color={personality.color} size={variant === 'card' ? 5 : 7} />
        </div>
      ) : (
        <div className={cn('flex h-full w-full items-center justify-center text-5xl', iconClassName)}>
          {personality.icon}
        </div>
      )}
    </div>
  );
}
