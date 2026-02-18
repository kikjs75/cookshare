import { RecipeCard } from '@/components/recipe/RecipeCard';
import { api } from '@/lib/api';

export const revalidate = 60;

export default async function HomePage() {
  let recipes = [];
  try {
    const data = await api.recipes.list({ limit: 12 });
    recipes = data.recipes;
  } catch {
    // 서버 연결 실패 시 빈 목록
  }

  return (
    <div>
      <section className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold">맛있는 레시피를 공유하세요</h1>
        <p className="text-muted-foreground">요리를 사랑하는 사람들과 함께하는 레시피 커뮤니티</p>
      </section>

      {recipes.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg">아직 등록된 레시피가 없습니다.</p>
          <p className="text-sm">첫 번째 레시피를 공유해보세요!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
