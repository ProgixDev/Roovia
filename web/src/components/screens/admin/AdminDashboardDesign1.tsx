"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { THEME_VARIANTS, useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  LogOut,
  Menu,
  Palette,
  Search,
  Star,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DEFAULT_ADMIN_NAV, type AdminNavItem } from "@/components/screens/admin/adminNav";

const MIN_QUERY_LENGTH = 1;

export interface StatCard {
  id: string;
  label: string;
  /** Pre-formatted — thousands separators, units and currency belong to the caller. */
  value: string;
  delta?: {
    /** Carries its own sign: "+12.4%", "−0.2 pts". */
    label: string;
    direction: "up" | "down";
    /**
     * Whether that movement is good news. Direction and judgement are separate
     * on purpose: a drop in cancellations is up-is-not-always-good territory,
     * and only the caller knows which way round a given metric reads.
     */
    tone: "good" | "bad" | "neutral";
  };
  /** What the delta is measured against, e.g. "vs November". */
  caption?: string;
}

export interface TrendSeries {
  /** Key into each point's `values`. */
  key: string;
  label: string;
  /** Any CSS color. Pass a theme token — `var(--chart-1)` — not a literal. */
  color: string;
  /**
   * SVG stroke-dasharray. Left out, the series takes the pattern for its
   * position in the list. Do not switch every series to solid: this theme's
   * chart ramp is one hue per variant, so the dash is what actually keeps two
   * lines apart for a colourblind reader — colour alone is not enough here.
   */
  dash?: string;
}

export interface TrendPoint {
  label: string;
  values: Record<string, number>;
}

export interface TrendRange {
  label: string;
  value: string;
}

export interface QueueItem {
  id: string;
  href?: string;
  /**
   * Two letters. Its presence picks the row layout: with initials the item
   * renders as avatar / title / subtitle / chevron, without them it stacks a
   * title-and-badge row above `body`.
   */
  initials?: string;
  title: string;
  subtitle?: string;
  badge?: { label: string; icon?: LucideIcon };
  body?: string;
}

export interface QueueSection {
  id: string;
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  emptyLabel: string;
  items: QueueItem[];
}

export interface AdminDashboardChart {
  title: string;
  series: TrendSeries[];
  ranges: TrendRange[];
  dataByRange: Record<string, TrendPoint[]>;
  defaultRange?: string;
}

export interface AdminDashboardDesign1Props {
  title?: string;
  stats?: StatCard[];
  chart?: AdminDashboardChart;
  queues?: QueueSection[];
  navItems?: AdminNavItem[];
  initials?: string;
  logoutHref?: string;
}

// Demo figures, so the route can render this design bare while it is being
// judged. Point the props at real data when it wins — nothing here is fetched.
//
// chart-1 against chart-5, never chart-1 against chart-2: every variant's
// chart ramp is a single hue, so 1 and 2 are two steps of the same colour and
// come out ~6 ΔE apart — indistinguishable even with full colour vision.
// chart-5 is the variant's neutral, which reads as "the comparison series",
// and the dash the chart gives the second line carries the rest.
const DEMO_CHART: AdminDashboardChart = {
  title: "Bookings over time",
  series: [
    { key: "confirmed", label: "Confirmed", color: "var(--chart-1)" },
    { key: "cancelled", label: "Cancelled", color: "var(--chart-5)" },
  ],
  ranges: [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ],
  defaultRange: "month",
  dataByRange: {
    day: [
      { label: "08", values: { confirmed: 4, cancelled: 1 } },
      { label: "10", values: { confirmed: 9, cancelled: 2 } },
      { label: "12", values: { confirmed: 14, cancelled: 3 } },
      { label: "14", values: { confirmed: 11, cancelled: 2 } },
      { label: "16", values: { confirmed: 17, cancelled: 4 } },
      { label: "18", values: { confirmed: 21, cancelled: 3 } },
      { label: "20", values: { confirmed: 13, cancelled: 5 } },
      { label: "22", values: { confirmed: 6, cancelled: 2 } },
    ],
    week: [
      { label: "Mon", values: { confirmed: 38, cancelled: 6 } },
      { label: "Tue", values: { confirmed: 44, cancelled: 9 } },
      { label: "Wed", values: { confirmed: 51, cancelled: 7 } },
      { label: "Thu", values: { confirmed: 47, cancelled: 12 } },
      { label: "Fri", values: { confirmed: 63, cancelled: 10 } },
      { label: "Sat", values: { confirmed: 72, cancelled: 14 } },
      { label: "Sun", values: { confirmed: 29, cancelled: 8 } },
    ],
    month: [
      { label: "Jan", values: { confirmed: 118, cancelled: 22 } },
      { label: "Feb", values: { confirmed: 104, cancelled: 19 } },
      { label: "Mar", values: { confirmed: 132, cancelled: 27 } },
      { label: "Apr", values: { confirmed: 126, cancelled: 24 } },
      { label: "May", values: { confirmed: 148, cancelled: 31 } },
      { label: "Jun", values: { confirmed: 161, cancelled: 28 } },
      { label: "Jul", values: { confirmed: 173, cancelled: 35 } },
      { label: "Aug", values: { confirmed: 158, cancelled: 30 } },
      { label: "Sep", values: { confirmed: 141, cancelled: 26 } },
      { label: "Oct", values: { confirmed: 136, cancelled: 23 } },
      { label: "Nov", values: { confirmed: 149, cancelled: 29 } },
      { label: "Dec", values: { confirmed: 167, cancelled: 33 } },
    ],
  },
};

