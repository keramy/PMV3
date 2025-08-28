
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function GeminiPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-72 bg-white border-r border-gray-400 flex flex-col">
        <div className="p-4 border-b border-gray-400">
            <h2 className="text-xl font-semibold text-gray-900">Gemini UI Preview</h2>
            <p className="text-sm text-gray-700">Built with shadcn/ui</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Components</h3>
          <Link href="/gemini-preview/dashboard" className="flex items-center px-3 py-2 text-gray-800 hover:bg-gray-200 rounded-md transition-colors">
            Dashboard
          </Link>
          <Link href="/gemini-preview/projects" className="flex items-center px-3 py-2 text-gray-800 hover:bg-gray-200 rounded-md transition-colors">
            Projects Table
          </Link>
          <Link href="/gemini-preview/tasks" className="flex items-center px-3 py-2 text-gray-800 hover:bg-gray-200 rounded-md transition-colors">
            Tasks Board
          </Link>
        </nav>
        <Separator className="bg-gray-400"/>
        <div className="p-4 text-xs text-gray-700">
            <p>&copy; 2025 Formula PM. All rights reserved.</p>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Card className="bg-white border-gray-400 h-full">
            {children}
        </Card>
      </main>
    </div>
  );
}
