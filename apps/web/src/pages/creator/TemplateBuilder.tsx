import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Question, PersonalityTrait } from '@shared/types';
import { ArrowLeft, Plus, Trash2, Save, CheckSquare, Square } from 'lucide-react';

export default function TemplateBuilder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [baseQuestions, setBaseQuestions] = useState<Question[]>([]);
  const [selectedBaseIds, setSelectedBaseIds] = useState<Set<string>>(new Set());

  const [customQuestions, setCustomQuestions] = useState<
    { content: string; category: string; options: { label: string; text: string; scores: string }[] }[]
  >([]);

  const [personalities, setPersonalities] = useState<
    { id: string; name: string; title: string; description: string; icon: string; color: string; traits: PersonalityTrait[] }[]
  >([]);

  useEffect(() => {
    api.get<Question[]>('/creator/questions').then((res) => {
      setBaseQuestions(res);
    });
  }, []);

  function toggleBaseQuestion(id: string) {
    const next = new Set(selectedBaseIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBaseIds(next);
  }

  function addCustomQuestion() {
    setCustomQuestions([
      ...customQuestions,
      {
        content: '',
        category: '',
        options: [
          { label: 'A', text: '', scores: '{}' },
          { label: 'B', text: '', scores: '{}' },
        ],
      },
    ]);
  }

  function updateCustomQuestion(idx: number, field: 'content' | 'category', value: string) {
    const next = [...customQuestions];
    next[idx][field] = value;
    setCustomQuestions(next);
  }

  function addOption(qIdx: number) {
    const next = [...customQuestions];
    const label = String.fromCharCode(65 + next[qIdx].options.length);
    next[qIdx].options.push({ label, text: '', scores: '{}' });
    setCustomQuestions(next);
  }

  function removeOption(qIdx: number, oIdx: number) {
    const next = [...customQuestions];
    next[qIdx].options = next[qIdx].options.filter((_, i) => i !== oIdx);
    // Relabel
    next[qIdx].options.forEach((o, i) => (o.label = String.fromCharCode(65 + i)));
    setCustomQuestions(next);
  }

  function updateOptionScore(qIdx: number, oIdx: number, value: string) {
    const next = [...customQuestions];
    next[qIdx].options[oIdx].scores = value;
    setCustomQuestions(next);
  }

  function updateOptionText(qIdx: number, oIdx: number, value: string) {
    const next = [...customQuestions];
    next[qIdx].options[oIdx].text = value;
    setCustomQuestions(next);
  }

  function removeCustomQuestion(idx: number) {
    setCustomQuestions(customQuestions.filter((_, i) => i !== idx));
  }

  function addPersonality() {
    setPersonalities([
      ...personalities,
      { id: '', name: '', title: '', description: '', icon: '🌟', color: '#3b82f6', traits: [{ name: '', value: 50 }] },
    ]);
  }

  function updatePersonality(idx: number, field: string, value: string) {
    const next = [...personalities];
    const p = next[idx] as unknown as Record<string, string>;
    p[field] = value;
    setPersonalities(next);
  }

  function removePersonality(idx: number) {
    setPersonalities(personalities.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('请输入模板名称');
      return;
    }
    if (selectedBaseIds.size === 0 && customQuestions.length === 0) {
      setError('请至少选择一道基础题或添加一道自定义题目');
      return;
    }
    if (personalities.length === 0) {
      setError('请至少设置一种人格');
      return;
    }
    for (const p of personalities) {
      if (!p.id || p.id.length !== 4) {
        setError(`人格 "${p.name || '未命名'}" 的ID必须是4位字母（如 ENJA）`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name,
        description,
        baseQuestionIds: Array.from(selectedBaseIds),
        customQuestions: customQuestions.map((q) => ({
          content: q.content,
          category: q.category,
          options: q.options.map((o) => ({
            label: o.label,
            text: o.text,
            scores: JSON.parse(o.scores || '{}'),
          })),
        })),
        personalities: personalities.map((p) => ({
          id: p.id.toUpperCase(),
          name: p.name,
          title: p.title,
          description: p.description,
          traits: p.traits.filter((t) => t.name),
          icon: p.icon,
          color: p.color,
        })),
        scoringRules: {
          dimensions: [
            { left: 'E', right: 'I', leftLabel: '社交电源', rightLabel: '独行电池', color: '#f59e0b' },
            { left: 'S', right: 'N', leftLabel: '细节侦探', rightLabel: '脑洞建筑师', color: '#3b82f6' },
            { left: 'J', right: 'P', leftLabel: '计划仙人', rightLabel: 'DDL战神', color: '#10b981' },
            { left: 'A', right: 'H', leftLabel: 'AI 原生派', rightLabel: '古法科研派', color: '#8b5cf6' },
          ],
        },
      };

      await api.post('/creator/submit-template', payload);
      navigate('/creator/submissions');
    } catch (err: unknown) {
      setError((err as Error).message || '提交失败');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/creator')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> 返回创作中心
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">制作新风格测试问卷</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">基本信息</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">模板名称</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="如：深夜图书馆人格测试"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">描述（可选）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm min-h-[60px]"
                  placeholder="简单描述这个测试问卷的主题和风格..."
                />
              </div>
            </div>

            {/* 基础题库选择 */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">基础题库选择</h2>
              <p className="text-xs text-gray-400">勾选你想纳入新问卷的现有题目（不会修改原题）</p>
              {baseQuestions.length === 0 ? (
                <p className="text-sm text-gray-400">暂无基础题目</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-100 rounded-xl p-3">
                  {baseQuestions.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => toggleBaseQuestion(q.id)}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        selectedBaseIds.has(q.id) ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      {selectedBaseIds.has(q.id) ? (
                        <CheckSquare className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      )}
                      <div className="text-sm text-gray-700">{q.content}</div>
                    </button>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500">已选择 {selectedBaseIds.size} 道基础题</div>
            </div>

            {/* 自定义题目 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">个性化题目</h2>
                <button
                  type="button"
                  onClick={addCustomQuestion}
                  className="text-xs text-primary-600 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3 h-3" /> 添加题目
                </button>
              </div>

              {customQuestions.map((q, qIdx) => (
                <div key={qIdx} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">自定义题 {qIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomQuestion(qIdx)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={q.content}
                    onChange={(e) => updateCustomQuestion(qIdx, 'content', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="题目内容"
                  />
                  <input
                    type="text"
                    value={q.category}
                    onChange={(e) => updateCustomQuestion(qIdx, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="分类（可选）"
                  />
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex gap-2">
                        <span className="w-7 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                          {opt.label}
                        </span>
                        <input
                          type="text"
                          required
                          value={opt.text}
                          onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="选项内容"
                        />
                        <input
                          type="text"
                          value={opt.scores}
                          onChange={(e) => updateOptionScore(qIdx, oIdx, e.target.value)}
                          className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder='{"E":3}'
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIdx, oIdx)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qIdx)}
                      className="text-xs text-primary-600 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> 添加选项
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 人格设置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">人格设置</h2>
                <button
                  type="button"
                  onClick={addPersonality}
                  className="text-xs text-primary-600 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3 h-3" /> 添加人格
                </button>
              </div>
              <p className="text-xs text-gray-400">人格ID必须是4位大写字母（对应 E/I + S/N + J/P + A/H）</p>

              {personalities.map((p, pIdx) => (
                <div key={pIdx} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">人格 {pIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePersonality(pIdx)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={p.id}
                      onChange={(e) => updatePersonality(pIdx, 'id', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="ID，如 ENJA"
                      maxLength={4}
                    />
                    <input
                      type="text"
                      required
                      value={p.name}
                      onChange={(e) => updatePersonality(pIdx, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="人格名称"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={p.title}
                    onChange={(e) => updatePersonality(pIdx, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="称号"
                  />
                  <textarea
                    required
                    value={p.description}
                    onChange={(e) => updatePersonality(pIdx, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[60px]"
                    placeholder="人格描述..."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={p.icon}
                      onChange={(e) => updatePersonality(pIdx, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-lg"
                      placeholder="🌟"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={p.color}
                        onChange={(e) => updatePersonality(pIdx, 'color', e.target.value)}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={p.color}
                        onChange={(e) => updatePersonality(pIdx, 'color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? '提交中...' : '提交审核'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
