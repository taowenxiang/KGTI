import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { getStatusLabel, getStatusColor, formatDate } from '../../lib/utils';
import type { Submission } from '@shared/types';
import { ClipboardList, CheckCircle, XCircle, ArrowLeft, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remark, setRemark] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const res = await api.get<Submission[]>('/admin/pending');
      setSubmissions(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      await api.post(`/admin/approve/${id}`);
      fetchSubmissions();
    } catch {
      alert('操作失败');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    if (!remark.trim()) {
      alert('请填写拒绝理由');
      return;
    }
    setProcessingId(id);
    try {
      await api.post(`/admin/reject/${id}`, { remark });
      setRemark('');
      fetchSubmissions();
    } catch {
      alert('操作失败');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回管理后台
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">审核中心</h1>
            <p className="text-sm text-gray-500">处理运营者提交的新内容</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">加载中...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无待审核的提交</p>
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
                      <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        {(s as unknown as { creator?: { name: string } }).creator?.name || '未知'}
                      </div>
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
                            <div>
                              <span className="text-gray-500">选项：</span>
                              <div className="mt-2 space-y-2">
                                {(content.options as Array<{ label: string; text: string; scores: Record<string, number> }>)?.map((opt, idx) => (
                                  <div key={idx} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2">
                                    <span className="font-bold text-gray-500 w-4">{opt.label}</span>
                                    <div>
                                      <div className="text-gray-800">{opt.text}</div>
                                      <div className="text-xs text-gray-400 mt-0.5">
                                        分值：{JSON.stringify(opt.scores)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
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
                            <div>
                              <span className="text-gray-500">描述：</span>
                              <p className="text-gray-800 mt-1 whitespace-pre-line">{String(content.description || '')}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-gray-500">图标：</span>
                                <span className="text-lg">{String(content.icon || '')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">主题色：</span>
                                <span
                                  className="inline-block w-4 h-4 rounded border border-gray-200"
                                  style={{ backgroundColor: String(content.color || '#ccc') }}
                                />
                                <span className="text-gray-400 text-xs">{String(content.color || '')}</span>
                              </div>
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
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100">
                        <input
                          type="text"
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                          placeholder="拒绝理由（通过时无需填写）"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(s.id)}
                            disabled={processingId === s.id}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" /> 拒绝
                          </button>
                          <button
                            onClick={() => handleApprove(s.id)}
                            disabled={processingId === s.id}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" /> 通过
                          </button>
                        </div>
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
