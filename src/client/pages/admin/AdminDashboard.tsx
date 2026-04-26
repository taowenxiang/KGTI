import { Link } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, Shield, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const cards = [
    {
      title: '题目管理',
      desc: '审核、编辑和删除题库中的题目',
      icon: BookOpen,
      to: '/admin/questions',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: '人格管理',
      desc: '管理所有人格类型与特征设定',
      icon: Users,
      to: '/admin/personalities',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: '审核中心',
      desc: '处理运营者提交的新题和新人格',
      icon: ClipboardList,
      to: '/admin/review',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: '数据统计',
      desc: '查看人格占比与各题选项分布',
      icon: BarChart3,
      to: '/admin/stats',
      color: 'bg-pink-50 text-pink-600',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
            <p className="text-sm text-gray-500">维护平台内容，审核运营者提交</p>
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
