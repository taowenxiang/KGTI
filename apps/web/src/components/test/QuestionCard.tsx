import type { Question } from '@shared/types';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionCardProps {
  question: Question;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  total: number;
  current: number;
}

export default function QuestionCard({ question, selectedIndex, onSelect, total, current }: QuestionCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6">
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
          第 {current + 1} / {total} 题
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
            {question.content}
          </h3>
          <div className="space-y-3">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedIndex === idx
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      selectedIndex === idx
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="pt-1 text-sm md:text-base leading-relaxed">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
