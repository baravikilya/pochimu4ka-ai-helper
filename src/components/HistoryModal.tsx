import React from 'react';
import { Calendar, MessageCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';

interface Query {
  id: number;
  question_text: string;
  difficulty_level: string;
  answer_text: string;
  created_at: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  queries: Query[];
  isLoading: boolean;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  queries,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Для малышей':
        return '🧸';
      case 'Школьник':
        return '🎒';
      case 'Студент':
        return '🎓';
      default:
        return '❓';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Моя история запросов">
      <div className="max-h-96 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Загрузка истории...</span>
          </div>
        ) : queries.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Пока нет вопросов</p>
            <p className="text-sm text-muted-foreground mt-1">
              Задайте первый вопрос нейросети!
            </p>
          </div>
        ) : (
          queries.map((query) => (
            <div
              key={query.id}
              className="bg-secondary/50 border border-border rounded-xl p-4 space-y-3"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getDifficultyIcon(query.difficulty_level)}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg font-medium">
                    {query.difficulty_level}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>{formatDate(query.created_at)}</span>
                </div>
              </div>

              {/* Question */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-sm font-medium text-primary">Вопрос:</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                  {query.question_text}
                </p>
              </div>

              {/* Answer */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-sm font-medium text-accent">Ответ:</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-accent/20">
                  {query.answer_text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default HistoryModal;