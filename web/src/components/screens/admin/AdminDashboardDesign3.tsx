"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { THEME_VARIANTS, useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronsUpDown,
  ListFilter,
  LogOut,
  MessageCircle,
  Palette,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";

/**
 * This design's palette, hardcoded rather than themed: the reference it
 * reproduces is a light screen built around one lime accent, and pulling the
 * `--chart-*` ramp in would repaint the cards, the chart and the gauge every
 * time someone switched theme variant.
 */
const C = {
  page: "#f1f1ee",
  card: "#ffffff",
  ink: "#111312",
  muted: "#8b8f8c",
  line: "#e8e8e4",
  lime: "#e4ee6b",
  sky: "#c3e4ec",
  up: "#16a34a",
  down: "#ef4444",
  cream: "#fdf3dd",
  mint: "#e6f6e3",
};

/** Gauge stops, red through green — the index reads left to right. */
const GAUGE_STOPS = ["#ef5a4c", "#f59e5b", "#f4d35e", "#c6dd63", "#63c47a"];

/**
 * A constant bright rim on every column regardless of size — like a rim
 * light along the top edge — so the ramp below can vary without any column
 * losing the crisp cap that makes it read as a bar in the first place.
 */
const CAP_LINE = C.lime;

/**
 * Every column shares one fill, fading from a pale wash at the cap down to
 * nothing at the base — the reference draws all bars the same tint and lets
 * height alone carry the value, rather than ramping colour with it.
 */
const BAR_FILL = `linear-gradient(to bottom, #eef1af, #eef1af00)`;

export interface NavTab {
  href: string;
  label: string;
}

export interface CoinCard {
  id: string;
  /** Short mark drawn in the circle: "₿", "Ξ". */
  symbol: string;
  name: string;
  /** Pre-formatted — the currency and separators belong to the caller. */
  price: string;
  /** Carries no sign; `direction` supplies it. */
  deltaLabel: string;
  direction: "up" | "down";
  /** Seven-ish points, any scale — the sparkline normalises them. */
  spark: number[];
  /** Highlight tint. Left out, the card is plain white. */
  tint?: string;
}

export interface MarketPoint {
  label: string;
  /** Trillions, matching the axis this chart prints. */
  value: number;
}

export interface TableRow {
  id: string;
  symbol: string;
  name: string;
  price: string;
  hourDelta: { label: string; direction: "up" | "down" };
  dayDelta: { label: string; direction: "up" | "down" };
  marketCap: string;
  volume: string;
  spark: number[];
}

export interface IndexReading {
  id: string;
  label: string;
  value: number;
  verdict: string;
  tint: string;
}

export interface AdminDashboardDesign3Props {
  brand?: string;
  /** The project's mark, same file every design uses. */
  logoSrc?: string;
  tabs?: NavTab[];
  initials?: string;
  logoutHref?: string;
  coins?: CoinCard[];
  market?: {
    title: string;
    ranges: string[];
    defaultRange?: string;
    /** One series per range value, keyed by the range's own label. */
    pointsByRange: Record<string, MarketPoint[]>;
    /** Label printed above the figure in the hover callout. */
    calloutLabel?: string;
  };
  table?: { title: string; rows: TableRow[] };
  fearGreed?: {
    title: string;
    /** 0–100. */
    value: number;
    verdict: string;
    readings: IndexReading[];
  };
}

// Everything below reproduces the reference screen's own figures, so the
// design can be judged on the numbers it was drawn for. Pass props to swap in
// real data — nothing here is fetched.

const TABS: NavTab[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "#", label: "Exchange" },
  { href: "#", label: "Analytics" },
  { href: "#", label: "Transaction" },
  { href: "#", label: "My Wallet" },
];

