'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Bell,
  Search,
} from 'lucide-react';
import {
  Squares2X2Icon as DashboardIcon,
  CubeIcon as ProductsIcon,
  ShoppingBagIcon as OrdersIcon,
  BuildingStorefrontIcon as InventoryIcon,
  TruckIcon as SuppliersIcon,
  ChartBarIcon as AnalyticsIcon,
  Cog6ToothIcon as SettingsIcon,
  UserIcon as ProfileIcon,
  TagIcon as CategoriesIcon,
} from '@heroicons/react/24/outline';

interface SidebarLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { icon: DashboardIcon, label: 'Dashboard', href: '/' },
  { icon: ProductsIcon, label: 'Products', href: '/products' },
  { icon: InventoryIcon, label: 'Inventory', href: '/inventory' },
  { icon: OrdersIcon, label: 'Orders', href: '/orders' },
  { icon: SuppliersIcon, label: 'Suppliers', href: '/suppliers' },
  { icon: AnalyticsIcon, label: 'Analytics', href: '/analytics' },
  { icon: SettingsIcon, label: 'Settings', href: '/settings' },
];

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-1">
          <img src="/pms-logo.svg" alt="PMS Logo" className="h-6 w-6" />
          <span className="font-bold text-lg">PMS</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-10 w-10" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <ProfileIcon className="h-4 w-4" />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <h1 className="text-lg font-semibold">PMS Dashboard</h1>
          </div>
          
          <div className="ml-auto flex items-center gap-2 px-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-64"
              />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Profile */}
            <Button variant="ghost" size="sm">
              <ProfileIcon className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
