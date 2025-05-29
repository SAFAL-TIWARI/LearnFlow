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
      { code: 'CSB 201', name: 'Design & Analysis of Algorithms' },
      { code: 'CSB 202', name: 'Operating Systems' },
      { code: 'CSB 203', name: 'Database Management Systems' },
      { code: 'CSB 204', name: 'Object-Oriented Programming' },
      { code: 'MAB 201', name: 'Discrete Mathematics' },
    ],
    4: [
      { code: 'CSB 205', name: 'Computer Networks' },
      { code: 'CSB 206', name: 'Software Engineering' },
      { code: 'CSB 207', name: 'Artificial Intelligence' },
      { code: 'CSB 208', name: 'Web Technologies' },
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
  { id: 'syllabus', name: 'Syllabus', icon: 'Syllabus' },
  { id: 'assignments', name: 'Assignments', icon: 'assignment' },
  { id: 'practicals', name: 'Practicals', icon: 'lab' },
  { id: 'labwork', name: 'Lab Work', icon: 'computer' },
  { id: 'pyq', name: 'PYQ', icon: 'pyq' },
];

// Subject-specific learning materials
export type SubjectMaterials = {
  Syllabus: FileResource[];
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
      {
        id: 'ds_assignment1',
        name: 'Assignment 1 - Array Implementation',
        url: 'https://drive.google.com/file/d/1VeDVrKDbXBtDoVY8QXdiylt1FxEevid7lOg05NnMgw4/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1VeDVrKDbXBtDoVY8QXdiylt1FxEevid7lOg05NnMgw4',
      },

    ],
    practicals: [
      {
        id: 'ds_practical1',
        name: 'Lab 1 - Stack and Queue Implementation',
        url: 'https://drive.google.com/file/d/1PRACTICAL_UNIQUE_ID_PLACEHOLDER/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1PRACTICAL_UNIQUE_ID_PLACEHOLDER',
      },

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
    Syllabus: [
      {
        id: 'ds_syllabus',
        name: 'Syllabus - Data Structures And Algorithms ',
        url: 'https://drive.google.com/file/d/1SmdONnxM4Q7NXgknn180zfk868jdELzu/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1SmdONnxM4Q7NXgknn180zfk868jdELzu',
      }
    ],
    pyq: [
      {
        id: 'ds_pyq1',
        name: 'PYQ 2024',
        url: 'https://drive.google.com/file/d/1PYQ_UNIQUE_ID_PLACEHOLDER/preview',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1PYQ_UNIQUE_ID_PLACEHOLDER',
      },
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
        { code: 'CSB 201', name: 'Design & Analysis of Algorithms' },
        { code: 'CSB 202', name: 'Operating Systems' },
        { code: 'CSB 203', name: 'Database Management Systems' },
        { code: 'CSB 204', name: 'Object-Oriented Programming' },
        { code: 'MAB 201', name: 'Discrete Mathematics' },
      ],
      'cse-iot': [
        { code: 'CSB 201', name: 'Design & Analysis of Algorithms' },
        { code: 'CSB 202', name: 'Operating Systems' },
        { code: 'CSB 203', name: 'Database Management Systems' },
        { code: 'CSB 204', name: 'Object-Oriented Programming' },
        { code: 'IOB 201', name: 'IoT Architecture' },
      ],
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
      ],
      'it': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
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
        { code: 'CSB 205', name: 'Computer Networks' },
        { code: 'CSB 206', name: 'Software Engineering' },
        { code: 'CSB 207', name: 'Artificial Intelligence' },
        { code: 'CSB 208', name: 'Web Technologies' },
        { code: 'MAB 202', name: 'Probability & Statistics' },
      ],
      'cse-iot': [
        { code: 'CSB 205', name: 'Computer Networks' },
        { code: 'CSB 206', name: 'Software Engineering' },
        { code: 'IOB 202', name: 'IoT Protocols' },
        { code: 'IOB 203', name: 'Embedded Systems' },
        { code: 'MAB 202', name: 'Probability & Statistics' },
      ],
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
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
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
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
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
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
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
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
      'aiads': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CHB 101', name: 'Engineering Chemistry' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'AIADS 101', name: 'Data Science' },
      ],
      'blockchain': [
        { code: 'MAB 101', name: 'Engineering Mathematics I' },
        { code: 'CSA 102', name: 'Digital Electronics' },
        { code: 'CSA 101', name: 'Computer Fundamentals' },
        { code: 'HUB 101', name: 'Communication Skills' },
        { code: 'PYB 101', name: 'Engineering Physics' },
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