import React from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { UserMenu } from '@/components/user-menu';
import { Logo } from '@/components/logo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <MainNav />
          </SidebarContent>
          <SidebarFooter>
            <UserMenu />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className='p-4 md:p-6'>
            {children}
          </div>
          <footer className="fixed bottom-0 left-0 md:left-[var(--sidebar-width-icon)] w-full peer-data-[variant=inset]:md:left-[calc(var(--sidebar-width-icon)+theme(spacing.2))] transition-[left] duration-200 ease-linear group-data-[state=expanded]:md:left-[var(--sidebar-width)] peer-data-[state=expanded]:peer-data-[variant=inset]:md:left-[calc(var(--sidebar-width)+theme(spacing.2))] bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center text-xs text-muted-foreground p-2 border-t">
              Sistema de automação não-oficial. Use com moderação.
            </div>
          </footer>
        </SidebarInset>
    </SidebarProvider>
  );
}
