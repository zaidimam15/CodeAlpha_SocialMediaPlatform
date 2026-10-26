import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.jsx';
import { Sidebar } from '../components/common/Sidebar.jsx';
import { RightSidebar } from '../components/common/RightSidebar.jsx';
import { MobileNav } from '../components/common/MobileNav.jsx';
import { CreatePostModal } from '../components/posts/CreatePostModal.jsx';

export function MainLayout() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0A0D14] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar onOpenCreatePost={() => setIsCreateOpen(true)} />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex justify-center gap-6 pt-4 pb-20 md:pb-8">
        <Sidebar onOpenCreatePost={() => setIsCreateOpen(true)} />

        <main className="w-full max-w-2xl min-w-0 flex-1">
          <Outlet context={{ openCreatePost: () => setIsCreateOpen(true) }} />
        </main>

        <RightSidebar />
      </div>

      <MobileNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={() => {
          // Window reload or custom trigger
          window.dispatchEvent(new CustomEvent('connectify_post_created'));
        }}
      />
    </div>
  );
}
