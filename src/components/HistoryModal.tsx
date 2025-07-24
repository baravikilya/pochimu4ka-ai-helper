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

// Функция для удаления markdown-разметки
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`[^`]*`/g, '') // remove inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/__([^_]+)__/g, '$1') // bold
    .replace(/_([^_]+)_/g, '$1') // italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/\!\[(.*?)\]\(.*?\)/g, '') // images
    .replace(/^#+\s*(.*)/gm, '$1') // headers
    .replace(/^-\s+/gm, '') // list items
    .replace(/^\d+\.\s+/gm, '') // numbered list items
    .replace(/---/g, '') // hr
    .replace(/>\s?/g, '') // blockquote
    .replace(/\n{2,}/g, '\n') // multiple newlines
    .replace(/\n/g, ' ').trim();
}

// Функция для форматирования plain text с переносами
function formatPlainText(text: string): React.ReactNode {
  // Экранируем HTML
  let safe = text.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c));
  // Двойные переносы — абзацный отступ
  safe = safe.replace(/\n\n+/g, '<div style="margin-top:1em"></div>');
  // Одиночные — <br>
  safe = safe.replace(/\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: safe }} />;
}

function stripMarkdownAndFormat(text: string): React.ReactNode {
  let plain = text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/__([^_]+)__/g, '$1') // bold
    .replace(/_([^_]+)_/g, '$1') // italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/\!\[(.*?)\]\(.*?\)/g, '') // images
    .replace(/^#+\s*(.*)/gm, '$1') // headers
    .replace(/^-\s+/gm, '') // list items
    .replace(/^\d+\.\s+/gm, '') // numbered list items
    .replace(/---/g, '') // hr
    .replace(/>\s?/g, '') // blockquote
    .replace(/^\s+|\s+$/g, ''); // trim
  // Экранируем HTML
  plain = plain.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c));
  // Все переносы — <br>
  plain = plain.replace(/\n+/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: plain }} />;
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
      case 'Для школьников':
        return '🎒';
      case 'Для студентов':
        return '🎓';
      default:
        return '❓';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Моя история запросов" wideOnDesktop>
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
                  {stripMarkdownAndFormat(query.answer_text)}
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