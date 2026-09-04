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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Footprints,
  Heart,
  LogOut,
  Menu,
  Palette,
  type LucideIcon,
} from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_ADMIN_NAV, type AdminNavItem } from "@/components/screens/admin/adminNav";
import backgroundPhoto from "../../../../public/admin-dashboard-bg.png";

/**
 * Glass panel recipe, shared by every card on this screen. A frosted surface
 * only reads as glass when there is something behind it — hence the room
 * photo this design lays down first. The panels sit straight on that photo
 * rather than inside an outer card, so the background shows between them.
 */
// transform-gpu is not decoration: a backdrop-filter without its own
// compositor layer gets repainted in tiles while the photo behind it decodes,
// which is the cracked-glass flash on reload.
const PANEL =
  "rounded-3xl border border-white/10 bg-white/8 backdrop-blur-xl transform-gpu isolate";

/**
 * This design's own palette, hardcoded rather than themed: the reference it
 * reproduces has one look, and pulling `--chart-*` in would repaint the bars,
 * the ring and the status pills every time someone switched theme variant.
 */
const ACCENT = {
  amber: "#f5c33b",
  amberSoft: "#ffe08a",
  blue: "#2f9bd8",
  slate: "#b6bcc4",
  green: "#22c58b",
  greenPill: "#b7e4c7",
  ink: "#16212f",
};

export interface ActivityBar {
  label: string;
  /** 0–100. Both the bar's height and the figure printed inside it. */
  percent: number;
}

export interface VitalStat {
  id: string;
  icon: LucideIcon;
  /** Pre-formatted — the unit belongs to the caller. */
  value: string;
  label: string;
}

export interface MacroStat {
  id: string;
  label: string;
  /** Its slice of the ring, and the figure shown beside the label. */
  value: number;
  /** Carries its own sign: "+1.27%". */
  delta: string;
  color: string;
}

export interface Challenge {
  id: string;
  title: string;
  /** "12540/15000" — the caller formats both halves. */
  progressLabel: string;
  /** 0–100, drawn as the ring on the left. */
  percent: number;
  statusLabel: string;
  done?: boolean;
}

export interface CalendarDay {
  /** Weekday, shown uppercased: "Sun". */
  label: string;
  /** Day of the month: "18". */
  date: string;
  selected?: boolean;
}

export interface AdminDashboardDesign2Props {
  title?: string;
  navItems?: AdminNavItem[];
  avatarSrc?: string;
  initials?: string;
  logoutHref?: string;
  activity?: { title: string; rangeLabel: string; bars: ActivityBar[] };
  vitals?: VitalStat[];
  overview?: {
    title: string;
    rangeLabel: string;
    /** The figure inside the ring. */
    percent: number;
    /** The figure under it, e.g. "1034 ml". */
    centerLabel: string;
    macros: MacroStat[];
  };
  challenges?: { title: string; items: Challenge[] };
  calendar?: { monthLabel: string; days: CalendarDay[] };
  output?: {
    title: string;
    rangeLabel: string;
    value: string;
    label: string;
    note?: string;
  };
  /** A static import keeps the blurred placeholder; a plain path works too. */
  backgroundSrc?: string | StaticImageData;
}

// Everything below reproduces the reference screen's own figures, so the
// design can be judged on the numbers it was drawn for. Pass props to swap in
// real data — nothing here is fetched.

const ACTIVITY = {
  title: "Activity",
  rangeLabel: "Weekly",
  bars: [
    { label: "Sun", percent: 23 },
    { label: "Tue", percent: 55 },
    { label: "Wed", percent: 50 },
    { label: "Thu", percent: 70 },
    { label: "Fri", percent: 40 },
    { label: "Sat", percent: 69 },
    { label: "Mon", percent: 30 },
  ],
};

const VITALS: VitalStat[] = [
  { id: "heart-rate", icon: Heart, value: "108bpm", label: "Heart Rate" },
  { id: "distance", icon: Footprints, value: "2.5km", label: "Distance" },
  { id: "water", icon: Droplet, value: "1.7l", label: "Water" },
];

const OVERVIEW = {
  title: "Overview",
  rangeLabel: "Monthly",
  percent: 75,
  centerLabel: "1034 ml",
  macros: [
    {
      id: "calories",
      label: "Calories Burn",
      value: 37.5,
      delta: "+1.27%",
      color: ACCENT.amber,
    },
    {
      id: "protein",
      label: "Protein",
      value: 37.5,
      delta: "+3.54%",
      color: ACCENT.blue,
    },
    {
      id: "carbs",
      label: "Carbs",
      value: 25,
      delta: "+1.34%",
      color: ACCENT.slate,
    },
  ],
};

