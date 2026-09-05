import Svg, { Circle, Path, Rect } from "react-native-svg";

import { kidsTheme } from "../../constants/kidsTheme";
import type { FactCategory } from "../../mocks/kidsFacts";

interface KidIllustrationProps {
  category: FactCategory;
  size?: number;
}

/**
 * Simple geometric shapes, not sourced art — a "cut paper" style consistent
 * with `VehicleSilhouette`, sized for a young reader rather than detailed
 * enough to need real illustration.
 */
export function KidIllustration({ category, size = 64 }: KidIllustrationProps) {
  if (category === "animal") {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx={50} cy={55} r={30} fill={kidsTheme.leaf} />
        <Circle cx={35} cy={30} r={12} fill={kidsTheme.leaf} />
        <Circle cx={65} cy={30} r={12} fill={kidsTheme.leaf} />
        <Circle cx={40} cy={50} r={5} fill="#FFFFFF" />
        <Circle cx={60} cy={50} r={5} fill="#FFFFFF" />
        <Circle cx={50} cy={65} r={6} fill={kidsTheme.ink} opacity={0.3} />
      </Svg>
    );
  }

  if (category === "plante") {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect x={45} y={60} width={10} height={30} rx={4} fill={kidsTheme.ink} opacity={0.4} />
        <Circle cx={50} cy={45} r={28} fill={kidsTheme.leaf} />
        <Circle cx={30} cy={55} r={16} fill={kidsTheme.leaf} />
        <Circle cx={70} cy={55} r={16} fill={kidsTheme.leaf} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={25} y={45} width={50} height={40} fill={kidsTheme.sky} />
      <Path d="M 15 45 L 50 15 L 85 45 Z" fill={kidsTheme.berry} />
      <Rect x={44} y={62} width={12} height={23} fill="#FFFFFF" />
    </Svg>
  );
}
