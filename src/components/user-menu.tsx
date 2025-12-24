'use client';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CreditCard, LogOut, Settings, User } from 'lucide-react';
import { useSidebar } from './ui/sidebar';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export function UserMenu() {
  const { state } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-2 p-2"
        >
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {/* Skeleton is rendered but hidden on client */}
            <div className={cn("absolute inset-0 flex items-center gap-2 p-0", isClient ? "hidden" : "flex")}>
                <Skeleton className="h-8 w-8 rounded-full" />
             </div>
          </div>
          

          <div className={cn('flex flex-col items-start', state === 'collapsed' ? 'hidden' : 'flex')}>
            <div className="relative">
                <span className="text-sm font-medium">Usuário</span>
                {/* Skeleton is rendered but hidden on client */}
                <div className={cn("absolute inset-0", isClient ? "hidden" : "block")}>
                    <Skeleton className="h-4 w-20 mb-1" />
                </div>
            </div>
            
            <div className="relative">
                <span className="text-xs text-muted-foreground">
                    user@example.com
                </span>
                {/* Skeleton is rendered but hidden on client */}
                <div className={cn("absolute inset-0", isClient ? "hidden" : "block")}>
                    <Skeleton className="h-3 w-28" />
                </div>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Usuário</p>
            <p className="text-xs leading-none text-muted-foreground">
              user@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Faturamento</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
