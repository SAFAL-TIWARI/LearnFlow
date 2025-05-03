
import React from 'react';
import { useAcademic } from '../context/AcademicContext';

const YearSelector: React.FC = () => {
  const { state, setYear } = useAcademic();
  
  const years = [1, 2, 3, 4];
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Select Your Year</h2>
      <div className="flex flex-wrap gap-3">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setYear(year)}
            className={`btn-year ${
              state.selectedYear === year ? 'btn-year-active' : 'btn-year-inactive'
            }`}
          >
            {year}
            <sup>{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'}</sup> Year
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearSelector;
