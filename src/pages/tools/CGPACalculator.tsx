
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Calculator, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number;
}

interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
  sgpa: number;
}

interface Year {
  id: string;
  name: string;
  semesters: Semester[];
}

const gradeMapping = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'D': 4,
  'F': 0
};

// Alternative grading systems
const gradingSystemOptions = {
  'sati-system': {
    'A+': 10, // 91-100 Outstanding
    'A': 9,   // 81-90 Excellent
    'B+': 8,  // 71-80 Very Good
    'B': 7,   // 61-70 Good
    'C+': 6,  // 51-60 Average
    'C': 5,   // 41-50 Satisfactory
    'D': 4,   // 40 only Marginal (PG)
    'E': 3,   // 31-40 Marginal (UG)
    'F': 0    // Fail
  },
  '10-point': {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'D': 4,
    'F': 0
  },
  '4-point': {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D': 1.0,
    'F': 0
  },
  'percentage': {
    '90-100': 10,
    '80-89': 9,
    '70-79': 8,
    '60-69': 7,
    '50-59': 6,
    '40-49': 5,
    '35-39': 4,
    'Below 35': 0
  }
};

const CGPACalculator = () => {
  const navigate = useNavigate();
  const [years, setYears] = useState<Year[]>([
    {
      id: '1',
      name: '1st Year',
      semesters: [
        { id: '1', name: '1st Semester', subjects: [], sgpa: 0 },
        { id: '2', name: '2nd Semester', subjects: [], sgpa: 0 }
      ]
    }
  ]);
  const [currentYear, setCurrentYear] = useState('1');
  const [currentSemester, setCurrentSemester] = useState('1');
  const [cgpa, setCgpa] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [gradingSystem, setGradingSystem] = useState('sati-system');
  const [percentageFormula, setPercentageFormula] = useState('sati-formula'); // sati-formula, indian-standard, direct-multiply, custom

  const addSubject = (yearId: string, semesterId: string) => {
    // Find the current semester to check subject count
    const currentYear = years.find(year => year.id === yearId);
    const currentSemester = currentYear?.semesters.find(sem => sem.id === semesterId);

    // Check if semester already has 10 subjects
    if (currentSemester && currentSemester.subjects.length >= 10) {
      alert('Maximum 10 subjects allowed per semester');
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      credits: 3,
      grade: '',
      gradePoints: 0
    };

    setYears(prev => prev.map(year =>
      year.id === yearId
        ? {
            ...year,
            semesters: year.semesters.map(sem =>
              sem.id === semesterId
                ? { ...sem, subjects: [...sem.subjects, newSubject] }
                : sem
            )
          }
        : year
    ));
  };

  const updateSubject = (yearId: string, semesterId: string, subjectId: string, field: keyof Subject, value: any) => {
    setYears(prev => prev.map(year =>
      year.id === yearId
        ? {
            ...year,
            semesters: year.semesters.map(sem =>
              sem.id === semesterId
                ? {
                    ...sem,
                    subjects: sem.subjects.map(sub =>
                      sub.id === subjectId
                        ? {
                            ...sub,
                            [field]: value,
                            gradePoints: field === 'grade' ? getCurrentGradeMapping()[value as string] || 0 : sub.gradePoints
                          }
                        : sub
                    )
                  }
                : sem
            )
          }
        : year
    ));
  };

  const getCurrentGradeMapping = () => {
    return gradingSystemOptions[gradingSystem as keyof typeof gradingSystemOptions] || gradingSystemOptions['sati-system'];
  };

  const removeSubject = (yearId: string, semesterId: string, subjectId: string) => {
    setYears(prev => prev.map(year =>
      year.id === yearId
        ? {
            ...year,
            semesters: year.semesters.map(sem =>
              sem.id === semesterId
                ? { ...sem, subjects: sem.subjects.filter(sub => sub.id !== subjectId) }
                : sem
            )
          }
        : year
    ));
  };

  const addYear = () => {
    // Check if already at maximum 10 years
    if (years.length >= 4) {
      alert('Maximum 10 years allowed');
      return;
    }

    const yearNumber = years.length + 1;
    const semesterStartNumber = (years.length * 2) + 1;

    const newYear: Year = {
      id: Date.now().toString(),
      name: `${yearNumber}${yearNumber === 1 ? 'st' : yearNumber === 2 ? 'nd' : yearNumber === 3 ? 'rd' : 'th'} Year`,
      semesters: [
        {
          id: (semesterStartNumber).toString(),
          name: `${semesterStartNumber}${semesterStartNumber === 1 ? 'st' : semesterStartNumber === 2 ? 'nd' : semesterStartNumber === 3 ? 'rd' : 'th'} Semester`,
          subjects: [],
          sgpa: 0
        },
        {
          id: (semesterStartNumber + 1).toString(),
          name: `${semesterStartNumber + 1}${(semesterStartNumber + 1) === 1 ? 'st' : (semesterStartNumber + 1) === 2 ? 'nd' : (semesterStartNumber + 1) === 3 ? 'rd' : 'th'} Semester`,
          subjects: [],
          sgpa: 0
        }
      ]
    };
    setYears(prev => [...prev, newYear]);
  };

  const calculateSGPA = (semester: Semester): number => {
    let totalGradePoints = 0;
    let totalCredits = 0;

    semester.subjects.forEach(subject => {
      if (subject.grade && subject.credits > 0) {
        totalGradePoints += subject.gradePoints * subject.credits;
        totalCredits += subject.credits;
      }
    });

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  };

  const calculateCGPA = () => {
    let totalSGPA = 0;
    let semesterCount = 0;
    let totalCreditsSum = 0;

    // Update SGPA for each semester and calculate CGPA as average of SGPAs
    const updatedYears = years.map(year => ({
      ...year,
      semesters: year.semesters.map(semester => {
        const sgpa = calculateSGPA(semester);

        // Count semesters with subjects for CGPA calculation
        if (semester.subjects.length > 0) {
          totalSGPA += sgpa;
          semesterCount++;
        }

        // Count total credits
        semester.subjects.forEach(subject => {
          if (subject.grade && subject.credits > 0) {
            totalCreditsSum += subject.credits;
          }
        });

        return { ...semester, sgpa };
      })
    }));

    setYears(updatedYears);

    // CGPA = Average of all SGPAs (SATI method)
    const calculatedCGPA = semesterCount > 0 ? totalSGPA / semesterCount : 0;
    setCgpa(calculatedCGPA);
    setTotalCredits(totalCreditsSum);

    // Convert CGPA to Percentage using selected formula
    let calculatedPercentage = 0;
    if (calculatedCGPA > 0) {
      switch (percentageFormula) {
        case 'sati-formula':
          // SATI Official Formula: Percentage = (CGPA obtained by student / 10) × 100
          calculatedPercentage = (calculatedCGPA / 10) * 100;
          break;
        case 'indian-standard':
          calculatedPercentage = (calculatedCGPA - 0.75) * 10;
          break;
        case 'direct-multiply':
          calculatedPercentage = calculatedCGPA * 10;
          break;
        case 'vtu-formula':
          calculatedPercentage = (calculatedCGPA - 0.5) * 10;
          break;
        case 'anna-university':
          calculatedPercentage = calculatedCGPA * 9.5;
          break;
        case 'mumbai-university':
          calculatedPercentage = (calculatedCGPA * 10) - 7.5;
          break;
        default:
          calculatedPercentage = (calculatedCGPA / 10) * 100;
      }
    }
    setPercentage(Math.max(0, calculatedPercentage));
  };

  useEffect(() => {
    calculateCGPA();
  }, [years, gradingSystem, percentageFormula]);



  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">CGPA Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calculator */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Grade Point Calculator
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add your subjects with credits and grades to calculate your CGPA.
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={currentYear} onValueChange={setCurrentYear}>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Academic Years</h3>
                    <Button
                      onClick={addYear}
                      size="sm"
                      variant="outline"
                      disabled={years.length >= 4}
                      title={years.length >= 4 ? "Maximum 4 years allowed" : "Add new academic year"}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Year {years.length >= 4 ? `(${years.length}/4)` : null}
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <TabsList className={`inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground ${
                      years.length <= 2 ? 'w-full grid grid-cols-2' :
                      years.length <= 4 ? 'w-full grid grid-cols-4' :
                      'flex gap-1'
                    }`}>
                      {years.map(year => (
                        <TabsTrigger
                          key={year.id}
                          value={year.id}
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${
                            years.length > 4 ? 'flex-shrink-0 min-w-[100px]' : ''
                          }`}
                        >
                          {year.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </div>

                {years.map(year => (
                  <TabsContent key={year.id} value={year.id}>
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-center">{year.name}</h3>

                      {year.semesters.map(semester => (
                        <div key={semester.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold">{semester.name}</h4>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              SGPA: {semester.sgpa.toFixed(2)}
                            </Badge>
                          </div>

                          {semester.subjects.map(subject => (
                            <div key={subject.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="col-span-4">
                                <Label htmlFor={`subject-${subject.id}`}>Subject Name/Code</Label>
                                <Input
                                  id={`subject-${subject.id}`}
                                  placeholder="e.g., Mathematics/MAB 101"
                                  value={subject.name}
                                  onChange={(e) => updateSubject(year.id, semester.id, subject.id, 'name', e.target.value)}
                                />
                              </div>
                              <div className="col-span-2">
                                <Label htmlFor={`credits-${subject.id}`}>Credits</Label>
                                <Input
                                  id={`credits-${subject.id}`}
                                  type="number"
                                  min="1"
                                  max="6"
                                  value={subject.credits}
                                  onChange={(e) => updateSubject(year.id, semester.id, subject.id, 'credits', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="col-span-3">
                                <Label htmlFor={`grade-${subject.id}`}>Grade</Label>
                                <Select
                                  value={subject.grade}
                                  onValueChange={(value) => updateSubject(year.id, semester.id, subject.id, 'grade', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select grade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(getCurrentGradeMapping()).map(([grade, points]) => (
                                      <SelectItem key={grade} value={grade}>
                                        {grade} ({points})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2">
                                <Label>Points</Label>
                                <div className="h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded border">
                                  {subject.gradePoints * subject.credits}
                                </div>
                              </div>
                              <div className="col-span-1">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeSubject(year.id, semester.id, subject.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          <Button
                            onClick={() => addSubject(year.id, semester.id)}
                            variant="outline"
                            className="w-full"
                            disabled={semester.subjects.length >= 10}
                            title={semester.subjects.length >= 10 ? "Maximum 10 subjects allowed per semester" : "Add new subject"}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subject to {semester.name} {semester.subjects.length >= 10 ? '(Max 10)' : `(${semester.subjects.length}/10)`}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {cgpa.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">CGPA</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Percentage</div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xl font-semibold">{totalCredits}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Credits</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Limits: Max 10 years, Max 10 subjects per semester
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="grading-system">Grading System</Label>
                <Select value={gradingSystem} onValueChange={setGradingSystem}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sati-system">SATI System (A+ to F)</SelectItem>
                    <SelectItem value="10-point">10-Point Scale</SelectItem>
                    <SelectItem value="4-point">4-Point Scale</SelectItem>
                    <SelectItem value="percentage">Percentage Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="percentage-formula">Percentage Formula</Label>
                <Select value={percentageFormula} onValueChange={setPercentageFormula}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sati-formula">SATI Formula: (CGPA ÷ 10) × 100</SelectItem>
                    <SelectItem value="direct-multiply">CGPA × 10</SelectItem>
                    <SelectItem value="indian-standard">(CGPA - 0.75) × 10</SelectItem>
                    <SelectItem value="vtu-formula">(CGPA - 0.5) × 10</SelectItem>
                    <SelectItem value="anna-university">CGPA × 9.5</SelectItem>
                    <SelectItem value="mumbai-university">(CGPA × 10) - 7.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formula Used</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>SGPA Formula:</strong>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono">
                  SGPA = Σ(Grade Points × Credits) / Σ(Credits)
                </div>
              </div>
              <div>
                <strong>CGPA Formula:</strong>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono">
                  {gradingSystem === 'sati-system' ?
                    'CGPA = Average of all SGPAs' :
                    'CGPA = Σ(Grade Points × Credits) / Σ(Credits)'
                  }
                </div>
              </div>
              <div>
                <strong>Percentage Formula:</strong>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono">
                  {percentageFormula === 'sati-formula' && 'Percentage = (CGPA ÷ 10) × 100'}
                  {percentageFormula === 'direct-multiply' && 'Percentage = CGPA × 10'}
                  {percentageFormula === 'indian-standard' && 'Percentage = (CGPA - 0.75) × 10'}
                  {percentageFormula === 'vtu-formula' && 'Percentage = (CGPA - 0.5) × 10'}
                  {percentageFormula === 'anna-university' && 'Percentage = CGPA × 9.5'}
                  {percentageFormula === 'mumbai-university' && 'Percentage = (CGPA × 10) - 7.5'}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {gradingSystem === 'sati-system' ?
                  '* Official SATI (Samrat Ashok Technological Institute) grading system' :
                  '* Select the formula used by your institution'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CGPACalculator;
