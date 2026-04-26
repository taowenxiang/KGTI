import { Brain } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Brain className="w-5 h-5" />
            <span className="font-medium">KGTI</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            港科广校园人格测试 · 字母代码遇上强记忆点人设
          </p>
          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} KGTI
          </div>
        </div>
      </div>
    </footer>
  );
}
