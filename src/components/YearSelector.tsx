
import React from 'react';
import { useAcademic } from '../context/AcademicContext';

const YearSelector: React.FC = () => {
  const { state, setYear } = useAcademic();

  // Years with emoji indicators
  const years = [
    { number: 1, emoji: '📘' },
    { number: 2, emoji: '📗' },
    { number: 3, emoji: '📙' },
    { number: 4, emoji: '📕' },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Select Your Year</h2>
      <div className="flex flex-wrap gap-3">
        {years.map(({ number, emoji }) => (
          <button
            key={number}
            onClick={() => setYear(number)}
            className={`btn-year ${
              state.selectedYear === number ? 'btn-year-active' : 'btn-year-inactive'
            } font-ogg`}
          >
            <span className="mr-1">{emoji}</span>
            {number}
            <sup>{number === 1 ? 'st' : number === 2 ? 'nd' : number === 3 ? 'rd' : 'th'}</sup> Year
          </button>
        ))}
      </div>

      {/* Info box showing the year-semester mapping */}
      {/* <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-xs">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Year-Semester Mapping:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-gray-700 dark:text-gray-300">📘 1st Year → 1st, 2nd Sem</div>
          <div className="text-gray-700 dark:text-gray-300">📗 2nd Year → 3rd, 4th Sem</div>
          <div className="text-gray-700 dark:text-gray-300">📙 3rd Year → 5th, 6th Sem</div>
          <div className="text-gray-700 dark:text-gray-300">📕 4th Year → 7th, 8th Sem</div>
        </div>
      </div> */}
    </div>
  );
};

export default YearSelector;
