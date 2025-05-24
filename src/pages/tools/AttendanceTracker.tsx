import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, XCircle, Plus, Trash2, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  requiredPercentage: number;
  color: string;
}

interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

const AttendanceTracker = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Mathematics',
      totalClasses: 45,
      attendedClasses: 38,
      requiredPercentage: 75,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Physics',
      totalClasses: 40,
      attendedClasses: 32,
      requiredPercentage: 75,
      color: 'bg-green-500'
    }
  ]);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    requiredPercentage: 75
  });

  const addSubject = () => {
    if (newSubject.name.trim()) {
      const subject: Subject = {
        id: Date.now().toString(),
        name: newSubject.name.trim(),
        totalClasses: 0,
        attendedClasses: 0,
        requiredPercentage: newSubject.requiredPercentage,
        color: `bg-${['blue', 'green', 'purple', 'orange', 'red', 'yellow'][Math.floor(Math.random() * 6)]}-500`
      };
      setSubjects(prev => [...prev, subject]);
      setNewSubject({ name: '', requiredPercentage: 75 });
      setShowAddSubject(false);
    }
  };

  const markAttendance = (subjectId: string, status: 'present' | 'absent' | 'late') => {
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = records.find(r => r.subjectId === subjectId && r.date === today);
    
    if (existingRecord) {
      setRecords(prev => prev.map(r => 
        r.id === existingRecord.id ? { ...r, status } : r
      ));
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        subjectId,
        date: today,
        status
      };
      setRecords(prev => [...prev, newRecord]);
    }

    // Update subject stats
    setSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        const subjectRecords = records.filter(r => r.subjectId === subjectId);
        const todayRecord = subjectRecords.find(r => r.date === today);
        
        let totalClasses = subject.totalClasses;
        let attendedClasses = subject.attendedClasses;

        if (!todayRecord) {
          totalClasses += 1;
          if (status === 'present' || status === 'late') {
            attendedClasses += 1;
          }
        } else {
          // Updating existing record
          if ((todayRecord.status === 'absent') && (status === 'present' || status === 'late')) {
            attendedClasses += 1;
          } else if ((todayRecord.status === 'present' || todayRecord.status === 'late') && status === 'absent') {
            attendedClasses -= 1;
          }
        }

        return { ...subject, totalClasses, attendedClasses };
      }
      return subject;
    }));
  };

  const getAttendancePercentage = (subject: Subject) => {
    return subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;
  };

  const getStatusColor = (percentage: number, required: number) => {
    if (percentage >= required) return 'text-green-600 dark:text-green-400';
    if (percentage >= required - 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getClassesNeeded = (subject: Subject) => {
    const currentPercentage = getAttendancePercentage(subject);
    if (currentPercentage >= subject.requiredPercentage) return 0;
    
    const needed = Math.ceil(
      (subject.requiredPercentage * subject.totalClasses - 100 * subject.attendedClasses) /
      (100 - subject.requiredPercentage)
    );
    return Math.max(0, needed);
  };

  const getTodayAttendance = (subjectId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return records.find(r => r.subjectId === subjectId && r.date === today);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">Attendance Tracker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Subjects
                </CardTitle>
                <Button onClick={() => setShowAddSubject(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subject
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No subjects added</p>
                  <p className="text-sm">Add your first subject to start tracking attendance</p>
                </div>
              ) : (
                subjects.map(subject => {
                  const percentage = getAttendancePercentage(subject);
                  const todayRecord = getTodayAttendance(subject.id);
                  const classesNeeded = getClassesNeeded(subject);

                  return (
                    <div key={subject.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${subject.color}`}></div>
                          <h3 className="font-semibold">{subject.name}</h3>
                        </div>
                        <Badge 
                          className={`${getStatusColor(percentage, subject.requiredPercentage)} bg-transparent border-current`}
                        >
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>Attended: {subject.attendedClasses}/{subject.totalClasses}</span>
                          <span>Required: {subject.requiredPercentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>

                      {classesNeeded > 0 && (
                        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Need to attend {classesNeeded} more classes</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Today:</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={todayRecord?.status === 'present' ? 'default' : 'outline'}
                            onClick={() => markAttendance(subject.id, 'present')}
                            className="h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={todayRecord?.status === 'absent' ? 'destructive' : 'outline'}
                            onClick={() => markAttendance(subject.id, 'absent')}
                            className="h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={todayRecord?.status === 'late' ? 'secondary' : 'outline'}
                            onClick={() => markAttendance(subject.id, 'late')}
                            className="h-8"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Late
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {subjects.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Subjects</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {subjects.reduce((acc, s) => acc + s.attendedClasses, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Classes Attended</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {subjects.reduce((acc, s) => acc + s.totalClasses, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Classes</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {subjects.length > 0 ? 
                    (subjects.reduce((acc, s) => acc + getAttendancePercentage(s), 0) / subjects.length).toFixed(1) : 0
                  }%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Overall Average</div>
              </div>
            </CardContent>
          </Card>

          {showAddSubject && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Add New Subject</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Mathematics"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="required-percentage">Required Attendance (%)</Label>
                  <Input
                    id="required-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={newSubject.requiredPercentage}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, requiredPercentage: parseInt(e.target.value) || 75 }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addSubject}>Add Subject</Button>
                  <Button variant="outline" onClick={() => setShowAddSubject(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
