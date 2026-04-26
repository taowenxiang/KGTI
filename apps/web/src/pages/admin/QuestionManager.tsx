import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { getStatusLabel, getStatusColor } from '../../lib/utils';
import type { Question } from '@shared/types';
import { BookOpen, Trash2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await api.get<Question[]>('/admin/questions');
      setQuestions(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/admin/questions/${id}`, { status });
    fetchQuestions();
  }

  async function deleteQuestion(id: string) {
    if (!confirm('确定删除这道题吗？')) return;
    await api.del(`/admin/questions/${id}`);
    fetchQuestions();
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">题目管理</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">加载中...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">暂无题目</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">内容</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">选项</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{q.content}</td>
                      <td className="px-4 py-3 text-gray-500">{q.options.length} 个选项</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(q.status)}`}>
                          {getStatusLabel(q.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {q.status !== 'APPROVED' && (
                            <button
                              onClick={() => updateStatus(q.id, 'APPROVED')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="通过"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {q.status !== 'REJECTED' && (
                            <button
                              onClick={() => updateStatus(q.id, 'REJECTED')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="拒绝"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteQuestion(q.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
