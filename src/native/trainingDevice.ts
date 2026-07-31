import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * React 与 Android 原生设备层之间的稳定边界。
 * 当前为浏览器可运行的预览实现；接入 Capacitor 后以同名 Kotlin 插件替换。
 */
export type DeviceMetric = {
  recordedAt: string;
  heartRate?: number;
  spo2?: number;
  power?: number;
  speed?: number;
  resistance?: number;
};

export type DeviceStatus = "disconnected" | "connecting" | "connected" | "error";

export interface TrainingDeviceBridge {
  connect(device: "backpack" | "bike"): Promise<DeviceStatus>;
  disconnect(device: "backpack" | "bike"): Promise<void>;
  startSession(sessionId: string): Promise<void>;
  stopSession(sessionId: string): Promise<void>;
  subscribeMetrics(listener: (metric: DeviceMetric) => void): () => void;
}

type NativeTrainingDevice = {
  connect(options: { device: "backpack" | "bike" }): Promise<{ status: DeviceStatus }>;
  disconnect(options: { device: "backpack" | "bike" }): Promise<void>;
  startSession(options: { sessionId: string }): Promise<void>;
  stopSession(options: { sessionId: string }): Promise<void>;
};

const nativeTrainingDevice = registerPlugin<NativeTrainingDevice>("TrainingDevice");

export const demoTrainingDevice: TrainingDeviceBridge = {
  async connect() { return "connected"; },
  async disconnect() { /* Kotlin 插件接入后在此断开 BLE 连接 */ },
  async startSession() { /* Kotlin 插件接入后开始设备采集 */ },
  async stopSession() { /* Kotlin 插件接入后停止设备采集 */ },
  subscribeMetrics() { return () => undefined; }
};

export const trainingDevice: TrainingDeviceBridge = Capacitor.isNativePlatform()
  ? {
      async connect(device) { return (await nativeTrainingDevice.connect({ device })).status; },
      async disconnect(device) { await nativeTrainingDevice.disconnect({ device }); },
      async startSession(sessionId) { await nativeTrainingDevice.startSession({ sessionId }); },
      async stopSession(sessionId) { await nativeTrainingDevice.stopSession({ sessionId }); },
      subscribeMetrics() { return () => undefined; }
    }
  : demoTrainingDevice;
