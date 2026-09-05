import { useMemo } from "react";

import type { LatLng } from "./types";

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export function computeBounds(points: LatLng[]): Bounds | null {
  if (points.length === 0) return null;
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }
  return { minLat, maxLat, minLng, maxLng };
}

export interface Point {
  x: number;
  y: number;
}

/**
 * A flat, non-geographic projection on purpose — DESIGN.md frames the
 * sketch renderer as a stylized topo canvas, not a literal map, so it skips
 * the latitude cosine correction a true equirectangular projection needs.
 * Single stop / empty input centers on the canvas instead of dividing by a
 * zero-size bounding box.
 */
export function createProjector(points: LatLng[], size: number, padding: number) {
  const bounds = computeBounds(points);
  const usable = size - padding * 2;

  if (!bounds) {
    const center = () => ({ x: size / 2, y: size / 2 });
    return center;
  }

  const latSpan = bounds.maxLat - bounds.minLat || 1;
  const lngSpan = bounds.maxLng - bounds.minLng || 1;
  const span = Math.max(latSpan, lngSpan);

  return (p: LatLng): Point => ({
    x: padding + ((p.longitude - bounds.minLng) / span) * usable,
    // Screen y grows downward, latitude grows upward — flip it.
    y: padding + (1 - (p.latitude - bounds.minLat) / span) * usable,
  });
}

export function useProjector(points: LatLng[], size: number, padding: number) {
  return useMemo(() => createProjector(points, size, padding), [points, size, padding]);
}

/**
 * Index-based, not path-length-weighted — a live-position demo doesn't need
 * true constant-speed motion along the route, just a point that visibly
 * advances stop by stop. `t` is clamped to [0, 1].
 */
export function interpolateAlongRoute(coordinates: LatLng[], t: number): LatLng | null {
  if (coordinates.length === 0) return null;
  if (coordinates.length === 1) return coordinates[0];
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (coordinates.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const a = coordinates[i];
  const b = coordinates[Math.min(i + 1, coordinates.length - 1)];
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * frac,
    longitude: a.longitude + (b.longitude - a.longitude) * frac,
  };
}
