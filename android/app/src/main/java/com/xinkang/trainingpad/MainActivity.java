package com.xinkang.trainingpad;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TrainingDevicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
