'use client'

import { useState, useEffect } from 'react';
import { BsMoon, BsSun } from 'react-icons/bs';
import { useTheme } from 'next-themes';

export default function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
             {theme === 'light' ? <BsMoon/> : <BsSun/>}
      </button>
    );
}

// 'use client';

// import * as React from 'react';
// import { Moon, Sun } from 'lucide-react';
// import { useTheme } from 'next-themes';

// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   MdOutlineSpaceDashboard,
//   MdOutlineAnalytics,
//   MdInventory,
//   MdShoppingCart,
//   MdOutlineIntegrationInstructions,
//   MdOutlineMoreHoriz,
//   MdOutlineSettings,
//   MdOutlineDashboard,
//   MdOutlineLogout,
//   MdAccountCircle,
//   MdOutlineNotifications,
//   MdOutlineLightMode,
//   MdOutlineClose,
//   MdMenu,
// } from 'react-icons/md';

// const ThemeSwitcher = () => {
//   const { setTheme } = useTheme();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant='outline' size='icon'>
//           <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
//           <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
//           <span className='sr-only'>Toggle theme</span>
//         </Button>
//       </DropdownMenuTrigger>
//       {/* <MdOutlineLightMode className='text-2xl text-white group-hover:text-white '></MdOutlineLightMode> */}
//       <DropdownMenuContent align='end'>
//         <DropdownMenuItem onClick={() => setTheme('light')}>
//           Light
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme('dark')}>
//           Dark
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme('system')}>
//           System
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// export default  ThemeSwitcher;