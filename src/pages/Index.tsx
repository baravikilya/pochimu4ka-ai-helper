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
        if (!userId) return;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId as any)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        const isProfile =
          !!data &&
          typeof data === 'object' &&
          'id' in data &&
          'user_id' in data &&
          'username' in data &&
          'created_at' in data;
        if (isProfile) {
          setUserProfile(data as UserProfile);
        } else {
          setUserProfile(null);
        }
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
      // Вызываем edge function через supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke('pochimuchka-ai', {
        body: { question, difficulty },
      });
      if (error) {
        console.error('Ошибка при вызове функции:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось получить ответ от нейросети',
          variant: 'destructive',
        });
        return;
      }
      setAnswer(data?.answer || 'Нет ответа от нейросети');
      toast({
        title: 'Ответ получен!',
        description: 'Нейросеть успешно ответила на ваш вопрос',
      });
    } catch (error) {
      setAnswer('Произошла ошибка при получении ответа.');
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при получении ответа от нейросети',
        variant: 'destructive',
      });
    } finally {
      setQuestionLoading(false);
    }
  };

  // Load user history from database
  const loadUserHistory = async () => {
    if (!user?.id) return;
    
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_history')
        .select('*')
        .eq('user_id', user.id as any)
        .order('created_at', { ascending: false });
      console.log('user.id:', user.id);
      console.log('История из supabase:', data);

      if (error) {
        console.error('Error loading history:', error);
        return;
      }

      if (Array.isArray(data)) {
        setQueries((data as unknown as any[]).filter(
          (item): item is UserHistoryQuery =>
            item && typeof item === 'object' &&
            'id' in item &&
            'question_text' in item &&
            'difficulty_level' in item &&
            'answer_text' in item &&
            'created_at' in item
        ));
      } else {
        setQueries([]);
      }
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
