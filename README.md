# 心康伴侣训练端 Pad（Android）

以现有患者训练 UI 为产品外壳，复用 `mem-sports-rehabilitation-master` 中已经在目标功率车验证过的设备连接实现。当前实车验证版本不依赖功率车模拟器、模拟后端或患者云端校验，直接在车载 Android 9 平板上初始化功率车并读取真实运动数据。

## MacBook 浏览器调试

```bash
npm install
npm run dev
```

打开 Vite 输出的本地地址可调试 UI 和流程。浏览器中不会加载厂商功率车 SDK，真实设备数据必须安装 APK 后在车载平板验证。

## 生成 Android 容器

首次执行：

```bash
npx cap add android
npm run cap:sync
npm run cap:open
```

`cap:open` 会调用 Android Studio。Android Studio 中可使用 Android 模拟器或 USB 连接的 Android 平板运行；每次前端变更后执行 `npm run cap:sync` 再运行。

Android Debug 构建还需要 Android Studio 自带的 JDK 和 Android SDK。模拟器只适合验证布局；厂商串口库只包含 ARM 架构，真实功率车连接必须使用车载实体平板验证。

## Windows 构建 APK

```powershell
cd D:\Projects\MEM\xinkang-training-pad-android
git pull
npm install
npm run build
npx cap sync android

$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
cd android
.\gradlew.bat assembleDebug
```

APK 产物：

```text
D:\Projects\MEM\xinkang-training-pad-android\android\app\build\outputs\apk\debug\app-debug.apk
```

## 架构边界

- React：页面、训练流程和真实功率车指标展示。
- Capacitor：将 Web 构建产物装入 Android 应用，并提供 JavaScript 与原生层通信桥。
- Kotlin 原生插件：初始化已验证的功率车 SDK，控制开始/暂停/继续/停止，并轮询真实指标。
- 厂商设备层：JAR 与串口 `.so` 原样取自 `mem-sports-rehabilitation-master`，不自行猜测或重写协议。

当前实车数据链：

```text
功率车控制板
  → 车载 Android 平板串口
  → mem-sports 已验证的功率车 SDK
  → TrainingDevicePlugin
  → React 训练界面
```

实时字段包括运动时间、距离、热量、心率、速度、踏频、功率和阻力档位。SDK 与原厂应用可能独占同一个串口，实车测试前应完全退出原厂功率车应用。

## 当前状态

版本 `1.1-real-bike` 已完成真实功率车 SDK、原生桥接和 UI 数据映射。Web 构建及 Capacitor 同步已验证；最终 Android 原生编译与数据准确性需在 Windows 和目标车载平板验证。当前版本用于实车技术联调，不作为无人值守的临床控制软件。
# xinkang-training-pad
