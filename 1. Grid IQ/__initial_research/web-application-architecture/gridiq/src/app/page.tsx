'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Activity,
  MapPin,
  Layers,
  Box,
  ZapOff,
  TrendingDown,
  Brain,
  Gauge,
  DollarSign,
  RefreshCw,
  Bell,
  Radio,
  Search,
  ClipboardList,
  ShieldAlert,
  FileBarChart,
  CalendarCheck,
  Target,
  FileDown,
  Handshake,
  Sliders,
  Cpu,
  Warehouse,
  RadioIcon,
  Wifi,
  Wrench,
  Users,
  UserCheck,
  UserPlus,
  HeartHandshake,
  Settings,
  UsersRound,
  UserCog,
  Building2,
  CreditCard,
  Plug,
  BellRing,
  Shield,
  ScrollText,
  Database,
  Lock,
  Zap,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Calendar,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Eye,
  MousePointerClick,
  BarChart3,
  Globe,
  ShieldCheck,
  ActivitySquare,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavChild {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavChild[];
}

// ─── Navigation Data ─────────────────────────────────────────────────────────

const NAV_STRUCTURE: NavGroup[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'grid-monitoring', label: 'Grid Monitoring', icon: Activity,
    children: [
      { id: 'live-loss-map', label: 'Live Loss Map', icon: MapPin, description: 'Real-time geographical view of energy loss across ECOWAS distribution zones' },
      { id: 'zone-drill-down', label: 'Zone Drill-Down', icon: Layers, description: 'Granular analysis of individual distribution zone performance metrics' },
      { id: 'digital-twin-viewer', label: 'Digital Twin Viewer', icon: Box, description: '3D digital replica of grid infrastructure for simulation and monitoring' },
      { id: 'outage-reliability', label: 'Outage & Reliability', icon: ZapOff, description: 'Track outage events, SAIDI/SAIFI indices, and grid reliability trends' },
    ],
  },
  {
    id: 'loss-analytics', label: 'Loss Analytics', icon: TrendingDown,
    children: [
      { id: 'anomaly-intelligence', label: 'Anomaly Intelligence', icon: Brain, description: 'AI-powered detection of unusual consumption patterns and theft indicators' },
      { id: 'meter-token-analytics', label: 'Meter & Token Analytics', icon: Gauge, description: 'Prepaid meter token analysis and vending discrepancy tracking' },
      { id: 'revenue-loss-model', label: 'Revenue Loss Model', icon: DollarSign, description: 'Financial modeling of technical and non-technical revenue losses' },
      { id: 'model-feedback-loop', label: 'Model Feedback Loop', icon: RefreshCw, description: 'Continuous model improvement through field verification and retraining' },
    ],
  },
  {
    id: 'alerts-investigations', label: 'Alerts & Investigations', icon: Bell, badge: '12',
    children: [
      { id: 'alert-feed', label: 'Alert Feed', icon: Radio, description: 'Real-time stream of grid anomalies, theft alerts, and system notifications' },
      { id: 'investigation-queue', label: 'Investigation Queue', icon: Search, description: 'Prioritized queue of cases requiring field investigation' },
      { id: 'field-case-detail', label: 'Field Case Detail', icon: ClipboardList, description: 'Detailed case management for field inspection and verification' },
      { id: 'political-risk', label: 'Political Risk', icon: ShieldAlert, description: 'Monitoring of political and regulatory risks affecting grid operations' },
    ],
  },
  {
    id: 'reporting-compliance', label: 'Reporting & Compliance', icon: FileBarChart,
    children: [
      { id: 'monthly-performance', label: 'Monthly Performance', icon: CalendarCheck, description: 'Monthly KPI dashboards and utility performance scorecards' },
      { id: 'impact-roi-tracker', label: 'Impact & ROI Tracker', icon: Target, description: 'Track return on investment for loss reduction initiatives' },
      { id: 'eis-export', label: 'EIS Export', icon: FileDown, description: 'Export data in ECOWAS Information System compliant formats' },
      { id: 'dfi-impact-pack', label: 'DFI Impact Pack', icon: Handshake, description: 'Impact reports for Development Finance Institution stakeholders' },
      { id: 'pilot-controls', label: 'Pilot Controls', icon: Sliders, description: 'Manage pilot programme parameters and control group settings' },
    ],
  },
  {
    id: 'asset-iot', label: 'Asset & IoT', icon: Cpu,
    children: [
      { id: 'asset-registry', label: 'Asset Registry', icon: Warehouse, description: 'Complete inventory of grid assets, transformers, and feeders' },
      { id: 'sensor-fleet', label: 'Sensor Fleet', icon: RadioIcon, description: 'IoT sensor deployment tracking and health monitoring' },
      { id: 'gateway-connectivity', label: 'Gateway Connectivity', icon: Wifi, description: 'Data gateway status, connectivity maps, and uptime monitoring' },
      { id: 'predictive-maintenance', label: 'Predictive Maintenance', icon: Wrench, description: 'ML-driven maintenance scheduling and failure prediction' },
    ],
  },
  {
    id: 'community', label: 'Community', icon: Users,
    children: [
      { id: 'regularisation-programme', label: 'Regularisation Programme', icon: UserCheck, description: 'Manage illegal connection regularisation and amnesty programmes' },
      { id: 'customer-case-intake', label: 'Customer Case Intake', icon: UserPlus, description: 'New customer onboarding and case registration portal' },
      { id: 'community-engagement', label: 'Community Engagement', icon: HeartHandshake, description: 'Track community outreach, education, and energy literacy programmes' },
    ],
  },
  {
    id: 'admin-settings', label: 'Admin & Settings', icon: Settings,
    children: [
      { id: 'user-management', label: 'User Management', icon: UsersRound, description: 'Manage platform users, roles, and access permissions' },
      { id: 'team-management', label: 'Team Management', icon: UserCog, description: 'Configure teams, assign zones, and manage organisational structure' },
      { id: 'utility-profile', label: 'Utility Profile', icon: Building2, description: 'Utility company settings, branding, and operational parameters' },
      { id: 'billing-subscriptions', label: 'Billing & Subscriptions', icon: CreditCard, description: 'Manage subscription plans, billing, and payment methods' },
      { id: 'api-integrations', label: 'API Integrations', icon: Plug, description: 'Configure external system integrations and API connections' },
      { id: 'notification-preferences', label: 'Notification Preferences', icon: BellRing, description: 'Customise alert thresholds, channels, and notification rules' },
    ],
  },
  {
    id: 'security-audit', label: 'Security & Audit', icon: Shield,
    children: [
      { id: 'audit-log', label: 'Audit Log', icon: ScrollText, description: 'Comprehensive audit trail of all platform actions and data changes' },
      { id: 'data-governance', label: 'Data Governance', icon: Database, description: 'Data classification, retention policies, and privacy compliance' },
      { id: 'cybersecurity-center', label: 'Cybersecurity Center', icon: Lock, description: 'Security posture monitoring, threat detection, and incident response' },
    ],
  },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ZONE_DATA = [
  { name: 'Lagos Zone', loss: 22.3, revenue: '$1.2M', status: 'Critical' as const, trend: -1.2 },
  { name: 'Accra Zone', loss: 16.8, revenue: '$890K', status: 'Warning' as const, trend: -2.4 },
  { name: 'Abidjan Zone', loss: 12.1, revenue: '$650K', status: 'Moderate' as const, trend: -3.1 },
  { name: 'Dakar Zone', loss: 8.7, revenue: '$420K', status: 'Good' as const, trend: -1.8 },
  { name: 'Freetown Zone', loss: 28.9, revenue: '$310K', status: 'Critical' as const, trend: +0.5 },
];

