import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.xinkang.trainingpad",
  appName: "心康伴侣训练端",
  webDir: "dist",
  android: {
    allowMixedContent: false,
    backgroundColor: "#eef4f8"
  }
};

export default config;
