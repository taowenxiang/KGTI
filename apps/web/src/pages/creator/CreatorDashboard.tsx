import { Link } from 'react-router-dom';
import { PenTool, FilePlus, List, BarChart3, LayoutTemplate } from 'lucide-react';

export default function CreatorDashboard() {
  const cards = [
    {
      title: '提交新题',
      desc: '为题库增加新的测试题目',
      icon: FilePlus,
      to: '/creator/submit?type=question',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: '提交人格',
      desc: '设计全新的人格类型',
      icon: PenTool,
      to: '/creator/submit?type=personality',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: '制作问卷',
      desc: '基于基础题库创建新风格测试',
      icon: LayoutTemplate,
      to: '/creator/template',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: '我的提交',
      desc: '查看已提交内容的审核状态',
      icon: List,
      to: '/creator/submissions',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: '人格分布',
      desc: '查看参与测试的人格分布数据',
      icon: BarChart3,
      to: '/creator/stats',
      color: 'bg-pink-50 text-pink-600',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">创作中心</h1>
            <p className="text-sm text-gray-500">发挥创意，为平台贡献新内容</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
