
import React, { createContext, useContext, useState } from 'react';

interface AcademicState {
  selectedYear: number | null;
  selectedSemester: number | null;
  selectedBranch: string | null;
  selectedSubject: string | null;
  selectedMaterial: string | null;
}

interface AcademicContextType {
  state: AcademicState;
  setYear: (year: number) => void;
  setSemester: (semester: number) => void;
  setBranch: (branch: string) => void;
  setSubject: (subject: string) => void;
  setMaterial: (material: string) => void;
  resetSelections: (level?: 'year' | 'semester' | 'branch' | 'subject' | 'material') => void;
}

const initialState: AcademicState = {
  selectedYear: null,
  selectedSemester: null,
  selectedBranch: null,
  selectedSubject: null,
  selectedMaterial: null,
};

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AcademicState>(initialState);

  const setYear = (year: number) => {
    setState({
      ...state,
      selectedYear: year,
      selectedSemester: null,
      selectedBranch: null,
      selectedSubject: null,
      selectedMaterial: null,
    });
  };

  const setSemester = (semester: number) => {
    setState({
      ...state,
      selectedSemester: semester,
      selectedBranch: null,
      selectedSubject: null,
      selectedMaterial: null,
    });
  };

  const setBranch = (branch: string) => {
    setState({
      ...state,
      selectedBranch: branch,
      selectedSubject: null,
      selectedMaterial: null,
    });
  };

  const setSubject = (subject: string) => {
    setState({
      ...state,
      selectedSubject: subject,
      selectedMaterial: null,
    });
  };

  const setMaterial = (material: string) => {
    setState({
      ...state,
      selectedMaterial: material,
    });
  };

  const resetSelections = (level?: 'year' | 'semester' | 'branch' | 'subject' | 'material') => {
    switch (level) {
      case 'year':
        setState(initialState);
        break;
      case 'semester':
        setState({
          ...state,
          selectedSemester: null,
          selectedBranch: null,
          selectedSubject: null,
          selectedMaterial: null,
        });
        break;
      case 'branch':
        setState({
          ...state,
          selectedBranch: null,
          selectedSubject: null,
          selectedMaterial: null,
        });
        break;
      case 'subject':
        setState({
          ...state,
          selectedSubject: null,
          selectedMaterial: null,
        });
        break;
      case 'material':
        setState({
          ...state,
          selectedMaterial: null,
        });
        break;
      default:
        setState(initialState);
    }
  };

  return (
    <AcademicContext.Provider
      value={{
        state,
        setYear,
        setSemester,
        setBranch,
        setSubject,
        setMaterial,
        resetSelections,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = (): AcademicContextType => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
