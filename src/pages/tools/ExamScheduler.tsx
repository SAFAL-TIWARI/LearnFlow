
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, BookOpen, Target, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  syllabus: string;
  priority: 'high' | 'medium' | 'low';
  preparationStatus: number; // 0-100
  studyPlan: StudyTask[];
}

interface StudyTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  estimatedHours: number;
}

const ExamScheduler = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    subject: '',
    date: '',
    time: '',
    duration: 180,
    location: '',
    syllabus: '',
    priority: 'medium',
    preparationStatus: 0,
    studyPlan: []
  });

  const addExam = () => {
    if (newExam.subject && newExam.date && newExam.time) {
      const exam: Exam = {
        id: Date.now().toString(),
        subject: newExam.subject || '',
        date: newExam.date || '',
        time: newExam.time || '',
        duration: newExam.duration || 180,
        location: newExam.location || '',
        syllabus: newExam.syllabus || '',
        priority: newExam.priority || 'medium',
        preparationStatus: 0,
        studyPlan: []
      };
      setExams(prev => [...prev, exam]);
      setNewExam({
        subject: '',
        date: '',
        time: '',
        duration: 180,
        location: '',
        syllabus: '',
        priority: 'medium',
        preparationStatus: 0,
        studyPlan: []
      });
      setShowAddExam(false);
    }
  };

  const deleteExam = (examId: string) => {
    setExams(prev => prev.filter(exam => exam.id !== examId));
    if (selectedExam === examId) {
      setSelectedExam(null);
    }
  };

  const addStudyTask = (examId: string) => {
    const newTask: StudyTask = {
      id: Date.now().toString(),
      title: '',
      description: '',
      dueDate: '',
      completed: false,
      estimatedHours: 2
    };

    setExams(prev => prev.map(exam =>
      exam.id === examId
        ? { ...exam, studyPlan: [...exam.studyPlan, newTask] }
        : exam
    ));
  };

  const updateStudyTask = (examId: string, taskId: string, updates: Partial<StudyTask>) => {
    setExams(prev => prev.map(exam =>
      exam.id === examId
        ? {
            ...exam,
            studyPlan: exam.studyPlan.map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          }
        : exam
    ));
  };

  const deleteStudyTask = (examId: string, taskId: string) => {
    setExams(prev => prev.map(exam =>
      exam.id === examId
        ? { ...exam, studyPlan: exam.studyPlan.filter(task => task.id !== taskId) }
        : exam
    ));
  };

  const updatePreparationStatus = (examId: string, status: number) => {
    setExams(prev => prev.map(exam =>
      exam.id === examId ? { ...exam, preparationStatus: status } : exam
    ));
  };

  const getDaysUntilExam = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUrgencyStatus = (daysUntil: number) => {
    if (daysUntil < 0) return { text: 'Overdue', color: 'text-red-600 dark:text-red-400' };
    if (daysUntil === 0) return { text: 'Today', color: 'text-red-600 dark:text-red-400' };
    if (daysUntil === 1) return { text: 'Tomorrow', color: 'text-orange-600 dark:text-orange-400' };
    if (daysUntil <= 7) return { text: `${daysUntil} days`, color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: `${daysUntil} days`, color: 'text-green-600 dark:text-green-400' };
  };

  const sortedExams = [...exams].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA.getTime() - dateB.getTime();
  });

  const selectedExamData = exams.find(exam => exam.id === selectedExam);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">Exam Scheduler</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Exams
                </CardTitle>
                <Button
                  onClick={() => setShowAddExam(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedExams.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exams scheduled</p>
                  <p className="text-sm">Add your first exam to get started</p>
                </div>
              ) : (
                sortedExams.map(exam => {
                  const daysUntil = getDaysUntilExam(exam.date);
                  const urgency = getUrgencyStatus(daysUntil);

                  return (
                    <div
                      key={exam.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedExam === exam.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedExam(exam.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm">{exam.subject}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteExam(exam.id);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(exam.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {exam.time}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <Badge className={`text-xs ${getPriorityColor(exam.priority)}`}>
                          {exam.priority}
                        </Badge>
                        <span className={`text-xs font-medium ${urgency.color}`}>
                          {urgency.text}
                        </span>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Preparation</span>
                          <span>{exam.preparationStatus}%</span>
                        </div>
                        <Progress value={exam.preparationStatus} className="h-1" />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exam Details and Study Plan */}
        <div className="lg:col-span-2">
          {showAddExam ? (
            <Card>
              <CardHeader>
                <CardTitle>Add New Exam</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics"
                      value={newExam.subject}
                      onChange={(e) => setNewExam(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newExam.priority}
                      onValueChange={(value: 'high' | 'medium' | 'low') =>
                        setNewExam(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newExam.time}
                      onChange={(e) => setNewExam(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="30"
                      max="480"
                      value={newExam.duration}
                      onChange={(e) => setNewExam(prev => ({ ...prev, duration: parseInt(e.target.value) || 180 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Room 101, Main Building"
                    value={newExam.location}
                    onChange={(e) => setNewExam(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="syllabus">Syllabus/Topics</Label>
                  <Textarea
                    id="syllabus"
                    placeholder="List the topics that will be covered in the exam..."
                    value={newExam.syllabus}
                    onChange={(e) => setNewExam(prev => ({ ...prev, syllabus: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addExam}>Add Exam</Button>
                  <Button variant="outline" onClick={() => setShowAddExam(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedExamData ? (
            <div className="space-y-6">
              {/* Exam Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {selectedExamData.subject}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedExamData.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedExamData.time} ({selectedExamData.duration} min)
                    </div>
                    {selectedExamData.location && (
                      <div>📍 {selectedExamData.location}</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedExamData.syllabus && (
                    <div>
                      <h4 className="font-medium mb-2">Syllabus</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedExamData.syllabus}
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="prep-status">Preparation Status</Label>
                      <span className="text-sm font-medium">{selectedExamData.preparationStatus}%</span>
                    </div>
                    <Input
                      id="prep-status"
                      type="range"
                      min="0"
                      max="100"
                      value={selectedExamData.preparationStatus}
                      onChange={(e) => updatePreparationStatus(selectedExamData.id, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Study Plan */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Study Plan
                    </CardTitle>
                    <Button
                      onClick={() => addStudyTask(selectedExamData.id)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedExamData.studyPlan.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No study tasks yet</p>
                      <p className="text-sm">Add tasks to organize your preparation</p>
                    </div>
                  ) : (
                    selectedExamData.studyPlan.map(task => (
                      <div key={task.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => updateStudyTask(selectedExamData.id, task.id, { completed: e.target.checked })}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Task title"
                              value={task.title}
                              onChange={(e) => updateStudyTask(selectedExamData.id, task.id, { title: e.target.value })}
                              className={task.completed ? 'line-through opacity-60' : ''}
                            />
                            <Textarea
                              placeholder="Task description"
                              value={task.description}
                              onChange={(e) => updateStudyTask(selectedExamData.id, task.id, { description: e.target.value })}
                              rows={2}
                              className={task.completed ? 'line-through opacity-60' : ''}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="date"
                                value={task.dueDate}
                                onChange={(e) => updateStudyTask(selectedExamData.id, task.id, { dueDate: e.target.value })}
                              />
                              <Input
                                type="number"
                                placeholder="Hours"
                                min="0.5"
                                step="0.5"
                                value={task.estimatedHours}
                                onChange={(e) => updateStudyTask(selectedExamData.id, task.id, { estimatedHours: parseFloat(e.target.value) || 2 })}
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStudyTask(selectedExamData.id, task.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Exam Selected</h3>
                  <p>Select an exam from the list to view details and manage your study plan</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamScheduler;
