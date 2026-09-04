# Roovia — TODO

Road trip planner for van / camping-car with AI itineraries. Park4night + Polarsteps + Tricount + AI planning in one app.

---

# FRONTEND

## Auth & account
- [x] Welcome screen + first-run carousel (plan / drive / share)
- [x] Sign up: email + password
- [x] Login + "stay signed in"
- [x] Apple Sign-In (mandatory on iOS once any social login exists)
- [x] Google Sign-In
- [ ] Email verification screen + resend
- [x] Forgot password → reset flow
- [x] Token storage in `expo-secure-store`, silent refresh, auto-logout on 401
- [ ] Guest mode: browse, blocked at trip generation → signup wall
- [x] Account screen: change email, change password, avatar, display name
- [ ] Connected devices / sessions list + revoke
- [ ] Delete account with confirmation (store requirement)
- [ ] Consent gates: CGU, privacy policy, location permission rationale, analytics opt-in

## Onboarding
- [ ] Post-signup flow: traveler profile → vehicle → first trip prompt
- [ ] Skippable, resumable, progress indicator
- [ ] "Why we ask this" hints so the AI-personalization value is visible

## Home / trips
- [ ] Trips list: upcoming, in progress, past, drafts
- [ ] Trip card: cover, dates, distance, budget, status
- [ ] Empty state → "generate my first trip" CTA
- [ ] Pull to refresh, pagination
- [ ] Quick actions: duplicate, archive, delete, share

## Traveler profile
- [ ] Multi-step wizard, resumable draft
- [ ] Party composition: solo / couple / family / friends
- [ ] Children: count + age each
- [ ] Activity interests multi-select: beach, hiking, sport, museums, food, nature
- [ ] Global budget input
- [ ] Destination picker (country / region / city, autocomplete)
- [ ] Duration / period: fixed dates or flexible
- [ ] Already-fixed stops and dated constraints ("be in Barcelona on the 12th")
- [ ] Travel preferences: pace, max driving hours per day, nature vs city, free vs paid spots
- [ ] Edit profile → prompt to re-apply on the active trip

## Vehicle profile
- [ ] Type: van, fourgon, camping-car, converted heavy truck, converted car
- [ ] Dimensions: height, length, width, weight (metric / imperial)
- [ ] Toilet on board yes/no + type
- [ ] Equipment: shower, fresh water tank, grey/black tank, solar, fridge
- [ ] Autonomy: water capacity, tank capacity, fuel type, consumption
- [ ] Specific needs: 220V hookup, dump station every N days
- [ ] Garage of several vehicles + active one
- [ ] Incompatibility banner when a route or spot doesn't fit the vehicle

## AI trip generation
- [ ] Natural-language prompt screen ("3 weeks in Spain, via Valencia, budget 2000 €")
- [ ] Guided form fallback for users who won't type
- [ ] Prefill from traveler + vehicle profile, chips editable before sending
- [ ] Streaming UI: steps appear progressively, skeleton, cancel button
- [ ] States: pending / partial / done / failed + retry
- [ ] Result: day-by-day timeline — route, stops, places to visit, activities, sleep spots (free and paid), drive time, detours, services on the way
- [ ] Budget estimate block on the result
- [ ] Refine ("more hiking", "cheaper", "less driving") without losing manual edits
- [ ] Manual edit: reorder, add/remove stop, lock a stop, shift dates
- [ ] Save / duplicate / delete trip
- [ ] Generation history per trip (compare versions)

## Itinerary & map
- [ ] Map with route polyline + numbered stops
- [ ] Stop detail sheet: photos, description, hours, price, reviews, why it was picked
- [ ] Day selector synced with map
- [ ] List view alternative
- [ ] Hand off to Google Maps / Waze / Apple Maps for actual driving
- [ ] Live position + "next stop in X km / Y min"
- [ ] Trip states: planned → in progress → finished
- [ ] Offline access to the active trip + cached tiles along the corridor

