import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function SubmitPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'question';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Question form
  const [qContent, setQContent] = useState('');
  const [qCategory, setQCategory] = useState('');
  const [qOptions, setQOptions] = useState<{ label: string; text: string; scores: string }[]>([
    { label: 'A', text: '', scores: '{}' },
    { label: 'B', text: '', scores: '{}' },
  ]);

  // Personality form
  const [pName, setPName] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pIcon, setPIcon] = useState('🌟');
  const [pColor, setPColor] = useState('#3b82f6');
  const [pTraits, setPTraits] = useState<{ name: string; value: number }[]>([
    { name: '', value: 50 },
  ]);

  function addOption() {
    const label = String.fromCharCode(65 + qOptions.length);
    setQOptions([...qOptions, { label, text: '', scores: '{}' }]);
  }

  function removeOption(idx: number) {
    setQOptions(qOptions.filter((_, i) => i !== idx));
  }

  function updateOption(idx: number, field: 'text' | 'scores', value: string) {
    const next = [...qOptions];
    next[idx][field] = value;
    setQOptions(next);
  }

  function addTrait() {
    setPTraits([...pTraits, { name: '', value: 50 }]);
  }

  function updateTrait(idx: number, field: 'name' | 'value', value: string | number) {
    const next = [...pTraits];
    next[idx][field] = value as never;
    setPTraits(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'question') {
        const options = qOptions.map((o) => ({
          label: o.label,
          text: o.text,
          scores: JSON.parse(o.scores || '{}'),
        }));
        await api.post('/creator/submit-question', {
          content: qContent,
          category: qCategory,
          options,
        });
      } else {
        await api.post('/creator/submit-personality', {
          name: pName,
          title: pTitle,
          description: pDesc,
          icon: pIcon,
          color: pColor,
          traits: pTraits.filter((t) => t.name),
        });
      }
      navigate('/creator');
    } catch (err: unknown) {
      setError((err as Error).message || '提交失败');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/creator')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> 返回创作中心
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {type === 'question' ? '提交新题目' : '提交新的人格类型'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {type === 'question' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">题目内容</label>
                  <textarea
                    required
                    value={qContent}
                    onChange={(e) => setQContent(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm min-h-[80px]"
                    placeholder="请输入题目内容..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">分类（可选）</label>
                  <input
                    type="text"
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="如：性格、情感、社交"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">选项</label>
                    <button type="button" onClick={addOption} className="text-xs text-primary-600 flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> 添加选项
                    </button>
                  </div>
                  <div className="space-y-3">
                    {qOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="w-8 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {opt.label}
                        </span>
                        <input
                          type="text"
                          required
                          value={opt.text}
                          onChange={(e) => updateOption(idx, 'text', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="选项内容"
                        />
                        <input
                          type="text"
                          value={opt.scores}
                          onChange={(e) => updateOption(idx, 'scores', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder='{"E":3}'
                        />
                        {qOptions.length > 2 && (
                          <button type="button" onClick={() => removeOption(idx)} className="p-2 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">scores 格式：{'{'}维度字母: 分值{'}'}，如 {'{"E":3}'}、{'{"I":1}'}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">人格名称</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="如：冒险家"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">称号</label>
                  <input
                    type="text"
                    required
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="如：无畏的探索者"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">详细解读</label>
                  <textarea
                    required
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm min-h-[100px]"
                    placeholder="描述这个人格类型的特征、行为模式..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">图标（emoji）</label>
                    <input
                      type="text"
                      required
                      value={pIcon}
                      onChange={(e) => setPIcon(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-center text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">主题色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pColor}
                        onChange={(e) => setPColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={pColor}
                        onChange={(e) => setPColor(e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">特征维度</label>
                    <button type="button" onClick={addTrait} className="text-xs text-primary-600 flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> 添加维度
                    </button>
                  </div>
                  <div className="space-y-3">
                    {pTraits.map((trait, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={trait.name}
                          onChange={(e) => updateTrait(idx, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="维度名称"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={trait.value}
                          onChange={(e) => updateTrait(idx, 'value', parseInt(e.target.value))}
                          className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

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
