import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { PersonalityAudienceStat } from '@shared/types';
import { ArrowLeft, BarChart3, Users } from 'lucide-react';

export default function CreatorStatsPage() {
  const [stats, setStats] = useState<PersonalityAudienceStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PersonalityAudienceStat[]>('/creator/stats/personalities')
      .then((res) => {
        setStats(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/creator"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回创作中心
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">人格分布</h1>
            <p className="text-sm text-gray-500">查看平台上各人格类型在注册用户和全部使用者中的人数分布</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">加载中...</div>
        ) : stats.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无测试数据</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="space-y-5">
              {stats.map((p) => (
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
                    <div className="rounded-xl border border-gray-100 px-3 py-2">
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

            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
              每位使用者只按最新一次测试结果计入统计
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
