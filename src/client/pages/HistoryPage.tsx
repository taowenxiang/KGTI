import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { TestResult } from '@shared/types';
import { ArrowLeft, Calendar, Brain, ChevronRight } from 'lucide-react';
import PersonalityVisual from '../components/result/PersonalityVisual';

export default function HistoryPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<TestResult[]>('/test/history')
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">测试记录</h1>
            <p className="text-sm text-gray-500">查看你过往的所有测试结果</p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">还没有测试记录</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              去测一测 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((r) => (
              <Link
                key={r.id}
                to={`/result/${r.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-primary-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {r.personality && (
                      <PersonalityVisual
                        personality={r.personality}
                        variant="card"
                        className="h-16 w-16 shrink-0 rounded-xl"
                      />
                    )}
                    <div>
                      <div className="font-bold text-gray-800">
                        {r.personality ? `${r.personality.id} · ${r.personality.name}` : '未知人格'}
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        {r.personality?.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(r.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>

                {/* 维度速览 */}
                {r.scores && (
                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'E/I', left: 'E', right: 'I' },
                      { label: 'S/N', left: 'S', right: 'N' },
                      { label: 'J/P', left: 'J', right: 'P' },
                      { label: 'A/H', left: 'A', right: 'H' },
                    ].map((dim) => {
                      const leftScore = (r.scores[dim.left] as number) || 0;
                      const rightScore = (r.scores[dim.right] as number) || 0;
                      const active = leftScore >= rightScore ? dim.left : dim.right;
                      return (
                        <div key={dim.label} className="text-xs">
                          <span className="text-gray-400">{dim.label}</span>
                          <div className="font-bold text-gray-700 mt-0.5">{active}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
