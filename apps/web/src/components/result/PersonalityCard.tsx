import type { Personality } from '@shared/types';
import { Sparkles } from 'lucide-react';
import PersonalityVisual from './PersonalityVisual';

interface PersonalityCardProps {
  personality: Personality;
  compact?: boolean;
}

export default function PersonalityCard({ personality, compact }: PersonalityCardProps) {
  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <PersonalityVisual personality={personality} variant="card" className="mb-3 h-20 w-20 rounded-xl" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{personality.id}</p>
        <h3 className="font-bold text-gray-800 text-sm">{personality.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{personality.title}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <PersonalityVisual personality={personality} className="mb-6 h-44 w-full max-w-sm rounded-3xl" />
        <div className="inline-flex items-center gap-1.5 text-sm text-gray-500 mb-2">
          <Sparkles className="w-4 h-4" />
          你的 KGTI 人格结果
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{personality.id} · {personality.name}</h1>
        <p className="text-lg text-gray-500 mb-6">{personality.title}</p>
        <div
          className="w-full h-1 rounded-full mb-6"
          style={{ backgroundColor: `${personality.color}30` }}
        >
          <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: personality.color }} />
        </div>
        <p className="text-gray-600 leading-relaxed max-w-lg">{personality.description}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
        {personality.traits.map((trait) => (
          <div key={trait.name} className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">{trait.name}</div>
            <div className="text-lg font-bold" style={{ color: personality.color }}>
              {trait.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
