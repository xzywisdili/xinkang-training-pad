import { useState } from "react";
import { PatientApp } from "./patient/PatientApp";
import { initialPublishedTrainingVideos } from "./trainingVideos";
import type { TrainingState } from "./types";

/** 训练端 Pad 独立入口：不包含医生 Web 菜单、角色权限与视频后台。 */
export default function App() {
  const [trainingState, setTrainingState] = useState<TrainingState>("ready");
  const [anomaly, setAnomaly] = useState(false);

  return (
    <PatientApp
      onExit={() => window.location.reload()}
      trainingState={trainingState}
      setTrainingState={setTrainingState}
      anomaly={anomaly}
      setAnomaly={setAnomaly}
      publishedTrainingVideos={initialPublishedTrainingVideos}
    />
  );
}
