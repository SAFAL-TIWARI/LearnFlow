
import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import YearSelector from './YearSelector';
import SemesterSelector from './SemesterSelector';
import BranchSelector from './BranchSelector';
import SubjectSelector from './SubjectSelector';
import MaterialSelector from './MaterialSelector';
import ResourceFiles from './ResourceFiles';
import FadeInElement from './FadeInElement';

const AcademicContent: React.FC = () => {
  const { state, resetSelections } = useAcademic();
  
  return (
    <div id="academic-resources" className="py-16 bg-gray-50 dark:bg-gray-900 min-h-[600px] scroll-mt-16000000000000000">
      <div className="container mx-auto px-4">
        <div className="max-w-1xl mx-auto">
          <div className="mb-6">
            <FadeInElement delay={50} direction="up" distance={20} duration={600}>
              <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">Academic Resources</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Find all the materials you need by selecting your year, semester, branch, and subject.
              </p>
            </FadeInElement>
            
            {/* Breadcrumb navigation */}
            {state.selectedYear !== null && (
              <div className="flex flex-wrap items-center space-x-2 text-sm mb-8">
                <button 
                  onClick={() => resetSelections()}
                  className="text-learnflow-600 dark:text-learnflow-400 hover:underline font-medium"
                >
                  Resources
                </button>
                
                {state.selectedYear && (
                  <>
                    <span className="text-gray-400">/</span>
                    <button 
                      onClick={() => resetSelections('year')}
                      className="text-learnflow-600 dark:text-learnflow-400 hover:underline font-medium"
                    >
                      Year {state.selectedYear}
                    </button>
                  </>
                )}
                
                {state.selectedSemester && (
                  <>
                    <span className="text-gray-400">/</span>
                    <button 
                      onClick={() => resetSelections('semester')}
                      className="text-learnflow-600 dark:text-learnflow-400 hover:underline font-medium"
                    >
                      Semester {state.selectedSemester}
                    </button>
                  </>
                )}
                
                {state.selectedBranch && (
                  <>
                    <span className="text-gray-400">/</span>
                    <button 
                      onClick={() => resetSelections('branch')}
                      className="text-learnflow-600 dark:text-learnflow-400 hover:underline font-medium"
                    >
                      {state.selectedBranch.toUpperCase()}
                    </button>
                  </>
                )}
                
                {state.selectedSubject && (
                  <>
                    <span className="text-gray-400">/</span>
                    <button 
                      onClick={() => resetSelections('subject')}
                      className="text-learnflow-600 dark:text-learnflow-400 hover:underline font-medium"
                    >
                      {state.selectedSubject}
                    </button>
                  </>
                )}
                
                {state.selectedMaterial && (
                  <>
                    <span className="text-gray-400">/</span>
                    <button 
                      onClick={() => resetSelections('material')}
                      className="text-learnflow-600 dark:text-learnflow-400 hover:underline font-medium"
                    >
                      {state.selectedMaterial}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          <FadeInElement delay={150} direction="up" distance={30} duration={800}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <YearSelector />
              <SemesterSelector />
              <BranchSelector />
              <SubjectSelector />
              <MaterialSelector />
              <ResourceFiles />
            </div>
          </FadeInElement>
        </div>
      </div>
    </div>
  );
};

export default AcademicContent;
