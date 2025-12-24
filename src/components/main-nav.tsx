'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Send,
  Users,
  Settings,
  ShieldCheck,
  QrCode,
  BookOpen,
} from 'lucide-react';
import { useTutorial } from './tutorial-provider';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Painel',
    selector: '#nav-dashboard'
  },
  {
    href: '/campaigns',
    icon: Send,
    label: 'Campanhas',
    selector: '#nav-campaigns'
  },
  {
    href: '/contacts',
    icon: Users,
    label: 'Contatos',
    selector: '#nav-contacts'
  },
  {
    href: '/whatsapp-connect',
    icon: QrCode,
    label: 'Conectar',
    selector: '#tour-connect-wa'
  },
];

const secondaryNavItems = [
    {
        href: '/tutorial',
        icon: BookOpen,
        label: 'Tutorial',
        selector: '#nav-tutorial'
    },
    {
        href: '/safety',
        icon: ShieldCheck,
        label: 'Segurança',
        selector: '#nav-safety'
    },
    {
        href: '/settings',
        icon: Settings,
        label: 'Configurações',
        selector: '#nav-settings'
    },
]

export function MainNav() {
  const pathname = usePathname();
  const { startTutorial } = useTutorial();

  const handleTutorialClick = (e: React.MouseEvent) => {
    // If we are not on the tutorial page, let the link navigate.
    // The tutorial page itself will handle starting the tour.
    if (pathname === '/tutorial') {
      e.preventDefault();
      startTutorial();
    }
  }

  return (
    <>
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href} id={item.selector.substring(1)}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
    <div className='flex-grow' />
    <SidebarMenu>
        {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href} id={item.selector.substring(1)}>
            <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
            >
                <Link href={item.href} onClick={item.href === '/tutorial' ? handleTutorialClick : undefined}>
                    <item.icon />
                    <span>{item.label}</span>
                </Link>
            </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
    </>
  );
}
