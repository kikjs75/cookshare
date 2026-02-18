export interface User {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  author_id: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  amount: string;
  unit: string | null;
  sort_order: number;
}

export interface Step {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  image_url: string | null;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface AuthPayload {
  userId: string;
  email: string;
}

export interface CreateRecipeBody {
  title: string;
  description?: string;
  cook_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  ingredients: { name: string; amount: string; unit?: string }[];
  steps: { instruction: string }[];
  tags?: string[];
}