// Read off the December column of DEMO_CHART, against November — a tile that
// contradicts the chart under it is worse than no tile. Dec 167 + 33 = 200
// bookings against Nov's 178, so 33/200 is the cancellation rate and +12.4%
// is the move.
const DEMO_STATS: StatCard[] = [
  {
    id: "bookings",
    label: "Bookings",
    value: "200",
    delta: { label: "+12.4%", direction: "up", tone: "good" },
    caption: "vs November",
  },
  {
    id: "revenue",
    label: "Revenue",
    value: "€14.6k",
    delta: { label: "+14.1%", direction: "up", tone: "good" },
    caption: "vs November",
  },
  {
    id: "pros",
    label: "Active pros",
    value: "312",
    delta: { label: "+2.3%", direction: "up", tone: "good" },
    caption: "vs November",
  },
  {
    id: "cancellation-rate",
    label: "Cancellation rate",
    value: "16.5%",
    // Up is bad here — direction and judgement are separate for this reason.
    delta: { label: "+0.2 pts", direction: "up", tone: "bad" },
    caption: "vs November",
  },
];

const DEMO_QUEUES: QueueSection[] = [
  {
    id: "applications",
    title: "Pending applications",
    viewAllHref: "#",
    emptyLabel: "Nothing waiting.",
    items: [
      { id: "app-1", href: "#", initials: "LM", title: "Studio Meridian", subtitle: "Lyon · 2 d" },
      { id: "app-2", href: "#", initials: "AK", title: "Atelier Kova", subtitle: "Home visits · 4 d" },
      { id: "app-3", href: "#", initials: "RB", title: "Rue Bassin", subtitle: "Bordeaux · 6 d" },
    ],
  },
  {
    id: "reports",
    title: "Reported reviews",
    viewAllHref: "#",
    emptyLabel: "Nothing reported.",
    items: [
      {
        id: "review-1",
        href: "#",
        title: "Camille D.",
        badge: { label: "1", icon: Star },
        body: "Booking was confirmed then dropped an hour before, with no message and no refund.",
      },
      {
        id: "review-2",
        href: "#",
        title: "Yanis T.",
        badge: { label: "2", icon: Star },
        body: "Left waiting for forty minutes past the slot. The result was not what was agreed either.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sidebar — icon-only rail. Labels live in `title`/`aria-label` rather than
// beside the icons — the rail is 80px wide so the content column keeps the
// full page for tables, which is what an admin section is mostly made of.
//
// Desktop only. Below `md` those 80px are a fifth of a phone's width spent on
// eight unlabelled icons, so the rail is hidden outright and navigation moves
// into the top bar's drawer — labelled, which a touch target without a
// hoverable `title` has to be.
// ---------------------------------------------------------------------------

function Sidebar({
  items = DEFAULT_ADMIN_NAV,
  homeHref = "/admin",
  homeLabel = "Overview",
  logoSrc = "/Logo.png",
}: {
  items?: AdminNavItem[];
  homeHref?: string;
  homeLabel?: string;
  logoSrc?: string;
}) {
  const pathname = usePathname();

  // sticky + h-screen + self-start: the rail is tied to the viewport, not to
  // the page's height — a long list page must not stretch it (and drag the
  // centred nav off-screen with it).
  return (
    <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center self-start md:flex">
      {/* Mirrors the top bar's header box exactly — same pt-7/pb-2, and an
          h-11 row (the height its search input gives that row) — so the logo
          and the page title share a vertical centre. Both only apply from
          `md` up, which is the only width at which this rail exists. */}
      <div className="flex justify-center pt-7 pb-2">
        <Link href={homeHref} aria-label={homeLabel} className="flex h-11 items-center">
          <Image src={logoSrc} alt="" width={44} height={44} />
        </Link>
      </div>

      {/* Taken out of the flow so the logo slot above doesn't push it down —
          the rail centres on the page, not on the space left under the logo.
          Capped and scrollable because eight 44px targets plus gaps run to
          ~440px: on a short viewport (a tablet in landscape, a laptop with
          devtools open) the ends would otherwise sit off-screen unreachable. */}
      <nav className="absolute top-1/2 flex max-h-screen -translate-y-1/2 flex-col items-center gap-3 overflow-y-auto py-4">
        {items.map((item) => {
          // A "#" placeholder never matches a pathname, so it never lights up.
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-2xl transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-5" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Top bar — search here jumps between admin functions, not through records:
// an admin app grows a page per capability, and hunting for the right one in
// a rail of unlabelled icons is the actual friction. Per-page search belongs
// in the page.
//
// The search field is desktop-only: a phone has no room for it beside the
// title, and below `md` it would in any case be the second navigation control
// next to the drawer that replaces the hidden rail. The drawer is the mobile
// answer to both.
// ---------------------------------------------------------------------------

function TopBar({
  title,
  items = DEFAULT_ADMIN_NAV,
  initials,
  logoutHref,
  searchPlaceholder = "Search a feature...",
}: {
  title: string;
  /** Search targets. Same list the rail renders, so the two never drift. */
  items?: AdminNavItem[];
  /** Shown in the avatar bubble. Two letters read best. */
  initials?: string;
  /**
   * Where the sign-out control points. A link rather than a callback so a
   * server component can render this bar without handing it a function.
   * Omitted → the control is left out entirely, no dead button.
   */
  logoutHref?: string;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { variantId, setVariantId } = useTheme();
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length < MIN_QUERY_LENGTH) return [];
    return items
      .filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.keywords?.some((keyword) => keyword.toLowerCase().includes(query)),
      )
      .slice(0, 6);
  }, [search, items]);

  const goTo = (href: string) => {
    setSearch("");
    setFocused(false);
    // Placeholder entries have nowhere to go yet — close the list and stop,
    // rather than pushing "#" and jumping the scroll position for nothing.
    if (href === "#") return;
    router.push(href);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (suggestions[0]) goTo(suggestions[0].href);
  };

  const showSuggestions = focused && search.trim().length >= MIN_QUERY_LENGTH;

  return (
    <header className="flex items-center justify-between gap-3 px-6 pt-5 pb-2 sm:gap-6 sm:px-8 sm:pt-7">
      {/* Below `md` the rail is hidden, so this drawer is the only way between
          admin pages. Its entries carry their labels — an icon-only target
          works on the rail because a pointer can hover its `title`, and a
          finger cannot. */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Navigation"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <Menu className="size-4" aria-hidden="true" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-none bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader>
            <SheetTitle className="text-sidebar-foreground">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Admin sections.</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-1 overflow-y-auto px-3 pb-4">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <SheetClose asChild key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-foreground uppercase sm:text-2xl md:flex-none">
        {title}
      </h1>

      <form
        onSubmit={handleSearchSubmit}
        className="relative hidden max-w-sm flex-1 items-center md:flex"
      >
        <label className="sr-only" htmlFor="admin-topbar-search">
          {searchPlaceholder}
        </label>
        <input
          id="admin-topbar-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-full border border-border bg-card pr-11 pl-5 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-4 text-muted-foreground hover:text-foreground"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>

        {showSuggestions && (
          <ul className="absolute top-full left-0 z-10 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover py-1 shadow-xl">
            {suggestions.length === 0 && (
              <li className="px-4 py-2.5 text-xs text-muted-foreground">No match.</li>
            )}
            {suggestions.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  // mousedown, not click: the input's blur fires first and
                  // would unmount this list before a click ever lands.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    goTo(item.href);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <item.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-sm text-popover-foreground">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Change color theme"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
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
        {/* Decorative — it names nobody the page doesn't already name, and on
            a phone the 40px it costs is better spent on the title. */}
        {initials && (
          <div
            aria-hidden="true"
            className="hidden size-10 shrink-0 place-items-center rounded-full bg-card text-xs font-bold text-card-foreground sm:grid"
          >
            {initials}
          </div>
        )}
        {logoutHref && (
          <Link
            href={logoutHref}
            aria-label="Sign out"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
          </Link>
        )}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Stat cards — headline numbers, no plot: four figures worth reading before
// the chart underneath explains how they got there.
//
// Only bad news gets a colour (the destructive token) — there is no success
// token in this theme, and borrowing a series colour for a status would break
// the chart's own meaning. The arrow carries direction on its own, and the
// delta label keeps its sign, so nothing here rests on colour alone.
// ---------------------------------------------------------------------------

const ARROW = { up: ArrowUpRight, down: ArrowDownRight } as const;

function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    // Two-up on a phone rather than a stack: four full-width tiles run to
    // ~440px of scroll, which puts the chart that explains them below the
    // fold. The tiles are short enough to read at half a phone's width.
    //
    // One row from `md` — the width at which the rail reappears and the page
    // is a tablet's. Four tiles across a tablet's content column come out
    // ~130px each, the same as the phone's two-up, so they read the same and
    // the chart moves up a whole row.
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Arrow = stat.delta ? ARROW[stat.delta.direction] : ArrowRight;
        return (
          <section key={stat.id} className="rounded-2xl bg-card p-4 sm:p-5">
            <h2 className="text-xs font-medium text-muted-foreground">{stat.label}</h2>

            {/* Steps up on a monitor: at that width the tile is ~310px wide
                and a 24px figure floats in it. The number is what the tile is
                for, so the spare width goes to the number. */}
            <p className="mt-2 text-2xl font-bold text-card-foreground tabular-nums xl:text-3xl">
              {stat.value}
            </p>

            {(stat.delta || stat.caption) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {stat.delta && (
                  <span
                    className={
                      stat.delta.tone === "bad"
                        ? "flex items-center gap-1 font-medium text-destructive"
                        : stat.delta.tone === "good"
                          ? "flex items-center gap-1 font-medium text-foreground"
                          : "flex items-center gap-1 font-medium text-muted-foreground"
                    }
                  >
                    <Arrow className="size-3.5" aria-hidden="true" />
                    {stat.delta.label}
                  </span>
                )}
                {stat.caption && <span className="text-muted-foreground">{stat.caption}</span>}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trend chart — hand-drawn SVG rather than a charting dependency: two
// smoothed lines, one shared axis, a hover readout. Every series here counts
// the same kind of thing, so they share one scale — never give a second
// series its own axis.
// ---------------------------------------------------------------------------

/** Solid first, then progressively shorter dashes. Index 0 stays undefined. */
const DASH_BY_INDEX = [undefined, "7 4", "2 3", "9 3 2 3"] as const;

/**
 * The SVG is drawn at its container's own pixel width rather than at a fixed
 * 720 units scaled down to fit. Scaled-to-fit is what a phone actually got:
 * ~280px of room for a 720-unit viewBox is a 0.39 ratio, which rendered the
 * 11px tick and axis labels at four-and-a-bit pixels — present, and
 * unreadable. Drawing 1:1 keeps every label at its true size at any width.
 */
const FALLBACK_W = 720;
const MIN_W = 260;
const PAD = { left: 40, right: 12, top: 14, bottom: 28 };
/** Horizontal room one x-axis label needs before its neighbours collide. */
const LABEL_SLOT = 46;

/**
 * The chart's proportion is 3:1 and stays 3:1 at every width — that is what
 * the original 720×240 viewBox scaled to fit already did, and it is the
 * chart's proportion, not a default to improve on. Redrawing the viewBox 1:1
 * above only stops the axis labels shrinking with the page; the height is
 * derived straight back from the width so it lands where it always did.
 *
 * The one exception is the floor, and only because the ratio breaks down
 * there: at a phone's ~280px of room, 3:1 leaves a 93px plot.
 */
const ASPECT = 3;
const MIN_H = 200;

function plotHeightFor(width: number): number {
  return Math.max(MIN_H, Math.round(width / ASPECT));
}

function niceMax(value: number): number {
  const step = value > 150 ? 50 : value > 60 ? 25 : 10;
  return Math.max(step, Math.ceil(value / step) * step);
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    d += ` Q ${prev.x} ${prev.y} ${(prev.x + cur.x) / 2} ${(prev.y + cur.y) / 2}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}

function dashFor(series: TrendSeries, index: number): string | undefined {
  return series.dash ?? DASH_BY_INDEX[index % DASH_BY_INDEX.length];
}

/** A sample of the line itself — same colour and same dash as the mark it names. */
function SeriesSwatch({ color, dash }: { color: string; dash?: string }) {
  return (
    <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true" className="shrink-0">
      <line
        x1="0"
        y1="4"
        x2="16"
        y2="4"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Data arrives as props; the only state is which range is selected and which point the pointer is over. */
function TrendChart({
  title,
  series,
  ranges,
  dataByRange,
  defaultRange,
}: {
  title: string;
  series: TrendSeries[];
  ranges: TrendRange[];
  /** One point list per range value. */
  dataByRange: Record<string, TrendPoint[]>;
  defaultRange?: string;
}) {
  const gradientId = useId();
  const [range, setRange] = useState(defaultRange ?? ranges[0]?.value ?? "");
  const [hovered, setHovered] = useState<number | null>(null);
  const [viewW, setViewW] = useState(FALLBACK_W);
  const svgRef = useRef<SVGSVGElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  // Track the container's real width so the viewBox can match it 1:1. Where
  // there is no ResizeObserver (jsdom, an SSR pass) the fallback width stands
  // and the chart behaves exactly as it did before.
  useEffect(() => {
    const element = plotRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width;
      if (width) setViewW(Math.max(MIN_W, Math.round(width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const viewH = plotHeightFor(viewW);
  const plotW = viewW - PAD.left - PAD.right;
  const plotH = viewH - PAD.top - PAD.bottom;

  const points = dataByRange[range] ?? [];
  const labels = points.map((point) => point.label);
  const valuesOf = (key: string) => points.map((point) => point.values[key] ?? 0);

  const yMax = niceMax(Math.max(0, ...series.flatMap((item) => valuesOf(item.key))));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(yMax * t));

  // Show every nth label once they no longer fit side by side — twelve months
  // across a phone-width plot would otherwise overlap into a grey smear.
  const labelStep = Math.max(
    1,
    Math.ceil(labels.length / Math.max(1, Math.floor(plotW / LABEL_SLOT))),
  );

  const xAt = (i: number) =>
    PAD.left + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
  const yAt = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  const pointsFor = (key: string) => valuesOf(key).map((v, i) => ({ x: xAt(i), y: yAt(v) }));

  // The filled area belongs to the first series alone — putting one under a
  // second line would read as a total the numbers never add up to.
  const primary = series[0];
  const primaryPoints = primary ? pointsFor(primary.key) : [];
  const areaPath =
    primaryPoints.length > 1
      ? `${smoothPath(primaryPoints)} L ${xAt(labels.length - 1)} ${PAD.top + plotH} L ${PAD.left} ${PAD.top + plotH} Z`
      : "";

  // Taken from a client X rather than a mouse event: a phone has no hover, so
  // without a touch path the readout is unreachable and the numbers behind it
  // simply unavailable on the device most likely to need them.
  const handlePointer = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || labels.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * viewW;
    const ratio = (x - PAD.left) / plotW;
    const index = Math.round(ratio * (labels.length - 1));
    setHovered(Math.min(labels.length - 1, Math.max(0, index)));
  };

  const handleRangeChange = (next: string) => {
    setHovered(null);
    setRange(next);
  };

  const activeRangeLabel = ranges.find((option) => option.value === range)?.label ?? "";

  return (
    <section className="rounded-2xl bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-base font-medium text-card-foreground">{title}</h2>

        {/* -my-1 py-1: the extra height is a finger-sized target, taken back
            from the row so the buttons still sit on the title's baseline. */}
        <div className="-my-1 flex items-center gap-4 sm:gap-5">
          {ranges.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleRangeChange(option.value)}
              className={cn(
                "py-1 text-xs transition-colors",
                option.value === range
                  ? "border-b-2 border-ring font-medium text-card-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend — identity never rests on colour alone, hence the dash. */}
      <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {series.map((item, index) => (
          <li key={item.key} className="flex items-center gap-2 text-xs text-muted-foreground">
            <SeriesSwatch color={item.color} dash={dashFor(item, index)} />
            {item.label}
          </li>
        ))}
      </ul>

      {/* This is what the ResizeObserver measures — it is deliberately the
          plot's own box, not the padded card, so the viewBox matches the
          width the SVG actually gets. */}
      <div ref={plotRef} className="relative mt-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="h-auto w-full touch-pan-y"
          role="img"
          aria-label={`${title} by ${activeRangeLabel.toLowerCase()}`}
          onMouseMove={(event) => handlePointer(event.clientX)}
          onMouseLeave={() => setHovered(null)}
          onTouchStart={(event) => handlePointer(event.touches[0].clientX)}
          onTouchMove={(event) => handlePointer(event.touches[0].clientX)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary?.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={primary?.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={viewW - PAD.right}
                y1={yAt(tick)}
                y2={yAt(tick)}
                className="stroke-border"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={yAt(tick) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px]"
              >
                {tick}
              </text>
            </g>
          ))}

          {labels.map((label, i) =>
            i % labelStep === 0 ? (
              <text
                key={label}
                x={xAt(i)}
                y={viewH - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {label}
              </text>
            ) : null,
          )}

          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

          {hovered !== null && (
            <line
              x1={xAt(hovered)}
              x2={xAt(hovered)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              className="stroke-muted-foreground"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* Back to front, so the first series ends up on top of the rest. */}
          {series
            .map((item, index) => ({ item, index }))
            .reverse()
            .map(({ item, index }) => (
              <path
                key={item.key}
                d={smoothPath(pointsFor(item.key))}
                fill="none"
                stroke={item.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={dashFor(item, index)}
              />
            ))}

          {hovered !== null &&
            series.map((item) => {
              const point = pointsFor(item.key)[hovered];
              if (!point) return null;
              return (
                <circle
                  key={item.key}
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  fill={item.color}
                  className="stroke-card"
                  strokeWidth="2"
                />
              );
            })}
        </svg>

        {hovered !== null && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl border border-border bg-popover px-3 py-2 shadow-lg"
            // Clamped: at the first or last point an unclamped centre hangs
            // the card half outside the plot — off a phone screen entirely.
            style={{ left: `${Math.min(85, Math.max(15, (xAt(hovered) / viewW) * 100))}%` }}
          >
            <p className="text-[11px] font-medium text-popover-foreground">{labels[hovered]}</p>
            {series.map((item, index) => (
              <p
                key={item.key}
                className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground"
              >
                <SeriesSwatch color={item.color} dash={dashFor(item, index)} />
                {item.label}
                <span className="ml-auto font-medium text-popover-foreground">
                  {points[hovered]?.values[item.key] ?? 0}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Queue rail — the queues that need a human, kept beside the dashboard rather
// than in the shell: the list pages behind them are table-heavy and want the
// full width. Cap each section to its few most recent items — it is a
// glance, not a second copy of the list.
// ---------------------------------------------------------------------------

function QueueRow({ item }: { item: QueueItem }) {
  const content = item.initials ? (
    <>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground"
      >
        {item.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-card-foreground">{item.title}</p>
        {item.subtitle && (
          <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
        )}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </>
  ) : (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-card-foreground">{item.title}</span>
        {item.badge && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-chart-2">
            {item.badge.icon && <item.badge.icon className="size-3 fill-current" aria-hidden="true" />}
            {item.badge.label}
          </span>
        )}
      </div>
      {item.body && <p className="line-clamp-2 text-xs text-muted-foreground">{item.body}</p>}
    </div>
  );

  const className = "flex items-center gap-3 rounded-2xl bg-card p-3 transition-colors";

  // A queue entry with nowhere to go yet stays a plain block — a link that
  // does nothing is worse than no link.
  if (!item.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={item.href} className={`${className} hover:bg-accent`}>
      {content}
    </Link>
  );
}

function QueueRail({ sections }: { sections: QueueSection[] }) {
  return (
    // Below `xl` this is not a rail at all — it falls under the dashboard as
    // a full-width band, so it takes the same page padding the content column
    // above it has rather than a rail's, and lays its sections out side by
    // side: stacked, two queues of three short rows each run most of a
    // tablet's remaining height while leaving half its width empty.
    //
    // `xl` folds it back to one column, which is what makes it a rail again.
    // Aligned to the content column's own pt-4 there, so the first queue
    // heading and the first stat tile start on the same line.
    //
    // content-start is not optional. As a flex item in the `xl` row this
    // aside is stretched to the full page height, and a grid with room to
    // spare spreads its rows down that whole height — which put a growing
    // gap between the two queues. Rows pack to the top; the slack goes to
    // the bottom, where it belongs.
    <aside className="grid w-full shrink-0 content-start gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8 xl:w-80 xl:grid-cols-1 xl:gap-8 xl:pt-4 xl:pb-8 2xl:w-96">
      {sections.map((section) => (
        <section key={section.id}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-foreground">{section.title}</h2>
            {section.viewAllHref && (
              <Link
                href={section.viewAllHref}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {section.viewAllLabel ?? "View all"}
              </Link>
            )}
          </div>

          <ul className="mt-3 flex flex-col gap-2">
            {section.items.length === 0 && (
              <li className="p-3 text-xs text-muted-foreground">{section.emptyLabel}</li>
            )}
            {section.items.map((item) => (
              <li key={item.id}>
                <QueueRow item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}

// ---------------------------------------------------------------------------

/**
 * Whole screen, sidebar included: rail, header, the headline figures, the
 * chart that explains how they got there, and the queues that need a human.
 * Self-contained on purpose — a second design owns its own copy of every
 * piece here rather than sharing one, the way mobile's OnboardingDesign*
 * files each own their slides.
 *
 * Everything it draws arrives as props; it fetches nothing.
 *
 * NOTE for whichever design wins: once a single admin design is picked (this
 * one or a later AdminDashboardDesignN), pull its Sidebar/TopBar/StatCards/
 * TrendChart/QueueRail back out into their own shared files instead of
 * leaving them duplicated per design. The duplication only earns its keep
 * while multiple designs are still competing.
 */
export function AdminDashboardDesign1({
  title = "Overview",
  stats = DEMO_STATS,
  chart = DEMO_CHART,
  queues = DEMO_QUEUES,
  navItems,
  initials = "AD",
  logoutHref = "/",
}: AdminDashboardDesign1Props) {
  return (
    // Full-bleed, not capped and centred: the rail belongs against the edge
    // of the glass, and a capped shell floats it inward with dead margin down
    // both sides — which reads as a layout bug rather than a choice.
    <div className="flex min-h-screen bg-sidebar text-sidebar-foreground">
      <Sidebar items={navItems} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={title}
          items={navItems}
          initials={initials}
          logoutHref={logoutHref}
        />

        <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
          <div className="min-w-0 flex-1 px-6 pt-4 pb-2 sm:px-8 xl:pb-8">
            {/* One shared surface for the whole dashboard cluster — no
                per-section borders inside it, only background-tone steps.
                Thinner padding on a phone: nested inside the page's own p-6
                it would otherwise cost 44px a side, and the chart inside is
                the element with the least width to spare. */}
            <div className="flex flex-col gap-4 rounded-3xl bg-background p-4 sm:gap-6 sm:p-6">
              {/* Figures first, then the chart they came out of — the tiles
                  answer "how are we doing", the chart answers "since when". */}
              <StatCards stats={stats} />
              <TrendChart
                title={chart.title}
                series={chart.series}
                ranges={chart.ranges}
                dataByRange={chart.dataByRange}
                defaultRange={chart.defaultRange}
              />
            </div>
          </div>

          <QueueRail sections={queues} />
        </div>
      </div>
    </div>
  );
}
