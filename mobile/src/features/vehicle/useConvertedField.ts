import { useEffect, useState } from "react";

import type { UnitSystem } from "../../lib/format";

/**
 * Backs one unit-converted numeric field (dimensions, water/fuel capacity).
 * The underlying value always stays SI — only the text shown and parsed
 * here is in the active unit system. Text is its own local state rather
 * than derived fresh from the number on every keystroke: re-deriving would
 * round-trip "2.7" through a formatter mid-type and rewrite it out from
 * under the user before they can type the next digit. It only resyncs from
 * the number when the unit system itself changes.
 */
export function useConvertedField(
  siValue: number,
  onChangeSi: (si: number) => void,
  units: UnitSystem,
  toDisplay: (si: number, units: UnitSystem) => number,
  fromDisplay: (display: number, units: UnitSystem) => number,
  decimals = 2,
) {
  const [text, setText] = useState(() => toDisplay(siValue, units).toFixed(decimals));

  useEffect(() => {
    setText(toDisplay(siValue, units).toFixed(decimals));
    // Only when the unit system changes — see the doc above for why this
    // deliberately excludes `siValue`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  const onChangeText = (next: string) => {
    setText(next);
    const parsed = parseFloat(next.replace(",", "."));
    if (!Number.isNaN(parsed)) {
      onChangeSi(fromDisplay(parsed, units));
    }
  };

  return { text, onChangeText };
}
