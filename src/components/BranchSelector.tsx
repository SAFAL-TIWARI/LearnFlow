
import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import { branches, branchSubjects } from '../data/academicData';
import { useIsMobile } from '../hooks/use-mobile';

const BranchSelector: React.FC = () => {
  const { state, setBranch } = useAcademic();
  const isMobile = useIsMobile();

  // Only render if year and semester are selected
  if (state.selectedYear === null || state.selectedSemester === null) {
    return null;
  }

  // Get branches that have subjects for the selected year and semester
  const getAvailableBranchIds = () => {
    const year = state.selectedYear;
    const semester = state.selectedSemester;

    if (branchSubjects[year] && branchSubjects[year][semester]) {
      return Object.keys(branchSubjects[year][semester]);
    }

    return [];
  };

  const availableBranchIds = getAvailableBranchIds();

  // Highlight branches that have subjects defined, but show all branches
  return (
    <div className="mb-8 animate-slide-in">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Select Branch</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Year {state.selectedYear}, Semester {state.selectedSemester}
      </p>
      <div className={`${isMobile ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'flex flex-wrap gap-3'}`}>
        {branches.map((branch) => {
          const hasSubjects = availableBranchIds.includes(branch.id);

          return (
            <button
              key={branch.id}
              onClick={() => setBranch(branch.id)}
              className={`btn-branch ${
                state.selectedBranch === branch.id ? 'btn-branch-active' : 'btn-branch-inactive'
              } ${!hasSubjects ? 'opacity-1' : ''} font-ogg ${isMobile ? 'w-full text-center' : ''}`}
              title={hasSubjects ? undefined : "Limited subjects available"}
            >
              {branch.name}
              {!hasSubjects && <span className="ml-1 text-xs"></span>}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {/* * Branches with limited subject data */}
      </div>
    </div>
  );
};

export default BranchSelector;
