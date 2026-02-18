'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChefHat, PlusCircle, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <ChefHat className="h-6 w-6" />
          CookShare
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/recipes/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  레시피 작성
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  {user.username}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">회원가입</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
