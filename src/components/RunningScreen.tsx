import { CameraView } from "./CameraView";
import { SessionStats } from "../types";
import { LuBaby, LuCircleStop, LuUser } from "react-icons/lu";

interface RunningScreenProps {
  onStop: () => void;
  onVideoReady: (video: HTMLVideoElement) => void;
  stats: SessionStats;
  detectionStatus: string;
}

export function RunningScreen({
  onStop,
  onVideoReady,
  stats,
  detectionStatus,
}: RunningScreenProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 relative">
        <CameraView onVideoReady={onVideoReady} isActive={true} />

        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">Recording</span>
            </div>
            <button
              onClick={onStop}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <LuCircleStop className="w-5 h-5" />
              <span className="font-semibold">Stop</span>
            </button>
          </div>

          <div className="text-white/90 text-sm">{detectionStatus}</div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <LuUser className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-medium">
                  Total Unique
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.uniquePersons}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <LuUser className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-medium">
                  Appearances
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.totalAppearances}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <LuBaby className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-medium">
                  Children
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.children}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <LuUser className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-medium">
                  Adults
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.adults}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
