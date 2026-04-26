import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Personality } from '@shared/types';
import { Search, Sparkles, Users } from 'lucide-react';
import PersonalityVisual from '../components/result/PersonalityVisual';

export default function GalleryPage() {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [filtered, setFiltered] = useState<Personality[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Personality[]>('/personalities?status=APPROVED')
      .then((data) => {
        setPersonalities(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(personalities);
      return;
    }
    setFiltered(
      personalities.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    );
  }, [query, personalities]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-sm text-primary-600 border border-primary-100 mb-4">
            <Sparkles className="w-4 h-4" />
            全部人格类型
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">人格图鉴</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            探索所有独特的人格类型，了解每一种人格的特质与魅力
          </p>
        </div>

        <div className="max-w-md mx-auto mb-10 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索人格类型..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="w-14 h-14 bg-gray-100 rounded-xl mx-auto mb-4" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无符合条件的人格类型</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/personality/${p.id}`}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all group text-center"
              >
                <PersonalityVisual
                  personality={p}
                  variant="card"
                  className="mx-auto mb-4 h-28 w-full max-w-[180px] rounded-2xl group-hover:scale-[1.02] transition-transform"
                />
                <p className="mb-1 text-[11px] uppercase tracking-[0.24em] text-gray-400">{p.id}</p>
                <h3 className="font-bold text-gray-800 mb-1">{p.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 min-h-8">{p.title}</p>
                <div className="mt-3 flex flex-wrap gap-1 justify-center">
                  {p.traits.slice(0, 3).map((t) => (
                    <span
                      key={t.name}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${p.color}15`, color: p.color }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
