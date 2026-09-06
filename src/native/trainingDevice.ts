import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";

/**
 * React 与 Android 原生设备层之间的稳定边界。
 * 当前为浏览器可运行的预览实现；接入 Capacitor 后以同名 Kotlin 插件替换。
 */
export type DeviceMetric = {
  timestamp_ms?: number;
  duration_seconds?: number;
  heart_rate?: number;
  spo2?: number;
  power?: number;
  speed?: number;
  resistance?: number;
  cadence?: number;
  distance?: number;
  calories?: number;
};

export type DeviceStatus = "disconnected" | "connecting" | "connected" | "error";

export interface TrainingDeviceBridge {
  connect(): Promise<DeviceStatus>;
  disconnect(): Promise<void>;
  startSession(sessionId: string): Promise<void>;
  pauseSession(): Promise<void>;
  resumeSession(): Promise<void>;
  stopSession(sessionId: string): Promise<void>;
  subscribeMetrics(listener: (metric: DeviceMetric) => void): () => void;
  subscribeErrors(listener: (message: string) => void): () => void;
}

type NativeTrainingDevice = {
  connect(options: { device: "bike" }): Promise<{ status: DeviceStatus; mode?: string; serialPath?: string; sdkVersion?: number }>;
  disconnect(options?: Record<string, never>): Promise<void>;
  startSession(options: { sessionId: string }): Promise<void>;
  pauseSession(options?: Record<string, never>): Promise<void>;
  resumeSession(options?: Record<string, never>): Promise<void>;
  stopSession(options: { sessionId: string }): Promise<void>;
  addListener(eventName: "metric", listener: (metric: DeviceMetric) => void): Promise<PluginListenerHandle>;
  addListener(eventName: "deviceError", listener: (event: { message?: string }) => void): Promise<PluginListenerHandle>;
};

const nativeTrainingDevice = registerPlugin<NativeTrainingDevice>("TrainingDevice");

export const demoTrainingDevice: TrainingDeviceBridge = {
  async connect() { return "connected"; },
  async disconnect() { /* 浏览器仅用于预览 UI */ },
  async startSession() { /* 浏览器仅用于预览 UI */ },
  async pauseSession() { /* 浏览器仅用于预览 UI */ },
  async resumeSession() { /* 浏览器仅用于预览 UI */ },
  async stopSession() { /* 浏览器仅用于预览 UI */ },
  subscribeMetrics() { return () => undefined; },
  subscribeErrors() { return () => undefined; }
};

function nativeSubscription(register: () => Promise<PluginListenerHandle>) {
  let removed = false;
  let handle: PluginListenerHandle | undefined;
  void register().then((listenerHandle) => {
    handle = listenerHandle;
    if (removed) void handle.remove();
  });
  return () => {
    removed = true;
    if (handle) void handle.remove();
  };
}

export const trainingDevice: TrainingDeviceBridge = Capacitor.isNativePlatform()
  ? {
      async connect() { return (await nativeTrainingDevice.connect({ device: "bike" })).status; },
      async disconnect() { await nativeTrainingDevice.disconnect(); },
      async startSession(sessionId) { await nativeTrainingDevice.startSession({ sessionId }); },
      async pauseSession() { await nativeTrainingDevice.pauseSession(); },
      async resumeSession() { await nativeTrainingDevice.resumeSession(); },
      async stopSession(sessionId) { await nativeTrainingDevice.stopSession({ sessionId }); },
      subscribeMetrics(listener) { return nativeSubscription(() => nativeTrainingDevice.addListener("metric", listener)); },
      subscribeErrors(listener) { return nativeSubscription(() => nativeTrainingDevice.addListener("deviceError", (event) => listener(event.message || "功率车数据读取异常"))); }
    }
  : demoTrainingDevice;