## Dynamic re-routing
- [ ] Suggestion cards ("rain in Nice tomorrow — swap the beach day?")
- [ ] Triggers shown: bad weather, place closed, running late, plan change, new stop from a group member
- [ ] Accept / dismiss / edit with diff preview (±km, ±cost, ±time)
- [ ] Manual "recalculate from here"
- [ ] Undo last recalculation
- [ ] Push notification deep-linking into the suggestion

## Van / camping-car services map
- [ ] POI layers with toggles + clustering:
  - [ ] Fuel stations + price per liter
  - [ ] Drinking water fill points
  - [ ] Dump stations (vidange)
  - [ ] Public toilets
  - [ ] Aires de services camping-car
  - [ ] Bivouac spots
  - [ ] Paid campsites
  - [ ] Parkings with height limit
  - [ ] Local markets
  - [ ] Points of interest / viewpoints
- [ ] Filters: free / paid, open now, fits my vehicle height, min rating
- [ ] "Around me now" sheet for mid-trip search
- [ ] POI detail: photos, services, price, last-verified date, reviews
- [ ] Add a POI to the trip → triggers recalculation
- [ ] Report a POI (wrong / closed) + submit a new one
- [ ] Save POI to favorites

## Budget
- [ ] Dashboard: estimated vs actual, per category, per day
- [ ] Fuel cost from vehicle consumption + live prices
- [ ] Cost per person for group trips
- [ ] Over-budget warning + "make it cheaper" action
- [ ] Multi-currency

## Shared expenses (Tricount)
- [ ] Create group + invite by link or code
- [ ] Add expense: amount, payer, category, split (equal / shares / exact), receipt photo
- [ ] Expense list + filters
- [ ] Balances: who owes who
- [ ] Settle-up suggestions
- [ ] End-of-trip summary + export
- [ ] Offline entry, sync on reconnect

## Pre-departure checklist
- [ ] Auto-generated from trip + vehicle + destination: passport, insurance, fuel, oil level, tire pressure, water, gear
- [ ] Categories + progress
- [ ] Add / edit custom items, assign to a group member
- [ ] Reminders D-7 and D-1
- [ ] Save as reusable template

## Community
- [ ] Feed of shared itineraries, filters: country, duration, budget, vehicle type, season
- [ ] Public itinerary detail with map preview + stats
- [ ] "Take this trip and adapt it to my profile"
- [ ] Rate + review itineraries and spots
- [ ] Publish my itinerary, with coordinate privacy scrub on home / bivouac
- [ ] Public user profile: trips, spots contributed, badges
- [ ] Follow / favorites
- [ ] Report content + block user

## Travel journal (Polarsteps)
- [ ] Background recording of the route actually driven, battery-aware
- [ ] Day entries auto-built from the track + stops
- [ ] Photos / videos per step, captions, cover
- [ ] Timeline + recap map ("2 340 km, 12 stops, 3 countries")
- [ ] Share with family: public link + image export
- [ ] Turn a finished journal into a publishable itinerary

## Shared trip (group)
- [ ] Invite members: owner / editor / viewer
- [ ] Several vehicles in one convoy
- [ ] Live location sharing + avatars on map
- [ ] Member proposes a spot → group notified → approve → recalculation
- [ ] Per-stop comments
- [ ] Handle simultaneous edits

## Kids interface
- [ ] Separate playful theme, big targets, no ads, no external links
- [ ] Simplified live map: "we are here", time left as a visual bar
- [ ] Upcoming points of interest as illustrated cards
- [ ] Local fauna / flora / landmark facts by child age
- [ ] Region quiz / mini game
- [ ] Parental lock to enter and exit
- [ ] Tablet layout

## International
- [ ] FR / EN strings, date and number formatting
- [ ] Metric ↔ imperial toggle
- [ ] Currency selection
- [ ] Country rules surfaced: wild camping legality, tolls, LEZ/ZFE

## Freemium & paywall
- [ ] Free tier limits visible in-app (generations per month, locked layers)
- [ ] Paywall: recurring subscription + one-off trip pass
- [ ] IAP via RevenueCat (StoreKit + Play Billing)
- [ ] Restore purchases, entitlement sync, grace period, expiry
- [ ] Upsell moments: after first generation, on locked POI layers
- [ ] Manage subscription link + current plan screen

