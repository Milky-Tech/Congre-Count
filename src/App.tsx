import { useState, useEffect } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { RunningScreen } from "./components/RunningScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { useSession } from "./hooks/useSession";
import { initHuman } from "./utils/humanModel";
import { initFaceDatabase } from "./utils/faceMemory";
import { exportToCSV } from "./utils/csvExport";
import { AppScreen, ModelPreference } from "./types";

function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [modelPreference, setModelPreference] = useState<ModelPreference>("fast");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  const {
    sessionData,
    error,
    detectionStatus,
    startSession,
    stopSession,
    setVideoElement,
  } = useSession(modelPreference);

  useEffect(() => {
    async function prepareAI() {
      try {
        setIsLoadingModels(true);
        console.log("🤖 Starting AI model initialization...");
        console.log("📦 Initializing face database...");
        await initFaceDatabase();
        
        console.log("🧹 Clearing cached face memory on start...");
        const { clearFaceMemory } = await import("./utils/faceMemory");
        await clearFaceMemory();

        if (modelPreference === "fast") {
            await initHuman();
        } else if (modelPreference === "accurate") {
            const { initOnnxModels } = await import("./utils/onnxModel");
            // Load both YOLO/ReID and Human models for accurate+classification
            await Promise.all([initOnnxModels(), initHuman()]);
        }
        console.log("✅ AI models and database ready!");
        setModelsReady(true);
      } catch (err) {
        console.error("❌ Failed to initialize:", err);
      } finally {
        setIsLoadingModels(false);
      }
    }

    setModelsReady(false);
    prepareAI();
  }, [modelPreference]);

  const handleStart = async () => {
    if (!modelsReady) {
      alert("Models are still loading. Please wait...");
      return;
    }

    startSession();
    setScreen("running");
  };

  const handleStop = () => {
    stopSession();
    setScreen("summary");
  };

  const handleExport = () => {
    exportToCSV(sessionData.persons, sessionData.startTime);
  };

  const handleNewSession = () => {
    setScreen("home");
  };

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          onStart={handleStart}
          isLoading={isLoadingModels || !modelsReady}
          modelPreference={modelPreference}
          onChangeModelPreference={setModelPreference}
        />
      )}

      {screen === "running" && (
        <RunningScreen
          onStop={handleStop}
          onVideoReady={setVideoElement}
          stats={sessionData.stats}
          detectionStatus={detectionStatus}
        />
      )}

      {screen === "summary" && (
        <SummaryScreen
          sessionData={sessionData}
          onExport={handleExport}
          onNewSession={handleNewSession}
        />
      )}

      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </>
  );
}

export default App;
