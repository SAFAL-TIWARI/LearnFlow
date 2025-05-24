import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Calendar, Target, Plus, BarChart3, Award, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface ProgressEntry {
  id: string;
  subject: string;
  category: 'assignment' | 'test' | 'project' | 'skill';
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  date: string;
  notes?: string;
}

interface SubjectProgress {
  subject: string;
  totalEntries: number;
  completedEntries: number;
  averageProgress: number;
  trend: 'up' | 'down' | 'stable';
}

const ProgressTracker = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ProgressEntry[]>([
    {
      id: '1',
      subject: 'Mathematics',
      category: 'assignment',
      title: 'Calculus Problem Sets',
      currentValue: 8,
      targetValue: 10,
      unit: 'problems',
      date: '2024-01-15',
      notes: 'Making good progress on derivatives'
    },
    {
      id: '2',
      subject: 'Physics',
      category: 'test',
      title: 'Chapter Test Scores',
      currentValue: 85,
      targetValue: 90,
      unit: '%',
      date: '2024-01-20'
    }
  ]);

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<ProgressEntry>>({
    subject: '',
    category: 'assignment',
    title: '',
    currentValue: 0,
    targetValue: 100,
    unit: '%',
    date: new Date().toISOString().split('T')[0]
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'Biology'];
  const categories = ['assignment', 'test', 'project', 'skill'];

  const addEntry = () => {
    if (newEntry.subject && newEntry.title && newEntry.targetValue) {
      const entry: ProgressEntry = {
        id: Date.now().toString(),
        subject: newEntry.subject || '',
        category: newEntry.category || 'assignment',
        title: newEntry.title || '',
        currentValue: newEntry.currentValue || 0,
        targetValue: newEntry.targetValue || 100,
        unit: newEntry.unit || '%',
        date: newEntry.date || new Date().toISOString().split('T')[0]
      };
      setEntries(prev => [...prev, entry]);
      setNewEntry({
        subject: '',
        category: 'assignment',
        title: '',
        currentValue: 0,
        targetValue: 100,
        unit: '%',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddEntry(false);
    }
  };

  const updateEntry = (entryId: string, updates: Partial<ProgressEntry>) => {
    setEntries(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    ));
  };

  const deleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const getProgressPercentage = (entry: ProgressEntry) => {
    return Math.min((entry.currentValue / entry.targetValue) * 100, 100);
  };

  const getSubjectProgress = (): SubjectProgress[] => {
    const subjectMap = new Map<string, ProgressEntry[]>();
    
    entries.forEach(entry => {
      if (!subjectMap.has(entry.subject)) {
        subjectMap.set(entry.subject, []);
      }
      subjectMap.get(entry.subject)!.push(entry);
    });

    return Array.from(subjectMap.entries()).map(([subject, subjectEntries]) => {
      const totalEntries = subjectEntries.length;
      const completedEntries = subjectEntries.filter(e => getProgressPercentage(e) >= 100).length;
      const averageProgress = subjectEntries.reduce((sum, e) => sum + getProgressPercentage(e), 0) / totalEntries;
      
      // Simple trend calculation based on recent entries
      const recentEntries = subjectEntries.slice(-3);
      const oldEntries = subjectEntries.slice(-6, -3);
      const recentAvg = recentEntries.reduce((sum, e) => sum + getProgressPercentage(e), 0) / recentEntries.length;
      const oldAvg = oldEntries.length > 0 ? oldEntries.reduce((sum, e) => sum + getProgressPercentage(e), 0) / oldEntries.length : recentAvg;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > oldAvg + 5) trend = 'up';
      else if (recentAvg < oldAvg - 5) trend = 'down';

      return {
        subject,
        totalEntries,
        completedEntries,
        averageProgress,
        trend
      };
    });
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSubject = selectedSubject === 'all' || entry.subject === selectedSubject;
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSubject && matchesCategory;
  });

  const subjectProgress = getSubjectProgress();

  const getOverallStats = () => {
    const totalEntries = entries.length;
    const completedEntries = entries.filter(e => getProgressPercentage(e) >= 100).length;
    const averageProgress = totalEntries > 0 ? entries.reduce((sum, e) => sum + getProgressPercentage(e), 0) / totalEntries : 0;
    const activeSubjects = new Set(entries.map(e => e.subject)).size;

    return { totalEntries, completedEntries, averageProgress, activeSubjects };
  };

  const stats = getOverallStats();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'assignment': return '📝';
      case 'test': return '📊';
      case 'project': return '🚀';
      case 'skill': return '🎯';
      default: return '📈';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">Progress Tracker</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entries">Progress Entries</TabsTrigger>
          <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalEntries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Entries</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completedEntries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.averageProgress.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Progress</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.activeSubjects}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Subjects</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.slice(-5).reverse().map(entry => {
                  const progress = getProgressPercentage(entry);
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getCategoryIcon(entry.category)}</span>
                        <div>
                          <h4 className="font-medium">{entry.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {entry.subject} • {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                          {progress >= 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="w-24">
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setShowAddEntry(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEntries.map(entry => {
              const progress = getProgressPercentage(entry);
              return (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(entry.category)}</span>
                        <div>
                          <h3 className="font-semibold">{entry.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{entry.subject}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entry.category}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{entry.currentValue}/{entry.targetValue} {entry.unit}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-right text-xs text-gray-500 mt-1">
                          {progress.toFixed(1)}%
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={entry.currentValue}
                            onChange={(e) => updateEntry(entry.id, { currentValue: parseFloat(e.target.value) || 0 })}
                            className="w-16 h-6 text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry(entry.id)}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {showAddEntry && (
            <Card>
              <CardHeader>
                <CardTitle>Add Progress Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entry-subject">Subject</Label>
                    <Select
                      value={newEntry.subject}
                      onValueChange={(value) => setNewEntry(prev => ({ ...prev, subject: value }))}
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
                    <Label htmlFor="entry-category">Category</Label>
                    <Select
                      value={newEntry.category}
                      onValueChange={(value: 'assignment' | 'test' | 'project' | 'skill') =>
                        setNewEntry(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="skill">Skill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="entry-title">Title</Label>
                  <Input
                    id="entry-title"
                    placeholder="e.g., Chapter 5 Exercises"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="entry-current">Current Value</Label>
                    <Input
                      id="entry-current"
                      type="number"
                      value={newEntry.currentValue}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="entry-target">Target Value</Label>
                    <Input
                      id="entry-target"
                      type="number"
                      value={newEntry.targetValue}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 100 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="entry-unit">Unit</Label>
                    <Input
                      id="entry-unit"
                      placeholder="e.g., %, points, problems"
                      value={newEntry.unit}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, unit: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="entry-date">Date</Label>
                  <Input
                    id="entry-date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addEntry}>Add Entry</Button>
                  <Button variant="outline" onClick={() => setShowAddEntry(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectProgress.map(subject => (
                  <div key={subject.subject} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(subject.trend)}
                        <h3 className="font-semibold">{subject.subject}</h3>
                      </div>
                      <Badge variant="outline">
                        {subject.completedEntries}/{subject.totalEntries} completed
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Progress</span>
                        <span>{subject.averageProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={subject.averageProgress} className="h-2" />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{subject.totalEntries} total entries</span>
                      <span className={`capitalize ${
                        subject.trend === 'up' ? 'text-green-600' : 
                        subject.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {subject.trend} trend
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTracker;
