import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Personality } from '@shared/types';
import PersonalityVisual from '../components/result/PersonalityVisual';
import { ArrowLeft, Share2, Sparkles, Lightbulb, Zap, Compass, BookOpen } from 'lucide-react';

export default function PersonalityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get<Personality>(`/personalities/${id}`)
      .then((data) => {
        setPersonality(data);
        setLoading(false);
      })
      .catch(() => {
        setError('人格类型不存在');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !personality) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '加载失败'}</p>
          <Link to="/gallery" className="text-primary-600 hover:underline">
            返回图鉴
          </Link>
        </div>
      </div>
    );
  }

  // 维度解析映射
  const dimensionMap: Record<string, { name: string; icon: React.ReactNode; opposite: string }> = {
    E: { name: '社交电源', icon: <Zap className="w-4 h-4" />, opposite: '独行电池' },
    I: { name: '独行电池', icon: <BookOpen className="w-4 h-4" />, opposite: '社交电源' },
    S: { name: '细节侦探', icon: <Compass className="w-4 h-4" />, opposite: '脑洞建筑师' },
    N: { name: '脑洞建筑师', icon: <Lightbulb className="w-4 h-4" />, opposite: '细节侦探' },
    J: { name: '计划仙人', icon: <Compass className="w-4 h-4" />, opposite: 'DDL战神' },
    P: { name: 'DDL战神', icon: <Zap className="w-4 h-4" />, opposite: '计划仙人' },
    A: { name: 'AI 原生派', icon: <Sparkles className="w-4 h-4" />, opposite: '古法科研派' },
    H: { name: '古法科研派', icon: <BookOpen className="w-4 h-4" />, opposite: 'AI 原生派' },
  };

  const dims = [
    { code: personality.id[0], label: '充电模式' },
    { code: personality.id[1], label: '脑回路模式' },
    { code: personality.id[2], label: '执行节奏' },
    { code: personality.id[3], label: 'AI 协作模式' },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(135deg,_#fffdf7,_#f8fbff)] py-8 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 头部 */}
        <div className="mb-6">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回图鉴
          </Link>
        </div>

        {/* 主卡片 */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <PersonalityVisual
              personality={personality}
              className="mb-6 w-full aspect-[4/3] rounded-3xl"
              imageClassName="object-contain"
            />

            <div className="inline-flex items-center gap-1.5 text-sm text-gray-500 mb-2">
              <Sparkles className="w-4 h-4" />
              {personality.id} · {personality.name}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{personality.name}</h1>
            <p className="text-lg text-gray-500 mb-6">{personality.title}</p>

            <div
              className="w-full h-1 rounded-full mb-6"
              style={{ backgroundColor: `${personality.color}30` }}
            >
              <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: personality.color }} />
            </div>

            <p className="text-gray-600 leading-relaxed max-w-lg whitespace-pre-line">
              {personality.description}
            </p>
          </div>

          {/* 特征值 */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
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

        {/* 四维度解析 */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5" />
            四维度定位
          </h3>
          <div className="space-y-4">
            {dims.map((dim) => {
              const info = dimensionMap[dim.code];
              if (!info) return null;
              return (
                <div
                  key={dim.code}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: `${personality.color}08` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: personality.color }}
                  >
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800">
                      {dim.label}：{info.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      对立面：{info.opposite}
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-white border border-gray-100">
                    {dim.code}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 搞笑补充 */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-3">如果你测出这个人格</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>你的朋友可能已经把你的人设发到了三个群</li>
            <li>你一边看这个结果一边想“这也太准了吧”，然后准备拿它当新自我介绍</li>
            <li>建议截图保存，下次别人问你是什么类型，直接发这页就行</li>
          </ul>
        </div>

        {/* 底部操作 */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/gallery"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> 返回图鉴
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            <Share2 className="w-4 h-4" /> 我也测一测
          </Link>
        </div>
      </div>
    </div>
  );
}
