package com.xinkang.trainingpad

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * 原生设备适配层的起点。
 * 实际接入时在此实现 BLE 扫描、连接、厂商协议解析、重连和指标事件推送；
 * 不将设备协议细节暴露给 React 页面。
 */
@CapacitorPlugin(name = "TrainingDevice")
class TrainingDevicePlugin : Plugin() {
    @PluginMethod
    fun connect(call: PluginCall) {
        val device = call.getString("device")
        if (device !in setOf("backpack", "bike")) {
            call.reject("device 必须是 backpack 或 bike")
            return
        }
        call.resolve(JSObject().put("status", "connected").put("mode", "stub"))
    }

    @PluginMethod
    fun disconnect(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun startSession(call: PluginCall) {
        call.resolve(JSObject().put("status", "started"))
    }

    @PluginMethod
    fun stopSession(call: PluginCall) {
        call.resolve(JSObject().put("status", "stopped"))
    }
}
