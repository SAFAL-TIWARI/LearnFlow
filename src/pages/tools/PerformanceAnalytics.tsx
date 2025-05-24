import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, TrendingDown, Target, Award, AlertTriangle, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface SubjectPerformance {
  id: string;
  subject: string;
  currentGrade: number;
  targetGrade: number;
  assignments: Assignment[];
  tests: Test[];
  trend: 'up' | 'down' | 'stable';
}

interface Assignment {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  date: string;
  weight: number;
}

interface Test {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  date: string;
  weight: number;
}

interface StudyMetrics {
  totalStudyHours: number;
  averageSessionLength: number;
  subjectsStudied: number;
  weeklyGoalProgress: number;
}

const PerformanceAnalytics = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectPerformance[]>([
    {
      id: '1',
      subject: 'Mathematics',
      currentGrade: 85,
      targetGrade: 90,
      assignments: [
        { id: '1', name: 'Calculus Assignment 1', score: 88, maxScore: 100, date: '2024-01-15', weight: 0.2 },
        { id: '2', name: 'Algebra Quiz', score: 92, maxScore: 100, date: '2024-01-20', weight: 0.1 }
      ],
      tests: [
        { id: '1', name: 'Midterm Exam', score: 82, maxScore: 100, date: '2024-01-25', weight: 0.3 }
      ],
      trend: 'up'
    },
    {
      id: '2',
      subject: 'Physics',
      currentGrade: 78,
      targetGrade: 85,
      assignments: [
        { id: '3', name: 'Lab Report 1', score: 75, maxScore: 100, date: '2024-01-18', weight: 0.15 }
      ],
      tests: [
        { id: '2', name: 'Chapter 1 Test', score: 80, maxScore: 100, date: '2024-01-22', weight: 0.25 }
      ],
      trend: 'stable'
    }
  ]);

  const [studyMetrics] = useState<StudyMetrics>({
    totalStudyHours: 45.5,
    averageSessionLength: 1.8,
    subjectsStudied: 6,
    weeklyGoalProgress: 78
  });

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [newGrade, setNewGrade] = useState({
    type: 'assignment' as 'assignment' | 'test',
    name: '',
    score: '',
    maxScore: '100',
    weight: '0.2'
  });

  const addGrade = () => {
    if (!selectedSubject || !newGrade.name || !newGrade.score) return;

    const score = parseFloat(newGrade.score);
    const maxScore = parseFloat(newGrade.maxScore);
    const weight = parseFloat(newGrade.weight);

    const gradeItem = {
      id: Date.now().toString(),
      name: newGrade.name,
      score,
      maxScore,
      date: new Date().toISOString().split('T')[0],
      weight
    };

    setSubjects(prev => prev.map(subject => {
      if (subject.id === selectedSubject) {
        if (newGrade.type === 'assignment') {
          return { ...subject, assignments: [...subject.assignments, gradeItem] };
        } else {
          return { ...subject, tests: [...subject.tests, gradeItem] };
        }
      }
      return subject;
    }));

    setNewGrade({
      type: 'assignment',
      name: '',
      score: '',
      maxScore: '100',
      weight: '0.2'
    });
    setShowAddGrade(false);
  };

  const calculateWeightedAverage = (subject: SubjectPerformance) => {
    const allGrades = [...subject.assignments, ...subject.tests];
    if (allGrades.length === 0) return 0;

    const totalWeightedScore = allGrades.reduce((sum, grade) => 
      sum + (grade.score / grade.maxScore) * 100 * grade.weight, 0
    );
    const totalWeight = allGrades.reduce((sum, grade) => sum + grade.weight, 0);

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  const getPerformanceStatus = (current: number, target: number) => {
    const diff = current - target;
    if (diff >= 0) return { status: 'on-track', color: 'text-green-600 dark:text-green-400' };
    if (diff >= -5) return { status: 'close', color: 'text-yellow-600 dark:text-yellow-400' };
    return { status: 'behind', color: 'text-red-600 dark:text-red-400' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getOverallGPA = () => {
    if (subjects.length === 0) return 0;
    const totalGrade = subjects.reduce((sum, subject) => sum + subject.currentGrade, 0);
    return (totalGrade / subjects.length / 100 * 4).toFixed(2);
  };

  const getImprovementSuggestions = (subject: SubjectPerformance) => {
    const suggestions = [];
    const performance = getPerformanceStatus(subject.currentGrade, subject.targetGrade);
    
    if (performance.status === 'behind') {
      suggestions.push('Focus more study time on this subject');
      suggestions.push('Consider seeking additional help or tutoring');
    }
    
    if (subject.assignments.length > 0) {
      const avgAssignment = subject.assignments.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / subject.assignments.length;
      if (avgAssignment < 80) {
        suggestions.push('Improve assignment completion and quality');
      }
    }
    
    if (subject.tests.length > 0) {
      const avgTest = subject.tests.reduce((sum, t) => sum + (t.score / t.maxScore) * 100, 0) / subject.tests.length;
      if (avgTest < 80) {
        suggestions.push('Enhance test preparation strategies');
      }
    }

    return suggestions.length > 0 ? suggestions : ['Keep up the good work!'];
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subject Details</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {getOverallGPA()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Overall GPA</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {studyMetrics.totalStudyHours}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Study Hours</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {studyMetrics.averageSessionLength}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Session</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {studyMetrics.weeklyGoalProgress}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Weekly Goal</div>
              </CardContent>
            </Card>
          </div>

          {/* Subject Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map(subject => {
                  const performance = getPerformanceStatus(subject.currentGrade, subject.targetGrade);
                  return (
                    <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(subject.trend)}
                        <div>
                          <h3 className="font-semibold">{subject.subject}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span>Current: <span className={getGradeColor(subject.currentGrade)}>{subject.currentGrade}%</span></span>
                            <span>•</span>
                            <span>Target: {subject.targetGrade}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`${performance.color} bg-transparent border-current`}>
                          {performance.status === 'on-track' ? 'On Track' : 
                           performance.status === 'close' ? 'Close' : 'Behind'}
                        </Badge>
                        <div className="mt-2 w-32">
                          <Progress value={(subject.currentGrade / subject.targetGrade) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Subject Details</h2>
            <div className="flex items-center gap-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setShowAddGrade(true)} 
                size="sm"
                disabled={!selectedSubject}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Grade
              </Button>
            </div>
          </div>

          {selectedSubject && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjects.filter(s => s.id === selectedSubject).map(subject => (
                <React.Fragment key={subject.id}>
                  {/* Assignments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Assignments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {subject.assignments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No assignments recorded</p>
                      ) : (
                        <div className="space-y-3">
                          {subject.assignments.map(assignment => (
                            <div key={assignment.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <h4 className="font-medium">{assignment.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {new Date(assignment.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`font-semibold ${getGradeColor((assignment.score / assignment.maxScore) * 100)}`}>
                                  {assignment.score}/{assignment.maxScore}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {((assignment.score / assignment.maxScore) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tests */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Tests & Exams
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {subject.tests.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No tests recorded</p>
                      ) : (
                        <div className="space-y-3">
                          {subject.tests.map(test => (
                            <div key={test.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <h4 className="font-medium">{test.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {new Date(test.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`font-semibold ${getGradeColor((test.score / test.maxScore) * 100)}`}>
                                  {test.score}/{test.maxScore}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {((test.score / test.maxScore) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </React.Fragment>
              ))}
            </div>
          )}

          {showAddGrade && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Grade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade-type">Type</Label>
                    <Select
                      value={newGrade.type}
                      onValueChange={(value: 'assignment' | 'test') => 
                        setNewGrade(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="test">Test/Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grade-name">Name</Label>
                    <Input
                      id="grade-name"
                      placeholder="e.g., Quiz 1"
                      value={newGrade.name}
                      onChange={(e) => setNewGrade(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="grade-score">Score</Label>
                    <Input
                      id="grade-score"
                      type="number"
                      placeholder="85"
                      value={newGrade.score}
                      onChange={(e) => setNewGrade(prev => ({ ...prev, score: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade-max">Max Score</Label>
                    <Input
                      id="grade-max"
                      type="number"
                      value={newGrade.maxScore}
                      onChange={(e) => setNewGrade(prev => ({ ...prev, maxScore: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade-weight">Weight</Label>
                    <Input
                      id="grade-weight"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={newGrade.weight}
                      onChange={(e) => setNewGrade(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addGrade}>Add Grade</Button>
                  <Button variant="outline" onClick={() => setShowAddGrade(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjects.map(subject => (
                  <div key={subject.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg mb-2">{subject.subject}</h3>
                    <ul className="space-y-1">
                      {getImprovementSuggestions(subject).map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Time Management</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your average study session is {studyMetrics.averageSessionLength} hours. Consider breaking longer sessions into focused 45-60 minute blocks with breaks.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Goal Progress</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You're at {studyMetrics.weeklyGoalProgress}% of your weekly goal. Keep up the momentum!
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Subject Balance</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    You're studying {studyMetrics.subjectsStudied} subjects. Ensure balanced attention across all subjects.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAnalytics;
