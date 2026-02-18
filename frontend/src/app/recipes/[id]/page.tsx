import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users, Eye, ChefHat } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' } as const;

export default async function RecipePage({ params }: { params: { id: string } }) {
  let recipe;
  try {
    recipe = await api.recipes.get(params.id);
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">
      {recipe.thumbnail_url && (
        <div className="relative mb-6 h-72 overflow-hidden rounded-xl">
          <Image src={recipe.thumbnail_url} alt={recipe.title} fill className="object-cover" />
        </div>
      )}

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap gap-2">
          {recipe.difficulty && (
            <Badge>{DIFFICULTY_LABEL[recipe.difficulty]}</Badge>
          )}
          {recipe.tags.map(tag => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        <h1 className="mb-2 text-3xl font-bold">{recipe.title}</h1>
        {recipe.description && <p className="text-muted-foreground">{recipe.description}</p>}

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><ChefHat className="h-4 w-4" />{recipe.author_name}</span>
          {recipe.cook_time && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{recipe.cook_time}분</span>}
          {recipe.servings && <span className="flex items-center gap-1"><Users className="h-4 w-4" />{recipe.servings}인분</span>}
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{recipe.view_count}회</span>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">재료</h2>
        <ul className="divide-y rounded-lg border">
          {recipe.ingredients.map(ing => (
            <li key={ing.id} className="flex justify-between px-4 py-3">
              <span>{ing.name}</span>
              <span className="text-muted-foreground">{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">조리 순서</h2>
        <ol className="space-y-4">
          {recipe.steps.map(step => (
            <li key={step.id} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step.step_number}
              </span>
              <p className="pt-1">{step.instruction}</p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
