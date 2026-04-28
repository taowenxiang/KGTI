import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { PersonalityAudienceStat, PersonalityStatsOverview } from '@shared/types';
import { ArrowLeft, BarChart3, Users, Brain, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface QuestionStat {
  id: string;
  content: string;
  options: Array<{ label: string; text: string; count: number }>;
  total: number;
}

export default function AdminStatsPage() {
  const [overview, setOverview] = useState<PersonalityStatsOverview | null>(null);
  const [personalityStats, setPersonalityStats] = useState<PersonalityAudienceStat[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<PersonalityStatsOverview>('/admin/stats/overview'),
      api.get<PersonalityAudienceStat[]>('/admin/stats/personalities'),
      api.get<QuestionStat[]>('/admin/stats/questions'),
    ])
      .then(([o, p, q]) => {
        setOverview(o);
        setPersonalityStats(p);
        setQuestionStats(q);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回管理后台
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
            <p className="text-sm text-gray-500">平台运营数据一览，人数统计按去重后的最新结果计算</p>
          </div>
        </div>

        {/* 概览卡片 */}
        {overview && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[
              { label: '注册用户', value: overview.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: '注册作答用户', value: overview.totalRegisteredParticipants, icon: Users, color: 'text-cyan-600 bg-cyan-50' },
              { label: '全部使用者', value: overview.totalParticipants, icon: Brain, color: 'text-purple-600 bg-purple-50' },
              { label: '测试次数', value: overview.totalResults, icon: Brain, color: 'text-fuchsia-600 bg-fuchsia-50' },
              { label: '人格类型', value: overview.totalPersonalities, icon: BarChart3, color: 'text-green-600 bg-green-50' },
              { label: '题目总数', value: overview.totalQuestions, icon: BookOpen, color: 'text-orange-600 bg-orange-50' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <div className="text-xs text-gray-500 mt-1">{card.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* 人格人数分布 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            人格人数分布
          </h2>
          <p className="text-xs text-gray-400 mb-4">每位使用者只按最新一次测试结果计入，分别展示注册用户与全体使用者两种口径。</p>
          {personalityStats.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">暂无数据</p>
          ) : (
            <div className="space-y-4">
              {personalityStats.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between gap-4 text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      {p.name} <span className="text-gray-400 text-xs">({p.id})</span>
                    </span>
                    <div className="text-right text-xs text-gray-500">
                      <div>全部使用者 {p.participantCount} 人 · {p.participantPercentage}%</div>
                      <div>注册用户 {p.registeredCount} 人 · {p.registeredPercentage}%</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                        <span>全部使用者</span>
                        <span>{p.participantCount} 人</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: p.participantCount > 0 ? `${Math.max(p.participantPercentage, 1)}%` : '0%',
                            backgroundColor: p.color,
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="rounded-xl border border-gray-100 px-3 py-2"
                    >
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                        <span>注册用户</span>
                        <span>{p.registeredCount} 人</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 opacity-75"
                          style={{
                            width: p.registeredCount > 0 ? `${Math.max(p.registeredPercentage, 1)}%` : '0%',
                            backgroundColor: p.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 题目选项分布 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            各题选项分布
          </h2>
          {questionStats.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {questionStats.map((q) => {
                const isOpen = expandedQuestion === q.id;
                return (
                  <div key={q.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedQuestion(isOpen ? null : q.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="pr-4">
                        <div className="text-sm font-medium text-gray-800 truncate">{q.content}</div>
                        <div className="text-xs text-gray-400 mt-1">共 {q.total} 次作答</div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3">
                        {q.options.map((opt, idx) => {
                          const pct = q.total > 0 ? (opt.count / q.total) * 100 : 0;
                          const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">
                                  {opt.label}. {opt.text}
                                </span>
                                <span className="text-gray-500">
                                  {opt.count} ({pct.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${colors[idx % colors.length]}`}
                                  style={{ width: `${Math.max(pct, 0.5)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
