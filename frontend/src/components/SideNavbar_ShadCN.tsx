import React from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Disclosure } from '@headlessui/react';
import { CgProfile } from 'react-icons/cg';
import { FaRegComments } from 'react-icons/fa';
import { BiMessageSquareDots } from 'react-icons/bi';
import Link from 'next/link';

import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

import {
  MdOutlineSpaceDashboard,
  MdOutlineAnalytics,
  MdInventory,
  MdShoppingCart,
  MdOutlineIntegrationInstructions,
  MdOutlineMoreHoriz,
  MdOutlineSettings,
  MdOutlineLogout,
  MdAccountCircle,
  MdNotifications,
  MdOutlineLightMode,
  MdInbox,
} from 'react-icons/md';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const basePath = '/wholesaler';

// Menu items.
const items = [
  {
    title: 'Dashboard',
    slug: '/dashboard',
    icon: MdOutlineSpaceDashboard,
  },
  {
    title: 'My Orders',
    slug: '/my-orders',
    icon: MdShoppingCart,
  },
  {
    title: 'Customer Orders',
    slug: 'wholesaler/orders',
    icon: MdShoppingCart,
  },
  {
    title: 'Inventory',
    url: '#',
    icon: MdInventory,
  },
  {
    title: 'Inbox',
    url: '#',
    icon: MdInbox,
  },

  {
    title: 'Settings',
    url: '#',
    icon: MdOutlineSettings,
  },
];

const SideNavbar = () => {
  return (
    <Sidebar collapsible='icon'>
      <SidebarContent className='text-white bg-nezeza_dark_blue'>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {/* force the menu action to be visible when the menu button is active */}
                  {/* <SidebarMenuAction className='peer-data-[active=true]/menu-button:opacity-100' /> */}

                  <SidebarMenuButton asChild>
                    {/* <a href={item.url}> */}
                    <Link href={`${basePath}/${item.slug}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    
  );
};

export default SideNavbar;
