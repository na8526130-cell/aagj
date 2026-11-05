import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  Copy,
  Zap,
  MapPin,
  Server,
  Activity,
  BatteryCharging,
  Battery,
  ShieldAlert,
  Search,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { IpGeoInfo, NetworkBatteryInfo } from '../types/clientInfo';

interface NetworkGeoSectionProps {
  ipGeo: IpGeoInfo;
  network: NetworkBatteryInfo;
  onCopy: (text: string, label: string) => void;
  onTriggerPing: () => void;
  onLookupIp: (ip: string) => void;
  isPinging: boolean;
  isLookingUp: boolean;
}

export const NetworkGeoSection: React.FC<NetworkGeoSectionProps> = ({
  ipGeo,
  network,
  onCopy,
  onTriggerPing,
  onLookupIp,
  isPinging,
  isLookingUp,
}) => {
  const [manualIpInput, setManualIpInput] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIpInput.trim()) {
      onLookupIp(manualIpInput.trim());
    }
  };

  return (
    <section id="network" className="scroll-mt-20 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
            <Globe className="w-4 h-4" />
            <span>ネットワーク・IP地理情報 & 通信品質</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            パブリックIP・プロバイダ(ISP)・実測回線品質
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerPing}
            disabled={isPinging}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm transition-colors"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-500 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? '実測Ping測定中...' : '実測Pingプローブ実行'}</span>
          </button>
        </div>
      </div>

      {/* Manual IP Verification & Transparency Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
            <Search className="w-3.5 h-3.5 text-cyan-500" />
            IP手動再検証 / 任意IP照会:
          </span>
          <form onSubmit={handleManualSearch} className="flex items-center gap-2 flex-1 md:w-72">
            <input
              type="text"
              placeholder="例: 133.242.0.1 または 自身のIP"
              value={manualIpInput}
              onChange={(e) => setManualIpInput(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full"
            />
            <button
              type="submit"
              disabled={isLookingUp}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium shrink-0 disabled:opacity-50"
            >
              {isLookingUp ? '照会中...' : '照会'}
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-slate-500 font-mono text-[11px]">
            データソース: <strong className="text-slate-700 dark:text-slate-300">{ipGeo.dataSource}</strong>
          </span>
          {ipGeo.rawApiResponse && (
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="px-2 py-0.5 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline border border-cyan-500/30 rounded"
            >
              {showRawJson ? '生API閉じる' : '生APIデータ確認'}
            </button>
          )}
        </div>
      </div>

      {showRawJson && ipGeo.rawApiResponse && (
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-60">
          <pre>{JSON.stringify(ipGeo.rawApiResponse, null, 2)}</pre>
        </div>
      )}

      {/* Adblocker / Fallback warning banner if Geo API was blocked */}
      {ipGeo.errorMessage && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">位置情報・プロバイダAPIの通信状況:</span>
            {ipGeo.errorMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: IP & Geolocation Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{ipGeo.flagEmoji}</span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {ipGeo.country} {ipGeo.countryCode !== 'N/A' ? `(${ipGeo.countryCode})` : ''}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {ipGeo.ipType} アドレス
                </span>
              </div>
            </div>

            <button
              onClick={() => onCopy(ipGeo.ip, 'パブリックIPアドレス')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              title="IPアドレスをコピー"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>IPコピー</span>
            </button>
          </div>

          {/* Large IP Display */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="text-xs font-medium text-slate-500 mb-1">
              検出されたパブリックIPアドレス (グローバルIP)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-cyan-600 dark:text-cyan-400 break-all select-all">
              {ipGeo.ip}
            </div>
            {ipGeo.webrtcIp && (
              <div className="mt-2 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>WebRTC STUN 経由でも同一IP ({ipGeo.webrtcIp}) が直接検証されました</span>
              </div>
            )}
          </div>

          {/* Location Breakdown Table */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">国名 / 国コード</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{ipGeo.country}</span>
                {ipGeo.countryCode !== 'N/A' && (
                  <span className="font-mono text-slate-400">({ipGeo.countryCode})</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">都道府県 / 地域 (Region)</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                {ipGeo.region}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">市区町村 (City)</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                {ipGeo.city}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">郵便番号 (Postal / ZIP)</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                {ipGeo.postalCode}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">緯度・経度 (座標)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {ipGeo.latitude !== null
                    ? `${ipGeo.latitude.toFixed(4)}, ${ipGeo.longitude?.toFixed(4)}`
                    : 'API未開示'}
                </span>
                {ipGeo.latitude !== null && (
                  <a
                    href={ipGeo.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Googleマップ</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">タイムゾーン & UTC時差</span>
              <div className="text-right">
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                  {ipGeo.timezoneId} ({ipGeo.timezoneUtcOffset})
                </span>
                <div className="text-[11px] text-slate-400">
                  端末設定 ({ipGeo.deviceTimezone}) との整合: {ipGeo.isTimezoneMatch ? '一致' : '不一致 (VPN/Proxyの可能性)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: ISP, ASN & Connection Quality Card */}
        <div className="space-y-6">
          {/* ISP & ASN Information */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-500" />
              プロバイダ (ISP) & 自律システム番号 (ASN)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 shrink-0">接続ISP (プロバイダ)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                  {ipGeo.isp}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 shrink-0">組織名 (Org)</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                  {ipGeo.org}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 shrink-0">ASN (自律システム番号)</span>
                <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 text-right">
                  {ipGeo.asn}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">ホスト名 / 接続ドメイン</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {ipGeo.domain}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Speed & Telemetry Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                回線通信品質 & バッテリーステータス
              </h3>
              <span className="text-[11px] text-slate-500">
                {network.networkApiSupported ? 'Network Information API 有効' : 'Network API 非対応ブラウザ'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">回線種別</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 truncate block">
                  {network.effectiveType}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{network.connectionType}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">推定下り速度</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {network.downlinkMbps !== null ? `${network.downlinkMbps}` : '非対応'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {network.downlinkMbps !== null ? 'Mbps (Downlink)' : 'Safari/Firefox等'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">往復遅延 (RTT)</span>
                <span className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {network.livePingMs !== null
                    ? `${network.livePingMs}`
                    : network.rttMs !== null
                    ? `${network.rttMs}`
                    : '未測定'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {network.livePingMs !== null ? 'ms (実測プローブ)' : network.rttMs !== null ? 'ms (推定RTT)' : 'Pingで実測可能'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block text-[11px] mb-1">バッテリー残量</span>
                <div className="flex items-center gap-1.5">
                  {network.batteryCharging ? (
                    <BatteryCharging className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Battery className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {network.batteryLevel !== null ? `${network.batteryLevel}%` : '非公開'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {network.batteryCharging ? '充電中' : network.batterySupported ? '稼働中' : '非対応/制限'}
                </span>
              </div>
            </div>

            {/* Note regarding Chromium W3C EffectiveType spec */}
            {network.effectiveTypeNote && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                <span>{network.effectiveTypeNote}</span>
              </div>
            )}

            {/* Real-time Ping Gauge Summary */}
            {network.livePingMs !== null && (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <Activity className="w-3.5 h-3.5 text-cyan-500" />
                    実測HTTP Pingプローブ結果 (Cloudflare / Google DNS CDN 実測)
                  </span>
                  <span className="font-mono text-[11px]">3回実測平均</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">平均遅延</span>
                    <strong className="text-sm text-cyan-600 dark:text-cyan-400">{network.livePingMs}ms</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">最小</span>
                    <strong className="text-sm text-emerald-600 dark:text-emerald-400">{network.livePingMin}ms</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">最大</span>
                    <strong className="text-sm text-amber-600 dark:text-amber-400">{network.livePingMax}ms</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ジッター</span>
                    <strong className="text-sm text-slate-700 dark:text-slate-300">{network.livePingJitter}ms</strong>
                  </div>
                </div>
              </div>
            )}

            {network.batteryNote && (
              <p className="text-[11px] text-slate-400">
                {network.batteryNote}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>
                データセーバー: <strong className="text-slate-700 dark:text-slate-300">{network.saveData === null ? '非対応ブラウザ' : network.saveData ? '節約モード (ON)' : '標準 (OFF)'}</strong>
              </span>
              <span>
                ネットワーク接続: <strong className="text-emerald-600 dark:text-emerald-400">{network.isOnline ? 'オンライン' : 'オフライン'}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
