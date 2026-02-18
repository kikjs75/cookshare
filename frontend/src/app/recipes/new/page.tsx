'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const [tags, setTags] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [steps, setSteps] = useState([{ instruction: '' }]);

  function addIngredient() { setIngredients(prev => [...prev, { name: '', amount: '', unit: '' }]); }
  function removeIngredient(i: number) { setIngredients(prev => prev.filter((_, idx) => idx !== i)); }
  function updateIngredient(i: number, field: string, value: string) {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing));
  }

  function addStep() { setSteps(prev => [...prev, { instruction: '' }]); }
  function removeStep(i: number) { setSteps(prev => prev.filter((_, idx) => idx !== i)); }
  function updateStep(i: number, value: string) {
    setSteps(prev => prev.map((step, idx) => idx === i ? { instruction: value } : step));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { id } = await api.recipes.create({
        title,
        description: description || undefined,
        cook_time: cookTime ? Number(cookTime) : undefined,
        servings: servings ? Number(servings) : undefined,
        difficulty: difficulty || undefined,
        ingredients: ingredients.filter(ing => ing.name && ing.amount),
        steps: steps.filter(s => s.instruction),
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      });
      router.push(`/recipes/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '레시피 작성 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">레시피 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <Card>
          <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">제목 *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">설명</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="cookTime">조리 시간 (분)</Label>
                <Input id="cookTime" type="number" min="1" value={cookTime} onChange={e => setCookTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="servings">인분</Label>
                <Input id="servings" type="number" min="1" value={servings} onChange={e => setServings(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="difficulty">난이도</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as typeof difficulty)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">선택</option>
                  <option value="easy">쉬움</option>
                  <option value="medium">보통</option>
                  <option value="hard">어려움</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
              <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="한식, 국물, 간편" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>재료</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="mr-1 h-4 w-4" /> 추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="재료명" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
                <Input placeholder="양" className="w-24" value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)} />
                <Input placeholder="단위" className="w-20" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} />
                {ingredients.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>조리 순서</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <Plus className="mr-1 h-4 w-4" /> 추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="flex h-10 w-8 shrink-0 items-center justify-center font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <Textarea
                  placeholder={`${i + 1}번째 조리 순서를 입력하세요`}
                  value={step.instruction}
                  onChange={e => updateStep(i, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {steps.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
          <Button type="submit" disabled={loading}>{loading ? '저장 중...' : '레시피 저장'}</Button>
        </div>
      </form>
    </div>
  );
}
