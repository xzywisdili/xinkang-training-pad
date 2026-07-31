export type MedicalRecordOcrResult = { caseNumber?: string; medicalRecordNumber?: string; confidence?: number };

/**
 * 院内 OCR 服务契约：POST {VITE_OCR_API_BASE_URL}/ocr/medical-record，multipart 字段名为 image。
 * 服务端部署 PaddleOCR，只返回病例号/病案号及置信度，护士必须在界面复核后才能继续。
 */
export async function recognizeMedicalRecord(image: File): Promise<MedicalRecordOcrResult> {
  const baseUrl = import.meta.env.VITE_OCR_API_BASE_URL;
  if (!baseUrl) throw new Error("未配置 OCR 服务地址");
  const formData = new FormData();
  formData.append("image", image);
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/ocr/medical-record`, { method: "POST", body: formData });
  if (!response.ok) throw new Error("OCR 识别请求失败");
  return response.json() as Promise<MedicalRecordOcrResult>;
}
