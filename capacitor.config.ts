import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.xinkang.trainingpad",
  appName: "心康伴侣训练端",
  webDir: "dist",
  android: {
    // The current integration server exposes HTTP/WS only. Switch this back to
    // false after the production gateway provides HTTPS/WSS.
    allowMixedContent: true,
    backgroundColor: "#eef4f8"
  },
  // Keep the embedded page and the current test WebSocket on the same security
  // level. Production must remove this override and use an HTTPS/WSS gateway.
  server: {
    androidScheme: "http"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
