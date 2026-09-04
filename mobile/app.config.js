// Dynamic config instead of app.json: the Mapbox download token (Maven
// credentials for the native SDK itself, not the runtime public token) has
// to reach the @rnmapbox/maps config plugin at prebuild time, and app.json
// can't read process.env — only a JS config file can.
module.exports = ({ config }) => ({
  ...config,
  name: "roovia",
  slug: "roovia",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/Logo.png",
  scheme: "roovia",
  userInterfaceStyle: "automatic",
  platforms: ["ios", "android"],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.roovia",
    infoPlist: {
      UIStatusBarHidden: true,
      UIViewControllerBasedStatusBarAppearance: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/Logo.png",
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
      },
    },
    package: "com.anonymous.roovia",
  },
  web: {
    output: "static",
    favicon: "./assets/images/Logo.png",
  },
  plugins: [
    ["expo-router", { root: "./src/app" }],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#F5F5F5",
        image: "./assets/images/Logo.png",
        imageWidth: 120,
        dark: {
          backgroundColor: "#0B0D0E",
          image: "./assets/images/Logo.png",
        },
      },
    ],
    "expo-font",
    "expo-web-browser",
    "./plugins/withTransparentNavigationBar",
    "./plugins/withTransparentStatusBar",
    "./plugins/withReleaseSigning",
    "./plugins/withDebugSigning",
    "expo-secure-store",
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsDownloadToken: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN,
      },
    ],
  ],
});
