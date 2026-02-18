import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Heart, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecipeSummary } from '@/lib/api';

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' } as const;
const DIFFICULTY_COLOR = { easy: 'secondary', medium: 'default', hard: 'destructive' } as const;

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-48 bg-muted">
          {recipe.thumbnail_url ? (
            <Image src={recipe.thumbnail_url} alt={recipe.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">🍳</div>
          )}
          {recipe.difficulty && (
            <div className="absolute right-2 top-2">
              <Badge variant={DIFFICULTY_COLOR[recipe.difficulty]}>
                {DIFFICULTY_LABEL[recipe.difficulty]}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="mb-1 line-clamp-1 font-semibold">{recipe.title}</h3>
          {recipe.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between p-4 pt-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {recipe.cook_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {recipe.cook_time}분
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {recipe.servings}인분
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {recipe.like_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {recipe.view_count}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