const COINS: CoinCard[] = [
  {
    id: "btc",
    symbol: "₿",
    name: "BTC",
    price: "$118,506.21",
    deltaLabel: "0.34%",
    direction: "up",
    spark: [8, 5, 9, 4, 10, 6, 11, 7, 12],
    tint: C.lime,
  },
  {
    id: "xrp",
    symbol: "✕",
    name: "XRP",
    price: "$2.82",
    deltaLabel: "1.25%",
    direction: "up",
    spark: [6, 7, 5, 8, 6, 9, 7, 10, 9],
  },
  {
    id: "ltc",
    symbol: "Ł",
    name: "Litecoin",
    price: "$95.15",
    deltaLabel: "0.30%",
    direction: "up",
    spark: [5, 6, 4, 7, 6, 9, 8, 11, 10],
  },
  {
    id: "eth",
    symbol: "Ξ",
    name: "Ethereum",
    price: "$2,989.81",
    deltaLabel: "0.81%",
    direction: "up",
    spark: [4, 6, 5, 8, 7, 10, 9, 12, 11],
    tint: C.sky,
  },
];

const MARKET = {
  title: "Crypto Market Cap",
  ranges: ["1D", "1W", "1M", "6M", "1Y"],
  defaultRange: "1W",
  calloutLabel: "Market Cap",
  pointsByRange: {
    "1D": [
      { label: "04", value: 2.55 },
      { label: "08", value: 2.61 },
      { label: "12", value: 2.48 },
      { label: "16", value: 2.66 },
      { label: "20", value: 2.72 },
      { label: "00", value: 2.6 },
    ],
    "1W": [
      { label: "Mon", value: 2.6 },
      { label: "Tue", value: 2.35 },
      { label: "Wed", value: 2.63 },
      { label: "Thu", value: 2.5 },
      { label: "Fri", value: 2.1 },
      { label: "Sat", value: 2.75 },
      { label: "Sun", value: 2.8 },
    ],
    "1M": [
      { label: "W1", value: 2.2 },
      { label: "W2", value: 2.45 },
      { label: "W3", value: 2.3 },
      { label: "W4", value: 2.63 },
    ],
    "6M": [
      { label: "Apr", value: 1.8 },
      { label: "May", value: 2.05 },
      { label: "Jun", value: 2.2 },
      { label: "Jul", value: 2.5 },
      { label: "Aug", value: 2.4 },
      { label: "Sep", value: 2.63 },
    ],
    "1Y": [
      { label: "Q1", value: 1.5 },
      { label: "Q2", value: 1.95 },
      { label: "Q3", value: 2.35 },
      { label: "Q4", value: 2.63 },
    ],
  },
};

const TABLE = {
  title: "All Crypto",
  rows: [
    {
      id: "btc",
      symbol: "₿",
      name: "Bitcoin",
      price: "$118,506.21",
      hourDelta: { label: "0.34%", direction: "up" as const },
      dayDelta: { label: "1.24%", direction: "up" as const },
      marketCap: "$2.36T",
      volume: "$43.57B",
      spark: [4, 6, 5, 8, 7, 9, 8, 11],
    },
    {
      id: "eth",
      symbol: "Ξ",
      name: "Ethereum",
      price: "$2,989.81",
      hourDelta: { label: "0.81%", direction: "up" as const },
      dayDelta: { label: "2.15%", direction: "up" as const },
      marketCap: "$362.35B",
      volume: "$13.1B",
      spark: [5, 4, 7, 6, 9, 7, 10, 9],
    },
    {
      id: "ltc",
      symbol: "Ł",
      name: "Litecoin",
      price: "$95.15",
      hourDelta: { label: "1.27%", direction: "up" as const },
      dayDelta: { label: "3.14%", direction: "up" as const },
      marketCap: "$109.09B",
      volume: "$7.27B",
      spark: [6, 5, 8, 7, 10, 8, 11, 12],
    },
    {
      id: "usdt",
      symbol: "₮",
      name: "Tether",
      price: "$1.00",
      hourDelta: { label: "0.05%", direction: "down" as const },
      dayDelta: { label: "0.12%", direction: "down" as const },
      marketCap: "$159.51B",
      volume: "$70.71B",
      spark: [8, 7, 9, 6, 8, 5, 7, 6],
    },
    {
      id: "xrp",
      symbol: "✕",
      name: "XRP",
      price: "$2.82",
      hourDelta: { label: "1.25%", direction: "up" as const },
      dayDelta: { label: "3.40%", direction: "up" as const },
      marketCap: "$169.35B",
      volume: "$7.29B",
      spark: [5, 7, 6, 9, 7, 10, 8, 11],
    },
  ],
};

