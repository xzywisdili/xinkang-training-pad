package com.xinkang.trainingpad

import android.os.Handler
import android.os.Looper
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.tbtech.lynn.fitness.blh.bike.ControlBlhExerciseBike

/**
 * 海思瑞格功率车原生适配层。
 *
 * 设备接入逻辑直接复用 mem-sports-rehabilitation-master 中已在实车验证的
 * ControlBlhExerciseBike 初始化方式、SDK Key 和轮询取数方式。React 页面只消费
 * 统一指标，不感知厂商 SDK。
 */
@CapacitorPlugin(name = "TrainingDevice")
class TrainingDevicePlugin : Plugin() {
    private val mainHandler = Handler(Looper.getMainLooper())
    private var initialized = false
    private var polling = false
    private lateinit var bike: ControlBlhExerciseBike

    private val metricPoller = object : Runnable {
        override fun run() {
            if (!polling || !initialized) return
            runCatching {
                val data = bike.sportBikeData
                val metric = JSObject().apply {
                    put("timestamp_ms", System.currentTimeMillis())
                    put("duration_seconds", data.sportTime)
                    put("distance", data.distance)
                    put("calories", data.calorie)
                    put("heart_rate", data.heartRate)
                    put("speed", data.speed * 0.1)
                    put("cadence", data.rotateSpeed)
                    put("power", data.power)
                    // 原项目已验证：该设备用 incline 表示脚蹬阻力档位。
                    put("resistance", data.incline)
                }
                notifyListeners("metric", metric)
            }.onFailure { error ->
                notifyListeners("deviceError", JSObject().put("message", error.message ?: "读取功率车数据失败"))
            }
            mainHandler.postDelayed(this, METRIC_INTERVAL_MS)
        }
    }

    private fun ensureInitialized() {
        if (initialized) return
        bike = ControlBlhExerciseBike.getInstance().apply {
            init(context.applicationContext, SDK_KEY)
        }
        initialized = true
    }

    private fun startPolling() {
        if (polling) return
        polling = true
        mainHandler.post(metricPoller)
    }

    private fun stopPolling() {
        polling = false
        mainHandler.removeCallbacks(metricPoller)
    }

    @PluginMethod
    fun connect(call: PluginCall) {
        if (call.getString("device") != "bike") {
            call.reject("当前版本仅支持功率车")
            return
        }
        runCatching {
            ensureInitialized()
            startPolling()
            JSObject().apply {
                put("status", "connected")
                put("mode", "real")
                put("serialPath", bike.serialPath)
                put("sdkVersion", bike.sdkVersion)
            }
        }.onSuccess(call::resolve).onFailure { call.reject("功率车初始化失败：${it.message}", it) }
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        stopPolling()
        if (initialized) runCatching { bike.controlBikeStop() }
        call.resolve()
    }

    @PluginMethod
    fun startSession(call: PluginCall) {
        runCatching {
            ensureInitialized()
            startPolling()
            val result = bike.controlBikeRun()
            JSObject().put("status", "started").put("resultCode", result)
        }.onSuccess(call::resolve).onFailure { call.reject("启动功率车失败：${it.message}", it) }
    }

    @PluginMethod
    fun pauseSession(call: PluginCall) {
        runCatching { bike.controlBikePause() }
            .onSuccess { call.resolve(JSObject().put("status", "paused").put("resultCode", it)) }
            .onFailure { call.reject("暂停功率车失败：${it.message}", it) }
    }

    @PluginMethod
    fun resumeSession(call: PluginCall) {
        runCatching { bike.controlBikeRun() }
            .onSuccess { call.resolve(JSObject().put("status", "started").put("resultCode", it)) }
            .onFailure { call.reject("继续功率车失败：${it.message}", it) }
    }

    @PluginMethod
    fun stopSession(call: PluginCall) {
        runCatching { bike.controlBikeStop() }
            .onSuccess { call.resolve(JSObject().put("status", "stopped").put("resultCode", it)) }
            .onFailure { call.reject("停止功率车失败：${it.message}", it) }
    }

    override fun handleOnDestroy() {
        stopPolling()
        if (initialized) runCatching { bike.controlBikeStop() }
        super.handleOnDestroy()
    }

    companion object {
        private const val SDK_KEY = "tb91a4d0b003f9cf33"
        private const val METRIC_INTERVAL_MS = 500L
    }
}
