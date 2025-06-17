export type Branch = {
  id: string;
  name: string;
};

export type Subject = {
  code: string;
  name: string;
};

export type FileResource = {
  id: string;
  name: string;
  url: string;
  downloadUrl: string; // Direct download URL
};

export const branches: Branch[] = [
  { id: 'cse', name: 'CSE' },
  { id: 'blockchain', name: 'Blockchain' },
  { id: 'aiads', name: 'AIADS' },
  { id: 'aiaml', name: 'AI & ML' },
  { id: 'it', name: 'IT' },
  { id: 'cse-iot', name: 'CSE (IoT)' },
  { id: 'ec', name: 'EC' },
  { id: 'ee', name: 'EE' },
  { id: 'ei', name: 'EI' },
  { id: 'me', name: 'ME' },
  { id: 'ce', name: 'CE' },
];

// Legacy structure - kept for backward compatibility
export const subjectsByYearAndSemester: Record<
  number,
  Record<number, Subject[]>
> = {
  1: {
    1: [
      { code: 'MAB 101', name: 'Engineering Mathematics I' },
      { code: 'CHB 101', name: 'Engineering Chemistry' },
      { code: 'CSA 101', name: 'Computer Fundamentals' },
      { code: 'PYB 101', name: 'Engineering Physics' },
      { code: 'HUB 101', name: 'Communication Skills' },
      { code: 'CSA 102', name: 'Digital Electronics' },
      { code: 'IOA 103', name: 'Basic Electrical Engineering' },
      { code: 'MAC 101', name: 'Professional Ethics' },
    ],
    2: [
      { code: 'CSA 103', name: 'Data Structures And Algorithms' },
      { code: 'CSA 104', name: 'System Softwares' },
      { code: 'ITC 101', name: 'Python Programming' },
      { code: 'CSL 110', name: 'Linux' },
      { code: 'MAB 102', name: 'Engineering Mathematics II' },
      { code: 'HUB 101', name: 'Comunication Skills' },
      { code: 'CHB 101', name: 'Applied Chemistry' },
      { code: 'PYB 101', name: 'Applied Physics' },
      { code: 'MAC 102', name: 'Professional Ethics' },
    ],
  },
  2: {
    3: [
      { code: 'IO 302', name: 'Analysis & Design of Algorithms' },
      { code: 'IO 303', name: 'Object Oriented Programming' },
      { code: 'IO 304', name: 'Electronic Devices & Circuits' },
      { code: 'IO 306', name: 'Internet Programming' },
      { code: 'OE 305 (OE-1A)', name: 'Computer System Organization' },
      { code: 'OE 305 (OE-1C) ', name: 'Data Structures' },
      { code: 'CS 302', name: 'Analysis & Design of Algorithms' },
      { code: 'CS 303', name: 'Object-Oriented Programming' },
      { code: 'CS 304', name: 'Operating System' },
      { code: 'CS 306', name: 'Internet Programming' },
      { code: 'OE 305 (OE-1A)', name: 'Computer System Organization' },
      { code: 'MAB 204', name: 'Discrete Mathematics' },
      { code: 'IT 302', name: 'Communication System' },
      { code: 'IT 303', name: 'Analysis & Design of Algorithms' },
      { code: 'IT 304', name: 'Object-Oriented Programming' },
      { code: 'IT 306', name: 'Internet Programming' },
      { code: 'OE 305 (OE-1A)', name: 'Computer System Organization' },
      { code: 'AI 302', name: 'Artificial Intelligence' },
      { code: 'AI 303', name: 'Object Oriented Programming With JAVA' },
      { code: 'AI 304', name: 'Operating Systems' },
      { code: 'AI 305', name: 'Computer System Organization' },
      { code: 'AI 306', name: 'Web Application Development' },
      { code: 'BCC 202', name: 'Analysis & Design of Algorithms' },
      { code: 'BCC 203', name: 'Object Oriented Programming' },
      { code: 'BCC 204', name: 'Operating Systems' },
      { code: 'BCL 206', name: 'Internet Programming' },
      { code: 'BCO 205 (A)', name: 'Computer System Organization' },
    ],
    4: [
      { code: 'IO 205', name: 'Computer Networks' },
      { code: 'IO 206', name: 'Software Engineering' },
      { code: 'IO 207', name: 'Artificial Intelligence' },
      { code: 'IO 208', name: 'Web Technologies' },
      { code: 'MAB 202', name: 'Probability & Statistics' },
    ],
  },
  3: {
    5: [
      { code: 'CSC 301', name: 'Machine Learning' },
      { code: 'CSC 302', name: 'Cloud Computing' },
      { code: 'CSC 303', name: 'Cybersecurity' },
      { code: 'CSC 304', name: 'Mobile App Development' },
      { code: 'CSC 305', name: 'Data Mining' },
    ],
    6: [
      { code: 'CSC 306', name: 'Distributed Systems' },
      { code: 'CSC 307', name: 'Internet of Things' },
      { code: 'CSC 308', name: 'Big Data Analytics' },
      { code: 'CSC 309', name: 'Natural Language Processing' },
      { code: 'CSC 310', name: 'Computer Vision' },
    ],
  },
  4: {
    7: [
      { code: 'CSC 401', name: 'Deep Learning' },
      { code: 'CSC 402', name: 'Quantum Computing' },
      { code: 'CSC 403', name: 'Blockchain Technology' },
      { code: 'CSC 404', name: 'AR/VR Technologies' },
      { code: 'CSC 405', name: 'Ethics in Computing' },
    ],
    8: [
      { code: 'CSC 406', name: 'Final Year Project' },
      { code: 'CSC 407', name: 'Industry Internship' },
      { code: 'CSC 408', name: 'Technical Communication' },
      { code: 'CSC 409', name: 'Entrepreneurship' },
      { code: 'CSC 410', name: 'Emerging Technologies' },
    ],
  },
};

