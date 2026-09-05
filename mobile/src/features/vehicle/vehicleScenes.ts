import type { VehicleType } from "../../store/vehiclesStore";

// One illustrated "on the road" scene per type, shared by the garage card
// and the wizard's "Ready" finish screen so both show the same artwork for
// a given vehicle. `heavy_truck` has no matching illustration, so it falls
// back to the motorhome scene as the closest "big rig" visual.
export const VEHICLE_SCENE: Record<VehicleType, number> = {
  fourgon: require("../../../assets/images/vehicles/scene-van.png"),
  van: require("../../../assets/images/vehicles/scene-camper-van.png"),
  camping_car: require("../../../assets/images/vehicles/scene-motorhome.png"),
  converted_car: require("../../../assets/images/vehicles/scene-converted-car.png"),
  heavy_truck: require("../../../assets/images/vehicles/scene-motorhome.png"),
};
