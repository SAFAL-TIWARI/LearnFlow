import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, CheckCircle, Clock, Calendar, Trophy, Star, Trash2, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'personal' | 'career' | 'health';
  priority: 'high' | 'medium' | 'low';
  targetDate: string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  completedAt?: Date;
}

const GoalTracker = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Achieve 90% in Mathematics',
      description: 'Improve my mathematics grade from current 85% to 90% by end of semester',
      category: 'academic',
      priority: 'high',
      targetDate: '2024-06-15',
      progress: 65,
      status: 'active',
      milestones: [
        { id: '1', title: 'Complete all homework assignments', completed: true, dueDate: '2024-02-01' },
        { id: '2', title: 'Score 90%+ on next test', completed: false, dueDate: '2024-02-15' },
        { id: '3', title: 'Attend extra help sessions', completed: false, dueDate: '2024-03-01' }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ]);

  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    targetDate: '',
    progress: 0,
    status: 'active',
    milestones: []
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const addGoal = () => {
    if (newGoal.title && newGoal.targetDate) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title || '',
        description: newGoal.description || '',
        category: newGoal.category || 'academic',
        priority: newGoal.priority || 'medium',
        targetDate: newGoal.targetDate || '',
        progress: 0,
        status: 'active',
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setGoals(prev => [...prev, goal]);
      setNewGoal({
        title: '',
        description: '',
        category: 'academic',
        priority: 'medium',
        targetDate: '',
        progress: 0,
        status: 'active',
        milestones: []
      });
      setShowAddGoal(false);
    }
  };

  const addMilestone = (goalId: string) => {
    if (newMilestone.title) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        title: newMilestone.title,
        description: newMilestone.description || undefined,
        completed: false,
        dueDate: newMilestone.dueDate || undefined
      };

      setGoals(prev => prev.map(goal =>
        goal.id === goalId
          ? { ...goal, milestones: [...goal.milestones, milestone], updatedAt: new Date() }
          : goal
      ));

      setNewMilestone({ title: '', description: '', dueDate: '' });
      setShowAddMilestone(false);
    }
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            const completed = !milestone.completed;
            return {
              ...milestone,
              completed,
              completedAt: completed ? new Date() : undefined
            };
          }
          return milestone;
        });

        // Update goal progress based on completed milestones
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const totalCount = updatedMilestones.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return {
          ...goal,
          milestones: updatedMilestones,
          progress,
          status: progress === 100 ? 'completed' : goal.status,
          updatedAt: new Date()
        };
      }
      return goal;
    }));
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(goal =>
      goal.id === goalId
        ? {
            ...goal,
            progress,
            status: progress === 100 ? 'completed' : goal.status,
            updatedAt: new Date()
          }
        : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    if (selectedGoal === goalId) {
      setSelectedGoal(null);
    }
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '🎓';
      case 'personal': return '🌟';
      case 'career': return '💼';
      case 'health': return '💪';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const selectedGoalData = goals.find(goal => goal.id === selectedGoal);

  const getStatistics = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const active = goals.filter(g => g.status === 'active').length;
    const avgProgress = total > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / total : 0;
    
    return { total, completed, active, avgProgress };
  };

  const stats = getStatistics();

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">Goal Tracker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  My Goals
                </CardTitle>
                <Button onClick={() => setShowAddGoal(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Goal
                </Button>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {filteredGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No goals found</p>
                  <p className="text-sm">Set your first goal to get started</p>
                </div>
              ) : (
                filteredGoals.map(goal => {
                  const daysLeft = getDaysUntilTarget(goal.targetDate);
                  return (
                    <div
                      key={goal.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedGoal === goal.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedGoal(goal.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                          <h3 className="font-semibold">{goal.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityColor(goal.priority)}`}>
                            {goal.priority}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(goal.status)}`}>
                            {goal.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {goal.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span>{goal.milestones.length} milestones</span>
                        <span>
                          {daysLeft > 0 ? `${daysLeft} days left` : 
                           daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} days overdue`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Goal Details and Statistics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Goals</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.avgProgress.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Progress</div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Details */}
          {selectedGoalData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span>{getCategoryIcon(selectedGoalData.category)}</span>
                    Goal Details
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(selectedGoalData.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{selectedGoalData.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedGoalData.description}
                  </p>
                </div>

                <div>
                  <Label htmlFor="goal-progress">Progress: {selectedGoalData.progress}%</Label>
                  <Input
                    id="goal-progress"
                    type="range"
                    min="0"
                    max="100"
                    value={selectedGoalData.progress}
                    onChange={(e) => updateGoalProgress(selectedGoalData.id, parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Milestones</h4>
                    <Button
                      onClick={() => setShowAddMilestone(true)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {selectedGoalData.milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-start gap-2 p-2 border rounded">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => toggleMilestone(selectedGoalData.id, milestone.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                            {milestone.title}
                          </p>
                          {milestone.dueDate && (
                            <p className="text-xs text-gray-500">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Created: {selectedGoalData.createdAt.toLocaleDateString()}</p>
                  <p>Updated: {selectedGoalData.updatedAt.toLocaleDateString()}</p>
                  <p>Target: {new Date(selectedGoalData.targetDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Goal Form */}
          {showAddGoal && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="goal-title">Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g., Learn Python Programming"
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="goal-category">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value: 'academic' | 'personal' | 'career' | 'health') =>
                        setNewGoal(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">🎓 Academic</SelectItem>
                        <SelectItem value="personal">🌟 Personal</SelectItem>
                        <SelectItem value="career">💼 Career</SelectItem>
                        <SelectItem value="health">💪 Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goal-priority">Priority</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value: 'high' | 'medium' | 'low') =>
                        setNewGoal(prev => ({ ...prev, priority: value }))
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

          {/* Add Milestone Form */}
          {showAddMilestone && selectedGoalData && (
            <Card>
              <CardHeader>
                <CardTitle>Add Milestone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="milestone-title">Title</Label>
                  <Input
                    id="milestone-title"
                    placeholder="e.g., Complete Chapter 1"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="milestone-description">Description (optional)</Label>
                  <Textarea
                    id="milestone-description"
                    placeholder="Additional details..."
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="milestone-due">Due Date (optional)</Label>
                  <Input
                    id="milestone-due"
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => addMilestone(selectedGoalData.id)}>Add Milestone</Button>
                  <Button variant="outline" onClick={() => setShowAddMilestone(false)}>
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

export default GoalTracker;