const ALERT_DATA = [
  { id: 1, severity: 'Critical' as const, title: 'Massive Load Discrepancy Detected', description: 'Zone LAG-04 showing 340% variance between billed and metered consumption across 12 feeders', time: '2 min ago', zone: 'Lagos Zone' },
  { id: 2, severity: 'Critical' as const, title: 'Transformer Overload Alert', description: 'ACC-07 transformer operating at 127% rated capacity with abnormal heat signatures', time: '8 min ago', zone: 'Accra Zone' },
  { id: 3, severity: 'Warning' as const, title: 'Meter Bypass Pattern Identified', description: 'AI model flagged 47 prepaid meters with consistent zero-consumption patterns', time: '15 min ago', zone: 'Lagos Zone' },
  { id: 4, severity: 'Warning' as const, title: 'Revenue Collection Drop', description: 'ABI-03 zone showing 31% decline in revenue collection vs. previous month baseline', time: '22 min ago', zone: 'Abidjan Zone' },
  { id: 5, severity: 'Info' as const, title: 'Sensor Fleet Maintenance Due', description: '14 IoT sensors in Dakar Zone scheduled for battery replacement within 48 hours', time: '1 hr ago', zone: 'Dakar Zone' },
  { id: 6, severity: 'Critical' as const, title: 'Unauthorized Grid Extension', description: 'Satellite imagery detected illegal feeder taps in Freetown residential district', time: '1.5 hr ago', zone: 'Freetown Zone' },
  { id: 7, severity: 'Warning' as const, title: 'Voltage Fluctuation Anomaly', description: 'ACC-12 feeder experiencing irregular voltage drops during peak hours', time: '2 hr ago', zone: 'Accra Zone' },
  { id: 8, severity: 'Info' as const, title: 'Monthly Report Generated', description: 'ECOWAS regional performance report for February 2026 is ready for review', time: '3 hr ago', zone: 'All Zones' },
];

