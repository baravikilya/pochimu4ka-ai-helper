import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Send, Loader2, Brain, HelpCircle } from 'lucide-react';

interface QuestionFormProps {
  onSubmit: (question: string, difficulty: string) => Promise<void>;
  isLoading: boolean;
  answer: string | null;
}

const difficultyLevels = [
  { value: 'Для малышей', label: 'Для малышей', icon: '🧸' },
  { value: 'Для школьников', label: 'Для школьников', icon: '🎒' },
  { value: 'Для студентов', label: 'Для студентов', icon: '🎓' },
];

// Функция для добавления пустой строки перед списками, если её нет
function ensureListSeparation(text: string) {
  // Добавить пустую строку перед списком, если он идёт сразу после текста или заголовка
  return text.replace(/([^\n])\n([ \t]*([-*+] |\d+\. ))/g, '$1\n\n$2');
}

// Функция для исправления переноса после цифры и точки в начале строки
function fixListNumbering(text: string) {
  // Убирает перенос строки после цифры и точки в начале строки
  return text.replace(/^(\s*\d+\.)\s*\n\s+/gm, '$1 ');
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, isLoading, answer }) => {
  const [question, setQuestion] = useState('');
  const [difficulty, setDifficulty] = useState('Для школьников');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    await onSubmit(question.trim(), difficulty);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-title">
          Почимучка — ответы на любые вопросы
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Difficulty Selector - directly below title */}
        <div className="text-center">
          <div className="flex justify-center flex-wrap gap-6">
            {difficultyLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setDifficulty(level.value)}
                className={`difficulty-option ${
                  difficulty === level.value ? 'selected' : ''
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-2xl">{level.icon}</span>
                  <span className="font-medium">{level.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Input */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="text-primary" size={24} />
            <h3 className="text-lg font-semibold text-foreground">Вопрос:</h3>
          </div>
          <textarea
            id="question"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Почему трава зеленая?"
            className="pochimuchka-input resize-none text-lg"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="pochimuchka-button flex items-center space-x-3 text-lg px-8 py-4"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Думаю...</span>
              </>
            ) : (
              <>
                <Brain size={20} />
                <span>Найти ответ</span>
                <Send size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Answer Display */}
      {(answer || isLoading) && (
        <div className="mt-8 bg-card border-2 border-border rounded-xl p-6" style={{ boxShadow: 'var(--shadow-elevated)' }}>
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="text-primary" size={24} />
            <h3 className="text-lg font-semibold text-foreground">Ответ:</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  p: ({node, ...props}) => <p style={{marginBottom: '1.25em'}} {...props} />,
                  br: () => <br style={{margin: 0, padding: 0}} />,
                  pre: ({node, ...props}) => <pre style={{marginBottom: '1.25em'}} {...props} />,
                }}
              >
                {answer ? fixListNumbering(answer) : ''}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionForm;