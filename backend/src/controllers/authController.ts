import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { signToken } from '../middleware/auth';
import { User } from '../types';

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).json({ error: 'email, password, username은 필수입니다.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: '비밀번호는 8자 이상이어야 합니다.' });
    return;
  }

  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username) as User | undefined;
  if (existing) {
    res.status(409).json({ error: '이미 사용중인 이메일 또는 사용자명입니다.' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const id = uuidv4();

  db.prepare(
    'INSERT INTO users (id, email, password_hash, username) VALUES (?, ?, ?, ?)'
  ).run(id, email, password_hash, username);

  const token = signToken({ userId: id, email });
  res.status(201).json({ token, user: { id, email, username } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'email과 password는 필수입니다.' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, email: user.email, username: user.username, avatar_url: user.avatar_url },
  });
}

export function me(req: Request, res: Response): void {
  const authReq = req as import('../middleware/auth').AuthRequest;
  if (!authReq.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT id, email, username, avatar_url, bio, created_at FROM users WHERE id = ?').get(authReq.user.userId) as Omit<User, 'password_hash'> | undefined;

  if (!user) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    return;
  }

  res.json(user);
}
