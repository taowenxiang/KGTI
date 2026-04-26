import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Brain, BookOpen, ArrowRight, Sparkles, Shapes, BadgeCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Template } from '@shared/types';

export default function HomePage() {
  const { user: _user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    api.get<Template[]>('/test/templates').then(setTemplates).catch(() => {});
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(135deg,_#fffdf7,_#f7fbff_55%,_#fff7ed)] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full text-sm text-primary-700 mb-6 border border-primary-100 shadow-sm">
            <Sparkles className="w-4 h-4" />
            港科广专属校园人格测试
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            <span className="text-primary-700">KGTI</span>
            <br />
            测出你的字母人格代码，
            <br />
            以及那个人尽皆知的校园人设
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            从四维字母光谱出发，把你落在“<span className="font-semibold text-gray-900">DDL战神 / 卷心菜 / 深夜哲人 / 无相之神</span>”
            这样的强记忆点人格上。你不只是一个代码，更是一种港科广生活方式。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {templates[0] ? (
              <Link
                to={`/test/${templates[0].id}`}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-full text-lg font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300"
              >
                开始测试 <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-400 px-8 py-3.5 rounded-full text-lg font-medium cursor-not-allowed">
                题库准备中...
              </div>
            )}
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-full text-lg font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              浏览图鉴 <BookOpen className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-gray-600">
            {['ISPA · DDL战神', 'INPH · 卷心菜', 'INPA · 深夜哲人', 'ENPA · 无相之神'].map((item) => (
              <div key={item} className="rounded-full border border-white bg-white/80 px-4 py-2 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">四维人格骨架</h3>
              <p className="text-sm text-gray-500">E/I、S/N、J/P、A/H 四个维度，给你稳定可解释的字母结果</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shapes className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">强记忆点人设</h3>
              <p className="text-sm text-gray-500">不是冷冰冰的代码，而是能让你一眼记住、愿意截图传播的校园人格名</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">先测后登</h3>
              <p className="text-sm text-gray-500">不用先注册就能开测，登录后自动认领结果、保存历史、继续创作</p>
            </div>
          </div>
        </div>
      </section>

      {templates.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">正式上线的默认测试</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((t) => (
                <Link
                  key={t.id}
                  to={`/test/${t.id}`}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors">
                      <Brain className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-gray-400">{t.questionCount || 0} 题</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{t.name}</h3>
                  <p className="text-sm text-gray-500">{t.description || '探索你的港科广人格特质'}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
