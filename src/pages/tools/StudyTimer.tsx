
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Settings, Clock, Coffee, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

interface Session {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: Date;
}

const StudyTimer = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  });

  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio notification
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback for browsers that don't allow autoplay
        console.log('Audio notification blocked');
      });
    }

    // Add completed session to history
    const newSession: Session = {
      id: Date.now().toString(),
      type: currentSession,
      duration: getCurrentDuration(),
      completedAt: new Date()
    };
    setCompletedSessions(prev => [...prev, newSession]);

    // Determine next session type
    if (currentSession === 'work') {
      const newWorkSessions = workSessionsCompleted + 1;
      setWorkSessionsCompleted(newWorkSessions);

      if (newWorkSessions % settings.sessionsUntilLongBreak === 0) {
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setCurrentSession('work');
      setTimeLeft(settings.workDuration * 60);
    }

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(`${currentSession === 'work' ? 'Work' : 'Break'} session completed!`, {
        body: `Time for a ${currentSession === 'work' ? 'break' : 'work session'}`,
        icon: '/favicon.ico'
      });
    }
  };

  const getCurrentDuration = () => {
    switch (currentSession) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
    }
  };

  const toggleTimer = () => {
    if (!isRunning && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentDuration() * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work': return <Target className="h-5 w-5" />;
      case 'shortBreak': return <Coffee className="h-5 w-5" />;
      case 'longBreak': return <Coffee className="h-5 w-5" />;
    }
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work': return 'from-red-500 to-orange-500';
      case 'shortBreak': return 'from-green-500 to-emerald-500';
      case 'longBreak': return 'from-blue-500 to-indigo-500';
    }
  };

  const progress = ((getCurrentDuration() * 60 - timeLeft) / (getCurrentDuration() * 60)) * 100;

  const todaySessions = completedSessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.completedAt);
    return sessionDate.toDateString() === today.toDateString();
  });

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/tools')}
          className="mr-4"
        >
          Back to Tools
        </Button>
        <h1 className="text-3xl font-bold">Study Timer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pomodoro Timer
              </CardTitle>
              <div className="flex items-center gap-2">
                {getSessionIcon()}
                <span className="capitalize font-medium">
                  {currentSession === 'shortBreak' ? 'Short Break' :
                   currentSession === 'longBreak' ? 'Long Break' : 'Work Session'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Task */}
              <div>
                <Label htmlFor="current-task">Current Task (Optional)</Label>
                <Input
                  id="current-task"
                  placeholder="What are you working on?"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  disabled={isRunning}
                />
              </div>

              {/* Timer Display */}
              <div className="text-center">
                <div className={`inline-block p-8 rounded-full bg-gradient-to-br ${getSessionColor()} text-white shadow-lg`}>
                  <div className="text-6xl font-mono font-bold">
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <Progress value={progress} className="mt-4 h-2" />
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className="px-8"
                >
                  {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {todaySessions.filter(s => s.type === 'work').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Work Sessions</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(todaySessions.filter(s => s.type === 'work').reduce((acc, s) => acc + s.duration, 0) / 60)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Minutes Focused</div>
                </div>
              </div>

              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {workSessionsCompleted % settings.sessionsUntilLongBreak}/{settings.sessionsUntilLongBreak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Until Long Break</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Timer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                <Input
                  id="work-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Label htmlFor="short-break">Short Break (minutes)</Label>
                <Input
                  id="short-break"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 5 }))}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Label htmlFor="long-break">Long Break (minutes)</Label>
                <Input
                  id="long-break"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Label htmlFor="sessions-until-long">Sessions Until Long Break</Label>
                <Input
                  id="sessions-until-long"
                  type="number"
                  min="2"
                  max="8"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) || 4 }))}
                  disabled={isRunning}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
