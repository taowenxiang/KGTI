import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import PersonalityCard from '../components/result/PersonalityCard';
import PersonalityVisual from '../components/result/PersonalityVisual';
import type { TestResult } from '@shared/types';
import { toPng } from 'html-to-image';
import { ArrowLeft, Share2, RotateCcw, Download, Eye, LogIn } from 'lucide-react';

export default function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const { user } = useAuth();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!resultId) return;
    api
      .get<TestResult>(`/test/results/${resultId}`)
      .then((res) => {
        setResult(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError((err as Error).message || '加载结果失败');
        setLoading(false);
      });
  }, [resultId]);

  // useCallback 必须在条件 return 之前调用，否则会违反 React Hooks 规则
  const handleDownload = useCallback(async () => {
    if (!shareCardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `KGTI-${result?.personality?.id || 'result'}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('生成图片失败，请重试');
    } finally {
      setDownloading(false);
    }
  }, [result?.personality?.id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">分析结果中...</p>
        </div>
      </div>
    );
  }

  if (error || !result?.personality) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '结果不存在'}</p>
          <Link to="/" className="text-primary-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const personality = result.personality;
  const scores = result.scores || {};

  // 维度对比数据
  const dimensions = [
    { left: 'E', leftLabel: '社交电源', right: 'I', rightLabel: '独行电池', color: '#f59e0b' },
    { left: 'S', leftLabel: '细节侦探', right: 'N', rightLabel: '脑洞建筑师', color: '#3b82f6' },
    { left: 'J', leftLabel: '计划仙人', right: 'P', rightLabel: 'DDL战神', color: '#10b981' },
    { left: 'A', leftLabel: 'AI原生派', right: 'H', rightLabel: '古法科研派', color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(135deg,_#fffdf7,_#f8fbff)] py-8 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 人格卡片 - 整体可点击跳转详情页 */}
        <Link
          to={`/personality/${personality.id}`}
          className="block group relative cursor-pointer"
        >
          <PersonalityCard personality={personality} />
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-primary-400 group-hover:shadow-xl transition-all duration-200 pointer-events-none" />
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5" />
            查看人格详情
          </div>
        </Link>

        {!user && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            这次结果已经生成。登录后可以自动认领到你的历史记录里，下次回来还能继续看。
            <div className="mt-3">
              <Link
                to={`/login?redirect=/result/${result.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                登录并认领结果
              </Link>
            </div>
          </div>
        )}

        {/* Dimension Breakdown */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">四维度光谱解析</h3>
          <div className="space-y-5">
            {dimensions.map((dim) => {
              const leftScore = (scores[dim.left] as number) || 0;
              const rightScore = (scores[dim.right] as number) || 0;
              const total = leftScore + rightScore || 1;
              const leftPct = (leftScore / total) * 100;
              const rightPct = (rightScore / total) * 100;
              const activeSide = leftScore >= rightScore ? 'left' : 'right';

              return (
                <div key={dim.left}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span className={activeSide === 'left' ? 'font-bold text-gray-800' : ''}>
                      {dim.leftLabel} ({dim.left})
                    </span>
                    <span className={activeSide === 'right' ? 'font-bold text-gray-800' : ''}>
                      {dim.rightLabel} ({dim.right})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-medium w-8 text-right text-gray-600">{leftScore}</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-l-full transition-all duration-700"
                        style={{ width: `${leftPct}%`, backgroundColor: activeSide === 'left' ? dim.color : '#cbd5e1' }}
                      />
                      <div
                        className="h-full rounded-r-full transition-all duration-700"
                        style={{ width: `${rightPct}%`, backgroundColor: activeSide === 'right' ? dim.color : '#cbd5e1' }}
                      />
                    </div>
                    <div className="text-xs font-medium w-8 text-gray-600">{rightScore}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 分享卡片（用于生成图片） */}
        <div
          ref={shareCardRef}
          className="mt-6 bg-white rounded-3xl border-2 border-gray-900 p-6 md:p-8"
          style={{ maxWidth: 420, margin: '24px auto 0' }}
        >
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2 tracking-widest uppercase">KGTI</div>
            <div className="mb-4 flex justify-center">
              <PersonalityVisual personality={personality} variant="share" className="h-40 w-40 rounded-[2rem]" />
            </div>
            <div className="inline-flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Share2 className="w-3 h-3" />
              {personality.id} · {personality.name}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{personality.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{personality.title}</p>

            <div className="space-y-3">
              {dimensions.map((dim) => {
                const leftScore = (scores[dim.left] as number) || 0;
                const rightScore = (scores[dim.right] as number) || 0;
                const total = leftScore + rightScore || 1;
                const leftPct = (leftScore / total) * 100;
                const activeSide = leftScore >= rightScore ? 'left' : 'right';
                return (
                  <div key={dim.left} className="flex items-center gap-2 text-xs">
                    <span className={`w-16 text-right ${activeSide === 'left' ? 'font-bold text-gray-800' : 'text-gray-400'}`}>
                      {dim.left}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-l-full"
                        style={{ width: `${leftPct}%`, backgroundColor: activeSide === 'left' ? dim.color : '#e2e8f0' }}
                      />
                      <div
                        className="h-full rounded-r-full"
                        style={{ width: `${100 - leftPct}%`, backgroundColor: activeSide === 'right' ? dim.color : '#e2e8f0' }}
                      />
                    </div>
                    <span className={`w-16 text-left ${activeSide === 'right' ? 'font-bold text-gray-800' : 'text-gray-400'}`}>
                      {dim.right}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-400">
              打开 KGTI，看看你在港科广究竟是什么人设
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
          <Link
            to={`/personality/${personality.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
          >
            <Eye className="w-4 h-4" /> 人格详情
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading ? '生成中...' : '保存卡片'}
          </button>
          <Link
            to={`/test/${result.templateId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" /> 再测一次
          </Link>
        </div>
      </div>
    </div>
  );
}