const LOSS_TREND_DATA = [22.8, 22.1, 21.5, 20.9, 20.3, 19.8, 19.4, 19.1, 18.9, 18.7, 18.5, 18.4];
const RECOVERY_DATA = [180, 195, 210, 225, 240, 260, 280, 300, 315, 330, 345, 360];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MAP_ZONES = [
  { id: 'LAG', name: 'Lagos', x: 65, y: 55, w: 28, h: 22, loss: 22.3 },
  { id: 'ACC', name: 'Accra', x: 35, y: 50, w: 25, h: 20, loss: 16.8 },
  { id: 'ABI', name: 'Abidjan', x: 15, y: 48, w: 16, h: 18, loss: 12.1 },
  { id: 'DAK', name: 'Dakar', x: 5, y: 20, w: 18, h: 20, loss: 8.7 },
  { id: 'FRE', name: 'Freetown', x: 18, y: 30, w: 14, h: 14, loss: 28.9 },
  { id: 'BAM', name: 'Bamako', x: 28, y: 28, w: 22, h: 16, loss: 19.5 },
  { id: 'OUA', name: 'Ouagadougou', x: 40, y: 22, w: 22, h: 18, loss: 14.2 },
  { id: 'NIA', name: 'Niamey', x: 55, y: 25, w: 20, h: 16, loss: 21.7 },
  { id: 'LOM', name: 'Lomé', x: 45, y: 58, w: 16, h: 14, loss: 15.3 },
  { id: 'COT', name: 'Cotonou', x: 55, y: 48, w: 14, h: 12, loss: 17.6 },
];

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

// ─── Helper: Count-Up Hook ──────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ─── Animated Number Component ───────────────────────────────────────────────