## Notifications
- [ ] Permission request with rationale, at the right moment (not on launch)
- [ ] Push token registration + refresh
- [ ] In-app notification center + unread badge
- [ ] Per-type preferences: re-route, group activity, checklist reminders, community
- [ ] Deep link handling from every notification type

## Settings
- [ ] Language, units, currency
- [ ] Notification preferences
- [ ] Privacy: location sharing, analytics opt-out
- [ ] Map preferences (default layers, navigation app)
- [ ] Legal: CGU, privacy, licenses, OSM attribution
- [ ] Support / contact + bug report with logs
- [ ] In-app review prompt (`expo-store-review`)
- [ ] App version + changelog

## Offline & sync
- [ ] Offline-first cache for the active trip, POIs on route, checklist, expenses
- [ ] Write queue + retry on reconnect
- [ ] Conflict resolution UI when server and local diverge
- [ ] Network status banner + degraded mode
- [ ] Cache size management / clear cache

## Device permissions & hardware
- [ ] Foreground + background location (journal recording, live sharing)
- [ ] Camera + photo library (receipts, journal photos)
- [ ] Push notifications
- [ ] Battery-aware tracking and low-battery fallback
- [ ] Handle every "permission denied" state with a recovery path

## Cross-cutting UI
- [ ] Loading / empty / error state for every screen
- [ ] Global error boundary + crash reporting
- [ ] Deep links + universal links (trip, POI, invite, shared journal)
- [ ] Share sheet integration
- [ ] Analytics events on the funnel: signup → profile → generation → save → paywall → purchase
- [ ] Accessibility: contrast, font scaling, screen-reader labels
- [ ] Performance: 1000+ markers, long itineraries, low-end Android memory
- [ ] Force-update screen for breaking API changes

## Design system
- [ ] Logo integration (client-provided, once received)
- [ ] Color palette — nothing given by the client yet, unlike a typical brief; propose nature/road palette, get sign-off at R3
- [ ] Typography mapping for the fonts already installed: Outfit (UI/body), Playfair Display / Cormorant Garamond (journal/editorial), Fredoka (kids mode only)
- [ ] Icon set from `iconsax-react-native` (already installed) — pick filled vs outline convention
- [ ] Component style guide: buttons, cards, chips, sheets, empty states — one look across the app
- [ ] Map style: pin design per POI type (fuel, water, dump, toilet, bivouac, campsite, viewpoint), route line style, cluster style
- [ ] Dark mode — matters here specifically for night driving / dashboard mount use
- [ ] Kids-mode illustration style, distinct from the main app skin

## Web
- [ ] Landing: hero, features, pricing, FAQ, screenshots, store badges
- [ ] SEO + OG images (the Ads budget depends on it)
- [ ] Waitlist / email capture
- [ ] Legal pages: CGU, privacy, cookies + consent banner
- [ ] Public shared-journal / shared-itinerary page (deep link target)
- [ ] Admin: users, trips, POI moderation queue, reports, subscriptions, AI cost dashboard
- [ ] Admin auth + role guard

## Release
- [ ] EAS build profiles, signing, versioning
- [ ] Store listings FR/EN, screenshots, privacy labels
- [ ] Age rating — UGC + kids mode need care
- [ ] TestFlight / internal track beta with the client
- [ ] Store review checklist: account deletion, Apple Sign-In, IAP compliance, permission strings

---

# BACKEND

## Auth & users
- [ ] Register / login / refresh / logout, password hashing
- [ ] Email verification + password reset tokens (mail module already scaffolded)
- [ ] Apple + Google OAuth verification
- [ ] Roles: user, premium, moderator, admin + guards
- [ ] Session / device registry + revoke
- [ ] Account deletion (cascade + anonymize public content) and data export
- [ ] Brute-force protection, per-IP and per-account rate limits

