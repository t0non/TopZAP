'use client';

import { MessageSquareText } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo() {
  const { state } = useSidebar();
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 font-semibold text-foreground"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
        <MessageSquareText className="h-6 w-6" />
      </div>
      <span
        className={cn(
          'text-lg font-bold transition-opacity duration-200',
          state === 'collapsed' ? 'opacity-0 w-0' : 'opacity-100 w-auto'
        )}
      >
        WhatsConnect
      </span>
    </Link>
  );
}
