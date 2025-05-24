import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, BookOpen, Target, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  scheduledDate: string;
  scheduledTime: string;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'completed' | 'missed';
  notes?: string;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number; // 0-100
  sessions: string[]; // session IDs
}

const StudyPlanner = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const [newSession, setNewSession] = useState<Partial<StudySession>>({
    subject: '',
    topic: '',
    duration: 60,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    priority: 'medium',
    status: 'scheduled'
  });

  const [newGoal, setNewGoal] = useState<Partial<StudyGoal>>({
    title: '',
    description: '',
    targetDate: '',
    progress: 0,
    sessions: []
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'Biology'];

  const addSession = () => {
    if (newSession.subject && newSession.topic && newSession.scheduledDate && newSession.scheduledTime) {
      const session: StudySession = {
        id: Date.now().toString(),
        subject: newSession.subject || '',
        topic: newSession.topic || '',
        duration: newSession.duration || 60,
        scheduledDate: newSession.scheduledDate || '',
        scheduledTime: newSession.scheduledTime || '',
        priority: newSession.priority || 'medium',
        status: 'scheduled'
      };
      setSessions(prev => [...prev, session]);
      setNewSession({
        subject: '',
        topic: '',
        duration: 60,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        priority: 'medium',
        status: 'scheduled'
      });
      setShowAddSession(false);
    }
  };

  const addGoal = () => {
    if (newGoal.title && newGoal.targetDate) {
      const goal: StudyGoal = {
        id: Date.now().toString(),
        title: newGoal.title || '',
        description: newGoal.description || '',
        targetDate: newGoal.targetDate || '',
        progress: 0,
        sessions: []
      };
      setGoals(prev => [...prev, goal]);
      setNewGoal({
        title: '',
        description: '',
        targetDate: '',
        progress: 0,
        sessions: []
      });
      setShowAddGoal(false);
    }
  };

  const updateSessionStatus = (sessionId: string, status: 'completed' | 'missed') => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId ? { ...session, status } : session
    ));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getSessionsForDate = (date: string) => {
    return sessions.filter(session => session.scheduledDate === date)
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTotalStudyTime = () => {
    return sessions
      .filter(s => s.status === 'completed')
      .reduce((total, session) => total + session.duration, 0);
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });

    const completed = weekSessions.filter(s => s.status === 'completed').length;
    const total = weekSessions.length;
    
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const todaySessions = getSessionsForDate(selectedDate);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">Study Planner</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Selector */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Study Schedule
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <Button onClick={() => setShowAddSession(true)} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Session
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No study sessions scheduled for this date</p>
                  <p className="text-sm">Add a session to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map(session => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(session.status)}
                          <h3 className="font-semibold">{session.subject}</h3>
                          <Badge className={`text-xs ${getPriorityColor(session.priority)}`}>
                            {session.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateSessionStatus(session.id, 'completed')}
                                className="h-6 text-xs"
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateSessionStatus(session.id, 'missed')}
                                className="h-6 text-xs"
                              >
                                Missed
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSession(session.id)}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{session.topic}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.scheduledTime}
                        </div>
                        <div>{session.duration} minutes</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Study Goals
                </CardTitle>
                <Button onClick={() => setShowAddGoal(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No study goals set</p>
                  <p className="text-sm">Set goals to track your progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map(goal => (
                    <div key={goal.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{goal.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        <span>{goal.sessions.length} sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Forms */}
        <div className="lg:col-span-1 space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.floor(getTotalStudyTime() / 60)}h {getTotalStudyTime() % 60}m
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Study Time</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {sessions.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Sessions Completed</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {getWeeklyProgress().toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Weekly Progress</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {goals.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Goals</div>
              </div>
            </CardContent>
          </Card>

          {/* Add Session Form */}
          {showAddSession && (
            <Card>
              <CardHeader>
                <CardTitle>Add Study Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="session-subject">Subject</Label>
                  <Select
                    value={newSession.subject}
                    onValueChange={(value) => setNewSession(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="session-topic">Topic</Label>
                  <Input
                    id="session-topic"
                    placeholder="What will you study?"
                    value={newSession.topic}
                    onChange={(e) => setNewSession(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="session-date">Date</Label>
                    <Input
                      id="session-date"
                      type="date"
                      value={newSession.scheduledDate}
                      onChange={(e) => setNewSession(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-time">Time</Label>
                    <Input
                      id="session-time"
                      type="time"
                      value={newSession.scheduledTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="session-duration">Duration (min)</Label>
                    <Input
                      id="session-duration"
                      type="number"
                      min="15"
                      max="480"
                      value={newSession.duration}
                      onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-priority">Priority</Label>
                    <Select
                      value={newSession.priority}
                      onValueChange={(value: 'high' | 'medium' | 'low') =>
                        setNewSession(prev => ({ ...prev, priority: value }))
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

                <div className="flex gap-2">
                  <Button onClick={addSession}>Add Session</Button>
                  <Button variant="outline" onClick={() => setShowAddSession(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Goal Form */}
          {showAddGoal && (
            <Card>
              <CardHeader>
                <CardTitle>Add Study Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g., Master Calculus"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    placeholder="Describe your goal..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="goal-target">Target Date</Label>
                  <Input
                    id="goal-target"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addGoal}>Add Goal</Button>
                  <Button variant="outline" onClick={() => setShowAddGoal(false)}>
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

export default StudyPlanner;