## Profiles
- [ ] `traveler_profile` entity + CRUD
- [ ] `vehicle` entity + CRUD, several per user
- [ ] Validate physical constraints (height / weight ranges) — consumed by routing
- [ ] Profile → AI context serializer: compact, stable field order so the prompt prefix stays cacheable

## AI orchestration — core
- [ ] Anthropic SDK (`@anthropic-ai/sdk`), model `claude-opus-5` ($5 / M in, $25 / M out, 1M context)
- [ ] Streaming (`client.messages.stream`) piped to mobile over SSE, `max_tokens` ~64000
- [ ] `thinking: { type: "adaptive" }` + `output_config: { effort: "high" }` for full trips, `effort: "low"` for edits and re-routes
- [ ] Structured outputs (`output_config.format`) with a strict itinerary JSON schema — never parse prose
- [ ] Prompt caching: frozen system prompt + tool defs first, volatile user context last; assert `usage.cache_read_input_tokens > 0`
- [ ] Tool use so the model reads real data: `search_pois`, `route_between`, `fuel_price`, `weather_forecast`
- [ ] Three-phase pipeline: AI skeleton → deterministic enrichment + validation against real POI/routing data → short AI polish. Blocks hallucinated places.
- [ ] Reject or repair any stop that doesn't resolve to real coordinates
- [ ] Job queue (BullMQ + Redis), status polling, idempotency key
- [ ] Per-user quota + monthly cost cap, log tokens and € per generation
- [ ] Prompt versioning + eval set of ~30 reference trip requests to catch regressions
- [ ] Timeout, retry, partial-result persistence

## Trips
- [ ] `trip`, `trip_day`, `stop`, `trip_version` entities
- [ ] CRUD + list with filters and pagination
- [ ] Versioning so every regeneration and re-route is a new version, undo is a pointer move
- [ ] Locked stops and hard constraints respected by every recompute
- [ ] Trip status transitions + "start trip" / "finish trip"

## Routing
- [ ] Provider must accept vehicle dimensions (height / weight / length) — HERE, PTV or GraphHopper. Google and Mapbox don't expose camper profiles.
- [ ] Multi-waypoint optimization, distance / duration / elevation, toll and LEZ flags
- [ ] Geocoding, reverse geocoding, place autocomplete
- [ ] Isochrones — what's within 30 min of the route, for detour suggestions
- [ ] Cache routes (expensive, and they repeat)

## POI & external data
- [ ] **Park4night has no public API.** Build the dataset from OpenStreetMap / Overpass: `amenity=sanitary_dump_station`, `amenity=toilets`, `amenity=drinking_water`, `tourism=caravan_site`, `tourism=camp_site`, `amenity=fuel`
- [ ] OSM ingestion pipeline: scheduled refresh, de-dup, quality score
- [ ] Fuel prices: France = `prix-carburants.gouv.fr` open data; other countries TBD
- [ ] Weather forecast per stop per date (Open-Meteo / OpenWeather)
- [ ] Activities and restaurants: Google Places or Foursquare
- [ ] Unified `poi` table, PostGIS index, source attribution, ODbL compliance for OSM
- [ ] Community POIs in the same table, `source=user` + moderation state
- [ ] Radius / bbox / corridor search with vehicle-compatibility filters
- [ ] Provider failure fallbacks + circuit breaker (a dead provider must not kill generation)

## Dynamic re-routing
- [ ] Trigger engine: weather change on an upcoming stop, place closed or downrated, schedule drift, group proposal
- [ ] Scheduled scan over in-progress trips only
- [ ] Re-plan from a given stop, preserving locked stops and hard constraints
- [ ] Diff generator (added / removed stops, Δkm, Δcost, Δtime) for the accept UI
- [ ] Push dispatch on new suggestion

## Budget engine
- [ ] Deterministic, not AI: fuel = distance × consumption × local price, plus campsites, activities, per-country daily food baseline
- [ ] Per-person allocation
- [ ] Recompute on every itinerary version
- [ ] Currency conversion, cached rates

