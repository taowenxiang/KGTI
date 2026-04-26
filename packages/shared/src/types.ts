export type Role = 'STUDENT' | 'CREATOR' | 'ADMIN';
export type Status = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SubmissionType = 'QUESTION' | 'PERSONALITY' | 'TEMPLATE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface QuestionOption {
  label: string;
  text: string;
  scores: Record<string, number>;
}

export interface Question {
  id: string;
  content: string;
  options: QuestionOption[];
  category?: string;
  status: Status;
  createdBy?: string;
  createdAt: string;
}

export interface PersonalityTrait {
  name: string;
  value: number;
}

export interface Personality {
  id: string;
  name: string;
  title: string;
  description: string;
  traits: PersonalityTrait[];
  icon: string;
  color: string;
  pixelArt?: string[];
  heroImage?: string;
  shareImageFallback?: string;
  status: Status;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  status: Status;
  createdBy?: string;
  scoringRules?: ScoringRules;
  questionCount?: number;
  createdAt: string;
}

export interface ScoringDimension {
  left: string;
  right: string;
  leftLabel?: string;
  rightLabel?: string;
  color?: string;
}

export interface ScoringRules {
  dimensions: ScoringDimension[];
  resultMap?: Record<string, string>;
  tieBreak?: 'left' | 'right';
}

export interface TemplateSubmissionInput {
  name: string;
  description?: string;
  baseQuestionIds: string[];
  customQuestions: Array<{
    content: string;
    category?: string;
    options: QuestionOption[];
  }>;
  personalities: Array<{
    id: string;
    name: string;
    title: string;
    description: string;
    traits: PersonalityTrait[];
    icon: string;
    color: string;
    pixelArt?: string[];
  }>;
  scoringRules: ScoringRules;
}

export interface TestResult {
  id: string;
  userId?: string | null;
  guestToken?: string | null;
  templateId: string;
  personalityId: string;
  scores: Record<string, number>;
  answers: { questionId: string; optionIndex: number }[];
  personality?: Personality;
  template?: Template;
  createdAt: string;
}

export interface Submission {
  id: string;
  type: SubmissionType;
  content: unknown;
  status: Status;
  remark?: string;
  creatorId: string;
  reviewerId?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface TestAnswer {
  questionId: string;
  optionIndex: number;
}

export interface TestSubmitInput {
  templateId: string;
  answers: TestAnswer[];
  guestToken?: string;
}
