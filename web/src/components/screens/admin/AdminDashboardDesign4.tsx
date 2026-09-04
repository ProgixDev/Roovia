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
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Ellipsis,
  Globe,
  LogOut,
  Mail,
  Palette,
  PieChart,
  Search,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";

/**
 * This design's palette, hardcoded rather than themed: the reference it
 * reproduces is one violet accent on near-black, and pulling the `--chart-*`
 * ramp in would repaint the bands, the heatmap and the chart every time
 * someone switched theme variant.
 */
const C = {
  page: "#0b0b0f",
  card: "#151519",
  cardSoft: "#1c1c22",
  line: "#26262e",
  ink: "#ffffff",
  muted: "#8b8b95",
  violet: "#7c4dff",
  violetDim: "#3f2a80",
  violetSoft: "#2a1f52",
  lime: "#cfe94d",
  cyan: "#5fd3f3",
  green: "#4ade80",
};

/** Heatmap ramp, lowest to highest — the legend prints these in order. */
const HEAT = ["#241d3d", "#2f2557", "#5b3fc4", "#7d5cf0", "#b9a5ff"];

export interface NavTab {
  href: string;
  label: string;
}

export interface SpendBand {
  id: string;
  /** Printed above the band; the last band in the reference carries none. */
  amount?: string;
  /** "+ 23%", "1.24" — the caller writes the sign. */
  deltaLabel: string;
  label: string;
  /** Share of the row's width. */
  weight: number;
  /** One solid block, or a run of thin bars. */
  fill: "solid" | "bars";
  /** 0–100, how tall the band's marks stand in the row. */
  height: number;
  color: string;
}

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  /** Drawn dashed, for the series that is not the headline. Its legend swatch draws as an outline for the same reason. */
  dashed?: boolean;
  /** Chart height at each x — a shape, not necessarily the number shown. */
  points: number[];
  /** Pre-formatted callout for each point, read by whichever one the cursor is over. */
  valueLabels: string[];
}

export interface Transaction {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  amount: string;
  /** Incoming money is the exception, and the only one that takes a colour. */
  incoming?: boolean;
}

export interface AdminDashboardDesign4Props {
  brand?: string;
  /** The project's mark, same file every design uses. */
  logoSrc?: string;
  tabs?: NavTab[];
  greeting?: string;
  personName?: string;
  ranges?: string[];
  defaultRange?: string;
  initials?: string;
  logoutHref?: string;
  revenue?: {
    label: string;
    amount: string;
    deltaLabel: string;
    availableLabel: string;
    availableAmount: string;
  };
  spend?: { bands: SpendBand[]; averageLabel: string; fromLabel: string; toLabel: string };
  analytics?: { title: string; series: ChartSeries[]; xLabels: string[] };
  activity?: {
    title: string;
    columns: string[];
    rows: string[];
    /** One row of intensity indexes per row label, keyed into HEAT. */
    grid: number[][];
  };
  transactions?: { title: string; items: Transaction[] };
}

// Everything below reproduces the reference screen's own figures, so the
// design can be judged on the numbers it was drawn for. Pass props to swap in
// real data — nothing here is fetched.

const TABS: NavTab[] = [
  { href: "#", label: "Dashboard" },
  { href: "/admin", label: "Analytics" },
  { href: "#", label: "Transactions" },
  { href: "#", label: "Reports" },
  { href: "#", label: "Settings" },
];

const REVENUE = {
  label: "Total revenue",
  amount: "$16,957.00",
  deltaLabel: "+12.67%",
  availableLabel: "Available to spend:",
  availableAmount: "$16,957.00",
};

const SPEND = {
  averageLabel: "Average",
  fromLabel: "January 26",
  toLabel: "February 26",
  bands: [
    {
      id: "invest",
      amount: "$4,465.00",
      deltaLabel: "+ 23%",
      label: "Invest",
      weight: 33,
      fill: "solid" as const,
      height: 100,
      color: C.violet,
    },
    {
      id: "products",
      amount: "$8,458.70",
      deltaLabel: "+ 12%",
      label: "Products",
      weight: 44,
      fill: "bars" as const,
      height: 100,
      color: C.violet,
    },
    {
      id: "other",
      deltaLabel: "1.24",
      label: "Other",
      weight: 23,
      fill: "bars" as const,
      height: 100,
      color: C.violetDim,
    },
  ],
};