const CHALLENGES = {
  title: "Challenges",
  items: [
    {
      id: "steps",
      title: "15,000 steps in a day",
      progressLabel: "12540/15000",
      percent: 84,
      statusLabel: "On Going",
    },
    {
      id: "water",
      title: "3L Water Drink in a day",
      progressLabel: "3L/3L",
      percent: 100,
      statusLabel: "Complete",
      done: true,
    },
    {
      id: "exercise",
      title: "One hour exercise",
      progressLabel: "40Min/60Min",
      percent: 67,
      statusLabel: "On Going",
    },
  ],
};

const CALENDAR = {
  monthLabel: "June 2023",
  days: [
    { label: "Sun", date: "18" },
    { label: "Mon", date: "19" },
    { label: "Tue", date: "20", selected: true },
    { label: "Wed", date: "21" },
    { label: "Thu", date: "22" },
    { label: "Fri", date: "23" },
    { label: "Sat", date: "24" },
  ],
};

const OUTPUT = {
  title: "Output",
  rangeLabel: "Monthly",
  value: "2.5 Kg",
  label: "Weight Loss",
  note: "amazing!",
};

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

/**
 * The range control three panels carry. Presentational here — it names the
 * period the panel is showing; wire a handler in when the data behind it can
 * actually change.
 */
