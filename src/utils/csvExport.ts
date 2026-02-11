import { DetectedPerson } from '../types';

export function exportToCSV(persons: DetectedPerson[], sessionStartTime: Date): void {
  const headers = ['ID', 'Gender', 'AgeGroup', 'EstimatedAge', 'FirstSeen', 'Appearances'];

  const rows = persons.map((person) => [
    person.id,
    person.gender,
    person.ageGroup,
    person.estimatedAge.toFixed(0),
    person.firstSeen.toISOString(),
    person.appearances.toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const timestamp = sessionStartTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `attendance_${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
