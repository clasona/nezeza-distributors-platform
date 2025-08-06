import React from 'react';

const AdminTopNavbar: React.FC = () => {
  return (
    <header className="w-full h-16 bg-vesoko_dark_blue flex items-center justify-between px-6 shadow z-20 fixed top-0 left-0 right-0">
      <div className="flex items-center gap-2">
        <button
          className="sm:hidden text-white focus:outline-none"
          onClick={() => {
            const sidebar = document.querySelector('.side-navbar');
            if (sidebar) sidebar.classList.toggle('hidden');
          }}
          aria-label="Toggle sidebar"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span className="text-xl font-bold text-vesoko_yellow">Admin Panel</span>
      </div>
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative text-white hover:text-vesoko_yellow focus:outline-none" aria-label="Notifications">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
          <span className="absolute -top-1 -right-1 bg-vesoko_red_600 text-xs rounded-full px-1.5 py-0.5">3</span>
        </button>
        {/* Quick Links */}
        <div className="hidden md:flex gap-4">
          <a href="/admin/store-applications" className="text-vesoko_yellow hover:text-white font-medium">Applications</a>
          <a href="/admin/orders" className="text-vesoko_yellow hover:text-white font-medium">Orders</a>
          <a href="/admin/support" className="text-vesoko_yellow hover:text-white font-medium">Support</a>
        </div>
        {/* Theme Toggle */}
        <button className="text-white hover:text-vesoko_yellow focus:outline-none" aria-label="Toggle theme" onClick={() => {
          document.documentElement.classList.toggle('dark');
        }}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
        </button>
        {/* Profile */}
        <div className="flex items-center gap-2">
          <span className="text-vesoko_yellow font-semibold text-sm">Admin</span>
          <img src="/admin-avatar.png" alt="Admin Avatar" className="w-8 h-8 rounded-full border-2 border-vesoko_yellow" />
        </div>
      </div>
    </header>
  );
};

export default AdminTopNavbar;
