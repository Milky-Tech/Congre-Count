import { Download, Home, Users, Baby, User, UserCircle } from 'lucide-react';
import { SessionData } from '../types';

interface SummaryScreenProps {
  sessionData: SessionData;
  onExport: () => void;
  onNewSession: () => void;
}

export function SummaryScreen({ sessionData, onExport, onNewSession }: SummaryScreenProps) {
  const { stats, startTime, endTime, persons } = sessionData;

  const formatDuration = () => {
    if (!endTime) return 'N/A';
    const duration = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
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
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stats.uniquePersons}</div>
              <div className="text-sm text-gray-600 mt-1">Unique Persons</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stats.totalAppearances}</div>
              <div className="text-sm text-gray-600 mt-1">Total Appearances</div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Baby className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stats.children}</div>
              <div className="text-sm text-gray-600 mt-1">Children</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <User className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stats.adults}</div>
              <div className="text-sm text-gray-600 mt-1">Adults</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <UserCircle className="w-5 h-5 mr-2" />
              Gender Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Male</div>
                <div className="text-2xl font-bold text-gray-900">{stats.males}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Female</div>
                <div className="text-2xl font-bold text-gray-900">{stats.females}</div>
              </div>
            </div>
          </div>

          {persons.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Detections</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {persons.slice(-5).reverse().map((person) => (
                  <div key={person.id} className="bg-white rounded p-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-900">
                        {person.gender === 'male' ? 'Male' : 'Female'}
                      </span>
                      <span className="text-gray-500 mx-2">•</span>
                      <span className="text-gray-600">
                        {person.ageGroup === 'child' ? 'Child' : 'Adult'}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {person.appearances} appearance{person.appearances > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onExport}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onNewSession}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>New Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
