// Everything below is plain JSON-serializable data — no process.env, no
// computed values. This used to need JS to pass the Mapbox download token
// via `process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN` into the @rnmapbox/maps
// plugin's `RNMapboxMapsDownloadToken` option. That option is deprecated —
// it bakes the raw token into android/gradle.properties (and ios/Podfile)
// on disk — and both the Gradle build script and the iOS podspec already
// read `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` straight from the environment on
// their own, so the option (and the JS this file needed to reach it) is
// gone. Nothing here still requires app.config.js over app.json.
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
    "@rnmapbox/maps",
    "@react-native-community/datetimepicker",
  ],
});
