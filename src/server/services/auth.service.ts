import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { JWT_CONFIG } from '../config/auth.js';
import type { RegisterInput, LoginInput } from '../../shared/types.js';

const SALT_ROUNDS = 10;

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw Object.assign(new Error('该邮箱已被注册'), { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: 'STUDENT',
    },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });

  const token = generateToken(user.id, user.email, user.role);
  return { user, token };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) {
    throw Object.assign(new Error('邮箱或密码错误'), { statusCode: 400 });
  }

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) {
    throw Object.assign(new Error('邮箱或密码错误'), { statusCode: 400 });
  }

  const token = generateToken(user.id, user.email, user.role);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
    token,
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });
  if (!user) {
    throw Object.assign(new Error('用户不存在'), { statusCode: 404 });
  }
  return user;
}

function generateToken(id: string, email: string, role: string) {
  return jwt.sign({ id, email, role }, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  });
}
