import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import QuestionForm from '@/components/QuestionForm';
import AuthModal from '@/components/AuthModals';
import HistoryModal from '@/components/HistoryModal';

// Mock interfaces for now - will be replaced with Supabase integration
interface User {
  id: string;
  username: string;
}

interface Query {
  id: number;
  question_text: string;
  difficulty_level: string;
  answer_text: string;
  created_at: string;
}

const Index = () => {
  const { toast } = useToast();
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Question state
  const [questionLoading, setQuestionLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  
  // History state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [queries, setQueries] = useState<Query[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Mock authentication functions (will be replaced with Supabase)
  const handleLogin = async (username: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Mock login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success
      setUser({ id: '1', username });
      setIsLoginOpen(false);
      toast({
        title: 'Добро пожаловать!',
        description: `Вы успешно вошли как ${username}`,
      });
    } catch (error) {
      setAuthError('Неверное имя пользователя или пароль');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (username: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Mock registration delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success
      setUser({ id: '1', username });
      setIsRegisterOpen(false);
      toast({
        title: 'Регистрация завершена!',
        description: `Добро пожаловать, ${username}!`,
      });
    } catch (error) {
      setAuthError('Пользователь с таким именем уже существует');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setQueries([]);
    setAnswer(null);
    toast({
      title: 'До свидания!',
      description: 'Вы успешно вышли из системы',
    });
  };

  // Question submission
  const handleQuestionSubmit = async (question: string, difficulty: string) => {
    setQuestionLoading(true);
    setAnswer(null);
    
    try {
      // Mock API call to n8n webhook
      const response = await fetch('/api/webhook/pochimuchka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось получить ответ от сервера');
      }

      const data = await response.json();
      setAnswer(data.answer);

      // If user is logged in, save to history (mock)
      if (user) {
        const newQuery: Query = {
          id: Date.now(),
          question_text: question,
          difficulty_level: difficulty,
          answer_text: data.answer,
          created_at: new Date().toISOString(),
        };
        setQueries(prev => [newQuery, ...prev]);
      }

      toast({
        title: 'Ответ получен!',
        description: 'Нейросеть успешно ответила на ваш вопрос',
      });
    } catch (error) {
      // Mock response for demo
      const mockAnswer = `Это демонстрационный ответ на уровне "${difficulty}" для вопроса: "${question}". 

В реальном приложении здесь будет ответ от нейросети через n8n webhook. 

Пример ответа зависит от выбранного уровня сложности:
- Для малышей: простые слова и примеры
- Школьник: более подробное объяснение
- Студент: глубокий анализ с терминологией`;

      setAnswer(mockAnswer);

      // If user is logged in, save to history (mock)
      if (user) {
        const newQuery: Query = {
          id: Date.now(),
          question_text: question,
          difficulty_level: difficulty,
          answer_text: mockAnswer,
          created_at: new Date().toISOString(),
        };
        setQueries(prev => [newQuery, ...prev]);
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  // Load history when opening modal
  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
    // In real app, this would fetch from Supabase
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={!!user}
        username={user?.username}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenHistory={handleOpenHistory}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Задай вопрос нейросети 🤖
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Получи ответы на любые вопросы, адаптированные под твой уровень понимания
          </p>
        </div>

        <QuestionForm
          onSubmit={handleQuestionSubmit}
          isLoading={questionLoading}
          answer={answer}
        />
      </main>

      {/* Auth Modals */}
      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLogin}
        type="login"
        isLoading={authLoading}
        error={authError}
      />

      <AuthModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegister}
        type="register"
        isLoading={authLoading}
        error={authError}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        queries={queries}
        isLoading={historyLoading}
      />
    </div>
  );
};

export default Index;
