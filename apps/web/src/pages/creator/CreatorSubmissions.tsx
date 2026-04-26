import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { getStatusLabel, getStatusColor, formatDate } from '../../lib/utils';
import type { Submission } from '@shared/types';
import { List, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreatorSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const res = await api.get<Submission[]>('/creator/my-submissions');
      setSubmissions(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

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
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <List className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我的提交</h1>
            <p className="text-sm text-gray-500">查看已提交内容的审核状态</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">加载中...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <List className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无提交记录</p>
            <Link
              to="/creator/submit?type=question"
              className="inline-block mt-3 text-sm text-primary-600 hover:underline"
            >
              去提交新内容
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => {
              const isOpen = expandedId === s.id;
              const content = s.content as Record<string, unknown>;
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isOpen ? null : s.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                        {getStatusLabel(s.status)}
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {s.type === 'QUESTION' ? '新题目' : s.type === 'PERSONALITY' ? '新人格' : '新模板'}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.status === 'REJECTED' && s.remark && (
                        <span className="text-xs text-red-500 hidden sm:inline">有拒绝理由</span>
                      )}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-50">
                      <div className="py-4 space-y-3 text-sm">
                        {s.type === 'QUESTION' && (
                          <>
                            <div>
                              <span className="text-gray-500">题目内容：</span>
                              <span className="text-gray-800">{String(content.content || '')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">分类：</span>
                              <span className="text-gray-800">{String(content.category || '无')}</span>
                            </div>
                          </>
                        )}

                        {s.type === 'PERSONALITY' && (
                          <>
                            <div>
                              <span className="text-gray-500">人格ID：</span>
                              <span className="text-gray-800 font-mono">{String(content.id || '未指定')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">名称：</span>
                              <span className="text-gray-800">{String(content.name || '')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">称号：</span>
                              <span className="text-gray-800">{String(content.title || '')}</span>
                            </div>
                          </>
                        )}

                        {s.type === 'TEMPLATE' && (
                          <>
                            <div>
                              <span className="text-gray-500">模板名称：</span>
                              <span className="text-gray-800">{String(content.name || '')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">描述：</span>
                              <span className="text-gray-800">{String(content.description || '')}</span>
                            </div>
                          </>
                        )}

                        {s.status === 'REJECTED' && s.remark && (
                          <div className="bg-red-50 rounded-lg p-3 text-red-700">
                            <span className="font-medium">拒绝理由：</span>
                            {s.remark}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