function RangeLabel({ label }: { label: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
        >
          {label}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Weekly</DropdownMenuItem>
        <DropdownMenuItem>Monthly</DropdownMenuItem>
        <DropdownMenuItem>Yearly</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PanelHeading({ title, rangeLabel }: { title: string; rangeLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {rangeLabel && <RangeLabel label={rangeLabel} />}
    </div>
  );
}

/** Icon in a soft glass circle — the vitals and the output figure lead with one. */
function IconBubble({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white/85"
    >
      <Icon className="size-5" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Rail — a floating capsule down the left edge, icons only. Labels live in
// `title`/`aria-label`: the panels beside it want the width, and this screen
// is glass over a photo, where a labelled column would read as a second page.
// ---------------------------------------------------------------------------

function Rail({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections"
      className={cn(
        PANEL,
        // Centred against the card beside it, and only as tall as its icons.
        "hidden h-fit shrink-0 flex-col gap-1.5 self-center rounded-full p-2 lg:flex",
      )}
    >
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
              "grid size-11 place-items-center rounded-full transition-colors",
              active
                ? "bg-white text-[#16212f]"
                : "text-white/55 hover:bg-white/15 hover:text-white",
            )}
          >
            <item.icon className="size-5" />
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Below `lg` the capsule rail is hidden — it needs a column of its own beside
 * the card, and there is none — which left the screen with no navigation at
 * all on a phone or a tablet. This drawer is that navigation, opened from the
 * header. Its entries are labelled: the rail can hide its labels in `title`
 * because a pointer can hover them, and a finger cannot.
 */
function NavDrawer({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Sections"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white/75 transition-colors hover:bg-white/20 hover:text-white lg:hidden"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>
      </SheetTrigger>
      {/* This screen's rail, unrolled — not a generic drawer flush to the edge
          of the glass. It floats inset the way every other surface here does,
          takes the same frosted recipe, and keeps the rail's circular icon and
          its white capsule for the current page, so the drawer reads as the
          same object the wider layout shows down the left. */}
      <SheetContent
        side="left"
        className={cn(
          PANEL,
          "inset-y-3 left-3 h-auto w-60 gap-0 rounded-3xl p-2 text-white backdrop-blur-2xl sm:max-w-none",
        )}
      >
        <SheetHeader className="p-3 pb-2">
          <SheetTitle className="text-xs font-medium tracking-wide text-white/50 uppercase">
            Sections
          </SheetTitle>
          <SheetDescription className="sr-only">Admin sections.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <SheetClose asChild key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-full p-1.5 pr-4 text-sm transition-colors",
                    active
                      ? "bg-white font-medium text-[#16212f]"
                      : "text-white/60 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
                      active ? "bg-[#16212f]/10" : "bg-white/10",
                    )}
                  >
                    <item.icon className="size-4" />
                  </span>
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Activity — one bar per day, the figure printed at the top of its fill.
// ---------------------------------------------------------------------------

function Activity({
  title,
  rangeLabel,
  bars,
}: NonNullable<AdminDashboardDesign2Props["activity"]>) {
  return (
    <section className={cn(PANEL, "flex h-full flex-col p-5")}>
      <PanelHeading title={title} rangeLabel={rangeLabel} />

      <ul className="mt-7 flex flex-1 items-end justify-between gap-2">
        {bars.map((bar) => (
          <li key={bar.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
            <div className="flex h-44 w-full max-w-10 items-end justify-center rounded-full bg-white/10">
              {/* The fill is its own rounded pill inside the track, so a short
                  bar keeps the same cap as a tall one. */}
              <div
                className="flex w-full justify-center rounded-full pt-2"
                style={{
                  height: `${bar.percent}%`,
                  backgroundImage: `linear-gradient(to bottom, ${ACCENT.amberSoft}, ${ACCENT.amber})`,
                }}
              >
                <span
                  className="text-[11px] font-semibold tabular-nums"
                  style={{ color: ACCENT.ink }}
                >
                  {bar.percent}%
                </span>
              </div>
            </div>
            <span className="text-xs text-white/65">{bar.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Vitals — one panel per figure, value first, label under it.
// ---------------------------------------------------------------------------

function Vitals({ stats }: { stats: VitalStat[] }) {
  return (
    // Three across from `sm` to `lg`, where this block spans the full card and
    // three stacked full-width rows are three-quarters empty. It folds back to
    // a column at `lg`, which is where it becomes a narrow side column again —
    // grid-rows-3 rather than plain auto rows so the three keep splitting the
    // height evenly, the way the flex-1 they replaced did.
    <div className="grid h-full gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3">
      {stats.map((stat) => (
        <section
          key={stat.id}
          className={cn(PANEL, "flex min-w-0 items-center gap-4 px-5 py-4")}
        >
          <IconBubble icon={stat.icon} />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">{stat.value}</p>
            <p className="truncate text-sm text-white/60">{stat.label}</p>
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview — one ring, one arc per macro, drawn in order around the circle.
// ---------------------------------------------------------------------------

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

function Overview({
  title,
  rangeLabel,
  percent,
  centerLabel,
  macros,
}: NonNullable<AdminDashboardDesign2Props["overview"]>) {
  const total = macros.reduce((sum, macro) => sum + macro.value, 0) || 1;

  // Each arc starts where the previous one ended: dasharray gives it its
  // length, dashoffset walks it round the circle by the sum of the arcs
  // before it.
  const lengthOf = (macro: MacroStat) => (macro.value / total) * RING_C;
  const arcs = macros.map((macro, index) => ({
    macro,
    length: lengthOf(macro),
    offset: -macros.slice(0, index).reduce((sum, earlier) => sum + lengthOf(earlier), 0),
  }));

  return (
    <section className={cn(PANEL, "flex h-full flex-col p-5")}>
      <PanelHeading title={title} rangeLabel={rangeLabel} />

      {/* Stacked on a phone. Side by side the ring's fixed 144px leaves the
          list about 128px, which is less than the value and the delta alone —
          the labels next to them would truncate to an ellipsis. */}
      <div className="mt-3 flex flex-1 flex-col items-center gap-5 sm:flex-row">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden="true">
            <circle
              cx="64"
              cy="64"
              r={RING_R}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="13"
            />
            {arcs.map(({ macro, length, offset }) => (
              <circle
                key={macro.id}
                cx="64"
                cy="64"
                r={RING_R}
                fill="none"
                stroke={macro.color}
                strokeWidth="13"
                strokeDasharray={`${length} ${RING_C - length}`}
                strokeDashoffset={offset}
              />
            ))}
          </svg>

          <span className="absolute inset-0 grid place-items-center text-2xl font-bold text-white tabular-nums">
            {percent}%
          </span>
        </div>

        <ul className="min-w-0 flex-1 space-y-3.5">
          {macros.map((macro) => (
            <li key={macro.id} className="flex min-w-0 items-center gap-3 text-sm">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: macro.color }}
              />
              <span className="min-w-0 flex-1 truncate text-white/75">{macro.label}</span>
              <span className="shrink-0 font-semibold text-white tabular-nums">{macro.value}</span>
              <span className="shrink-0 text-xs text-white/55 tabular-nums">{macro.delta}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-2 text-center text-sm text-white/60 tabular-nums">{centerLabel}</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Challenges — a progress ring per row, the figures and the state on the right.
// ---------------------------------------------------------------------------

function ProgressRing({ percent, done }: { percent: number; done?: boolean }) {
  const r = 12;
  const c = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * c;

  // Same white as the rail's active entry: these markers and that one both
  // mean "this is the live thing", so they share a colour.
  //
  // A finished challenge stops being a gauge and becomes a tick — the ring
  // would read as "nearly there" at a glance even when full.
  if (done) {
    return (
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full bg-white"
        style={{ color: ACCENT.ink }}
      >
        <Check className="size-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="16" cy="16" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
      <circle
        cx="16"
        cy="16"
        r={r}
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c}`}
      />
    </svg>
  );
}

function Challenges({ title, items }: NonNullable<AdminDashboardDesign2Props["challenges"]>) {
  return (
    <section className={cn(PANEL, "flex h-full flex-col p-5")}>
      <PanelHeading title={title} />

      <ul className="mt-2 flex flex-1 flex-col justify-center">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3.5 sm:gap-4">
            <ProgressRing percent={item.percent} done={item.done} />

            {/* Wraps on a phone rather than truncating: once the ring and the
                status pill have taken their fixed widths the title is left
                about 110px, and half a challenge's name is no use. */}
            <span className="min-w-0 flex-1 text-white sm:truncate">{item.title}</span>

            <span className="hidden shrink-0 text-sm text-white/60 tabular-nums sm:inline">
              {item.progressLabel}
            </span>

            {/* The label states the state; the colour only seconds it. */}
            <span
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: item.done ? ACCENT.green : ACCENT.amber,
                color: ACCENT.ink,
              }}
            >
              {item.statusLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Week strip + output
// ---------------------------------------------------------------------------

function CalendarStrip({ monthLabel, days }: NonNullable<AdminDashboardDesign2Props["calendar"]>) {
  const arrow =
    "grid size-8 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/15 hover:text-white";

  return (
    <section className={cn(PANEL, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous week" className={arrow}>
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" aria-label="Next week" className={arrow}>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <ol className="mt-4 flex items-stretch justify-between gap-1">
        {days.map((day) => (
          <li key={day.date} className="min-w-0 flex-1">
            <div
              aria-current={day.selected ? "date" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 transition-colors",
                day.selected ? "bg-white text-[#16212f]" : "text-white/60",
              )}
            >
              <span className="text-[11px] tracking-wide uppercase">{day.label}</span>
              <span
                className={cn(
                  "text-base tabular-nums",
                  day.selected ? "font-bold" : "font-medium text-white/85",
                )}
              >
                {day.date}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Output({
  title,
  rangeLabel,
  value,
  label,
  note,
}: NonNullable<AdminDashboardDesign2Props["output"]>) {
  return (
    <section className={cn(PANEL, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <RangeLabel label={rangeLabel} />
      </div>

      {/* Wraps rather than squeezes: in the `lg` side column the figure, its
          label and the note come to more than the panel's width, and without
          this the label is the part that loses — "Weight Lo…". */}
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <IconBubble icon={Droplet} />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">{value}</p>
            <p className="truncate text-sm text-white/60">{label}</p>
          </div>
        </div>

        {note && (
          <span
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ backgroundColor: ACCENT.greenPill, color: "#14532d" }}
          >
            {note}
          </span>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

/**
 * Glass dashboard: frosted panels straight over a room photo — weekly
 * activity bars, three vitals, a macro ring, the challenge list, a week strip
 * and an output figure. No rail: this screen is one page, and a nav column
 * would be furniture it does not use.
 *
 * Every prop is optional and defaults to the reference's own figures, so the
 * route can render it bare while the design is being judged; point the props
 * at real data when it wins.
 *
 * Self-contained on purpose — header and every panel live here rather than
 * being shared with design 1, the way mobile's OnboardingDesign* files each
 * own their slides.
 *
 * NOTE for whichever design wins: once a single admin design is picked (this
 * one or another AdminDashboardDesignN), pull its header and panels back out
 * into their own shared files instead of leaving them duplicated per design.
 * The duplication only earns its keep while multiple designs are competing.
 */
export function AdminDashboardDesign2({
  title = "Lifestats",
  navItems = DEFAULT_ADMIN_NAV,
  avatarSrc,
  initials = "AD",
  logoutHref = "/",
  activity = ACTIVITY,
  vitals = VITALS,
  overview = OVERVIEW,
  challenges = CHALLENGES,
  calendar = CALENDAR,
  output = OUTPUT,
  backgroundSrc = backgroundPhoto,
}: AdminDashboardDesign2Props) {
  const { variantId, setVariantId } = useTheme();
  const iconButton =
    "grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white/75 transition-colors hover:bg-white/20 hover:text-white";

  return (
    // The ground colour matters: for the frame or two before the photo has
    // decoded, the panels are blurring whatever is behind them. Without it
    // that is the blank page, and the glass flashes as if it had cracked.
    <div className="relative min-h-screen bg-[#0c1f33] text-white">
      {/* The photo is the whole reason the panels read as glass. Decorative,
          so it carries an empty alt and stays out of the a11y tree. A static
          import rather than a bare path, so Next can inline a blurred
          placeholder and the photo fades in over the ground instead of
          popping in under finished glass. */}
      <Image
        src={backgroundSrc}
        alt=""
        fill
        priority
        placeholder={typeof backgroundSrc === "string" ? "empty" : "blur"}
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#0c1f33]/55" />

      {/* One card holds the whole screen, centred on the photo with the rail
          floating beside it. */}
      {/* The cap rises once past it: 1600px of card centred in 2560 leaves the
          panel looking stranded in a dark field rather than floating on a
          photo. Centred is right for this design — unlike a rail-and-content
          shell, a floating pane is meant to sit off the edges. */}
      {/* One card holds the whole screen, centred on the photo with the rail
          floating beside it. The cap rises once past 1600px — that much card
          centred in 2560 leaves the panel stranded in a dark field. */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center gap-5 px-3 py-4 sm:px-4 2xl:max-w-[1920px]">
        <Rail items={navItems} />

        <div
          className={cn(
            PANEL,
            // A heavier blur than the panels inside it, so the card reads as
            // one pane of glass with the rest floating on top of it.
            "flex min-w-0 flex-1 flex-col gap-4 rounded-[2rem] p-4 shadow-2xl backdrop-blur-2xl sm:gap-5 sm:p-6",
          )}
        >
          {/* The title shrinks and the buttons tighten below `sm`: at a
              phone's width a 30px title plus four 40px buttons and their gaps
              came to 335px inside a 324px card, which is what pushed the whole
              screen into a horizontal scroll. */}
          <header className="flex items-center justify-between gap-3 sm:gap-4">
            <NavDrawer items={navItems} />

            <h1 className="min-w-0 flex-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl lg:flex-none">
              {title}
            </h1>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Change color theme" className={iconButton}>
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

              <button type="button" aria-label="Notifications" className={iconButton}>
                <Bell className="size-4" />
              </button>

              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full border border-white/20 object-cover"
                />
              ) : (
                // Decorative — it names nobody the screen doesn't already
                // name, and on a phone its 40px is the difference between
                // "Lifestats" and "Lifest…".
                <span
                  aria-hidden="true"
                  className="hidden size-10 place-items-center rounded-full border border-white/20 bg-white/15 text-xs font-bold text-white sm:grid"
                >
                  {initials}
                </span>
              )}

              {logoutHref && (
                <Link href={logoutHref} aria-label="Sign out" className={iconButton}>
                  <LogOut className="size-4" />
                </Link>
              )}
            </div>
          </header>

          {/* Top band: bars, the three vitals, the ring.
              `lg` is a halfway house between the phone's stack and the twelve
              columns: the bars take the full width they need and the ring sits
              beside the vitals, which at twelve columns would each be too
              narrow to read at this size.

              min-w-0 on every cell is what actually keeps this on a phone. A
              grid column sized `auto` refuses to go under its items' min-content,
              and the Overview panel's is 408px — wider than the whole card —
              so without it the column drags the page into a sideways scroll
              instead of letting the labels truncate. */}
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-12">
            <div className="min-w-0 lg:col-span-2 xl:col-span-5">
              <Activity {...activity} />
            </div>
            <div className="min-w-0 lg:col-span-1 xl:col-span-3">
              <Vitals stats={vitals} />
            </div>
            <div className="min-w-0 lg:col-span-1 xl:col-span-4">
              <Overview {...overview} />
            </div>
          </div>

          {/* Lower band: the challenge list, with the week strip and the output
            figure stacked beside it. Those two go side by side from `sm` up to
            `lg`, where they are full-card width and each half empty on its own
            row. */}
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8">
              <Challenges {...challenges} />
            </div>
            <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
              <CalendarStrip {...calendar} />
              <Output {...output} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
