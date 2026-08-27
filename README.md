# 心康伴侣训练端 Pad（Android）

以新版 `xinkang-companion-rehab-closed-loop-demo-main` 的患者训练 UI 和闭环思路为产品基线，面向院内 Android Pad 独立交付。Pad 负责患者核验、处方核对、设备检查、训练监测、患者反馈和单次训练报告；医护 Web 继续负责患者建档、处方签署、异常复核和报告管理。

## MacBook 浏览器调试

```bash
npm install
npm run dev
```

打开 Vite 输出的本地地址即可调试绝大多数 UI、流程、Mock 数据和接口适配层。推荐 Chrome DevTools 的 iPad 横屏尺寸（1024 × 768）进行 UI 验收。

## 生成 Android 容器

首次执行：

```bash
npx cap add android
npm run cap:sync
npm run cap:open
```

`cap:open` 会调用 Android Studio。Android Studio 中可使用 Android 模拟器或 USB 连接的 Android 平板运行；每次前端变更后执行 `npm run cap:sync` 再运行。

Android Debug 构建还需要 Android Studio 自带的 JDK、Android SDK 与对应的 emulator/device。模拟器适合验证布局、登录、流程和接口；BLE 扫描、真实功率车/监测背包连接、后台采集与系统权限必须使用实体 Android 平板验证。

## 架构边界

- React：页面、训练流程、表单、报告展示和 API 数据适配。
- Capacitor：将 Web 构建产物装入 Android 应用，并提供 JavaScript 与原生层通信桥。
- Kotlin 原生插件：BLE 设备连接、采样、断连重连、原生 TTS/提示音、后台任务、设备时间同步和安全日志。
- 后端接口：认证、患者/处方/视频读取、训练会话、指标批量上传、异常事件、报告与离线补传。

当前联调数据链：

```text
骑行功率车模拟器 (:3000)
  → 功率车适配器 (:4000)
  → FastAPI / 云 PostgreSQL (:8000)
  → /ws/watch/{patient_user_id}
  → Android Pad 实时训练界面
```

病案号使用患者短号，例如 `1006`；Pad 核验后转换为云库完整 `user_id`，例如 `10001_1006`。训练历史和单次报告读取同事后端的 `/api/exercises/{patient_user_id}` 与 `/api/exercises/{patient_user_id}/{record_id}`，与 Web 报告管理共用同一数据源。

配置见 `.env.example`。开发服务器默认使用 `http://123.57.205.29:8000`；生产必须改为 HTTPS/WSS，并由后端提供 Pad/患者专用鉴权。

`src/native/trainingDevice.ts` 已定义 React 侧设备桥接契约；接入设备时保持该接口不变，再在 Android 工程实现同名 Capacitor Kotlin Plugin。

## 病例号 / 病案号 OCR 接入

将 `.env.example` 复制为 `.env.local`，填写院内 OCR 服务地址。拍照扫描会上传图片至：

```text
POST {VITE_OCR_API_BASE_URL}/ocr/medical-record
Content-Type: multipart/form-data
字段：image
```

服务应返回 `caseNumber` 或 `medicalRecordNumber`（可选 `confidence`）。建议在院内部署 PaddleOCR 服务，仅提取并返回病例号/病案号；Pad 页面始终要求护士人工核对识别结果后才能继续。

## 当前状态

患者核验、功率车实时数据、训练历史和单次训练报告已对接共用 FastAPI/云库。真实 BLE 功率车和监测背包仍需在 Android 原生插件中实现。当前后端尚未给 Pad 开放患者鉴权及已签处方读取权限，因此处方缺失时界面只允许作为设备联调状态使用，不应作为正式临床训练依据。
# xinkang-training-pad
