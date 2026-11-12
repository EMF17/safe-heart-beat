import type { CapacitorConfig } from "@capacitor/cli";

// The native app loads the live Pulse site, so server features (alerts, sync) keep working
// and every published update reaches phone users without a new store release.
const config: CapacitorConfig = {
  appId: "app.pulsecheckin.mobile",
  appName: "Pulse",
  webDir: "capacitor-www",
  server: {
    url: "https://pulse-checkin.app/app",
    cleartext: false,
    errorPath: "index.html",
  },
};

export default config;
