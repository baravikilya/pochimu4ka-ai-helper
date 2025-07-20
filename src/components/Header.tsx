import React from 'react';
import { LogIn, UserPlus, History, LogOut, User } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isLoggedIn,
  username,
  onOpenLogin,
  onOpenRegister,
  onOpenHistory,
  onLogout,
}) => {
  return (
    <header className="w-full bg-card border-b border-border card-shadow">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">П</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Почимучка.рф</h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          {!isLoggedIn ? (
            <>
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary transition-smooth"
              >
                <LogIn size={18} />
                <span>Войти</span>
              </button>
              <button
                onClick={onOpenRegister}
                className="pochimuchka-button flex items-center space-x-2"
              >
                <UserPlus size={18} />
                <span>Регистрация</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenHistory}
                className="flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary transition-smooth"
              >
                <History size={18} />
                <span>История запросов</span>
              </button>
              <div className="flex items-center space-x-2 px-4 py-2 bg-secondary rounded-lg">
                <User size={18} className="text-primary" />
                <span className="font-medium">Привет, {username}!</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-destructive transition-smooth"
              >
                <LogOut size={18} />
                <span>Выйти</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;