export const materialTypes = [
  { id: 'syllabus', name: 'Syllabus' },
  { id: 'assignments', name: 'Assignments' },
  { id: 'practicals', name: 'Practicals' },
  { id: 'labwork', name: 'Lab Work' },
  { id: 'pyq', name: 'PYQ' },
];

// Subject-specific learning materials
export type SubjectMaterials = {
  syllabus: FileResource[];
  assignments: FileResource[];
  practicals: FileResource[];
  labwork: FileResource[];
  pyq: FileResource[];
};

// Map of subject codes to their learning materials
export const subjectMaterials: Record<string, SubjectMaterials> = {
  // Data Structures And Algorithms And algorithm
  'CSA 103': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [
      {
        id: 'ds_labwork1',
        name: 'DSA Experiments',
        url: 'https://drive.google.com/file/d/1YHvo8DpFaSeAPVYbG2AnSXZBv5TVXVOT/preview',
        downloadUrl: 'https://drive.google.com/file/d/1YHvo8DpFaSeAPVYbG2AnSXZBv5TVXVOT/preview?export=download',
      },
      {
        id: 'ds_labwork2',
        name: 'DSA Experiments solutions',
        url: 'https://drive.google.com/file/d/1nhPVlI2EwPU6m-tRuS0WJuDW1_vwNtu3/preview',
        downloadUrl: 'https://drive.google.com/file/d/1nhPVlI2EwPU6m-tRuS0WJuDW1_vwNtu3/view?export=download',
      },
    ],
    syllabus: [

    ],
    pyq: [

    ],
  },

  // Python Programming
  'ITC 101': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [

    ],
    pyq: [
      {
        id: 'py_pyq1',
        name: 'PYQ 2024 - May',
        url: 'https://drive.google.com/file/d/1bcm2BMpjueuoGcjLxFRRGIWfeagSP4ZB/preview',
        downloadUrl: 'https://drive.google.com/file/d/1bcm2BMpjueuoGcjLxFRRGIWfeagSP4ZB/view?export=download',
      },
      {
        id: 'py_pyq2',
        name: 'PYQ 2023 - June',
        url: 'https://drive.google.com/file/d/1av_i5-6QPsax-5YFgxZ3dDl0l1PVXPoE/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1av_i5-6QPsax-5YFgxZ3dDl0l1PVXPoE',
      },
      {
        id: 'py_pyq3',
        name: 'PYQ 2023 - May',
        url: 'https://drive.google.com/file/d/1ETkSInNudTvWO4Zc4f6_5yp1H11WYEEz/preview',
        downloadUrl: 'https://drive.google.com/file/d/1ETkSInNudTvWO4Zc4f6_5yp1H11WYEEz/view?export=download',
      },
    ],

  },

  // Communication And Report Writing
  'HUB 101': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [

    ],
    pyq: [
      {
        id: 'hub_pyq1',
        name: 'PYQ 2022 - June',
        url: 'https://drive.google.com/file/d/1Snw3eVcKHPh3SZ0h7k_RDFBQwvsLZ5_C/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1Snw3eVcKHPh3SZ0h7k_RDFBQwvsLZ5_C',
      },
      {
        id: 'hub_pyq2',
        name: 'PYQ 2022 - Nov',
        url: 'https://drive.google.com/file/d/1cJQJLu0-xA4jN004-t0c-ThsprfRJdZX/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1cJQJLu0-xA4jN004-t0c-ThsprfRJdZX',
      },
      {
        id: 'hub_pyq3',
        name: 'PYQ 2022 - Dec',
        url: 'https://drive.google.com/file/d/1TN_sCjjdkIceuqBarIKonvX6_okdkSQ0/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1TN_sCjjdkIceuqBarIKonvX6_okdkSQ0',
      },
      {
        id: 'hub_pyq4',
        name: 'PYQ 2024 - May',
        url: 'https://drive.google.com/file/d/1ZVMTWqnGq7wr6zEZceoYAnXgOkM4-Ry8/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1ZVMTWqnGq7wr6zEZceoYAnXgOkM4-Ry8',
      },
      {
        id: 'hub_pyq5',
        name: 'PYQ 2024 - Dec',
        url: 'https://drive.google.com/file/d/1vNJ_Uj2_fswhRnv4ZjBCXgx2kJKkYwuH/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1vNJ_Uj2_fswhRnv4ZjBCXgx2kJKkYwuH',
      },
    ],
  },
  // Applied Chemistry
  'CHB 101': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [

    ],
    pyq: [
      {
        id: 'chb_pyq1',
        name: 'PYQ 2024 - Dec',
        url: 'https://drive.google.com/file/d/1ASzyYwCfk5XUUccu183Qta_D_N-hz0-f/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1ASzyYwCfk5XUUccu183Qta_D_N-hz0-f',
      },
    ],
  },
  // Mathematics II
  'MAB 102': {

    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [

    ],
    pyq: [
      {
        id: 'mab_pyq1',
        name: 'PYQ 2023 - June',
        url: 'https://drive.google.com/file/d/1a-Yfbd0CKrPvzxg3JioWEEUvnHokH2zn/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1a-Yfbd0CKrPvzxg3JioWEEUvnHokH2zn',
      },
      {
        id: 'mab_pyq2',
        name: 'PYQ 2024 - May',
        url: 'https://drive.google.com/file/d/1V8wiXQYp4wqeAwZ2jIWoMeIx5F1RI6lO/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1V8wiXQYp4wqeAwZ2jIWoMeIx5F1RI6lO',
      }
    ],
  },
  // Analysis & Design of Algorithms
  'IO 302': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'io302_syllabus',
        name: 'Analysis & Design of Algorithms',
        url: 'https://drive.google.com/file/d/1JlCF-5F11qRt_Q5Hb-bZ1MwWlUtMhYZF/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1JlCF-5F11qRt_Q5Hb-bZ1MwWlUtMhYZF',
      },
    ],
    pyq: [
    ],
  },

  // Object Oriented Programming
  'IO 303': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'io303_syllabus',
        name: 'Object Oriented Programming',
        url: 'https://drive.google.com/file/d/1auBpaRw8QQiRnqVlXrS5j-g5QVJxBgJT/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1auBpaRw8QQiRnqVlXrS5j-g5QVJxBgJT',
      },
    ],
    pyq: [
    ],
  },

  // Electronic Devices & Circuits
  'IO 304': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'io304_syllabus',
        name: 'Electronic Devices & Circuits',
        url: 'https://drive.google.com/file/d/1R0HTch1iBaC5dJtpQTdDz-NloVBeBAmY/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1R0HTch1iBaC5dJtpQTdDz-NloVBeBAmY',
      },
    ],
    pyq: [
    ],
  },

  // Internet Programming
  'IO 306': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'io306_syllabus',
        name: 'Internet Programming',
        url: 'https://drive.google.com/file/d/1mwA4zlGQ9PjxBeLnoNbfLwOxBZPjVIvM/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1mwA4zlGQ9PjxBeLnoNbfLwOxBZPjVIvM',
      },
    ],
    pyq: [
    ],
  },

  // Computer System Organization
  'OE 305 (OE-1A)': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'oe305a_syllabus',
        name: 'Computer System Organization',
        url: 'https://drive.google.com/file/d/14mPvvAKNabu0wbKbYwEiiGljeIIZtjQL/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=14mPvvAKNabu0wbKbYwEiiGljeIIZtjQL',
      },
    ],
    pyq: [
    ],
  },

  // OE-1C
  'OE 305 (OE-1C)': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'oe305c_syllabus',
        name: 'Data Structures',
        url: 'https://drive.google.com/file/d/11oJaXpnhOI7KfAmUIYcgsf07vucnCURL/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=11oJaXpnhOI7KfAmUIYcgsf07vucnCURL',
      },
    ],
    pyq: [
    ],
  },


  // Artificial Intelligence
  'AI 302': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'ai302_syllabus',
        name: 'Artificial Intelligence',
        url: 'https://drive.google.com/file/d/1L-cLEPKsmv0zugh1Nwm1YFDZHCyhGfjF/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1L-cLEPKsmv0zugh1Nwm1YFDZHCyhGfjF',
      },
    ],
    pyq: [
    ],
  },

  // Object Oriented Programming With JAVA
  'AI 303': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'ai303_syllabus',
        name: 'Object Oriented Programming With JAVA',
        url: 'https://drive.google.com/file/d/1aEDlw92y4igEFuiLcwK7uqJIYbL28J5i/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1aEDlw92y4igEFuiLcwK7uqJIYbL28J5i',
      },
    ],
    pyq: [
    ],
  },

  // Operating Systems
  'AI 304': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'ai304_syllabus',
        name: 'Operating Systems',
        url: 'https://drive.google.com/file/d/1uIZn06BJ5YYRdjrlrGPRemJTQ_ZpsO4J/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1uIZn06BJ5YYRdjrlrGPRemJTQ_ZpsO4J',
      },
    ],
    pyq: [
    ],
  },

  // Computer System Organization
  'AI 305': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'ai305_syllabus',
        name: 'Computer System Organization',
        url: 'https://drive.google.com/file/d/1wR43yueymrKHqPUHc6IkQrE1ihlmQMT8/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1wR43yueymrKHqPUHc6IkQrE1ihlmQMT8',
      },
    ],
    pyq: [
    ],
  },

  // Web Application Development
  'AI 306': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'ai306_syllabus',
        name: 'Web Application Development',
        url: 'https://drive.google.com/file/d/1eSSUcfRuxN7XobU_cReBroED13J7Uh-Z/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1eSSUcfRuxN7XobU_cReBroED13J7Uh-Z',
      },
    ],
    pyq: [
    ],
  },

  // Communication System
  'IT 302': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'it302_syllabus',
        name: 'Communication System',
        url: 'https://drive.google.com/file/d/1dlxhTdVAKyQqkkYZ8DIfLkmIEg6ze_qA/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1dlxhTdVAKyQqkkYZ8DIfLkmIEg6ze_qA',
      },
    ],
    pyq: [
    ],
  },

  // Analysis & Design of Algorithms (IT)
  'IT 303': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'it303_syllabus',
        name: 'Analysis & Design of Algorithms',
        url: 'https://drive.google.com/file/d/1a4RNfV1AZAIRmG8Yka4EsnzgxPGRCb7m/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1a4RNfV1AZAIRmG8Yka4EsnzgxPGRCb7m',
      },
    ],
    pyq: [
    ],
  },

  // Object-Oriented Programming (IT)
  'IT 304': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'it304_syllabus',
        name: 'Object-Oriented Programming',
        url: 'https://drive.google.com/file/d/1kwBkNcKM2rsqwx5MKPwv63tQQwub4Xbp/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1kwBkNcKM2rsqwx5MKPwv63tQQwub4Xbp',
      },
    ],
    pyq: [
    ],
  },

  // Internet Programming (IT)
  'IT 306': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'it306_syllabus',
        name: 'Internet Programming',
        url: 'https://drive.google.com/file/d/1_5KnGx7pRiQwJ88ga2wJJQVka33k8phZ/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1_5KnGx7pRiQwJ88ga2wJJQVka33k8phZ',
      },
    ],
    pyq: [
    ],
  },

  // Computer System Organization (OE 305 A)
  'OE 305 (A)': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'oe305a_syllabus2',
        name: 'Computer System Organization',
        url: 'https://drive.google.com/file/d/1p9HfQg0_okduOK6Y8MVvTQNy3H6ME2wG/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1p9HfQg0_okduOK6Y8MVvTQNy3H6ME2wG',
      },
    ],
    pyq: [
    ],
  },

  // Analysis & Design of Algorithms
  'CS 302': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'cs302_syllabus',
        name: 'Analysis & Design of Algorithms',
        url: 'https://drive.google.com/file/d/1A5yza8nDhgvky8yxiNuXu2MjQpRW2Edv/preview',
        downloadUrl: 'https://drive.google.com/file/d/1A5yza8nDhgvky8yxiNuXu2MjQpRW2Edv/view?export=download',
      },
    ],
    pyq: [
    ],
  },

  // Object-Oriented Programming
  'CS 303': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'cs303_syllabus',
        name: 'Object-Oriented Programming',
        url: 'https://drive.google.com/file/d/10C7D1ydusGN7EW9N8HPQg3-lNojYYfVi/preview',
        downloadUrl: 'https://drive.google.com/file/d/10C7D1ydusGN7EW9N8HPQg3-lNojYYfVi/view?export=download',
      },
    ],
    pyq: [
    ],
  },

  // Operating System
  'CS 304': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'cs304_syllabus',
        name: 'Operating System',
        url: 'https://drive.google.com/file/d/1SPz-DoCRG9m3YToO1oR0coQNnGdnJgeZ/preview',
        downloadUrl: 'https://drive.google.com/file/d/1SPz-DoCRG9m3YToO1oR0coQNnGdnJgeZ/view?export=download',
      },
    ],
    pyq: [
    ],
  },

  // Internet Programming
  'CS 306': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'cs306_syllabus',
        name: 'Internet Programming',
        url: 'https://drive.google.com/file/d/1P-ecTAeuHZpvbp-8rrRh5M3hpPWpCxBd/preview',
        downloadUrl: 'https://drive.google.com/file/d/1P-ecTAeuHZpvbp-8rrRh5M3hpPWpCxBd/view?export=download',
      },
    ],
    pyq: [
    ],
  },

  // Discrete Mathematics
  'MAB 204': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'mab204_syllabus',
        name: 'Discrete Mathematics',
        url: 'https://drive.google.com/file/d/16vkeopLfKrhszANP5GjVd8yN-00Vw8zD/preview',
        downloadUrl: 'https://drive.google.com/file/d/16vkeopLfKrhszANP5GjVd8yN-00Vw8zD/view?export=download',
      },
    ],
    pyq: [
    ],
  },
  // Analysis & Design of Algorithms
  'BCC 202': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'bcc202_syllabus',
        name: 'Analysis & Design of Algorithms',
        url: 'https://drive.google.com/file/d/16wGBixYcQLY1mmy-qE93Vjs0DLmJoLBN/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=16wGBixYcQLY1mmy-qE93Vjs0DLmJoLBN',
      },
    ],
    pyq: [
    ],
  },

  // Object Oriented Programming
  'BCC 203': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'bcc203_syllabus',
        name: 'Object Oriented Programming',
        url: 'https://drive.google.com/file/d/1flvnGUW8YUTVeXo5hB9O_pf4V3_F_H6q/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1flvnGUW8YUTVeXo5hB9O_pf4V3_F_H6q',
      },
    ],
    pyq: [
    ],
  },

  // Operating Systems
  'BCC 204': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'bcc204_syllabus',
        name: 'Operating Systems',
        url: 'https://drive.google.com/file/d/1gOnmqa9UPfJ4LleqalJApmMyOQ6hxcs9/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1gOnmqa9UPfJ4LleqalJApmMyOQ6hxcs9',
      },
    ],
    pyq: [
    ],
  },

  // Internet Programming
  'BCL 206': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'bcl206_syllabus',
        name: 'Internet Programming',
        url: 'https://drive.google.com/file/d/1y7ZV1WR5YKFCedD8zmgRJjCSYrLroQog/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1y7ZV1WR5YKFCedD8zmgRJjCSYrLroQog',
      },
    ],
    pyq: [
    ],
  },

  // Computer System Organization
  'BCO 205 (A)': {
    assignments: [

    ],
    practicals: [

    ],
    labwork: [

    ],
    syllabus: [
      {
        id: 'bco205a_syllabus',
        name: 'Computer System Organization',
        url: 'https://drive.google.com/file/d/11qUqBH8adxZciYxi_cgZpZUlfLBPrbOb/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=11qUqBH8adxZciYxi_cgZpZUlfLBPrbOb',
      },
    ],
    pyq: [
    ],
  },
  // Other subjects...
};

