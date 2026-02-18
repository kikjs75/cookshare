const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || '요청 실패');
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; username: string }) =>
      request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<User>('/auth/me'),
  },
  recipes: {
    list: (params?: { page?: number; limit?: number; q?: string; tag?: string; difficulty?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return request<RecipeListResponse>(`/recipes${qs ? '?' + qs : ''}`);
    },
    get: (id: string) => request<RecipeDetail>(`/recipes/${id}`),
    create: (data: CreateRecipeBody) =>
      request<{ id: string }>('/recipes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateRecipeBody>) =>
      request<{ success: boolean }>(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/recipes/${id}`, { method: 'DELETE' }),
    toggleLike: (id: string) =>
      request<{ liked: boolean }>(`/recipes/${id}/like`, { method: 'POST' }),
    uploadImage: async (file: File): Promise<{ url: string; key: string }> => {
      const token = getToken();
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API_URL}/recipes/upload/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error('이미지 업로드 실패');
      return res.json();
    },
  },
};

// Shared types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
}

export interface RecipeSummary {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  author_name: string;
  author_avatar: string | null;
  like_count: number;
  view_count: number;
  created_at: string;
}

export interface RecipeDetail extends RecipeSummary {
  author_id: string;
  ingredients: { id: string; name: string; amount: string; unit: string | null }[];
  steps: { id: string; step_number: number; instruction: string; image_url: string | null }[];
  tags: string[];
}

export interface RecipeListResponse {
  recipes: RecipeSummary[];
  total: number;
  page: number;
  limit: number;
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
