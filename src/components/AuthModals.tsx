import React, { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Modal from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, password: string) => Promise<void>;
  type: 'login' | 'register';
  isLoading: boolean;
  error: string | null;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  isLoading,
  error,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const title = type === 'login' ? 'Вход' : 'Регистрация';
  const buttonText = type === 'login' ? 'Войти' : 'Создать аккаунт';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || isLoading) return;
    
    await onSubmit(username.trim(), password);
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-foreground">
            Имя пользователя
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите имя пользователя"
            className="pochimuchka-input"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Пароль
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="pochimuchka-input pr-12"
              disabled={isLoading}
              autoComplete={type === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded transition-smooth"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={18} className="text-muted-foreground" />
              ) : (
                <Eye size={18} className="text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!username.trim() || !password.trim() || isLoading}
          className="w-full pochimuchka-button flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Загрузка...</span>
            </>
          ) : (
            <span>{buttonText}</span>
          )}
        </button>
      </form>
    </Modal>
  );
};

export default AuthModal;