import { LuDownload, LuUsers, LuBaby, LuUser, LuTrash2 } from "react-icons/lu";
import { SessionData } from "../types";
import { clearFaceMemory } from "../utils/faceMemory";

interface SummaryScreenProps {
  sessionData: SessionData;
  onExport: () => void;
  onNewSession: () => void;
}

export function SummaryScreen({
  sessionData,
  onExport,
  onNewSession,
}: SummaryScreenProps) {
  const { stats, startTime, endTime, persons } = sessionData;

  const formatDuration = () => {
    if (!endTime) return "N/A";
    const duration = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleClearStorage = async () => {
    if (
      window.confirm(
        "⚠️ This will clear all stored face records. You won't be able to recognize returning persons. Continue?",
      )
    ) {
      try {
        await clearFaceMemory();
        alert("✅ Face memory cleared successfully!");
      } catch (err) {
        console.error("Error clearing face memory:", err);
        alert("❌ Failed to clear face memory");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <LuUsers className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Session Complete
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Duration: {formatDuration()}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <LuUsers className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                {stats.uniquePersons}
              </div>
              <div className="text-sm text-gray-600 mt-1">Unique Persons</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <LuUsers className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalAppearances}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Total Appearances
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <LuBaby className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                {stats.children}
              </div>
              <div className="text-sm text-gray-600 mt-1">Children</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <LuUser className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                {stats.adults}
              </div>
              <div className="text-sm text-gray-600 mt-1">Adults</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              {/* <LuUserCircle className="w-5 h-5 mr-2" /> */}
              Gender Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Male</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.males}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Female</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.females}
                </div>
              </div>
            </div>
          </div>

          {persons.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Recent Detections
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {persons
                  .slice(-5)
                  .reverse()
                  .map((person) => (
                    <div
                      key={person.id}
                      className="bg-white rounded p-3 flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          {person.gender === "male" ? "Male" : "Female"}
                        </span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span className="text-gray-600">
                          {person.ageGroup === "child" ? "Child" : "Adult"}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        {person.appearances} appearance
                        {person.appearances > 1 ? "s" : ""}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={onExport}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <LuDownload className="w-5 h-5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={onNewSession}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <span>New Session</span>
              </button>
            </div>

            <button
              onClick={handleClearStorage}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <LuTrash2 className="w-5 h-5" />
              <span>Clear Face Memory</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
