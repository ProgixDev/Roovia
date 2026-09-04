# Roovia — Design System

> Draft 01. Van / camping-car road-trip planner. Concept: a cartographer's palette for a driver's app — tokens named the way a topographic map names its ink, not brand jargon. Live spec: [Roovia Field Guide](https://claude.ai/code/artifact/6b412d95-02ce-4af1-a3eb-ccc3edf18109).

```yaml
name: roovia
concept: topographic-field-guide
status: draft
color:
  light:
    ground:     "#EFF1E7"   # app background — sage-tinted paper, not café-cream
    surface:    "#FBFAF4"   # cards, sheets
    surface-2:  "#F2EFDF"   # code/mono blocks, recessed panels
    ink:        "#1B241C"   # body text, icons — spruce-black, never flat #000
    ink-muted:  "#5B6357"   # secondary text, captions
    line:       "#D8D6C6"   # hairlines, borders, dividers
    blaze:      "#E8540C"   # primary action — trail-blaze orange
    blaze-ink:  "#FFF8EE"   # text/icons on blaze
    lake:       "#1F5C74"   # links, route line on map, water POIs
    moss:       "#4C6B3F"   # success states, campsite POIs
    contour:    "#8B6B47"   # dividers, elevation data, earth POIs
    plum:       "#6B4C7A"   # map pins only — viewpoints
    slate:      "#46586B"   # map pins only — toilets
    danger:     "#B23A2E"
    amber:      "#C98A1F"   # warning, also parking pin
  dark:
    ground:     "#141B14"
    surface:    "#1C241C"
    surface-2:  "#202A20"
    ink:        "#EDEADA"
    ink-muted:  "#9CA391"
    line:       "#333A2E"
    blaze:      "#FF7A3D"
    blaze-ink:  "#1B241C"
    lake:       "#5AB1CC"
    moss:       "#86B366"
    contour:    "#C39B6C"
    plum:       "#A987B8"
    slate:      "#7C93A8"
    danger:     "#E4796A"
    amber:      "#E3B65C"
typography:
  display: "Big Shoulders Display"   # 600 / 700 / 900
  body: "Outfit"                     # 400 / 500 / 600 / 700 — already in mobile/package.json
  editorial: "Newsreader"            # italic 400 / 500 — journal, community, quotes
  mono: "Space Mono"                 # 400 / 700 — coordinates, budget, distance
spacing_unit: 8px
radius:
  s: 8px      # inputs, small controls
  m: 14px     # cards, stat tiles
  l: 24px     # POI cards, sheets, large surfaces
  pill: 999px # buttons, chips
shadow:
  light: "0 1px 2px rgba(27,36,28,.06), 0 10px 28px rgba(27,36,28,.09)"
  dark:  "0 1px 2px rgba(0,0,0,.4), 0 14px 32px rgba(0,0,0,.5)"
```

## Color rationale

| Token | Hex (light) | Job |
|---|---|---|
| `ground` | `#EFF1E7` | App background. Cooler and greyer than the standard AI-generated warm-cream — closer to actual topo-map paper stock. |
| `ink` | `#1B241C` | Body text, icons, phone-frame chrome. A spruce-black, never a flat `#000000`. |
| `blaze` | `#E8540C` | The one saturated color, spent on primary actions only — generate, book, confirm, add-to-route. Named for a trail-blaze paint mark, not "orange" or "primary". |
| `lake` | `#1F5C74` | Links, the drawn route line on the map, water points of interest (fresh-water fill points). |
| `moss` | `#4C6B3F` | Success states, campsite pins, anything living. |
| `contour` | `#8B6B47` | Dividers, elevation/distance data, earth-toned POIs — the brown a real topographic map uses for contour lines. |
| `plum`, `slate` | `#6B4C7A`, `#46586B` | Reserved for map pins only (viewpoint, toilets). Never used in buttons or UI chrome — keeps the six core tokens as the only colors doing double duty. |

Semantic colors (`danger`, `amber`) are separate from `blaze` — `blaze` is the brand action color, not a stand-in for "warning" or "alert".

## Typography

| Role | Font | Size | Weight | Line height | Used for |
|---|---|---|---|---|---|
| Hero stat / trip title | Big Shoulders Display | 44px | 900 | 0.95 | "2,340 km", trip names, the app's odometer voice |
| Section head | Big Shoulders Display | 28px | 700 | 1.05 | Screen titles, day headers |
| Card title | Outfit | 18px | 600 | 1.3 | POI names, list items |
| Body | Outfit | 15px | 400 | 1.5 | Descriptions, running text |
| Button / emphasis | Outfit | 15px | 600 | 1.3 | Buttons, form labels |
| Caption / eyebrow | Outfit or Space Mono | 12px | 500–600, uppercase, +0.06em tracking | 1.3 | Timestamps, category labels |
| Data (mono) | Space Mono | 15px | 400 / 700 | 1.4, tabular-nums | Coordinates, budget figures, distances — anything that must not wobble in a column |
| Editorial quote | Newsreader (italic) | 19px | 500 | 1.4 | Journal entries, community reviews, pull quotes |

Condensed display face reads as highway signage — keep it above 24px and out of body copy. Outfit is already shipped in `mobile/package.json` (`@expo-google-fonts/outfit`); Playfair Display and Cormorant Garamond, also already installed, stay reserved for Fredoka-adjacent editorial one-offs if Newsreader isn't added. Fredoka stays scoped to kids mode only — its own sub-palette, not this system.

## Components

- **Buttons** — pill radius (999px). Primary: `blaze` fill, `blaze-ink` text, `shadow.light/dark`. Secondary: transparent fill, 1px `ink` border, `ink` text. No tertiary/ghost variant yet.
- **Cards** (POI card, stat tile) — `surface` background, 1px `line` border, `radius.m` (stat tiles) or `radius.l` (POI cards), `shadow.light/dark`.
- **Chips** (POI filters) — `surface` background, 1px `line` border, pill radius, `ink` text. Active/selected state: invert to filled `blaze` or the relevant pin color when representing a POI category.
- **Inputs** — 1px `line` border, `radius.s`, focus ring `lake` at 2px offset (`:focus-visible`).
- **Dividers / section markers** — dashed horizontal rule (`line` token) with a small-caps `Space Mono` label centered in it, styled like a map's marginalia rather than a plain `<h2>`.

## Map pin legend

Eight POI categories, one color each — the two colors reserved exclusively for this list (`plum`, `slate`) never appear elsewhere in the UI:

| Pin | Color | Token |
|---|---|---|
| Fuel | trail-blaze orange | `blaze` |
| Water | lake blue | `lake` |
| Dump station (vidange) | contour brown | `contour` |
| Toilets | slate blue-grey | `slate` |
| Bivouac | dark forest green | `#2F4A29` |
| Campsite | moss green | `moss` |
| Viewpoint | plum | `plum` |
| Parking (height-flagged) | amber | `amber` |

## Dark mode

Not an inversion — `ground`/`surface` shift to a deep spruce (`#141B14`/`#1C241C`, not pure black), `blaze` brightens to `#FF7A3D` for contrast, `ink` becomes a warm paper-cream (`#EDEADA`) rather than pure white. Built for the one use case that actually needs it here: night driving with the phone on a dash mount.

## Open

- No client-provided logo or palette exists yet — this draft is ours to defend or replace at R3.
- Numeric type scale above is a starting point for Tailwind/NativeWind config, not yet wired into `mobile/`.
