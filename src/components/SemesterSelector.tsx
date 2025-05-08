
import React from 'react';
import { useAcademic } from '../context/AcademicContext';

const SemesterSelector: React.FC = () => {
  const { state, setSemester } = useAcademic();
  
  // Only render if a year is selected
  if (state.selectedYear === null) {
    return null;
  }
  
  const year = state.selectedYear;
  
  // Calculate semesters based on year
  const semesterStart = (year - 1) * 2 + 1;
  
  // Get emoji based on year
  const getYearEmoji = (year: number) => {
    switch(year) {
      case 1: return '📘';
      case 2: return '📗';
      case 3: return '📙';
      case 4: return '📕';
      default: return '📚';
    }
  };
  
  const yearEmoji = getYearEmoji(year);
  
  const semesters = [
    { number: semesterStart, label: `${semesterStart}${getSemesterSuffix(semesterStart)} Sem` },
    { number: semesterStart + 1, label: `${semesterStart + 1}${getSemesterSuffix(semesterStart + 1)} Sem` },
  ];
  
  // Helper function to get suffix
  function getSemesterSuffix(num: number) {
    if (num === 1) return 'st';
    if (num === 2) return 'nd';
    if (num === 3) return 'rd';
    return 'th';
  }
  
  return (
    <div className="mb-8 animate-slide-in">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Select Semester for {yearEmoji} Year {year}
      </h2>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
        {/* <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          For Year {year}, you can choose between:
        </div> */}
        
        <div className="flex flex-wrap gap-3">
          {semesters.map(({ number, label }) => (
            <button
              key={number}
              onClick={() => setSemester(number)}
              className={`btn-semester ${
                state.selectedSemester === number ? 'btn-semester-active' : 'btn-semester-inactive'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SemesterSelector;
