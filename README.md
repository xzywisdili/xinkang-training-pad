# 心康伴侣训练端 Pad（Android）

从 `xinkang-companion-clinical-demo` 拆出的独立训练端工程。它保留院内训练所需的身份确认/建档、运动选择、处方核对、设备检查、心理评估、血压模式、功率车训练、视频跟练和训练结果；不含医生 Web、医护账号、权限后台、视频资源管理，以及患者小程序应承载的日历、报告和个人档案入口。

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

本工程当前使用脱敏初始数据和预览设备状态。它可以直接用于 Web UI 调试；真实接口与 Android 原生设备插件需要在后续联调阶段接入。
# xinkang-training-pad
