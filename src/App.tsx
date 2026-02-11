import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { RunningScreen } from './components/RunningScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { useSession } from './hooks/useSession';
import { loadModels } from './utils/faceDetection';
import { exportToCSV } from './utils/csvExport';
import { AppScreen } from './types';

function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  const {
    sessionData,
    error,
    detectionStatus,
    startSession,
    stopSession,
    setVideoElement,
  } = useSession();

  useEffect(() => {
    async function initModels() {
      try {
        setIsLoadingModels(true);
        await loadModels();
        setModelsReady(true);
      } catch (err) {
        console.error('Failed to load models:', err);
      } finally {
        setIsLoadingModels(false);
      }
    }

    initModels();
  }, []);

  const handleStart = async () => {
    if (!modelsReady) {
      alert('Models are still loading. Please wait...');
      return;
    }

    startSession();
    setScreen('running');
  };

  const handleStop = () => {
    stopSession();
    setScreen('summary');
  };

  const handleExport = () => {
    exportToCSV(sessionData.persons, sessionData.startTime);
  };

  const handleNewSession = () => {
    setScreen('home');
  };

  return (
    <>
      {screen === 'home' && (
        <HomeScreen onStart={handleStart} isLoading={isLoadingModels || !modelsReady} />
      )}

      {screen === 'running' && (
        <RunningScreen
          onStop={handleStop}
          onVideoReady={setVideoElement}
          stats={sessionData.stats}
          detectionStatus={detectionStatus}
        />
      )}

      {screen === 'summary' && (
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