const FEAR_GREED = {
  title: "Fear and Greed Index",
  value: 68,
  verdict: "Greed",
  readings: [
    { id: "yesterday", label: "Yesterday", value: 70, verdict: "Greed", tint: C.mint },
    { id: "last-week", label: "Last Week", value: 50, verdict: "Neutral", tint: C.cream },
    { id: "last-month", label: "Last Month", value: 54, verdict: "Neutral", tint: C.cream },
  ],
};

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

const CARD = "rounded-3xl bg-white";

/**
 * Catmull-Rom through the points, emitted as cubic beziers. Straight segments
 * between samples give every turn a corner; this rounds them while still
 * passing through each actual value, so the curve stays honest.
 */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    // Sixth of the neighbouring span is the standard Catmull-Rom tension —
    // enough to round the turn without overshooting past the next point.
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

/** A curve the width of its box, normalised so any scale of numbers fits. */
function Sparkline({
  points,
  color = C.ink,
  width = 84,
  height = 28,
}: {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);

  const d = smoothPath(
    points.map((value, index) => ({
      x: index * step,
      // 2px of padding top and bottom keeps the stroke inside the box.
      y: height - 2 - ((value - min) / span) * (height - 4),
    })),
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Delta with its own arrow — direction never rests on the colour alone. */
function Delta({
  label,
  direction,
  className,
}: {
  label: string;
  direction: "up" | "down";
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 font-medium", className)}
      style={{ color: direction === "up" ? C.up : C.down }}
    >
      {label}
      <span aria-hidden="true" className="text-[9px]">
        {direction === "up" ? "▲" : "▼"}
      </span>
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors hover:bg-black/[0.03]"
      style={{ borderColor: C.line, color: C.muted }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Top bar — brand, the section pills, and the account controls.
// ---------------------------------------------------------------------------

function TopBar({
  brand,
  logoSrc,
  tabs,
  initials,
  logoutHref,
}: {
  brand: string;
  logoSrc: string;
  tabs: NavTab[];
  initials: string;
  logoutHref?: string;
}) {
  const pathname = usePathname();
  const { variantId, setVariantId } = useTheme();
  const round =
    "grid size-9 shrink-0 place-items-center rounded-full border transition-colors hover:bg-black/[0.03] sm:size-10";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <Image src={logoSrc} alt="" width={32} height={32} className="size-8 shrink-0 object-contain" />
        <span className="truncate text-base font-semibold sm:text-lg" style={{ color: C.ink }}>
          {brand}
        </span>
      </div>

      {/* The pills are the whole navigation: this design has no rail, so the
          sections live across the top where the eye starts.

          Below `lg` they take a row of their own — the five of them run to
          about 500px, which does not share a line with the brand and the
          controls — and scroll inside it rather than wrapping, so the bar
          stays one pill-shaped strip instead of breaking into two ragged
          rows. */}
      <nav
        aria-label="Sections"
        className="order-last flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none] lg:order-none lg:w-auto [&::-webkit-scrollbar]:hidden"
        style={{ backgroundColor: C.card }}
      >
        {tabs.map((tab) => {
          // A "#" placeholder never matches a pathname, so it never lights up.
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors",
                active ? "text-white" : "hover:bg-black/[0.04]",
              )}
              style={{ backgroundColor: active ? C.ink : "transparent", color: active ? "#fff" : C.muted }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Tightened below `sm` so the brand and these controls still share a
          line: at size-10 with gap-2 they came to 374px inside a 342px row
          and broke onto one of their own. */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Change color theme"
              className={round}
              style={{ borderColor: C.line, backgroundColor: C.card, color: C.ink }}
            >
              <Palette className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {THEME_VARIANTS.map((variant) => (
              <DropdownMenuItem key={variant.id} onSelect={() => setVariantId(variant.id)}>
                <span
                  data-theme={variant.id}
                  className="bg-primary size-4 shrink-0 rounded-full border"
                  aria-hidden
                />
                {variant.name}
                {variant.id === variantId && (
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          aria-label="Search"
          className={round}
          style={{ borderColor: C.line, backgroundColor: C.card, color: C.ink }}
        >
          <Search className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Messages"
          className={round}
          style={{ borderColor: C.line, backgroundColor: C.card, color: C.ink }}
        >
          <MessageCircle className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className={round}
          style={{ borderColor: C.line, backgroundColor: C.card, color: C.ink }}
        >
          <Bell className="size-4" />
        </button>

        {logoutHref && (
          <Link
            href={logoutHref}
            aria-label="Sign out"
            className={round}
            style={{ borderColor: C.line, backgroundColor: C.card, color: C.ink }}
          >
            <LogOut className="size-4" />
          </Link>
        )}

        {/* Decorative — it names nobody the page doesn't already name, and on
            a phone its 40px is what pushes this row past the brand beside it. */}
        <span
          aria-hidden="true"
          className="hidden size-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white sm:grid"
          style={{ backgroundColor: C.ink }}
        >
          {initials}
        </span>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Coin cards — mark, name and sparkline on one line, the price given the room.
// ---------------------------------------------------------------------------

function CoinTile({ coin }: { coin: CoinCard }) {
  return (
    <article
      className={cn(CARD, "flex flex-col justify-between gap-6 p-5")}
      style={{ backgroundColor: coin.tint ?? C.card }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full text-sm"
            style={{ backgroundColor: coin.tint ? "rgba(255,255,255,0.75)" : C.page, color: C.ink }}
          >
            {coin.symbol}
          </span>
          <span className="font-medium" style={{ color: C.ink }}>
            {coin.name}
          </span>
        </div>

        <Sparkline points={coin.spark} />
      </div>

      <div>
        <p className="text-xs" style={{ color: C.muted }}>
          <Delta label={coin.deltaLabel} direction={coin.direction} className="text-xs" />
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: C.ink }}>
          {coin.price}
        </p>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Market cap — a column per period with a flat cap line, and a callout on the
// point worth reading. Columns, not a smooth line: the axis is a total that
// only means anything at each close.
// ---------------------------------------------------------------------------

const AXIS = [3.5, 3.0, 2.5, 2.0, 1.5, 1.0];

function MarketCap({
  title,
  ranges,
  defaultRange,
  pointsByRange,
  calloutLabel,
}: NonNullable<AdminDashboardDesign3Props["market"]>) {
  const [range, setRange] = useState(defaultRange ?? ranges[0]);
  // null until the cursor is actually over a column — the callout comes and
  // goes with it, the same as Design 4's chart.
  const [hovered, setHovered] = useState<number | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const points = pointsByRange[range] ?? [];
  const max = 3.6;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row || points.length === 0) return;
    const rect = row.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.floor(ratio * points.length);
    setHovered(Math.min(points.length - 1, Math.max(0, index)));
  };

  return (
    <section className={cn(CARD, "flex h-full flex-col p-5")}>
      {/* Wraps rather than squeezes: on a phone the title and the five range
          pills come to more than the panel's width, and unwrapped it is the
          title that gives — "Crypto Market Cap" broken across three lines. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium" style={{ color: C.ink }}>
          {title}
        </h2>

        <div className="flex items-center gap-1 rounded-full p-1" style={{ backgroundColor: C.page }}>
          {ranges.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setRange(option);
                setHovered(null);
              }}
              className="rounded-full px-2.5 py-1 text-xs transition-colors"
              style={{
                backgroundColor: option === range ? C.ink : "transparent",
                color: option === range ? "#fff" : C.muted,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-1 gap-3">
        <ul className="flex flex-col justify-between py-1 text-[10px]" style={{ color: C.muted }}>
          {AXIS.map((tick) => (
            <li key={tick} className="tabular-nums">
              ${tick.toFixed(1)}T
            </li>
          ))}
        </ul>

        <div className="min-w-0 flex-1">
          <div
            ref={rowRef}
            className="flex h-full min-h-40 cursor-crosshair items-stretch gap-1"
            onMouseMove={handleMove}
            onMouseLeave={() => setHovered(null)}
          >
            {points.map((point, index) => (
              <div
                key={point.label}
                className="relative flex min-w-0 flex-1 flex-col items-center justify-end"
              >
                {/* A small corner radius, not a full pill — on a narrow bar
                    rounded-t-full turns the whole top into a stadium cap,
                    which is what was reading as a smudge instead of a
                    column. One flat fill on every bar, fading to nothing at
                    the base; only the height carries the value. Positioned
                    itself (not the column) so the callout below anchors to
                    the cap and rides up and down with it as height changes. */}
                <div
                  className="relative w-full rounded-t-md"
                  style={{
                    height: `${(point.value / max) * 100}%`,
                    backgroundImage: BAR_FILL,
                    borderTop: `3px solid ${CAP_LINE}`,
                  }}
                >
                  {hovered === index && (
                    <div className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-full text-center whitespace-nowrap">
                      <div className="rounded-xl px-3 py-1.5" style={{ backgroundColor: C.ink }}>
                        <span className="block text-[9px] text-white/60">{calloutLabel}</span>
                        <span className="block text-xs font-medium text-white tabular-nums">
                          ${point.value.toFixed(2)}T
                        </span>
                      </div>
                      {/* Tail: a 45°-rotated square, half tucked behind the
                          bubble above it, so the visible triangle points at
                          the cap it belongs to. */}
                      <div
                        className="mx-auto -mt-1 size-2 rotate-45"
                        style={{ backgroundColor: C.ink }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <ul className="mt-2 flex gap-1.5 text-[10px]" style={{ color: C.muted }}>
            {points.map((point) => (
              <li key={point.label} className="min-w-0 flex-1 text-center">
                {point.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// All crypto — the table. Scrolls sideways rather than squeezing: seven
// columns of figures stop being readable well before they stop fitting.
// ---------------------------------------------------------------------------

function CryptoTable({ title, rows }: NonNullable<AdminDashboardDesign3Props["table"]>) {
  return (
    <section className={cn(CARD, "flex h-full flex-col p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium" style={{ color: C.ink }}>
          {title}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <Chip>
            Volume(24h)
            <ChevronsUpDown className="size-3" aria-hidden="true" />
          </Chip>
          <Chip>
            Market Cap(24h)
            <ChevronsUpDown className="size-3" aria-hidden="true" />
          </Chip>
          <Chip>
            Filters
            <ListFilter className="size-3" aria-hidden="true" />
          </Chip>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs" style={{ color: C.muted }}>
              <th className="pb-3 font-normal">Name</th>
              <th className="pb-3 font-normal">Price</th>
              <th className="pb-3 font-normal">1h %</th>
              <th className="pb-3 font-normal">24h %</th>
              <th className="pb-3 font-normal">Market Cap</th>
              <th className="pb-3 font-normal">Volume</th>
              <th className="pb-3 text-right font-normal">Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t" style={{ borderColor: C.line }}>
                <td className="py-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="grid size-7 shrink-0 place-items-center rounded-full text-xs"
                      style={{ backgroundColor: C.page, color: C.ink }}
                    >
                      {row.symbol}
                    </span>
                    <span style={{ color: C.ink }}>{row.name}</span>
                  </span>
                </td>
                <td className="py-3 tabular-nums" style={{ color: C.ink }}>
                  {row.price}
                </td>
                <td className="py-3">
                  <Delta {...row.hourDelta} className="text-xs" />
                </td>
                <td className="py-3">
                  <Delta {...row.dayDelta} className="text-xs" />
                </td>
                <td className="py-3 tabular-nums" style={{ color: C.ink }}>
                  {row.marketCap}
                </td>
                <td className="py-3 tabular-nums" style={{ color: C.ink }}>
                  {row.volume}
                </td>
                <td className="py-3">
                  <span className="flex justify-end">
                    <Sparkline
                      points={row.spark}
                      color={row.dayDelta.direction === "up" ? C.up : C.down}
                      width={72}
                      height={24}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Fear and greed — a segmented arc with a marker, then the same index read at
// three earlier points so today's number has something to sit against.
// ---------------------------------------------------------------------------

const GAUGE_R = 92;
const GAUGE_CX = 102;
const GAUGE_CY = 103;
/**
 * How far past a flat half circle each end swings, in radians. The ends drop
 * to the height of the verdict word under the figure, so the arc closes
 * around the reading rather than stopping level with its middle.
 */
const GAUGE_OVERSHOOT = Math.PI / 30; // 6°
/** Sized so the arc plus its stroke clears the box on every side. */
const GAUGE_BOX = { w: 204, h: 126 };
/** Thick enough that each segment reads as a capsule rather than a line. */
const GAUGE_STROKE = 18;
/** Clear space left between two capsules, in user units. */
const GAUGE_GAP = 6;

/**
 * Polar point on the gauge arc. `t` runs 0 (left end) to 1 (right end), the
 * span being a half circle plus the overshoot at either end.
 */
function gaugePoint(t: number, radius: number) {
  const start = Math.PI + GAUGE_OVERSHOOT;
  const sweep = Math.PI + GAUGE_OVERSHOOT * 2;
  const angle = start - t * sweep;
  // Math.cos/sin can differ in their last bit between Node (SSR) and the
  // browser (CSR) for the same angle, which stringifies to a different
  // number and trips a hydration mismatch. Rounding to a fixed precision —
  // far finer than the SVG needs — makes both sides agree.
  return {
    x: Math.round((GAUGE_CX + radius * Math.cos(angle)) * 1000) / 1000,
    y: Math.round((GAUGE_CY - radius * Math.sin(angle)) * 1000) / 1000,
  };
}

function FearGreed({
  title,
  value,
  verdict,
  readings,
}: NonNullable<AdminDashboardDesign3Props["fearGreed"]>) {
  const titleId = useId();
  const clamped = Math.min(100, Math.max(0, value));
  const marker = gaugePoint(clamped / 100, GAUGE_R);

  // One path per stop: each a capsule of its own, near its neighbours but
  // never touching them. The gap has to clear the stroke twice over — a round
  // cap juts half the stroke width past the end of its arc at both ends — or
  // the caps meet in the middle and the arc reads as one continuous band.
  // Two facing caps eat one stroke width between them (half from each), so
  // the gap along the path is that plus the clear space we actually want.
  const arcLength = GAUGE_R * (Math.PI + GAUGE_OVERSHOOT * 2);
  const gap = (GAUGE_STROKE + GAUGE_GAP) / arcLength;
  const segments = GAUGE_STOPS.map((color, index) => {
    const from = index / GAUGE_STOPS.length + gap / 2;
    const to = (index + 1) / GAUGE_STOPS.length - gap / 2;
    const start = gaugePoint(from, GAUGE_R);
    const end = gaugePoint(to, GAUGE_R);
    return {
      color,
      d: `M ${start.x} ${start.y} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${end.x} ${end.y}`,
    };
  });

  return (
    <section className={cn(CARD, "flex h-full flex-col p-5")} aria-labelledby={titleId}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-lg font-medium" style={{ color: C.ink }}>
          {title}
        </h2>
        <Chip>
          Filters
          <ListFilter className="size-3" aria-hidden="true" />
        </Chip>
      </div>

      <div className="mt-2 flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-[19rem]">
          <svg
            viewBox={`0 0 ${GAUGE_BOX.w} ${GAUGE_BOX.h}`}
            className="w-full"
            role="img"
            aria-label={`${value} — ${verdict}`}
          >
            {segments.map((segment) => (
              <path
                key={segment.color}
                d={segment.d}
                fill="none"
                stroke={segment.color}
                strokeWidth={GAUGE_STROKE}
                strokeLinecap="round"
              />
            ))}

            <circle cx={marker.x} cy={marker.y} r="6" fill={C.ink} stroke="#fff" strokeWidth="2.5" />

            <text
              x={GAUGE_CX}
              y={GAUGE_CY - 12}
              textAnchor="middle"
              className="tabular-nums"
              style={{ fill: C.ink, fontSize: "30px", fontWeight: 600 }}
            >
              {value}
            </text>
            <text
              x={GAUGE_CX}
              y={GAUGE_CY + 8}
              textAnchor="middle"
              style={{ fill: C.muted, fontSize: "12px" }}
            >
              {verdict}
            </text>
          </svg>
        </div>
      </div>

      <ul className="mt-3 grid grid-cols-3 gap-2">
        {readings.map((reading) => (
          <li key={reading.id}>
            <p className="mb-1.5 text-center text-[11px]" style={{ color: C.muted }}>
              {reading.label}
            </p>
            <div
              className="rounded-2xl px-2 py-3 text-center"
              style={{ backgroundColor: reading.tint }}
            >
              <p className="text-lg font-semibold tabular-nums" style={{ color: C.ink }}>
                {reading.value}
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                {reading.verdict}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------

/**
 * Light crypto console: four coin tiles, a market-cap chart, the full coin
 * table and the fear-and-greed gauge, on a soft grey ground with one lime
 * accent. Navigation sits in pills across the top rather than in a rail —
 * this design gives the width to the table.
 *
 * Every prop is optional and defaults to the reference's own figures, so the
 * route can render it bare while the design is being judged; point the props
 * at real data when it wins.
 *
 * Self-contained on purpose — top bar, tiles, chart, table and gauge all live
 * here rather than being shared with designs 1 and 2, the way mobile's
 * OnboardingDesign* files each own their slides.
 *
 * NOTE for whichever design wins: once a single admin design is picked (this
 * one or another AdminDashboardDesignN), pull its top bar and panels back out
 * into their own shared files instead of leaving them duplicated per design.
 * The duplication only earns its keep while multiple designs are competing.
 */
export function AdminDashboardDesign3({
  brand = "Cryptech",
  logoSrc = "/Logo.png",
  tabs = TABS,
  initials = "AD",
  logoutHref = "/",
  coins = COINS,
  market = MARKET,
  table = TABLE,
  fearGreed = FEAR_GREED,
}: AdminDashboardDesign3Props) {
  return (
    // No width cap and a thin gutter: the panels are the page, and a centred
    // column would leave dead ground down both sides on a wide screen.
    <div
      className="flex min-h-screen flex-col p-6 sm:p-8"
      style={{ backgroundColor: C.page, color: C.ink }}
    >
      <div className="flex w-full flex-1 flex-col gap-4">
        <TopBar
          brand={brand}
          logoSrc={logoSrc}
          tabs={tabs}
          initials={initials}
          logoutHref={logoutHref}
        />

        {/* Top band: the four watched coins against the market-cap chart.
            Both bands grow, so the screen ends where the viewport does. */}
        <div className="grid gap-4 xl:min-h-0 xl:flex-[5] xl:grid-cols-12">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:col-span-5">
            {coins.map((coin) => (
              <CoinTile key={coin.id} coin={coin} />
            ))}
          </div>

          <div className="min-w-0 xl:col-span-7">
            <MarketCap {...market} />
          </div>
        </div>

        {/* Lower band: the table, with the index beside it.
            min-w-0 is what makes the table's own overflow-x-auto work. A grid
            column sized `auto` will not go below its items' min-content, and
            the table declares min-w-[46rem]; without this the column takes
            736px whatever the viewport, and a phone scrolls the whole page
            sideways instead of just the table. */}
        <div className="grid gap-4 xl:min-h-0 xl:flex-[6] xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-8">
            <CryptoTable {...table} />
          </div>
          <div className="min-w-0 xl:col-span-4">
            <FearGreed {...fearGreed} />
          </div>
        </div>
      </div>
    </div>
  );
}
