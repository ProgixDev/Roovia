import type { ImageSourcePropType } from "react-native";

function unsplash(photoId: string): ImageSourcePropType {
  return { uri: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=500&q=70` };
}

/** Reused across every journal entry that needs a photo stand-in — same verified-free set as the rest of this pass, not a fresh research round for content that mainly demonstrates the timeline shape. */
export const JOURNAL_PHOTOS: ImageSourcePropType[] = [
  unsplash("photo-1685239159517-8a345f04ae02"),
  unsplash("photo-1695609861021-91cba5246953"),
  unsplash("photo-1736319552159-3b8a3ed1e17f"),
  unsplash("photo-1762854215339-55b9701f7f84"),
  unsplash("photo-1676634277252-047112f14b60"),
];
