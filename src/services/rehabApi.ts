import { Capacitor } from "@capacitor/core";

export type RehabPatient = {
  user_id: string;
  patient_id?: string | null;
  full_name?: string | null;
  gender?: string | null;
  age?: number | null;
  date_of_birth?: string | null;
  rehab_phase?: string | null;
  risk_level?: string | null;
  resting_heart_rate?: number | null;
  at_heart_rate?: number | null;
  peak_heart_rate?: number | null;
  exercise_count?: number;
  last_exercise_date?: string | null;
};

export type RehabPrescription = {
  id: number;
  patient_user_id: string;
  prescription_code?: string | null;
  status: string;
  plan_data?: Record<string, unknown> | null;
  doctor_full_name?: string | null;
  signed_by?: string | null;
  signed_at?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;
  cycle_status?: string | null;
};

export type ExerciseRecord = {
  record_id: string;
  exercise_type?: string;
  start_time?: string | null;
  duration_min?: number | null;
  calories?: string | number | null;
  max_heart_rate?: number | null;
  avg_heart_rate?: number | null;
  target_hr_duration?: number | null;
  target_hr_times?: number | null;
  satisfaction?: number | null;
  score?: number | null;
  prescription_id?: number | null;
};

export type BikeMetric = {
  record_id?: string;
  timestamp_ms?: number;
  sequence?: number;
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  speed?: number;
  distance?: number;
  power?: number;
  resistance?: number;
  calories?: number;
  spo2?: number;
  cadence?: number;
  stage?: string;
};

export type ExerciseRecordDetail = BikeMetric & { id?: number };
export type ExerciseReport = ExerciseRecord & { details: ExerciseRecordDetail[] };

export type BikeRealtimeEvent = {
  type: "connected" | "start" | "sample" | "end" | "error";
  metric?: BikeMetric;
  message?: string;
};

const configuredApiBase = import.meta.env.VITE_REHAB_API_BASE_URL?.trim();
const defaultRemoteApiBase = "http://123.57.205.29:8000";
export const rehabApiBaseUrl = (configuredApiBase || (Capacitor.isNativePlatform() ? defaultRemoteApiBase : "")).replace(/\/$/, "");
const hospitalId = import.meta.env.VITE_REHAB_HOSPITAL_ID?.trim() || "10001";
const configuredToken = import.meta.env.VITE_PAD_API_TOKEN?.trim() || "";

function apiUrl(path: string) {
  return `${rehabApiBaseUrl}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (configuredToken) headers.set("Authorization", `Bearer ${configuredToken}`);
  const response = await fetch(apiUrl(path), { ...init, headers, cache: "no-store" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { detail?: string; message?: string };
    const message = body.detail || body.message;
    throw new Error(message ? `${message}（${response.status}）` : `后端请求失败（${response.status}）`);
  }
  return response.json() as Promise<T>;
}

function normalizedRecordNumber(value: string) {
  return value.trim().replace(/\s+/g, "");
}

function patientShortId(patient: RehabPatient) {
  const parts = patient.user_id.split("_");
  return patient.patient_id || parts[parts.length - 1] || patient.user_id;
}

export async function findPatientByRecordNumber(recordNumber: string) {
  const normalized = normalizedRecordNumber(recordNumber);
  if (!normalized) throw new Error("请输入病例号或病案号");
  const patients = await requestJson<RehabPatient[]>(`/api/patients?hospital_id=${encodeURIComponent(hospitalId)}&size=500`);
  const patient = patients.find((item) => item.user_id === normalized || patientShortId(item) === normalized);
  if (!patient) throw new Error("云端患者库未找到该病案号，请先由医护 Web 端完成建档");
  const detail = await requestJson<RehabPatient>(`/api/patients/${encodeURIComponent(patient.user_id)}`);
  return { ...patient, ...detail, patient_id: patientShortId(patient) };
}

export async function listPatientExercises(patientUserId: string) {
  return requestJson<ExerciseRecord[]>(`/api/exercises/${encodeURIComponent(patientUserId)}`);
}

export async function getExerciseReport(patientUserId: string, recordId: string) {
  return requestJson<ExerciseReport>(`/api/exercises/${encodeURIComponent(patientUserId)}/${encodeURIComponent(recordId)}`);
}

export async function getLatestSignedPrescription(patientUserId: string) {
  try {
    const prescriptions = await requestJson<RehabPrescription[]>(`/api/prescriptions/${encodeURIComponent(patientUserId)}`);
    return prescriptions
      .filter((item) => item.status === "completed" && Boolean(item.signed_at || item.signed_by))
      .sort((left, right) => String(right.signed_at || right.valid_from || "").localeCompare(String(left.signed_at || left.valid_from || "")))[0] ?? null;
  } catch (error) {
    if (error instanceof Error && /401|403|404|Not authenticated|credentials|未登录|token\s*缺失|无有效\s*token/i.test(error.message)) return null;
    throw error;
  }
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeMetric(message: Record<string, unknown>): BikeMetric {
  const payload = (message.data && typeof message.data === "object" ? message.data : message) as Record<string, unknown>;
  return {
    record_id: String(payload.record_id ?? payload.recordId ?? "") || undefined,
    timestamp_ms: numberValue(payload.timestamp_ms ?? payload.timestampMs),
    sequence: numberValue(payload.sequence),
    heart_rate: numberValue(payload.heart_rate ?? payload.heartRate),
    systolic_bp: numberValue(payload.systolic_bp ?? payload.systolicBp),
    diastolic_bp: numberValue(payload.diastolic_bp ?? payload.diastolicBp),
    speed: numberValue(payload.speed),
    distance: numberValue(payload.distance),
    power: numberValue(payload.power),
    resistance: numberValue(payload.resistance),
    calories: numberValue(payload.calories),
    spo2: numberValue(payload.spo2),
    cadence: numberValue(payload.cadence ?? payload.cadence_rpm ?? payload.cadenceRpm),
    stage: typeof payload.stage === "string" ? payload.stage : undefined
  };
}

export function subscribeBikeRealtime(patientUserId: string, onEvent: (event: BikeRealtimeEvent) => void) {
  const wsBase = (rehabApiBaseUrl || window.location.origin).replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  let closedByClient = false;
  let retryTimer: number | undefined;
  let socket: WebSocket | undefined;

  const connect = () => {
    socket = new WebSocket(`${wsBase}/ws/watch/${encodeURIComponent(patientUserId)}`);
    socket.onopen = () => onEvent({ type: "connected" });
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as Record<string, unknown>;
        const rawType = String(message.type ?? "sample");
        const type = rawType === "start" || rawType === "end" ? rawType : "sample";
        onEvent({ type, metric: normalizeMetric(message) });
      } catch {
        onEvent({ type: "error", message: "收到无法解析的功率车数据" });
      }
    };
    socket.onerror = () => onEvent({ type: "error", message: "功率车实时通道连接异常" });
    socket.onclose = () => {
      if (closedByClient) return;
      onEvent({ type: "error", message: "功率车实时通道已断开，正在重连" });
      retryTimer = window.setTimeout(connect, 3000);
    };
  };

  connect();
  return () => {
    closedByClient = true;
    if (retryTimer) window.clearTimeout(retryTimer);
    socket?.close();
  };
}
