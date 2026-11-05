import React from 'react';
import { Moon, Sun, Download, RefreshCw } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenExport: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenExport,
  onRefresh,
  isRefreshing,
  activeSection,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element, no subtitle pills) */}
        <a
          href="#"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          Client Profiler
        </a>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a
            href="#overview"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeSection === 'overview'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            概要
          </a>
          <a
            href="#network"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeSection === 'network'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ネットワーク & IP
          </a>
          <a
            href="#hardware"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeSection === 'hardware'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ハードウェア
          </a>
          <a
            href="#media"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeSection === 'media'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            メディア & コーデック
          </a>
          <a
            href="#security"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeSection === 'security'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            セキュリティ & API
          </a>
          <a
            href="#referrer"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeSection === 'referrer'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            流入元 & 履歴
          </a>
          <a
            href="#browser"
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeSection === 'browser'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ブラウザ & OS
          </a>
        </nav>

        {/* Zone 3: Actions (Refresh + Theme toggle + 1 primary action button) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="最新データ再取得"
            aria-label="最新データ再取得"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
            aria-label="テーマ切替"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>レポート出力</span>
          </button>
        </div>
      </div>
    </header>
  );
};
