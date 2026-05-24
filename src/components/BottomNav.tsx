'use client';

import { Menu, Download, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onSearch: () => void;
  onMenu?: () => void;
  onDownload?: () => void;
}

export default function BottomNav({ onSearch, onMenu, onDownload }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-md px-5 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div
          className={cn(
            'relative pointer-events-auto flex items-center justify-between',
            'glass rounded-full px-5 py-3',
            'shadow-[0_8px_32px_rgba(15,12,41,0.6)]'
          )}
        >
          <button
            type="button"
            onClick={onDownload}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Download"
          >
            <Download size={20} />
          </button>

          {/* Center FAB - sits above the bar */}
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search city"
            className={cn(
              'absolute left-1/2 -translate-x-1/2 -top-6',
              'h-14 w-14 rounded-full',
              'bg-fab-gradient text-white',
              'flex items-center justify-center',
              'shadow-[0_10px_30px_rgba(108,99,255,0.55)]',
              'ring-4 ring-[#1a1a2e]/80',
              'transition-transform active:scale-95 hover:scale-105'
            )}
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={onMenu}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
