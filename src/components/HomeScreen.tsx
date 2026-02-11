import { Camera, Users, Shield } from 'lucide-react';

interface HomeScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

export function HomeScreen({ onStart, isLoading }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Attendance Counter
          </h1>
          <p className="text-gray-600">
            Passive people counting with face detection
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3">
            <Camera className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Point Camera at Entrance</h3>
              <p className="text-sm text-gray-600">
                Position your phone to capture people entering the space
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Automatic Detection</h3>
              <p className="text-sm text-gray-600">
                System tracks unique persons and counts appearances automatically
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Privacy Protected</h3>
              <p className="text-sm text-gray-600">
                No images stored - all processing happens on your device
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            This device counts anonymous faces for attendance only. No photos are stored or transmitted.
          </p>
        </div>

        <button
          onClick={onStart}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Models...
            </span>
          ) : (
            'Start Session'
          )}
        </button>
      </div>
    </div>
  );
}
