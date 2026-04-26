import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestStore } from '../stores/testStore';
import { api } from '../lib/api';
import { getOrCreateGuestToken, saveGuestToken } from '../lib/guest';
import QuestionCard from '../components/test/QuestionCard';
import ProgressBar from '../components/test/ProgressBar';
import type { Question } from '@shared/types';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function TestPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const {
    questions,
    answers,
    currentIndex,
    isSubmitting,
    setTemplateId,
    setQuestions,
    answerQuestion,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    setSubmitting,
    setResultId,
    reset,
  } = useTestStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reset();
    if (!templateId) return;
    setTemplateId(templateId);
    api
      .get<Question[]>(`/test/templates/${templateId}/questions`)
      .then((qs) => {
        setQuestions(qs);
        setLoading(false);
      })
      .catch(() => {
        setError('加载题目失败');
        setLoading(false);
      });
  }, [templateId]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);

  function handleSelect(optionIndex: number) {
    if (!currentQuestion) return;
    answerQuestion(currentQuestion.id, optionIndex);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => nextQuestion(), 300);
    }
  }

  async function handleSubmit() {
    if (!templateId || answers.length < questions.length) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ id: string; guestToken?: string | null }>('/test/submit', {
        templateId,
        answers,
        guestToken: getOrCreateGuestToken(),
      });
      saveGuestToken(res.guestToken);
      setResultId(res.id);
      navigate(`/result/${res.id}`);
    } catch (err: unknown) {
      setError((err as Error).message || '提交失败');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载题目中...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '暂无题目'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-2 rounded-full text-sm hover:bg-primary-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const allAnswered = answers.length === questions.length;
  const questionDots = questions.map((_, idx) => (
    <button
      key={idx}
      onClick={() => goToQuestion(idx)}
      aria-label={`跳转到第 ${idx + 1} 题`}
      className={`h-2 rounded-full transition-all ${
        idx === currentIndex
          ? 'bg-primary-600 w-5'
          : answers.some((a) => a.questionId === questions[idx].id)
          ? 'bg-primary-300 w-2'
          : 'bg-gray-200 w-2'
      }`}
    />
  ));

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        <ProgressBar current={currentIndex} total={questions.length} />

        <div className="mt-8">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              selectedIndex={currentAnswer?.optionIndex ?? null}
              onSelect={handleSelect}
              total={questions.length}
              current={currentIndex}
            />
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap justify-center gap-1.5 px-2 md:hidden">
            {questionDots}
          </div>

          <div className="hidden md:flex md:items-center md:justify-between md:gap-6">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> 上一题
            </button>

            <div className="flex min-w-0 flex-1 justify-center gap-1.5">
              {questionDots}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                下一题 <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  allAnswered
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '解码人格中...' : '查看结果'}
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:hidden">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm text-gray-600 bg-white border border-gray-100 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> 上一题
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm text-gray-600 bg-white border border-gray-100 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                下一题 <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  allAnswered
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '解码人格中...' : '查看结果'}
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
