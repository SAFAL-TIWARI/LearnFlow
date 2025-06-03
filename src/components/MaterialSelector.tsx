
import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import { materialTypes, subjectsByYearAndSemester } from '../data/academicData';
import { getMaterialIcon } from './Icons';

const MaterialSelector: React.FC = () => {
  const { state, setMaterial } = useAcademic();

  // Only render if subject is selected
  if (!state.selectedSubject) {
    return null;
  }

  // Get the subject name for display
  const getSubjectName = (): string => {
    if (state.selectedYear && state.selectedSemester) {
      const subjects = subjectsByYearAndSemester[state.selectedYear][state.selectedSemester] || [];
      const subject = subjects.find(s => s.code === state.selectedSubject);
      return subject ? subject.name : state.selectedSubject;
    }
    return state.selectedSubject;
  };

  return (
    <div className="mb-8 animate-slide-in">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
        Learning Materials
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select a material type for <span className="font-semibold">{getSubjectName()}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {materialTypes.map((material) => (
          <button
            key={material.id}
            onClick={() => setMaterial(material.id)}
            className={`btn-material ${
              state.selectedMaterial === material.id ? 'btn-material-active' : 'btn-material-inactive'
            } font-larish`}
          >
            {/* {getMaterialIcon(material.icon)} */}
            {material.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaterialSelector;
