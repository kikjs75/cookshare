import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { getStorage } from '../services/storage';
import { CreateRecipeBody, Recipe } from '../types';

export function listRecipes(req: Request, res: Response): void {
  const { page = '1', limit = '12', tag, difficulty, q } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const db = getDb();
  let query = `
    SELECT r.*, u.username as author_name, u.avatar_url as author_avatar,
           COUNT(DISTINCT l.user_id) as like_count
    FROM recipes r
    JOIN users u ON r.author_id = u.id
    LEFT JOIN likes l ON r.id = l.recipe_id
  `;
  const params: (string | number)[] = [];
  const where: string[] = [];

  if (q) {
    where.push('(r.title LIKE ? OR r.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (difficulty) {
    where.push('r.difficulty = ?');
    params.push(difficulty as string);
  }
  if (tag) {
    where.push('EXISTS (SELECT 1 FROM recipe_tags rt JOIN tags t ON rt.tag_id = t.id WHERE rt.recipe_id = r.id AND t.name = ?)');
    params.push(tag as string);
  }

  if (where.length > 0) query += ' WHERE ' + where.join(' AND ');
  query += ' GROUP BY r.id ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const recipes = db.prepare(query).all(...params);

  const countQuery = `SELECT COUNT(DISTINCT r.id) as total FROM recipes r
    LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
    LEFT JOIN tags t ON rt.tag_id = t.id
    ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}`;
  const { total } = db.prepare(countQuery).get(...params.slice(0, -2)) as { total: number };

  res.json({ recipes, total, page: Number(page), limit: Number(limit) });
}

export function getRecipe(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();

  const recipe = db.prepare(`
    SELECT r.*, u.username as author_name, u.avatar_url as author_avatar,
           COUNT(DISTINCT l.user_id) as like_count
    FROM recipes r
    JOIN users u ON r.author_id = u.id
    LEFT JOIN likes l ON r.id = l.recipe_id
    WHERE r.id = ?
    GROUP BY r.id
  `).get(id) as (Recipe & { author_name: string; like_count: number }) | undefined;

  if (!recipe) {
    res.status(404).json({ error: '레시피를 찾을 수 없습니다.' });
    return;
  }

  db.prepare('UPDATE recipes SET view_count = view_count + 1 WHERE id = ?').run(id);

  const ingredients = db.prepare('SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY sort_order').all(id);
  const steps = db.prepare('SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_number').all(id);
  const tags = db.prepare('SELECT t.name FROM tags t JOIN recipe_tags rt ON t.id = rt.tag_id WHERE rt.recipe_id = ?').all(id) as { name: string }[];

  res.json({ ...recipe, ingredients, steps, tags: tags.map(t => t.name) });
}

export function createRecipe(req: AuthRequest, res: Response): void {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const body = req.body as CreateRecipeBody;
  if (!body.title) { res.status(400).json({ error: 'title은 필수입니다.' }); return; }

  const db = getDb();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO recipes (id, title, description, cook_time, servings, difficulty, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.title, body.description ?? null, body.cook_time ?? null, body.servings ?? null, body.difficulty ?? null, req.user.userId);

  if (body.ingredients?.length) {
    const insertIngredient = db.prepare('INSERT INTO ingredients (id, recipe_id, name, amount, unit, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    body.ingredients.forEach((ing, i) => insertIngredient.run(uuidv4(), id, ing.name, ing.amount, ing.unit ?? null, i));
  }

  if (body.steps?.length) {
    const insertStep = db.prepare('INSERT INTO steps (id, recipe_id, step_number, instruction) VALUES (?, ?, ?, ?)');
    body.steps.forEach((step, i) => insertStep.run(uuidv4(), id, i + 1, step.instruction));
  }

  if (body.tags?.length) {
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)');
    const linkTag = db.prepare('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) SELECT ?, id FROM tags WHERE name = ?');
    body.tags.forEach(tag => { insertTag.run(uuidv4(), tag); linkTag.run(id, tag); });
  }

  res.status(201).json({ id });
}

export function updateRecipe(req: AuthRequest, res: Response): void {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { id } = req.params;
  const db = getDb();
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id) as Recipe | undefined;

  if (!recipe) { res.status(404).json({ error: '레시피를 찾을 수 없습니다.' }); return; }
  if (recipe.author_id !== req.user.userId) { res.status(403).json({ error: '수정 권한이 없습니다.' }); return; }

  const body = req.body as Partial<CreateRecipeBody>;
  db.prepare(`
    UPDATE recipes SET title = ?, description = ?, cook_time = ?, servings = ?, difficulty = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(body.title ?? recipe.title, body.description ?? recipe.description, body.cook_time ?? recipe.cook_time, body.servings ?? recipe.servings, body.difficulty ?? recipe.difficulty, id);

  res.json({ success: true });
}

export function deleteRecipe(req: AuthRequest, res: Response): void {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { id } = req.params;
  const db = getDb();
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id) as Recipe | undefined;

  if (!recipe) { res.status(404).json({ error: '레시피를 찾을 수 없습니다.' }); return; }
  if (recipe.author_id !== req.user.userId) { res.status(403).json({ error: '삭제 권한이 없습니다.' }); return; }

  db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
  res.json({ success: true });
}

export async function uploadImage(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  if (!req.file) { res.status(400).json({ error: '이미지 파일이 없습니다.' }); return; }

  const storage = getStorage();
  const result = await storage.upload(req.file, 'recipes');
  res.json(result);
}

export function toggleLike(req: AuthRequest, res: Response): void {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { id } = req.params;
  const db = getDb();
  const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND recipe_id = ?').get(req.user.userId, id);

  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND recipe_id = ?').run(req.user.userId, id);
    res.json({ liked: false });
  } else {
    db.prepare('INSERT INTO likes (user_id, recipe_id) VALUES (?, ?)').run(req.user.userId, id);
    res.json({ liked: true });
  }
}
