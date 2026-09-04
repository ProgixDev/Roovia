import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import { useTheme } from "../../contexts/ThemeContext";
import { formatLength, formatWeight, type UnitSystem } from "../../lib/format";
import type { VehicleType } from "../../store/vehiclesStore";

interface Spec {
  path: string;
  roofY: number;
  leftX: number;
  rightX: number;
  wheelXs: number[];
  wheelR: number;
}

const GROUND_Y = 118;

// Five flat, straight-edged silhouettes sharing one viewBox and ground
// line — a "cut paper" figure rather than an illustrated vehicle, so the
// callout brackets below can key off each spec's own roofY/leftX/rightX
// instead of guessing where the drawing's edges land.
const SPECS: Record<VehicleType, Spec> = {
  van: {
    path: "M40,100 L40,65 L55,45 L200,45 L230,60 L245,75 L245,100 Z",
    roofY: 45,
    leftX: 40,
    rightX: 245,
    wheelXs: [80, 210],
    wheelR: 16,
  },
  fourgon: {
    path: "M35,100 L35,30 L60,30 L60,20 L235,20 L255,45 L255,100 Z",
    roofY: 20,
    leftX: 35,
    rightX: 255,
    wheelXs: [75, 220],
    wheelR: 17,
  },
  camping_car: {
    // Cab-over profile: a van cab (up to the riser at x=100) topped by the
    // wider "Luton" overhang that gives a coachbuilt motorhome its silhouette.
    path: "M30,100 L30,55 L50,55 L65,35 L100,35 L100,20 L260,20 L260,100 Z",
    roofY: 20,
    leftX: 30,
    rightX: 260,
    wheelXs: [70, 225],
    wheelR: 17,
  },
  heavy_truck: {
    path: "M25,105 L25,15 L270,15 L270,105 Z",
    roofY: 15,
    leftX: 25,
    rightX: 270,
    wheelXs: [65, 165, 230],
    wheelR: 20,
  },
  converted_car: {
    path: "M45,100 L45,80 L70,62 L130,58 L195,58 L220,75 L232,88 L232,100 Z",
    roofY: 58,
    leftX: 45,
    rightX: 232,
    wheelXs: [75, 200],
    wheelR: 15,
  },
};

interface VehicleSilhouetteProps {
  type: VehicleType;
  heightM: number;
  lengthM: number;
  weightKg: number;
  unit: UnitSystem;
  /** Card thumbnails drop the callout brackets — too fine-grained to read at that size, and not the point there. */
  compact?: boolean;
}

/** "You type into the drawing" — the height/length/weight callouts show the vehicle's own live values, not static labels. */
export function VehicleSilhouette({ type, heightM, lengthM, weightKg, unit, compact = false }: VehicleSilhouetteProps) {
  const { theme } = useTheme();
  const spec = SPECS[type];
  const heightGuideX = spec.leftX - 18;
  const lengthGuideY = GROUND_Y + 22;

  return (
    <Svg width="100%" height={compact ? 90 : 160} viewBox={compact ? "0 0 300 120" : "0 0 300 160"}>
      {spec.wheelXs.map((x) => (
        <Circle key={x} cx={x} cy={GROUND_Y} r={spec.wheelR} fill={theme.colors.blaze} stroke={theme.colors.surfaceSunken} strokeWidth={3} />
      ))}
      <Path d={spec.path} fill={theme.colors.ink} />
      {compact ? null : (
        <>
          {/* Height bracket */}
          <Line x1={heightGuideX} y1={spec.roofY} x2={heightGuideX} y2={GROUND_Y} stroke={theme.colors.contour} strokeWidth={1.5} />
          <Line x1={heightGuideX - 5} y1={spec.roofY} x2={heightGuideX + 5} y2={spec.roofY} stroke={theme.colors.contour} strokeWidth={1.5} />
          <Line x1={heightGuideX - 5} y1={GROUND_Y} x2={heightGuideX + 5} y2={GROUND_Y} stroke={theme.colors.contour} strokeWidth={1.5} />
          <SvgText
            x={heightGuideX - 8}
            y={(spec.roofY + GROUND_Y) / 2}
            fontSize={11}
            fill={theme.colors.inkMuted}
            textAnchor="end"
            alignmentBaseline="middle"
          >
            {formatLength(heightM, unit)}
          </SvgText>

          {/* Length bracket */}
          <Line x1={spec.leftX} y1={lengthGuideY} x2={spec.rightX} y2={lengthGuideY} stroke={theme.colors.contour} strokeWidth={1.5} />
          <Line x1={spec.leftX} y1={lengthGuideY - 5} x2={spec.leftX} y2={lengthGuideY + 5} stroke={theme.colors.contour} strokeWidth={1.5} />
          <Line x1={spec.rightX} y1={lengthGuideY - 5} x2={spec.rightX} y2={lengthGuideY + 5} stroke={theme.colors.contour} strokeWidth={1.5} />
          <SvgText
            x={(spec.leftX + spec.rightX) / 2}
            y={lengthGuideY + 16}
            fontSize={11}
            fill={theme.colors.inkMuted}
            textAnchor="middle"
          >
            {formatLength(lengthM, unit)}
          </SvgText>

          {/* Weight — no natural axis on a side profile, so it rides as a small badge instead of a third bracket. */}
          <SvgText x={spec.rightX} y={spec.roofY - 8} fontSize={11} fill={theme.colors.inkMuted} textAnchor="end">
            {formatWeight(weightKg, unit)}
          </SvgText>
        </>
      )}
    </Svg>
  );
}
