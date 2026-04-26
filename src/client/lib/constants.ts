export const APP_NAME = 'PersonaQuest';
export const APP_SLOGAN = '发现真实的自己';

export const ROUTES = {
  HOME: '/',
  TEST: '/test/:templateId',
  RESULT: '/result/:resultId',
  GALLERY: '/gallery',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
  ADMIN_QUESTIONS: '/admin/questions',
  ADMIN_PERSONALITIES: '/admin/personalities',
  CREATOR: '/creator',
  CREATOR_SUBMIT: '/creator/submit',
} as const;