const ANALYTICS = {
  title: "Analytics",
  // Jun (index 3) is the point the reference screen was drawn hovering — its
  // valueLabels there are the two figures on the reference image.
  xLabels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  series: [
    {
      id: "income",
      label: "Income",
      color: C.lime,
      points: [28, 44, 82, 66, 38, 72],
      valueLabels: ["$4,120.00", "$5,860.00", "$9,340.00", "$7,968.00", "$4,410.00", "$8,215.00"],
    },
    {
      id: "expenses",
      label: "Expenses",
      color: C.muted,
      dashed: true,
      points: [18, 34, 26, 44, 22, 40],
      valueLabels: ["$3,020.00", "$4,150.00", "$3,640.00", "$5,957.00", "$3,180.00", "$4,760.00"],
    },
  ],
};

const ACTIVITY = {
  title: "Activity by time",
  columns: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sut", "Sun"],
  rows: ["1pm", "2pm", "3pm", "4pm", "5pm", "6pm"],
  // Quiet at the edges of the afternoon, busiest Wednesday through Friday,
  // with the peaks on Thursday — the shape the reference screen shows.
  grid: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 4, 3, 0, 0],
    [0, 3, 2, 3, 3, 0, 0],
    [2, 2, 3, 4, 3, 3, 0],
    [0, 2, 2, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
};

const TRANSACTIONS = {
  title: "Recent transactions",
  items: [
    { id: "internet", name: "Internet", tag: "Multimedia", tagColor: C.lime, amount: "-$40.00" },
    {
      id: "isabella",
      name: "Isabella Garcia",
      tag: "Transfer",
      tagColor: C.violet,
      amount: "-$86.50",
    },
    { id: "sephora", name: "Sephora", tag: "Beauty", tagColor: C.cyan, amount: "-$248.80" },
    { id: "netflix", name: "Netflix", tag: "Multimedia", tagColor: C.lime, amount: "-$248.80" },
    {
      id: "violet",
      name: "Violet Orean",
      tag: "Transfer",
      tagColor: C.violet,
      amount: "+$500.00",
      incoming: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

const CARD = "rounded-3xl";

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn(CARD, "flex h-full flex-col p-5", className)} style={{ backgroundColor: C.card }}>
      {children}
    </section>
  );
}

function CardHead({
  icon: Icon,
  title,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-medium" style={{ color: C.ink }}>
        <Icon className="size-4" aria-hidden="true" />
        {title}
      </h2>
      {action}
    </div>
  );
}

/** Round control, the shape every icon button on this screen takes. */
function RoundButton({
  label,
  children,
  href,
  onClick,
  filled,
}: {
  label: string;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  filled?: boolean;
}) {
  const className = "grid size-10 place-items-center rounded-full transition-opacity hover:opacity-80";
  const style = { backgroundColor: filled ? C.violet : C.cardSoft, color: C.ink };

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} onClick={onClick} className={className} style={style}>
      {children}
    </button>
  );
}

/**
 * Catmull-Rom through the points, emitted as cubic beziers: straight segments
 * between samples corner at every turn, and this design's chart is all curve.
 * The line still passes through each real value.
 */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