## Expenses
- [ ] `expense_group`, `expense`, `split`, `settlement`
- [ ] Balances + minimal-settlement algorithm
- [ ] Receipt upload to object storage
- [ ] Offline-tolerant sync (client-generated ids, per-field last-write-wins)
- [ ] CSV / PDF export

## Checklist
- [ ] Rules engine: destination country + vehicle + duration + season + party → item set
- [ ] Country requirement data (documents, mandatory equipment, vignettes) — curate FR/EU first
- [ ] Per-trip persistence, assignment, reminder scheduling

## Community & moderation
- [ ] Publish itinerary as a sanitized snapshot, visibility levels
- [ ] Discovery: search, filter, sort, trending, by country
- [ ] Ratings and reviews on itineraries and POIs, aggregate scores, anti-spam
- [ ] "Adapt this trip to my profile" → AI job reusing the generation pipeline with an existing itinerary as input
- [ ] Report queue, moderation actions, audit log
- [ ] Abuse limits, banned words, image moderation
- [ ] Block-user semantics across feed, comments, groups

## Journal & media
- [ ] Track ingestion: batched compressed GPS points + polyline simplification
- [ ] Media upload via signed URLs, thumbnails, EXIF strip, storage lifecycle and quotas
- [ ] Journal entities + tokenized public share link (revocable)
- [ ] Recap stats computation

## Groups & realtime
- [ ] Trip membership, invite tokens, roles
- [ ] Realtime channel: presence, live positions, itinerary change events
- [ ] Position privacy: opt-in, TTL, reduced precision
- [ ] Stop proposal + approval flow
- [ ] Concurrent-edit resolution on the itinerary

## Kids content
- [ ] Generation job: age-appropriate facts per region and stop, cached per geohash + age band
- [ ] Kid-safe review flag required before serving

## Billing
- [ ] RevenueCat webhooks (or App Store Server API + Play RTDN) → entitlement state
- [ ] Entitlement guard on gated endpoints: generations, POI layers, publish
- [ ] Quota counters per plan, monthly reset
- [ ] Trip-pass (time-limited) entitlement type
- [ ] Receipt validation, refunds, chargebacks, expiry, grace period
- [ ] Webhook replay protection + idempotency

## Notifications
- [ ] Expo push token registry per device, invalid-token cleanup
- [ ] Notification types, user preferences, quiet hours
- [ ] Transactional mail: verification, reset, invite, trip summary

## Admin API
- [ ] Admin-guarded: users, trips, POIs, reports, subscriptions
- [ ] AI usage and cost dashboard data (tokens, € per user, € per generation)
- [ ] Feature flags so the free/premium line moves without a release
- [ ] Impersonate / support view (audited)

## Platform
- [ ] Scheduled jobs runner (OSM refresh, fuel prices, re-route scan, reminders)
- [ ] Object storage + signed URL service
- [ ] Search indexing for community and POIs
- [ ] Structured logging, Sentry, uptime checks, alert on AI cost spike
- [ ] API versioning + force-update signal to the app

## Legal / data
- [ ] GDPR: retention policy, export and delete, DPAs with providers
- [ ] OSM ODbL attribution served to the app
- [ ] Recurring cost model per active user — AI + routing + maps are the running bill

---

# Blockers to settle with the client

- [ ] Park4night data: no API. Accept OSM coverage (thinner at launch) + community fill?
- [ ] Who pays the recurring AI + routing + maps bill, and what monthly ceiling?
- [ ] Free vs premium feature split, subscription price, trip-pass price
- [ ] Apple/Google IAP commission is 15–30% on the subscription and trip-pass — same rule as any app selling digital access. Eats into the recurring-revenue plan Nicolas is counting on; price accordingly.
- [ ] Campsites: display only, or real booking? Booking is a separate project.
- [ ] iOS + Android at launch, or iOS first (mockup is iPhone)?
- [ ] Who moderates user content (community posts, photos)?
- [ ] App name
- [ ] No logo / color palette provided yet — get both at R3, blocks the design-system pass