function AnimatedNumber({ value, decimals = 1, prefix = '', suffix = '' }: {
  value: number; decimals?: number; prefix?: string; suffix?: string;
}) {
  const display = useCountUp(value, 2000);
  return <>{prefix}{display.toFixed(decimals)}{suffix}</>;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({ title, value, decimals, prefix, suffix, trend, trendLabel, pulseDot, icon: Icon, delay = 0 }: {
  title: string; value: number; decimals?: number; prefix?: string; suffix?: string;
  trend?: 'up' | 'down'; trendLabel?: string; pulseDot?: boolean;
  icon: LucideIcon; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-xl p-5 hover:bg-[var(--giq-card-hover)] transition-colors relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
        <Icon className="w-full h-full" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[var(--giq-text-secondary)] text-sm font-medium">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-[var(--giq-accent-emerald-soft)] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[var(--giq-accent-emerald)]" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          <AnimatedNumber value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
        </span>
        {trend && trendLabel && (
          <span className={`flex items-center text-xs font-semibold mb-1 px-1.5 py-0.5 rounded-md ${
            trend === 'down'
              ? 'text-[var(--giq-accent-emerald)] bg-[var(--giq-accent-emerald-soft)]'
              : trend === 'up' && title === 'Active Alerts'
                ? 'text-[var(--giq-accent-red)] bg-[var(--giq-accent-red-soft)]'
                : 'text-[var(--giq-accent-emerald)] bg-[var(--giq-accent-emerald-soft)]'
          }`}>
            {trend === 'down' ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <ArrowUpRight className="w-3 h-3 mr-0.5" />}
            {trendLabel}
          </span>
        )}
        {pulseDot && (
          <span className="mb-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--giq-accent-red)]" style={{ animation: 'pulse-red 2s infinite' }} />
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── SVG Loss Trend Chart ────────────────────────────────────────────────────

function LossTrendChart() {
  const chartW = 480;
  const chartH = 200;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const minVal = 15;
  const maxVal = 25;
  const range = maxVal - minVal;

  const points = LOSS_TREND_DATA.map((v, i) => ({
    x: padL + (i / (LOSS_TREND_DATA.length - 1)) * innerW,
    y: padT + (1 - (v - minVal) / range) * innerH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + innerH} L ${points[0].x} ${padT + innerH} Z`;

  return (
    <div className="bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Loss Trend</h3>
        <Badge variant="secondary" className="text-xs bg-[var(--giq-accent-emerald-soft)] text-[var(--giq-accent-emerald)] border-0">
          <TrendingDown className="w-3 h-3 mr-1" /> Downward
        </Badge>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" style={{ minHeight: 180 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = padT + f * innerH;
          const val = maxVal - f * range;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="var(--giq-border-light)" strokeWidth={0.5} strokeDasharray="4 3" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fill="var(--giq-text-muted)" fontSize={9}>{val}%</text>
            </g>
          );
        })}
        {/* X labels */}
        {MONTHS.map((m, i) => {
          const x = padL + (i / (MONTHS.length - 1)) * innerW;
          return <text key={m} x={x} y={chartH - 4} textAnchor="middle" fill="var(--giq-text-muted)" fontSize={9}>{m}</text>;
        })}
        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="var(--giq-accent-emerald)"
          fillOpacity={0.08}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--giq-accent-emerald)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill="var(--giq-card)"
            stroke="var(--giq-accent-emerald)"
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 * i + 0.8 }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── SVG Revenue Bar Chart ───────────────────────────────────────────────────

function RevenueBarChart() {
  const chartW = 480;
  const chartH = 200;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const maxVal = 400;
  const barW = innerW / RECOVERY_DATA.length * 0.55;
  const gap = innerW / RECOVERY_DATA.length;

  return (
    <div className="bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Revenue Recovery</h3>
        <Badge variant="secondary" className="text-xs bg-[var(--giq-accent-emerald-soft)] text-[var(--giq-accent-emerald)] border-0">
          <TrendingUp className="w-3 h-3 mr-1" /> +12% YoY
        </Badge>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" style={{ minHeight: 180 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = padT + f * innerH;
          const val = maxVal - f * maxVal;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="var(--giq-border-light)" strokeWidth={0.5} strokeDasharray="4 3" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fill="var(--giq-text-muted)" fontSize={9}>${Math.round(val / 1000 * 10) / 10}k</text>
            </g>
          );
        })}
        {/* X labels */}
        {MONTHS.map((m, i) => {
          const x = padL + i * gap + gap / 2;
          return <text key={m} x={x} y={chartH - 4} textAnchor="middle" fill="var(--giq-text-muted)" fontSize={9}>{m}</text>;
        })}
        {/* Bars */}
        {RECOVERY_DATA.map((v, i) => {
          const x = padL + i * gap + (gap - barW) / 2;
          const barH = (v / maxVal) * innerH;
          const y = padT + innerH - barH;
          return (
            <motion.rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill="var(--giq-accent-emerald)"
              fillOpacity={0.7}
              initial={{ height: 0, y: padT + innerH }}
              animate={{ height: barH, y }}
              transition={{ duration: 0.6, delay: 0.08 * i, ease: 'easeOut' }}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'Critical' | 'Warning' | 'Moderate' | 'Good' }) {
  const styles: Record<string, string> = {
    Critical: 'bg-[var(--giq-accent-red-soft)] text-[var(--giq-accent-red)] border-[var(--giq-accent-red)]/20',
    Warning: 'bg-[var(--giq-accent-amber-soft)] text-[var(--giq-accent-amber)] border-[var(--giq-accent-amber)]/20',
    Moderate: 'bg-[var(--giq-accent-cyan-soft)] text-[var(--giq-accent-cyan)] border-[var(--giq-accent-cyan)]/20',
    Good: 'bg-[var(--giq-accent-emerald-soft)] text-[var(--giq-accent-emerald)] border-[var(--giq-accent-emerald)]/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
}

// ─── Zone Performance Table ──────────────────────────────────────────────────

function ZoneTable() {
  return (
    <div className="bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--giq-border-light)]">
        <h3 className="text-sm font-semibold text-foreground">Zone Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--giq-border-light)]">
              <th className="text-left px-5 py-3 text-[var(--giq-text-muted)] font-medium">Zone</th>
              <th className="text-left px-5 py-3 text-[var(--giq-text-muted)] font-medium">Loss %</th>
              <th className="text-left px-5 py-3 text-[var(--giq-text-muted)] font-medium">Revenue at Risk</th>
              <th className="text-left px-5 py-3 text-[var(--giq-text-muted)] font-medium">Status</th>
              <th className="text-left px-5 py-3 text-[var(--giq-text-muted)] font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {ZONE_DATA.map((z, i) => (
              <motion.tr
                key={z.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * i }}
                className="border-b border-[var(--giq-border-light)] last:border-0 hover:bg-[var(--giq-card-hover)] transition-colors"
              >
                <td className="px-5 py-3 font-medium text-foreground">{z.name}</td>
                <td className="px-5 py-3 text-foreground">{z.loss}%</td>
                <td className="px-5 py-3 text-[var(--giq-text-secondary)]">{z.revenue}</td>
                <td className="px-5 py-3"><StatusBadge status={z.status} /></td>
                <td className="px-5 py-3">
                  <span className={`flex items-center text-xs font-semibold ${
                    z.trend < 0 ? 'text-[var(--giq-accent-emerald)]' : 'text-[var(--giq-accent-red)]'
                  }`}>
                    {z.trend < 0 ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                    {Math.abs(z.trend)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Recent Alerts ───────────────────────────────────────────────────────────

function RecentAlerts() {
  const severityIcon: Record<string, { icon: LucideIcon; color: string }> = {
    Critical: { icon: AlertTriangle, color: 'text-[var(--giq-accent-red)]' },
    Warning: { icon: AlertTriangle, color: 'text-[var(--giq-accent-amber)]' },
    Info: { icon: Info, color: 'text-[var(--giq-accent-cyan)]' },
  };
  return (
    <div className="bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--giq-border-light)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
        <Badge variant="secondary" className="text-xs">{ALERT_DATA.length} active</Badge>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {ALERT_DATA.slice(0, 5).map((a, i) => {
          const SevIcon = severityIcon[a.severity].icon;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * i }}
              className="px-5 py-3 border-b border-[var(--giq-border-light)] last:border-0 hover:bg-[var(--giq-card-hover)] transition-colors flex items-start gap-3"
            >
              <SevIcon className={`w-4 h-4 mt-0.5 shrink-0 ${severityIcon[a.severity].color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-foreground truncate">{a.title}</span>
                  <StatusBadge status={a.severity === 'Info' ? 'Good' : a.severity === 'Warning' ? 'Warning' : 'Critical'} />
                </div>
                <p className="text-xs text-[var(--giq-text-muted)] truncate">{a.description}</p>
              </div>
              <span className="text-xs text-[var(--giq-text-muted)] whitespace-nowrap shrink-0">{a.time}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Executive Dashboard View ────────────────────────────────────────────────

function ExecutiveDashboardView() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={fadeIn} className="h-full overflow-y-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-sm text-[var(--giq-text-muted)]">ECOWAS Energy Distribution Intelligence Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 rounded-md border border-[var(--giq-border-light)] bg-[var(--giq-card)] text-sm text-foreground px-3 focus:outline-none focus:ring-2 focus:ring-[var(--giq-accent-emerald)]"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--giq-accent-red)] text-white text-[10px] flex items-center justify-center font-bold">5</span>
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Loss Rate" value={18.4} suffix="%" trend="down" trendLabel="-2.1%" icon={TrendingDown} delay={0} />
        <KPICard title="Revenue Recovered" value={2.4} prefix="$" suffix="M" trend="up" trendLabel="+12%" icon={DollarSign} delay={0.1} />
        <KPICard title="Active Alerts" value={47} decimals={0} trend="up" trendLabel="+5" pulseDot icon={Bell} delay={0.2} />
        <KPICard title="Grid Uptime" value={94.7} suffix="%" trend="up" trendLabel="+1.3%" icon={Activity} delay={0.3} />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <LossTrendChart />
        <RevenueBarChart />
      </div>

      {/* Zone Table + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-6">
        <ZoneTable />
        <RecentAlerts />
      </div>
    </motion.div>
  );
}

// ─── Live Loss Map View ──────────────────────────────────────────────────────

function LiveLossMapView() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const getZoneColor = (loss: number) => {
    if (loss > 20) return 'var(--giq-accent-red)';
    if (loss > 10) return 'var(--giq-accent-amber)';
    return 'var(--giq-accent-emerald)';
  };

  const getZoneColorSoft = (loss: number) => {
    if (loss > 20) return 'var(--giq-accent-red-soft)';
    if (loss > 10) return 'var(--giq-accent-amber-soft)';
    return 'var(--giq-accent-emerald-soft)';
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={fadeIn} className="h-full flex flex-col lg:flex-row gap-4">
      {/* Map Area */}
      <div className="flex-1 bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-xl overflow-hidden relative">
        <div className="px-5 py-4 border-b border-[var(--giq-border-light)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live Loss Map</h2>
            <p className="text-xs text-[var(--giq-text-muted)]">ECOWAS Distribution Network — Real-time Loss Overlay</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-[var(--giq-text-muted)] w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 65px)' }}>
          <svg viewBox="0 0 100 80" className="w-full max-w-3xl mx-auto" style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.3s' }}>
            {/* Grid overlay */}
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`vg${i}`} x1={i * 10} y1={0} x2={i * 10} y2={80} stroke="var(--giq-border-light)" strokeWidth={0.15} />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`hg${i}`} x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="var(--giq-border-light)" strokeWidth={0.15} />
            ))}
            {/* Zones */}
            {MAP_ZONES.map((z) => (
              <g
                key={z.id}
                onMouseEnter={() => setHoveredZone(z.id)}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
              >
                <motion.rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  rx={2}
                  fill={getZoneColor(z.loss)}
                  fillOpacity={hoveredZone === z.id ? 0.4 : 0.2}
                  stroke={getZoneColor(z.loss)}
                  strokeWidth={hoveredZone === z.id ? 0.8 : 0.4}
                  strokeOpacity={hoveredZone === z.id ? 1 : 0.6}
                  animate={{
                    scale: hoveredZone === z.id ? 1.03 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ transformOrigin: `${z.x + z.w / 2}% ${z.y + z.h / 2}%` }}
                />
                <text
                  x={z.x + z.w / 2}
                  y={z.y + z.h / 2 - 2}
                  textAnchor="middle"
                  fill="var(--foreground)"
                  fontSize={3.5}
                  fontWeight="600"
                >
                  {z.name}
                </text>
                <text
                  x={z.x + z.w / 2}
                  y={z.y + z.h / 2 + 4}
                  textAnchor="middle"
                  fill={getZoneColor(z.loss)}
                  fontSize={3}
                  fontWeight="700"
                >
                  {z.loss}%
                </text>
              </g>
            ))}
            {/* Connection lines between zones */}
            <line x1={50} y1={38} x2={65} y2={55} stroke="var(--giq-accent-emerald)" strokeWidth={0.3} strokeDasharray="1 1" opacity={0.4} />
            <line x1={30} y1={40} x2={50} y2={55} stroke="var(--giq-accent-emerald)" strokeWidth={0.3} strokeDasharray="1 1" opacity={0.4} />
            <line x1={23} y1={48} x2={30} y2={55} stroke="var(--giq-accent-emerald)" strokeWidth={0.3} strokeDasharray="1 1" opacity={0.4} />
          </svg>
        </div>
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-lg px-3 py-2 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--giq-accent-emerald)', opacity: 0.6 }} />
            <span className="text-[var(--giq-text-secondary)]">&lt;10%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--giq-accent-amber)', opacity: 0.6 }} />
            <span className="text-[var(--giq-text-secondary)]">10-20%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--giq-accent-red)', opacity: 0.6 }} />
            <span className="text-[var(--giq-text-secondary)]">&gt;20%</span>
          </div>
        </div>
      </div>

      {/* Zone Sidebar */}
      <div className="w-full lg:w-72 bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--giq-border-light)]">
          <h3 className="text-sm font-semibold text-foreground">Distribution Zones</h3>
          <p className="text-xs text-[var(--giq-text-muted)]">{MAP_ZONES.length} active zones</p>
        </div>
        <div className="max-h-96 lg:max-h-[calc(100vh-220px)] overflow-y-auto">
          {MAP_ZONES.map((z, i) => (
            <motion.button
              key={z.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 * i }}
              className="w-full px-4 py-3 border-b border-[var(--giq-border-light)] last:border-0 hover:bg-[var(--giq-card-hover)] transition-colors text-left flex items-center gap-3"
              onMouseEnter={() => setHoveredZone(z.id)}
              onMouseLeave={() => setHoveredZone(null)}
            >
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ background: getZoneColor(z.loss), opacity: 0.7 }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{z.name}</div>
                <div className="text-xs text-[var(--giq-text-muted)]">{z.id} Zone</div>
              </div>
              <span
                className="text-sm font-bold shrink-0"
                style={{ color: getZoneColor(z.loss) }}
              >
                {z.loss}%
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Alert Feed View ─────────────────────────────────────────────────────────

function AlertFeedView() {
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ALERT_DATA.filter((a) => {
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && !a.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const severityConfig: Record<string, { icon: LucideIcon; color: string; softColor: string }> = {
    Critical: { icon: AlertTriangle, color: 'var(--giq-accent-red)', softColor: 'var(--giq-accent-red-soft)' },
    Warning: { icon: AlertTriangle, color: 'var(--giq-accent-amber)', softColor: 'var(--giq-accent-amber-soft)' },
    Info: { icon: Info, color: 'var(--giq-accent-cyan)', softColor: 'var(--giq-accent-cyan-soft)' },
  };

  const tabs = ['All', 'Critical', 'Warning', 'Info'];

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={fadeIn} className="h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alert Feed</h1>
          <p className="text-sm text-[var(--giq-text-muted)]">Real-time anomaly and event notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--giq-text-muted)]" />
            <Input
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-56 h-9 text-sm bg-[var(--giq-card)] border-[var(--giq-border-light)]"
            />
          </span>
        </div>
      </div>

      {/* Severity Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setSeverityFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              severityFilter === t
                ? 'bg-[var(--giq-accent-emerald)] text-white'
                : 'bg-[var(--giq-card)] text-[var(--giq-text-secondary)] border border-[var(--giq-border-light)] hover:bg-[var(--giq-card-hover)]'
            }`}
          >
            {t}
            {t !== 'All' && (
              <span className="ml-1 opacity-70">({ALERT_DATA.filter((a) => a.severity === t).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-3 pb-6">
        {filtered.map((a, i) => {
          const cfg = severityConfig[a.severity];
          const SevIcon = cfg.icon;
          return (
            <motion.div
              key={a.id}
              variants={slideInLeft}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
              className="bg-[var(--giq-card)] border border-[var(--giq-border-light)] rounded-xl p-4 hover:bg-[var(--giq-card-hover)] transition-colors flex items-start gap-4"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: cfg.softColor }}
              >
                <SevIcon className="w-5 h-5" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{a.title}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{ background: cfg.softColor, color: cfg.color }}
                  >
                    {a.severity}
                  </span>
                </div>
                <p className="text-xs text-[var(--giq-text-secondary)] mb-2">{a.description}</p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-[var(--giq-text-muted)]">
                    <Clock className="w-3 h-3" />{a.time}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[var(--giq-text-muted)]">
                    <MapPin className="w-3 h-3" />{a.zone}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 text-xs border-[var(--giq-border-light)] hover:bg-[var(--giq-accent-emerald-soft)] hover:text-[var(--giq-accent-emerald)] hover:border-[var(--giq-accent-emerald)]/30">
                <Search className="w-3 h-3 mr-1" />Investigate
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// ─── Placeholder View ────────────────────────────────────────────────────────

function PlaceholderView({ viewId }: { viewId: string }) {
  // Find the nav item data
  let icon: LucideIcon = Settings;
  let label = viewId;
  let description = 'This module is under development.';

  for (const group of NAV_STRUCTURE) {
    if (group.id === viewId) {
      icon = group.icon;
      label = group.label;
      description = `${group.label} module for the GridIQ platform.`;
      break;
    }
    if (group.children) {
      const child = group.children.find((c) => c.id === viewId);
      if (child) {
        icon = child.icon;
        label = child.label;
        description = child.description || `${child.label} module for the GridIQ platform.`;
        break;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-[var(--giq-accent-emerald-soft)] flex items-center justify-center mx-auto mb-6"
        >
          <icon className="w-10 h-10 text-[var(--giq-accent-emerald)]" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          {label}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[var(--giq-text-secondary)] text-sm mb-4"
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Badge className="bg-[var(--giq-accent-amber-soft)] text-[var(--giq-accent-amber)] border-0 hover:bg-[var(--giq-accent-amber-soft)]">
            <Sparkles className="w-3 h-3 mr-1" /> Coming Soon
          </Badge>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Sidebar Navigation Item ─────────────────────────────────────────────────

function NavTreeItem({ item, activeView, setActiveView, expandedGroups, toggleGroup, depth = 0 }: {
  item: NavGroup;
  activeView: string;
  setActiveView: (id: string) => void;
  expandedGroups: Set<string>;
  toggleGroup: (id: string) => void;
  depth?: number;
}) {
  const isActive = item.id === activeView || (item.children?.some((c) => c.id === activeView) ?? false);
  const isExpanded = expandedGroups.has(item.id);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <motion.button
        whileHover={{ x: 3 }}
        transition={{ duration: 0.15 }}
        onClick={() => {
          if (hasChildren) {
            toggleGroup(item.id);
            if (!isExpanded) setActiveView(item.children![0].id);
          } else {
            setActiveView(item.id);
          }
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive && !hasChildren
            ? 'bg-[var(--giq-accent-emerald)] text-white shadow-lg'
            : isActive
              ? 'bg-[var(--giq-accent-emerald-soft)] text-[var(--giq-accent-emerald)]'
              : 'text-[var(--giq-text-secondary)] hover:bg-[var(--giq-card-hover)] hover:text-foreground'
        }`}
        style={isActive && !hasChildren ? { animation: 'nav-glow 3s ease-in-out infinite' } : {}}
      >
        <item.icon className={`w-4 h-4 shrink-0 ${isActive && !hasChildren ? 'text-white' : isActive ? 'text-[var(--giq-accent-emerald)]' : ''}`} />
        <span className="flex-1 text-left truncate">{item.label}</span>
        {item.badge && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[var(--giq-accent-red-soft)] text-[var(--giq-accent-red)]">
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="ml-4 pl-3 border-l border-[var(--giq-border-light)] mt-1 space-y-0.5">
              {item.children!.map((child) => {
                const isChildActive = child.id === activeView;
                return (
                  <motion.button
                    key={child.id}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => setActiveView(child.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all relative ${
                      isChildActive
                        ? 'text-[var(--giq-accent-emerald)] font-semibold'
                        : 'text-[var(--giq-text-muted)] hover:text-[var(--giq-text-secondary)] hover:bg-[var(--giq-card-hover)]'
                    }`}
                  >
                    {isChildActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[var(--giq-accent-emerald)]"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <child.icon className={`w-3.5 h-3.5 shrink-0 ${isChildActive ? 'text-[var(--giq-accent-emerald)]' : ''}`} />
                    <span className="truncate">{child.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar Content ─────────────────────────────────────────────────────────

function SidebarContent({ activeView, setActiveView, onClose }: {
  activeView: string;
  setActiveView: (id: string) => void;
  onClose?: () => void;
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['grid-monitoring', 'alerts-investigations']));

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleNavClick = useCallback((id: string) => {
    setActiveView(id);
    onClose?.();
  }, [setActiveView, onClose]);

  return (
    <div className="h-full flex flex-col bg-[var(--giq-panel)] border-r border-[var(--giq-border-light)]">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <motion.div animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">GridIQ</h1>
          <span className="text-[10px] uppercase tracking-wider text-[var(--giq-text-muted)] font-semibold">West Africa</span>
        </div>
      </div>

      <Separator className="bg-[var(--giq-border-light)]" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-1">
          {NAV_STRUCTURE.map((item) => (
            <NavTreeItem
              key={item.id}
              item={item}
              activeView={activeView}
              setActiveView={handleNavClick}
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator className="bg-[var(--giq-border-light)]" />

      {/* Footer */}
      <div className="px-3 py-3 space-y-2 shrink-0">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--giq-text-secondary)] hover:bg-[var(--giq-card-hover)] hover:text-foreground transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        )}

        {/* User Chip */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--giq-card)]">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-[var(--giq-accent-emerald-soft)] text-[var(--giq-accent-emerald)] text-xs font-bold">
              AO
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">Amara Okafor</div>
            <div className="text-[10px] text-[var(--giq-text-muted)] truncate">Grid Operations Lead</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function GridIQPage() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ExecutiveDashboardView />;
      case 'live-loss-map':
        return <LiveLossMapView />;
      case 'alert-feed':
        return <AlertFeedView />;
      default:
        return <PlaceholderView viewId={activeView} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[var(--giq-deep)]">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="h-full grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block overflow-hidden">
          <SidebarContent activeView={activeView} setActiveView={setActiveView} />
        </div>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-[260px] h-full z-50 lg:hidden"
            >
              <SidebarContent
                activeView={activeView}
                setActiveView={setActiveView}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[var(--giq-panel)] border-b border-[var(--giq-border-light)] shrink-0">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">GridIQ</span>
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 overflow-hidden p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
