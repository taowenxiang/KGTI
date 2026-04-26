interface PixelAvatarProps {
  pixelArt: string[];
  color: string;
  size?: number;
  className?: string;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
  const B = Math.max((num & 0x0000ff) - amt, 0);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export default function PixelAvatar({ pixelArt, color, size = 4, className = '' }: PixelAvatarProps) {
  if (!pixelArt || pixelArt.length === 0) return null;

  const shadowColor = darkenColor(color, 40);

  const charToColor: Record<string, string | undefined> = {
    '#': color,
    '-': shadowColor,
    'o': '#ffffff',
    '.': 'transparent',
  };

  const rows = pixelArt.length;
  const cols = pixelArt[0]?.length || 0;

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
        gap: 0,
        imageRendering: 'pixelated',
      }}
    >
      {pixelArt.map((row, rIdx) =>
        row.split('').map((ch, cIdx) => {
          const bg = charToColor[ch] || 'transparent';
          return (
            <div
              key={`${rIdx}-${cIdx}`}
              style={{
                width: size,
                height: size,
                backgroundColor: bg,
              }}
            />
          );
        })
      )}
    </div>
  );
}
