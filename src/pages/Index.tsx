import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import ProfileIcon from '@/components/ProfileIcon';
import QuestionForm from '@/components/QuestionForm';
import AuthModal from '@/components/AuthModals';
import HistoryModal from '@/components/HistoryModal';
import { generateSlug, generateMetaDescription } from '@/lib/utils';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  created_at: string;
}

interface UserHistoryQuery {
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
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Question state
  const [questionLoading, setQuestionLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  
  // History state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [queries, setQueries] = useState<UserHistoryQuery[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load user profile after sign in
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setQueries([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('pochimuchka.profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        setUserProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
  };

  // Authentication functions
  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      setIsLoginOpen(false);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });
    } catch (error) {
      setAuthError('Произошла ошибка при входе');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: email.split('@')[0] // Use email prefix as username
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      setIsRegisterOpen(false);
      toast({
        title: 'Регистрация завершена!',
        description: 'Проверьте email для подтверждения аккаунта',
      });
    } catch (error) {
      setAuthError('Произошла ошибка при регистрации');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'До свидания!',
        description: 'Вы успешно вышли из системы',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Question submission with new database logic
  const handleQuestionSubmit = async (question: string, difficulty: string) => {
    setQuestionLoading(true);
    setAnswer(null);
    
    try {
      // Try to call the n8n webhook
      const webhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://kosomeeliquom.beget.app/webhook/pochimuchka';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          difficulty,
        }),
      });

      let answerText: string;
      if (response.ok) {
        const data = await response.json();
        answerText = data.answer;
      } else {
        throw new Error('Webhook failed');
      }

      setAnswer(answerText);

      // NEW DATABASE LOGIC: Save to public_content for everyone
      const slug = generateSlug(question);
      const metaDescription = generateMetaDescription(answerText);

      try {
        // Insert into public_content table
        await supabase
          .from('pochimuchka.public_content')
          .insert({
            slug,
            question_title: question,
            answer_html: answerText,
            difficulty_level: difficulty,
            meta_description: metaDescription,
          });
      } catch (publicError) {
        console.error('Error saving to public content:', publicError);
      }

      // IF user is logged in: Save to their private history
      if (user && session) {
        try {
          const { error: historyError } = await supabase
            .from('pochimuchka.user_history')
            .insert({
              user_id: user.id,
              question_text: question,
              answer_text: answerText,
              difficulty_level: difficulty,
            });

          if (!historyError) {
            // Reload history after successful insert
            loadUserHistory();
          }
        } catch (historyError) {
          console.error('Error saving to user history:', historyError);
        }
      }

      toast({
        title: 'Ответ получен!',
        description: 'Нейросеть успешно ответила на ваш вопрос',
      });
    } catch (error) {
      // Fallback mock response for demo
      const mockAnswer = `Это демонстрационный ответ на уровне "${difficulty}" для вопроса: "${question}". 

В реальном приложении здесь будет ответ от нейросети через n8n webhook. 

Пример ответа зависит от выбранного уровня сложности:
- Для малышей: простые слова и примеры
- Для школьников: более подробное объяснение
- Для студентов: глубокий анализ с терминологией`;

      setAnswer(mockAnswer);

      // Same database logic for mock answer
      const slug = generateSlug(question);
      const metaDescription = generateMetaDescription(mockAnswer);

      try {
        await supabase
          .from('pochimuchka.public_content')
          .insert({
            slug,
            question_title: question,
            answer_html: mockAnswer,
            difficulty_level: difficulty,
            meta_description: metaDescription,
          });
      } catch (publicError) {
        console.error('Error saving mock to public content:', publicError);
      }

      if (user && session) {
        try {
          const { error: historyError } = await supabase
            .from('pochimuchka.user_history')
            .insert({
              user_id: user.id,
              question_text: question,
              answer_text: mockAnswer,
              difficulty_level: difficulty,
            });

          if (!historyError) {
            loadUserHistory();
          }
        } catch (historyError) {
          console.error('Error saving mock to user history:', historyError);
        }
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  // Load user history from database
  const loadUserHistory = async () => {
    if (!user) return;
    
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('pochimuchka.user_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading history:', error);
        return;
      }

      setQueries(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load history when opening modal
  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
    loadUserHistory();
  };

  return (
    <div className="min-h-screen">
      {/* Profile Icon in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ProfileIcon
          isLoggedIn={!!user}
          username={userProfile?.username}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenHistory={handleOpenHistory}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content container with elevated styling */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-elevated)' }}>
          <QuestionForm
            onSubmit={handleQuestionSubmit}
            isLoading={questionLoading}
            answer={answer}
          />
        </div>
      </main>

      {/* Auth Modals */}
      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setAuthError(null);
        }}
        onSubmit={handleLogin}
        type="login"
        isLoading={authLoading}
        error={authError}
      />

      <AuthModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setAuthError(null);
        }}
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
