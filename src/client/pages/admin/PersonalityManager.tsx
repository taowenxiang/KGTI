import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { getStatusLabel, getStatusColor } from '../../lib/utils';
import type { Personality } from '@shared/types';
import { Users, Trash2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PersonalityManager() {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersonalities();
  }, []);

  async function fetchPersonalities() {
    setLoading(true);
    try {
      const res = await api.get<Personality[]>('/admin/personalities');
      setPersonalities(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/admin/personalities/${id}`, { status });
    fetchPersonalities();
  }

  async function deletePersonality(id: string) {
    if (!confirm('确定删除这个人格类型吗？')) return;
    await api.del(`/admin/personalities/${id}`);
    fetchPersonalities();
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <Users className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">人格管理</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">加载中...</div>
        ) : personalities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">暂无人格类型</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {personalities.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{ backgroundColor: `${p.color}15` }}
                >
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(p.status)}`}>
                      {getStatusLabel(p.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{p.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.traits.map((t) => (
                      <span
                        key={t.name}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${p.color}12`, color: p.color }}
                      >
                        {t.name} {t.value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {p.status !== 'APPROVED' && (
                    <button
                      onClick={() => updateStatus(p.id, 'APPROVED')}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="通过"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {p.status !== 'REJECTED' && (
                    <button
                      onClick={() => updateStatus(p.id, 'REJECTED')}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="拒绝"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deletePersonality(p.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
