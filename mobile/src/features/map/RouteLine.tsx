import { Path } from "react-native-svg";

import type { Point } from "./useMapRegion";

interface RouteLineProps {
  points: Point[];
  color: string;
}

/** A dashed path so it reads as a planned route, not a drawn-on line. */
export function RouteLine({ points, color }: RouteLineProps) {
  if (points.length < 2) return null;

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <Path
      d={d}
      stroke={color}
      strokeWidth={3}
      strokeDasharray="1, 10"
      strokeLinecap="round"
      fill="none"
    />
  );
}
