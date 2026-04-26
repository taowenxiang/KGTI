import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRoleLabel } from '../../lib/utils';
import { Brain, Menu, X, LogOut, User as UserIcon, Shield, PenTool } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-600">
          <Brain className="w-6 h-6" />
          <span className="font-bold text-lg tracking-tight">KGTI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600 transition-colors">首页</Link>
          <Link to="/gallery" className="hover:text-primary-600 transition-colors">人格图鉴</Link>
          {user && (
            <Link to="/history" className="hover:text-primary-600 transition-colors">测试记录</Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="hover:text-primary-600 transition-colors flex items-center gap-1">
              <Shield className="w-4 h-4" /> 管理后台
            </Link>
          )}
          {(user?.role === 'CREATOR' || user?.role === 'ADMIN') && (
            <Link to="/creator" className="hover:text-primary-600 transition-colors flex items-center gap-1">
              <PenTool className="w-4 h-4" /> 创作中心
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{getRoleLabel(user.role)}</span>
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <UserIcon className="w-4 h-4" />
                {user.name}
              </div>
              <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                登录
              </Link>
              <Link
                to="/register"
                className="text-sm bg-primary-600 text-white px-4 py-1.5 rounded-full hover:bg-primary-700 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-2 text-sm">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700">首页</Link>
            <Link to="/gallery" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700">人格图鉴</Link>
            {user && (
              <Link to="/history" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700">测试记录</Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 flex items-center gap-1">
                <Shield className="w-4 h-4" /> 管理后台
              </Link>
            )}
            {(user?.role === 'CREATOR' || user?.role === 'ADMIN') && (
              <Link to="/creator" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 flex items-center gap-1">
                <PenTool className="w-4 h-4" /> 创作中心
              </Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="w-full text-left py-2 text-red-500 flex items-center gap-1">
                <LogOut className="w-4 h-4" /> 退出登录
              </button>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 border rounded-lg text-gray-700">
                  登录
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-primary-600 text-white rounded-lg">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