// ---------------------------------------------------------------------------
// Top bar — brand, the section pills, the account controls.
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

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Image src={logoSrc} alt="" width={36} height={36} className="size-9 object-contain" />
        <span className="text-xl font-semibold" style={{ color: C.ink }}>
          {brand}
        </span>
      </div>

      {/* The pills are the whole navigation: no rail on this design, the
          sections sit across the top where the eye starts.

          Below `lg` they take a row of their own — the five run past what is
          left beside the brand and the controls — and scroll inside it rather
          than wrapping, so the bar stays one pill-shaped strip instead of
          breaking into two ragged rows. */}
      <nav
        aria-label="Sections"
        className="order-last flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-full p-1 [scrollbar-width:none] lg:order-none lg:w-auto [&::-webkit-scrollbar]:hidden"
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
              className="shrink-0 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors"
              style={{
                backgroundColor: active ? C.ink : C.cardSoft,
                color: active ? C.page : C.muted,
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Change color theme"
              className="grid size-10 place-items-center rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: C.cardSoft, color: C.ink }}
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

        <RoundButton label="Search">
          <Search className="size-4" />
        </RoundButton>
        <RoundButton label="Messages" filled>
          <Mail className="size-4" />
        </RoundButton>
        {logoutHref && (
          <RoundButton label="Sign out" href={logoutHref}>
            <LogOut className="size-4" />
          </RoundButton>
        )}

        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-full text-xs font-bold"
          style={{ backgroundColor: C.violetSoft, color: C.ink }}
        >
          {initials}
        </span>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Revenue — the headline figure and what can be done with it.
// ---------------------------------------------------------------------------

function Revenue({
  label,
  amount,
  deltaLabel,
  availableLabel,
  availableAmount,
}: NonNullable<AdminDashboardDesign4Props["revenue"]>) {
  const pill = "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium";

  return (
    <div className="flex flex-col justify-center gap-5">
      <div>
        <p className="text-sm" style={{ color: C.muted }}>
          {label}
        </p>

        <p className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight tabular-nums" style={{ color: C.ink }}>
            {amount}
          </span>
          <span className="text-xs font-medium tabular-nums" style={{ color: C.cyan }}>
            {deltaLabel}
          </span>
        </p>

        <p className="mt-3 text-xs" style={{ color: C.muted }}>
          {availableLabel}{" "}
          <span className="font-medium" style={{ color: C.ink }}>
            {availableAmount}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={pill} style={{ backgroundColor: C.ink, color: C.page }}>
          Transfer
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className={pill} style={{ backgroundColor: C.ink, color: C.page }}>
          Request
          <ArrowDown className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="More actions"
          className="grid size-10 place-items-center rounded-full border"
          style={{ borderColor: C.line, color: C.ink }}
        >
          <Ellipsis className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spend bands — where the month went, each category as wide as its share and
// as tall as its size. The dashed rule is the average across all three.
// ---------------------------------------------------------------------------

function SpendBands({
  bands,
  averageLabel,
  fromLabel,
  toLabel,
}: NonNullable<AdminDashboardDesign4Props["spend"]>) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="relative flex flex-1 items-stretch">
        {/* One rule across every band — an average drawn per column would be
            three different numbers wearing one name. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[38%] border-t border-dashed"
          style={{ borderColor: C.line }}
        >
          {/* Hidden on a phone. The pill rides the rule at 38% of a ~112px
              strip, which is exactly where the bands' own label row starts;
              with no horizontal room left it lands on top of "+12% Products".
              The dashed rule stays either way — a label sitting on another
              label reads worse than the rule alone. */}
          <span
            className="absolute right-[26%] hidden -translate-y-1/2 rounded-full px-3 py-1 text-[11px] sm:inline"
            style={{ backgroundColor: C.cardSoft, color: C.muted }}
          >
            {averageLabel}
          </span>
        </div>

        {bands.map((band, index) => (
          <div
            key={band.id}
            // px-3 on a phone: the two barcode bands have a hard floor of
            // 22 bars at min-w-[2px] plus their gaps, and at px-5 the three
            // bands together came to more than the viewport — the one place
            // this screen scrolled sideways.
            className={cn(
              "flex min-w-0 flex-col justify-between gap-4 px-3 sm:px-5",
              index > 0 && "border-l",
            )}
            style={{ flexGrow: band.weight, flexBasis: 0, borderColor: C.line }}
          >
            {/* text-base on a phone: the bands are sized by their share, so
                the smallest gets ~86px and "$4,465.00" at text-xl needs ~100
                — it truncated to "$4,465…", which is not a figure. */}
            <p
              className="truncate text-base font-semibold tabular-nums sm:text-xl"
              style={{ color: C.ink }}
            >
              {/* A band with no total of its own keeps the row's rhythm. */}
              {band.amount ?? " "}
            </p>

            <div className="flex flex-col gap-2">
              <p className="flex items-baseline gap-2 text-xs">
                <span className="font-medium tabular-nums" style={{ color: C.ink }}>
                  {band.deltaLabel}
                </span>
                <span style={{ color: C.muted }}>{band.label}</span>
              </p>

              <div className="flex h-11 items-end">
                {band.fill === "solid" ? (
                  <div
                    className="w-full rounded-lg"
                    style={{ height: `${band.height}%`, backgroundColor: band.color }}
                  />
                ) : (
                  // 22 bars at min-w-[2px] plus their gaps is a hard floor on
                  // this band's width: at 3px that floor is 107px, and two of
                  // these bands plus the third will not fit a phone. 2px on
                  // the gap is 21px back per band, and invisible at this size.
                  <div className="flex h-full w-full items-end gap-[2px] sm:gap-[3px]">
                    {Array.from({ length: 22 }).map((_, bar) => (
                      <div
                        key={bar}
                        className="min-w-[2px] flex-1 rounded-full"
                        style={{ height: `${band.height}%`, backgroundColor: band.color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between px-3 text-xs sm:px-5" style={{ color: C.muted }}>
        <span>{fromLabel}</span>
        <span>{toLabel}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analytics — income against expenses. The headline series is filled and
// solid, the comparison one dashed, so the two never rest on colour alone.
// ---------------------------------------------------------------------------

const CHART_W = 320;
const CHART_H = 150;

function Analytics({
  title,
  series,
  xLabels,
}: NonNullable<AdminDashboardDesign4Props["analytics"]>) {
  const fillId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const pointCount = series[0]?.points.length ?? 1;
  // null until the cursor is actually over the chart — the guide line, the
  // dots and the pills all come and go with it, nothing pinned.
  const [hovered, setHovered] = useState<number | null>(null);

  const all = series.flatMap((item) => item.points);
  const max = Math.max(1, ...all);
  const step = CHART_W / Math.max(1, pointCount - 1);
  const at = (points: number[]) =>
    points.map((value, index) => ({
      x: index * step,
      y: CHART_H - 10 - (value / max) * (CHART_H - 28),
    }));

  const headline = series[0];
  const headlinePoints = headline ? at(headline.points) : [];

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || pointCount === 0) return;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * CHART_W;
    const index = Math.round(x / step);
    setHovered(Math.min(pointCount - 1, Math.max(0, index)));
  };

  // The pills sit to the right of the guide line as in the reference, but
  // flip to its left past the two-thirds mark so hovering the last couple of
  // points doesn't push them off the card.
  const linePercent = hovered !== null ? (hovered * step * 100) / CHART_W : 0;
  const flip = linePercent > 66;

  return (
    <Card>
      <CardHead
        icon={PieChart}
        title={title}
        action={
          <button type="button" aria-label="Analytics options" style={{ color: C.muted }}>
            <Ellipsis className="size-4" />
          </button>
        }
      />

      <ul className="mt-4 flex items-center gap-4 text-xs" style={{ color: C.muted }}>
        {series.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            {/* The comparison series draws an outline swatch rather than a
                filled one — the same distinction its dashed line carries. */}
            <span
              aria-hidden="true"
              className="size-2.5 rounded-[3px]"
              style={
                item.dashed
                  ? { border: `1.5px solid ${item.color}` }
                  : { backgroundColor: item.color }
              }
            />
            {item.label}
          </li>
        ))}
      </ul>

      <div className="relative mt-3 flex-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="h-full w-full cursor-crosshair overflow-visible"
          role="img"
          aria-label={
            hovered !== null
              ? `${xLabels[hovered]}: ${series
                  .map((item) => `${item.label} ${item.valueLabels[hovered]}`)
                  .join(", ")}`
              : `${series.map((item) => item.label).join(" vs ")}, ${xLabels[0]}–${xLabels[xLabels.length - 1]}. Move the pointer over a point for its figures.`
          }
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={headline?.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={headline?.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {headlinePoints.length > 1 && (
            <path
              d={`${smoothPath(headlinePoints)} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`}
              fill={`url(#${fillId})`}
            />
          )}

          {hovered !== null && (
            <line
              x1={hovered * step}
              x2={hovered * step}
              y1="0"
              y2={CHART_H}
              stroke={C.line}
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          )}

          {series.map((item) => {
            const points = at(item.points);
            return (
              <g key={item.id}>
                <path
                  d={smoothPath(points)}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={item.dashed ? "6 5" : undefined}
                />
                {hovered !== null && points[hovered] && (
                  <circle
                    cx={points[hovered].x}
                    cy={points[hovered].y}
                    r="4"
                    fill={item.color}
                    stroke={C.card}
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Pinned near the top of the plot rather than at each series' own
            height — the reference stacks both figures beside the guide line
            regardless of where the curves sit that point. Gone entirely, not
            just faded, once the cursor leaves — nothing to point at, nothing
            to say. */}
        {hovered !== null && (
          <div
            className="pointer-events-none absolute top-1 flex flex-col gap-1.5"
            style={{
              left: `${linePercent}%`,
              transform: flip ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
            }}
          >
            {series.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs tabular-nums whitespace-nowrap"
                style={{ backgroundColor: C.cardSoft, color: C.ink }}
              >
                <span
                  aria-hidden="true"
                  className="h-4 w-0.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.valueLabels[hovered]}
              </span>
            ))}
          </div>
        )}
      </div>

      <ul className="mt-2 flex justify-between text-[11px]" style={{ color: C.muted }}>
        {xLabels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Activity by time — a cell per hour and weekday, shaded by how busy it was.
// ---------------------------------------------------------------------------

function Activity({
  title,
  columns,
  rows,
  grid,
}: NonNullable<AdminDashboardDesign4Props["activity"]>) {
  return (
    <Card>
      <CardHead
        icon={Globe}
        title={title}
        action={
          <button
            type="button"
            aria-label="Open activity"
            className="grid size-8 place-items-center rounded-full"
            style={{ backgroundColor: C.cardSoft, color: C.ink }}
          >
            <ArrowUpRight className="size-4" />
          </button>
        }
      />

      {/* table-fixed, or the columns take their width from the header words
          and "Wed" ends up wider than "Fri". One border-spacing value, so the
          gap between two cells side by side is the gap between a cell and the
          one under it. */}
      <table className="mt-3 h-full w-full flex-1 table-fixed border-separate border-spacing-1 text-[11px]">
        <thead>
          <tr>
            <th className="w-10" />
            {columns.map((column) => (
              <th key={column} className="pb-1 font-normal" style={{ color: C.muted }}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row}>
              <th className="pr-2 text-left font-normal" style={{ color: C.muted }} scope="row">
                {row}
              </th>
              {columns.map((column, columnIndex) => {
                const level = grid[rowIndex]?.[columnIndex] ?? 0;
                return (
                  <td key={column}>
                    {/* Fills whatever height the row is given rather than a
                        fixed one, so the grid grows with the card instead of
                        leaving a gap under it. The cell's own title carries
                        the reading — a colour ramp says nothing on its own. */}
                    <div
                      title={`${row}, ${column}`}
                      className="h-full min-h-7 w-full rounded-xl"
                      style={{ backgroundColor: HEAT[level] ?? HEAT[0] }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex items-center justify-end gap-2 text-[11px]" style={{ color: C.muted }}>
        Less
        <span className="flex items-center gap-1">
          {HEAT.map((shade) => (
            <span
              key={shade}
              aria-hidden="true"
              className="size-3.5 rounded-[5px]"
              style={{ backgroundColor: shade }}
            />
          ))}
        </span>
        More
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Recent transactions
// ---------------------------------------------------------------------------

function Transactions({
  title,
  items,
}: NonNullable<AdminDashboardDesign4Props["transactions"]>) {
  return (
    <Card>
      <CardHead
        icon={Wallet}
        title={title}
        action={
          <button
            type="button"
            aria-label="Search transactions"
            className="grid size-8 place-items-center rounded-full"
            style={{ backgroundColor: C.cardSoft, color: C.ink }}
          >
            <Search className="size-3.5" />
          </button>
        }
      />

      <ul className="mt-3 flex flex-1 flex-col justify-between">
        {items.map((item) => (
          // Three grid tracks, the outer two 1fr and the middle sized to its
          // own content: the tag lands in the middle of the row with real
          // space on both sides, rather than hugging the name or the amount.
          // Sized up a step from the card's usual text — this list is the
          // shortest thing beside two much taller panels, so its rows carry
          // the row height instead of floating small in the leftover space.
          // Two tracks below `sm`, where the tag is hidden: a display:none
          // item generates no box, so with three tracks the amount fell into
          // the middle one — pinned against the name with the whole third
          // track sitting empty to its right.
          <li
            key={item.id}
            className="grid grid-cols-[1fr_auto] items-center gap-4 py-3.5 sm:grid-cols-[1fr_auto_1fr]"
          >
            <span className="min-w-0 justify-self-start truncate text-base" style={{ color: C.ink }}>
              {item.name}
            </span>

            <span
              className="hidden shrink-0 items-center justify-self-center gap-2 rounded-full px-3 py-1.5 text-xs sm:flex"
              style={{ backgroundColor: C.cardSoft, color: C.muted }}
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: item.tagColor }}
              />
              {item.tag}
            </span>

            <span className="flex shrink-0 items-center justify-self-end gap-3">
              <span className="text-base tabular-nums" style={{ color: item.incoming ? C.green : C.ink }}>
                {item.amount}
              </span>

              <button
                type="button"
                aria-label={`Options for ${item.name}`}
                style={{ color: C.muted }}
              >
                <Ellipsis className="size-5" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------------------

/**
 * Dark money console: the month's revenue and what is left of it, where it
 * went as proportional bands, then income against expenses, activity by hour
 * and the latest transactions. One violet accent on near-black, navigation in
 * pills across the top rather than a rail.
 *
 * Every prop is optional and defaults to the reference's own figures, so the
 * route can render it bare while the design is being judged; point the props
 * at real data when it wins.
 *
 * Self-contained on purpose — top bar, bands, chart, heatmap and list all
 * live here rather than being shared with designs 1 to 3, the way mobile's
 * OnboardingDesign* files each own their slides.
 *
 * NOTE for whichever design wins: once a single admin design is picked (this
 * one or another AdminDashboardDesignN), pull its top bar and panels back out
 * into their own shared files instead of leaving them duplicated per design.
 * The duplication only earns its keep while multiple designs are competing.
 */
export function AdminDashboardDesign4({
  brand = "Loud",
  logoSrc = "/Logo.png",
  tabs = TABS,
  greeting = "Welcome back,",
  personName = "Angela",
  ranges = ["Week", "Month", "Year"],
  defaultRange = "Month",
  initials = "AD",
  logoutHref = "/",
  revenue = REVENUE,
  spend = SPEND,
  analytics = ANALYTICS,
  activity = ACTIVITY,
  transactions = TRANSACTIONS,
}: AdminDashboardDesign4Props) {
  const [range, setRange] = useState(defaultRange);

  return (
    // No width cap and a thin gutter: the panels are the page, and a centred
    // column would leave dead ground down both sides on a wide screen.
    <div
      className="flex min-h-screen flex-col p-6 sm:p-8"
      style={{ backgroundColor: C.page, color: C.ink }}
    >
      <div className="flex w-full flex-1 flex-col gap-5">
        <TopBar
          brand={brand}
          logoSrc={logoSrc}
          tabs={tabs}
          initials={initials}
          logoutHref={logoutHref}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {greeting}{" "}
            <span style={{ color: C.muted }}>{personName}</span>
          </h1>

          <div className="flex items-center gap-1 rounded-full p-1" style={{ backgroundColor: C.card }}>
            {ranges.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                aria-pressed={option === range}
                className="rounded-full px-5 py-2 text-sm transition-colors"
                style={{
                  backgroundColor: option === range ? C.cardSoft : "transparent",
                  color: option === range ? C.ink : C.muted,
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Headline band: the figure on the left, where the month went on the
            right, sharing one baseline. Both bands grow, so the screen ends
            where the viewport does instead of leaving a strip of ground under
            the cards. */}
        <div className="grid gap-6 xl:min-h-0 xl:flex-[4] xl:grid-cols-12">
          <div className="xl:col-span-4">
            <Revenue {...revenue} />
          </div>
          <div className="min-w-0 xl:col-span-8">
            <SpendBands {...spend} />
          </div>
        </div>

        {/* Three panels across two columns at `lg` leaves the third alone on
            its own row with a half-width hole beside it, so there it spans
            both. At `xl` all three share one row and it goes back to one. */}
        <div className="grid gap-4 lg:grid-cols-2 xl:min-h-0 xl:flex-[6] xl:grid-cols-3">
          <div className="grid min-w-0">
            <Analytics {...analytics} />
          </div>
          <div className="grid min-w-0">
            <Activity {...activity} />
          </div>
          <div className="grid min-w-0 lg:col-span-2 xl:col-span-1">
            <Transactions {...transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
