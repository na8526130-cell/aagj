/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { OverviewSection } from './components/OverviewSection';
import { NetworkGeoSection } from './components/NetworkGeoSection';
import { HardwareGpuSection } from './components/HardwareGpuSection';
import { MediaCodecsSection } from './components/MediaCodecsSection';
import { SecurityApisSection } from './components/SecurityApisSection';
import { ReferrerTimelineSection } from './components/ReferrerTimelineSection';
import { BrowserSoftwareSection } from './components/BrowserSoftwareSection';
import { ExportModal } from './components/ExportModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { FullClientInspectionData } from './types/clientInfo';
import { useActivityTracker } from './hooks/useActivityTracker';
import {
  detectBrowserAndOS,
  detectHardwareAndGPU,
  detectNetworkAndBattery,
  detectReferrerAndSession,
  fetchIpAndGeoInfo,
  measureRealPing,
} from './utils/clientDetectors';
import {
  detectAdvancedDisplay,
  detectAudioCapabilities,
  detectMediaCodecs,
  detectNavigationTiming,
  detectSecurityAndPrivacy,
  detectWebApis,
  detectWebGlLimits,
  measureRefreshRate,
} from './utils/advancedDetectors';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const {
    events,
    addEvent,
    clearEvents,
    lastActiveTimestamp,
    sessionDurationSeconds,
  } = useActivityTracker();

  // Full inspection state
  const [data, setData] = useState<FullClientInspectionData>(() => {
    const hw = detectHardwareAndGPU();
    hw.webglLimits = detectWebGlLimits();

    return {
      session: detectReferrerAndSession(),
      network: {
        effectiveType: '判定中...',
        connectionType: '判定中...',
        downlinkMbps: null,
        rttMs: null,
        saveData: null,
        networkApiSupported: false,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        batteryLevel: null,
        batteryCharging: null,
        batteryChargingTime: null,
        batteryDischargingTime: null,
        batterySupported: false,
        livePingMs: null,
        livePingMin: null,
        livePingMax: null,
        livePingJitter: null,
        pingStatus: 'idle',
      },
      hardware: hw,
      ipGeo: {
        ip: '取得中...',
        ipType: 'Unknown',
        country: '取得中...',
        countryCode: 'N/A',
        flagEmoji: '🌐',
        region: '取得中...',
        city: '取得中...',
        postalCode: '-',
        latitude: null,
        longitude: null,
        googleMapsUrl: 'https://www.google.com/maps',
        isp: '取得中...',
        org: '取得中...',
        asn: '-',
        domain: '-',
        timezoneId: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Tokyo',
        timezoneUtcOffset: '端末基準',
        isTimezoneMatch: true,
        deviceTimezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Tokyo',
        dataSource: '初期化中',
        fetchStatus: 'loading',
      },
      browser: detectBrowserAndOS(),
      audio: detectAudioCapabilities(),
      codecs: detectMediaCodecs(),
      display: detectAdvancedDisplay(null),
      performanceTiming: detectNavigationTiming(),
      security: {
        adBlockDetected: false,
        adBlockNote: '診断中...',
        incognitoDetected: false,
        incognitoConfidence: '通常モード',
        isSecureContext: typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false,
        crossOriginIsolated: typeof window !== 'undefined' ? Boolean(window.crossOriginIsolated) : false,
        cookieEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : false,
        localStorageWorking: true,
        sessionStorageWorking: true,
        indexedDbWorking: true,
        canvasProtectionActive: false,
      },
      webApis: detectWebApis(),
      inspectedAt: new Date().toLocaleString('ja-JP'),
    };
  });

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleCopy = useCallback(
    (text: string, label: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
          () => {
            showToast(`${label} をコピーしました`);
            addEvent('copy', `${label} コピー`, text.slice(0, 40) + (text.length > 40 ? '...' : ''), 'COPY');
          },
          () => {
            showToast('コピーに失敗しました', 'info');
          }
        );
      }
    },
    [showToast, addEvent]
  );

  // Sync session duration & last active timestamp from tracker
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        lastActiveTimestamp,
        sessionDurationSeconds,
      },
    }));
  }, [lastActiveTimestamp, sessionDurationSeconds]);

  // Initial load & async network/IP fetching
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [networkInfo, ipInfo, fps, securityInfo] = await Promise.all([
        detectNetworkAndBattery(),
        fetchIpAndGeoInfo(),
        measureRefreshRate(),
        detectSecurityAndPrivacy(),
      ]);

      const hardwareInfo = detectHardwareAndGPU();
      hardwareInfo.webglLimits = detectWebGlLimits();
      const browserInfo = detectBrowserAndOS();
      const sessionInfo = detectReferrerAndSession();
      const audioInfo = detectAudioCapabilities();
      const codecsInfo = detectMediaCodecs();
      const displayInfo = detectAdvancedDisplay(fps);
      const perfTiming = detectNavigationTiming();
      const webApisList = detectWebApis();

      setData((prev) => ({
        ...prev,
        session: {
          ...sessionInfo,
          lastActiveTimestamp: Date.now(),
          sessionDurationSeconds: prev.session.sessionDurationSeconds,
        },
        network: {
          ...networkInfo,
          livePingMs: prev.network.livePingMs,
          livePingMin: prev.network.livePingMin,
          livePingMax: prev.network.livePingMax,
          livePingJitter: prev.network.livePingJitter,
          pingStatus: prev.network.pingStatus,
        },
        hardware: hardwareInfo,
        ipGeo: ipInfo,
        browser: browserInfo,
        audio: audioInfo,
        codecs: codecsInfo,
        display: displayInfo,
        performanceTiming: perfTiming,
        security: securityInfo,
        webApis: webApisList,
        inspectedAt: new Date().toLocaleString('ja-JP'),
      }));

      showToast('最新の診断データを取得しました');
    } catch (err) {
      console.error('Failed to refresh data', err);
      showToast('データ更新中にエラーが発生しました', 'info');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Ping test handler
  const handleTriggerPing = useCallback(async () => {
    if (isPinging) return;
    setIsPinging(true);
    addEvent('speed_test', '実測Pingプローブ開始', 'CDNエンドポイントへのHTTP遅延測定中', 'PING');

    try {
      const result = await measureRealPing(3);
      setData((prev) => ({
        ...prev,
        network: {
          ...prev.network,
          livePingMs: result.avg,
          livePingMin: result.min,
          livePingMax: result.max,
          livePingJitter: result.jitter,
          pingStatus: 'success',
        },
      }));
      showToast(`実測Ping: 平均 ${result.avg}ms (ジッター: ${result.jitter}ms)`);
      addEvent(
        'speed_test',
        '実測Pingプローブ完了',
        `平均: ${result.avg}ms, 最小: ${result.min}ms, 最大: ${result.max}ms, ジッター: ${result.jitter}ms`,
        'PING'
      );
    } catch {
      showToast('Pingプローブの実行に失敗しました', 'info');
    } finally {
      setIsPinging(false);
    }
  }, [isPinging, addEvent, showToast]);

  // Manual IP verification / lookup handler
  const handleLookupIp = useCallback(async (customIp: string) => {
    setIsLookingUp(true);
    addEvent('speed_test', 'IP手動照会開始', `指定IP [${customIp}] の位置・プロバイダ情報を再取得中`, 'LOOKUP');
    try {
      const result = await fetchIpAndGeoInfo(customIp);
      setData((prev) => ({
        ...prev,
        ipGeo: result,
      }));
      showToast(`IP [${result.ip}] の地理情報を更新しました`);
      addEvent('speed_test', 'IP手動照会完了', `国: ${result.country}, 地域: ${result.region}, ISP: ${result.isp}`, 'LOOKUP');
    } catch {
      showToast('指定IP情報の照会に失敗しました', 'info');
    } finally {
      setIsLookingUp(false);
    }
  }, [addEvent, showToast]);

  // Listen to Network & Battery events
  useEffect(() => {
    const handleOnline = () => {
      setData((prev) => ({
        ...prev,
        network: { ...prev.network, isOnline: true },
      }));
      addEvent('page_load', '回線ステータス変化', 'ネットワークに再接続 (Online)', 'ONLINE');
    };

    const handleOffline = () => {
      setData((prev) => ({
        ...prev,
        network: { ...prev.network, isOnline: false },
      }));
      addEvent('page_load', '回線ステータス変化', 'ネットワークが切断 (Offline)', 'OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery listeners if supported
    let batteryObj: any = null;
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        const updateBattery = () => {
          setData((prev) => ({
            ...prev,
            network: {
              ...prev.network,
              batteryLevel: Math.round(battery.level * 100),
              batteryCharging: battery.charging,
              batteryChargingTime: Number.isFinite(battery.chargingTime) ? battery.chargingTime : null,
              batteryDischargingTime: Number.isFinite(battery.dischargingTime) ? battery.dischargingTime : null,
              batterySupported: true,
            },
          }));
        };
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addEvent]);

  // Dark mode toggle
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  // Update active section on scroll
  useEffect(() => {
    const sections = ['overview', 'network', 'hardware', 'media', 'security', 'referrer', 'browser'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Header adhering strictly to Top Bar Contract */}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenExport={() => setIsExportModalOpen(true)}
        onRefresh={refreshAllData}
        isRefreshing={isRefreshing}
        activeSection={activeSection}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 1. Overview Section */}
        <OverviewSection
          data={data}
          onSelectTab={(id) => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onTriggerPing={handleTriggerPing}
          isPinging={isPinging}
        />

        {/* 2. Network & Public IP Geolocation */}
        <NetworkGeoSection
          ipGeo={data.ipGeo}
          network={data.network}
          onCopy={handleCopy}
          onTriggerPing={handleTriggerPing}
          onLookupIp={handleLookupIp}
          isPinging={isPinging}
          isLookingUp={isLookingUp}
        />

        {/* 3. Hardware, GPU & WebGL Limits */}
        <HardwareGpuSection
          hardware={data.hardware}
          onCopy={handleCopy}
        />

        {/* 4. Media, Audio & Codecs */}
        <MediaCodecsSection
          audio={data.audio}
          codecs={data.codecs}
          display={data.display}
        />

        {/* 5. Security Context & Modern Web APIs Matrix */}
        <SecurityApisSection
          security={data.security}
          performanceTiming={data.performanceTiming}
          webApis={data.webApis}
        />

        {/* 6. Referrer & Real-time Activity Timeline */}
        <ReferrerTimelineSection
          session={data.session}
          events={events}
          onClearEvents={clearEvents}
          onCopy={handleCopy}
        />

        {/* 7. Browser, OS & Software Specs */}
        <BrowserSoftwareSection
          browser={data.browser}
          onCopy={handleCopy}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Client Profiler</span>
            <span aria-hidden="true">·</span>
            <span>高精度クライアント環境・接続詳細診断 (100%実測・生データ検証)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              レポート出力
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              ページ最上部へ戻る
            </button>
          </div>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        onCopy={handleCopy}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