// Legacy resource files (for backward compatibility or fallback)
export const resourceFiles: Record<string, FileResource[]> = {
  // Empty - all resources are now managed through subjectMaterials
};

// New structure - branch-specific subjects
export const branchSubjects: Record<
  number, // Year
  Record<
    number, // Semester
    Record<string, Subject[]> // Branch ID -> Subjects
  >
> = {
  1: {
    1: {
      'cse': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'aiaml': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'it': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'cse-iot': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'PYB 101', name: 'Engineering Physics' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'IOA 103', name: 'Basic Electrical Engeering' },
        { code: 'MAC 101', name: 'Professional Ethics' },

      ],
      'ec': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'ECB 101', name: 'Electrical Engineering' },
        { code: 'ECB 102', name: 'Electrical Machines' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'ee': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'EEB 101', name: 'Electrical Engineering' },
        { code: 'EEB 102', name: 'Electrical Machines' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'ei': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'EIB 101', name: 'Electrical Engineering' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'me': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'MEB 101', name: 'Engineering Mechanics' },
        { code: 'PYB 101', name: 'Engineering Physics' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
      'ce': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CEB 101', name: 'Civil Engineering Basics' },
        { code: 'PYB 101', name: 'Engineering Physics' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'MAC 101', name: 'Professional Ethics' },
      ],
    },
    2: {
      'cse': [
        { code: 'MAB 102', name: 'Engineering Mathematics II' },
        { code: 'CSA 103', name: 'Data Structures And Algorithms' },
        { code: 'ITC 101', name: 'Python Programming' },
        { code: 'CSL 110', name: 'Linux' },
        { code: 'CSA 104', name: 'System Softwares' },
        { code: 'PYB 101', name: 'Applied Physics' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'blockchain': [
        { code: 'MAB 102', name: 'Engineering Mathematics II' },
        { code: 'CSA 103', name: 'Data Structures And Algorithms' },
        { code: 'ITC 101', name: 'Python Programming' },
        { code: 'CSL 110', name: 'Linux' },
        { code: 'CSA 104', name: 'System Softwares' },
        { code: 'CHB 101', name: 'Applied Chemistry' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'aiads': [
        { code: 'MAB 102', name: 'Engineering Mathematics II' },
        { code: 'CSA 103', name: 'Data Structures And Algorithms' },
        { code: 'ITC 101', name: 'Python Programming' },
        { code: 'CSL 110', name: 'Linux' },
        { code: 'CSA 104', name: 'System Softwares' },
        { code: 'PYB 101', name: 'Applied Physics' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'aiaml': [
        { code: 'MAB 102', name: 'Engineering Mathematics II' },
        { code: 'CSA 103', name: 'Data Structures And Algorithms' },
        { code: 'ITC 101', name: 'Python Programming' },
        { code: 'CSL 110', name: 'Linux' },
        { code: 'CSA 104', name: 'System Softwares' },
        { code: 'PYB 101', name: 'Applied Physics' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'it': [
        { code: 'MAB 102', name: 'Engineering Mathematics II' },
        { code: 'CSA 103', name: 'Data Structures And Algorithms' },
        { code: 'ITC 101', name: 'Python Programming' },
        { code: 'CSL 110', name: 'Linux' },
        { code: 'CSA 104', name: 'System Softwares' },
        { code: 'PYB 101', name: 'Applied Physics' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'cse-iot': [
        { code: 'MAB 102', name: 'Engineering Mathematics II' },
        { code: 'CSA 103', name: 'Data Structures And Algorithms' },
        { code: 'ITC 101', name: 'Python Programming' },
        { code: 'CSL 110', name: 'Linux' },
        { code: 'HUB 101', name: 'Comunicational Skills' },
        { code: 'CHB 101', name: 'Applied Chemistry' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'ec': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'ECB 101', name: 'Electrical Engineering' },
        { code: 'ECB 102', name: 'Electrical Machines' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'ee': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'EEB 101', name: 'Electrical Engineering' },
        { code: 'EEB 102', name: 'Electrical Machines' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'ei': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'EIB 101', name: 'Electrical Engineering' },
        { code: 'EIB 102', name: 'Electrical Machines' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'me': [
        { code: 'MEB 103', name: 'Thermodynamics' },
        { code: 'MEB 104', name: 'Material Science' },
        { code: 'MAB 102', name: 'Engineering Mathematics II' },
        { code: 'HUB 101', name: 'Comunicational Skills' },
        { code: 'CHB 101', name: 'Environmental Science' },
        { code: 'PYB 101', name: 'Applied Physics' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
      'ce': [
        { code: 'CEB 103', name: 'Surveying' },
        { code: 'CEB 104', name: 'Building Materials' },
        { code: 'MAB 102', name: 'Engineering Mathematics II' },
        { code: 'HUB 101', name: 'Comunicational Skills' },
        { code: 'CHB 101', name: 'Environmental Science' },
        { code: 'PYB 101', name: 'Applied Physics' },
        { code: 'MAC 102', name: 'Professional Ethics' },
      ],
    },
  },
  2: {
    3: {
      'cse': [
        { code: 'CS 302', name: 'Analysis & Design of Algorithms' },
        { code: 'CS 303', name: 'Object-Oriented Programming' },
        { code: 'CS 304', name: 'Operating System' },
        { code: 'CS 306', name: 'Internet Programming' },
        { code: 'OE 305 (OE-1A)', name: 'Computer System Organization' },
        { code: 'MAB 204', name: 'Discrete Mathematics' },
      ],
      'blockchain': [
        { code: 'BCC 202', name: 'Analysis & Design of Algorithms' },
        { code: 'BCC 203', name: 'Object Oriented Programming' },
        { code: 'BCC 204', name: 'Operating Systems' },
        { code: 'BCL 206', name: 'Internet Programming' },
        { code: 'BCO 205 (A)', name: 'Computer System Organization' },
        { code: 'MAB 204', name: 'Discrete Mathematics' },
      ],
      'aiads': [
        { code: 'AI 302', name: 'Artificial Intelligence' },
        { code: 'AI 303', name: 'Object Oriented Programming With JAVA' },
        { code: 'AI 304', name: 'Operating Systems' },
        { code: 'AI 305', name: 'Computer System Organization' },
        { code: 'AI 306', name: 'Web Application Development' },
        { code: 'MAB 204', name: 'Discrete Mathematics' },
      ],
      'aiaml': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'cse-iot': [
        { code: 'IO 302', name: 'Analysis & Design of Algorithms' },
        { code: 'IO 303', name: 'Object Oriented Programming' },
        { code: 'IO 304', name: 'Electronic Devices & Circuits' },
        { code: 'IO 306', name: 'Internet Programming' },
        { code: 'OE 305 (OE-1A)', name: 'Computer System Organization' },
        { code: 'OE 305 (OE-1C) ', name: 'Data Structures' },
      ],
      'it': [
        { code: 'IT 302', name: 'Communication System' },
        { code: 'IT 303', name: 'Analysis & Design of Algorithms' },
        { code: 'IT 304', name: 'Object-Oriented Programming' },
        { code: 'IT 306', name: 'Internet Programming' },
        { code: 'OE 305 (OE-1A)', name: 'Computer System Organization' },
        { code: 'MAB 204', name: 'Discrete Mathematics' },
      ],
      'me': [
        { code: 'MEB 201', name: 'Fluid Mechanics' },
        { code: 'MEB 202', name: 'Manufacturing Processes' },
        { code: 'MEB 203', name: 'Machine Design' },
        { code: 'MEB 204', name: 'Heat Transfer' },
        { code: 'MAB 201', name: 'Engineering Mathematics III' },
      ],
    },
    4: {
      'cse': [
        { code: 'IO 205', name: 'Computer Networks' },
        { code: 'IO 206', name: 'Software Engineering' },
        { code: 'IO 207', name: 'Artificial Intelligence' },
        { code: 'IO 208', name: 'Web Technologies' },
        { code: 'MAB 202', name: 'Probability & Statistics' },
      ],
      'cse-iot': [
        { code: 'IO 205', name: 'Computer Networks' },
        { code: 'IO 206', name: 'Software Engineering' },
        { code: 'IOB 202', name: 'IoT Protocols' },
        { code: 'IOB 203', name: 'Embedded Systems' },
        { code: 'MAB 202', name: 'Probability & Statistics' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
      ],
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'aiaml': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'it': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
      ],
      'me': [
        { code: 'MEB 205', name: 'Dynamics of Machinery' },
        { code: 'MEB 206', name: 'Industrial Engineering' },
        { code: 'MEB 207', name: 'Mechanical Measurements' },
        { code: 'MEB 208', name: 'Automobile Engineering' },
        { code: 'MAB 202', name: 'Probability & Statistics' },
      ],
    },
  },
  3: {
    5: {
      'cse': [
        { code: 'CSC 301', name: 'Machine Learning' },
        { code: 'CSC 302', name: 'Cloud Computing' },
        { code: 'CSC 303', name: 'Cybersecurity' },
        { code: 'CSC 304', name: 'Mobile App Development' },
        { code: 'CSC 305', name: 'Data Mining' },
      ],
      'cse-iot': [
        { code: 'CSC 301', name: 'Machine Learning' },
        { code: 'CSC 302', name: 'Cloud Computing' },
        { code: 'IOC 301', name: 'IoT Security' },
        { code: 'IOC 302', name: 'Sensor Networks' },
        { code: 'IOC 303', name: 'Edge Computing' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
      ],
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'aiaml': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'it': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
      ],
    },
    6: {
      'cse': [
        { code: 'CSC 306', name: 'Distributed Systems' },
        { code: 'CSC 307', name: 'Internet of Things' },
        { code: 'CSC 308', name: 'Big Data Analytics' },
        { code: 'CSC 309', name: 'Natural Language Processing' },
        { code: 'CSC 310', name: 'Computer Vision' },
      ],
      'cse-iot': [
        { code: 'CSC 306', name: 'Distributed Systems' },
        { code: 'IOC 304', name: 'IoT Applications' },
        { code: 'IOC 305', name: 'Smart Systems' },
        { code: 'CSC 308', name: 'Big Data Analytics' },
        { code: 'IOC 306', name: 'IoT Project' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
      ],
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'aiaml': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'it': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
      ],
    },
  },
  4: {
    7: {
      'cse': [
        { code: 'CSC 401', name: 'Deep Learning' },
        { code: 'CSC 402', name: 'Quantum Computing' },
        { code: 'CSC 403', name: 'Blockchain Technology' },
        { code: 'CSC 404', name: 'AR/VR Technologies' },
        { code: 'CSC 405', name: 'Ethics in Computing' },
      ],
      'cse-iot': [
        { code: 'CSC 401', name: 'Deep Learning' },
        { code: 'IOC 401', name: 'Industrial IoT' },
        { code: 'IOC 402', name: 'IoT Analytics' },
        { code: 'CSC 404', name: 'AR/VR Technologies' },
        { code: 'CSC 405', name: 'Ethics in Computing' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
      ],
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'aiaml': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'it': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
      ],
    },
    8: {
      'cse': [
        { code: 'CSC 406', name: 'Final Year Project' },
        { code: 'CSC 407', name: 'Industry Internship' },
        { code: 'CSC 408', name: 'Technical Communication' },
        { code: 'CSC 409', name: 'Entrepreneurship' },
        { code: 'CSC 410', name: 'Emerging Technologies' },
      ],
      'cse-iot': [
        { code: 'CSC 406', name: 'Final Year Project' },
        { code: 'CSC 407', name: 'Industry Internship' },
        { code: 'CSC 408', name: 'Technical Communication' },
        { code: 'CSC 409', name: 'Entrepreneurship' },
        { code: 'IOC 403', name: 'IoT Capstone Project' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
      ],
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'aiaml': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'it': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
      ],
    },
  },
};