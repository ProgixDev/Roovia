import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as {
  apiBaseUrl?: string;
};

export const config = {
  /** Base URL of the API server. Set via app.json `extra.apiBaseUrl`; defaults to localhost for dev. */
  apiBaseUrl: extra?.apiBaseUrl ?? "http://localhost:3000/api/v1",
} as const;
