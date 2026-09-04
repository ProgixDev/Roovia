export interface VehicleDimensions {
  heightM: number;
  weightKg: number;
  lengthM: number;
}

export interface FitConstraint {
  maxHeightM?: number;
  maxWeightKg?: number;
  maxLengthM?: number;
}

export function fits(vehicle: VehicleDimensions, constraint: FitConstraint): boolean {
  return fitIssues(vehicle, constraint).length === 0;
}

/** Empty when it fits — every failing dimension gets its own plain-language reason for `IncompatibilityBanner`. */
export function fitIssues(vehicle: VehicleDimensions, constraint: FitConstraint): string[] {
  const issues: string[] = [];

  if (constraint.maxHeightM !== undefined && vehicle.heightM > constraint.maxHeightM) {
    issues.push(`Hauteur ${vehicle.heightM.toFixed(2)} m > limite ${constraint.maxHeightM.toFixed(2)} m`);
  }
  if (constraint.maxWeightKg !== undefined && vehicle.weightKg > constraint.maxWeightKg) {
    issues.push(`Poids ${vehicle.weightKg} kg > limite ${constraint.maxWeightKg} kg`);
  }
  if (constraint.maxLengthM !== undefined && vehicle.lengthM > constraint.maxLengthM) {
    issues.push(`Longueur ${vehicle.lengthM.toFixed(2)} m > limite ${constraint.maxLengthM.toFixed(2)} m`);
  }

  return issues;
}
