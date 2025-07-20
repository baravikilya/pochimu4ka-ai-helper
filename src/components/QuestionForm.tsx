import React, { useState } from 'react';
import { Send, Loader2, Brain } from 'lucide-react';

interface QuestionFormProps {
  onSubmit: (question: string, difficulty: string) => Promise<void>;
  isLoading: boolean;
  answer: string | null;
}

const difficultyLevels = [
  { value: 'Для малышей', label: 'Для малышей', icon: '🧸' },
  { value: 'Школьник', label: 'Школьник', icon: '🎒' },
  { value: 'Студент', label: 'Студент', icon: '🎓' },
];

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, isLoading, answer }) => {
  const [question, setQuestion] = useState('');
  const [difficulty, setDifficulty] = useState('Школьник');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    await onSubmit(question.trim(), difficulty);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Input */}
        <div className="space-y-3">
          <label htmlFor="question" className="block text-lg font-medium text-foreground">
            О чём хочешь узнать?
          </label>
          <textarea
            id="question"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Напиши свой вопрос здесь..."
            className="pochimuchka-input resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-3">
          <label className="block text-lg font-medium text-foreground">
            Уровень сложности ответа
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <span>Спросить у нейросети</span>
                <Send size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Answer Display */}
      {(answer || isLoading) && (
        <div className="mt-8 bg-card border border-border rounded-xl p-6 card-shadow">
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
              <p className="whitespace-pre-wrap leading-relaxed">{answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionForm;