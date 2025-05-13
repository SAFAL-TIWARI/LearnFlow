
import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import { branchSubjects, subjectsByYearAndSemester, branches, Subject } from '../data/academicData';

const SubjectSelector: React.FC = () => {
  const { state, setSubject } = useAcademic();

  // Only render if year, semester, and branch are selected
  if (state.selectedYear === null || state.selectedSemester === null || state.selectedBranch === null) {
    return null;
  }

  // Get branch-specific subjects if available
  const getBranchSubjects = (): Subject[] => {
    const year = state.selectedYear;
    const semester = state.selectedSemester;
    const branchId = state.selectedBranch;

    // Check if we have branch-specific subjects for this combination
    if (
      branchSubjects[year] &&
      branchSubjects[year][semester] &&
      branchSubjects[year][semester][branchId]
    ) {
      return branchSubjects[year][semester][branchId];
    }

    // Fallback to legacy subjects if branch-specific ones aren't available
    return subjectsByYearAndSemester[year][semester] || [];
  };

  // Get the selected branch name for display
  const getBranchName = (): string => {
    const branch = branches.find(b => b.id === state.selectedBranch);
    return branch ? branch.name : state.selectedBranch || '';
  };

  const subjects = getBranchSubjects();

  if (subjects.length === 0) {
    return (
      <div className="mb-8 animate-slide-in">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Select Subject</h2>
        <p className="text-gray-600 dark:text-gray-400">
          ⚠️ No subjects found for Year {state.selectedYear}, Semester {state.selectedSemester}, {getBranchName()} branch.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please select a different branch or check back later as we continue to update our curriculum data.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 animate-slide-in">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Select Subject</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Showing subjects for <span className="font-semibold">{getBranchName()}</span> branch
      </p>
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <button
            key={subject.code}
            onClick={() => setSubject(subject.code)}
            className={`btn-subject ${
              state.selectedSubject === subject.code ? 'btn-subject-active' : 'btn-subject-inactive'
            } font-ogg`}
          >
            {subject.code}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {state.selectedSubject && (
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 py-2 px-3 rounded inline-block">
            <strong>{subjects.find(s => s.code === state.selectedSubject)?.name}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelector;
