
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
  const semesters = [
    { number: semesterStart, label: '1st Sem' },
    { number: semesterStart + 1, label: '2nd Sem' },
  ];
  
  return (
    <div className="mb-8 animate-slide-in">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Select Semester</h2>
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
  );
};

export default SemesterSelector;
