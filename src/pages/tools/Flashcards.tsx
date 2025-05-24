import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Play, Pause, Edit3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  correctCount: number;
  incorrectCount: number;
  tags: string[];
}

interface StudySession {
  id: string;
  subject: string;
  cardsStudied: number;
  correctAnswers: number;
  duration: number; // in minutes
  date: Date;
}

const Flashcards = () => {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: '1',
      front: 'What is the derivative of x²?',
      back: '2x',
      subject: 'Mathematics',
      difficulty: 'easy',
      correctCount: 5,
      incorrectCount: 1,
      tags: ['calculus', 'derivatives']
    },
    {
      id: '2',
      front: 'What is Newton\'s Second Law?',
      back: 'F = ma (Force equals mass times acceleration)',
      subject: 'Physics',
      difficulty: 'medium',
      correctCount: 3,
      incorrectCount: 2,
      tags: ['mechanics', 'laws']
    }
  ]);

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showAddCard, setShowAddCard] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, startTime: new Date() });

  const [newCard, setNewCard] = useState<Partial<Flashcard>>({
    front: '',
    back: '',
    subject: '',
    difficulty: 'medium',
    tags: []
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'Biology'];

  const addCard = () => {
    if (newCard.front && newCard.back && newCard.subject) {
      const card: Flashcard = {
        id: Date.now().toString(),
        front: newCard.front || '',
        back: newCard.back || '',
        subject: newCard.subject || '',
        difficulty: newCard.difficulty || 'medium',
        correctCount: 0,
        incorrectCount: 0,
        tags: newCard.tags || []
      };
      setFlashcards(prev => [...prev, card]);
      setNewCard({
        front: '',
        back: '',
        subject: '',
        difficulty: 'medium',
        tags: []
      });
      setShowAddCard(false);
    }
  };

  const deleteCard = (cardId: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== cardId));
  };

  const startStudySession = () => {
    const filtered = getFilteredCards();
    if (filtered.length === 0) return;

    setStudyCards([...filtered].sort(() => Math.random() - 0.5)); // Shuffle
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsStudying(true);
    setSessionStats({ correct: 0, incorrect: 0, startTime: new Date() });
  };

  const endStudySession = () => {
    const duration = Math.round((new Date().getTime() - sessionStats.startTime.getTime()) / 60000);
    const session: StudySession = {
      id: Date.now().toString(),
      subject: selectedSubject === 'all' ? 'Mixed' : selectedSubject,
      cardsStudied: sessionStats.correct + sessionStats.incorrect,
      correctAnswers: sessionStats.correct,
      duration,
      date: new Date()
    };
    setSessions(prev => [...prev, session]);
    setIsStudying(false);
    setStudyCards([]);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const markAnswer = (correct: boolean) => {
    const currentCard = studyCards[currentCardIndex];
    if (!currentCard) return;

    // Update card statistics
    setFlashcards(prev => prev.map(card => {
      if (card.id === currentCard.id) {
        return {
          ...card,
          correctCount: correct ? card.correctCount + 1 : card.correctCount,
          incorrectCount: correct ? card.incorrectCount : card.incorrectCount + 1,
          lastReviewed: new Date()
        };
      }
      return card;
    }));

    // Update session statistics
    setSessionStats(prev => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1
    }));

    // Move to next card
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      endStudySession();
    }
  };

  const getFilteredCards = () => {
    return flashcards.filter(card => {
      const matchesSubject = selectedSubject === 'all' || card.subject === selectedSubject;
      const matchesDifficulty = selectedDifficulty === 'all' || card.difficulty === selectedDifficulty;
      return matchesSubject && matchesDifficulty;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAccuracyRate = (card: Flashcard) => {
    const total = card.correctCount + card.incorrectCount;
    return total > 0 ? (card.correctCount / total) * 100 : 0;
  };

  const getOverallStats = () => {
    const totalCards = flashcards.length;
    const totalReviews = flashcards.reduce((sum, card) => sum + card.correctCount + card.incorrectCount, 0);
    const totalCorrect = flashcards.reduce((sum, card) => sum + card.correctCount, 0);
    const overallAccuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
    const totalSessions = sessions.length;

    return { totalCards, totalReviews, overallAccuracy, totalSessions };
  };

  const stats = getOverallStats();
  const filteredCards = getFilteredCards();
  const currentCard = isStudying ? studyCards[currentCardIndex] : null;

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center mb-8">
        <BackButton fallbackPath="/tools" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
        <h1 className="text-3xl font-bold">Flashcards</h1>
      </div>

      {isStudying ? (
        // Study Mode
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Card {currentCardIndex + 1} of {studyCards.length}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">✓ {sessionStats.correct}</span>
              <span className="text-red-600">✗ {sessionStats.incorrect}</span>
              <Button variant="outline" size="sm" onClick={endStudySession}>
                End Session
              </Button>
            </div>
          </div>

          {currentCard && (
            <Card className="min-h-[300px]">
              <CardContent className="p-8 flex flex-col justify-center items-center text-center">
                <div className="mb-4">
                  <Badge className={getDifficultyColor(currentCard.difficulty)}>
                    {currentCard.difficulty}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {currentCard.subject}
                  </Badge>
                </div>

                <div className="text-xl font-medium mb-6">
                  {showAnswer ? currentCard.back : currentCard.front}
                </div>

                {!showAnswer ? (
                  <Button onClick={() => setShowAnswer(true)} className="mt-4">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Show Answer
                  </Button>
                ) : (
                  <div className="flex gap-4 mt-4">
                    <Button
                      variant="destructive"
                      onClick={() => markAnswer(false)}
                    >
                      Incorrect
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => markAnswer(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Correct
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Main Interface
        <Tabs defaultValue="study" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="manage">Manage Cards</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="study" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Start Study Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {filteredCards.length} cards available
                  </span>
                  <Button 
                    onClick={startStudySession}
                    disabled={filteredCards.length === 0}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Start Studying
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Study Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No study sessions yet</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(-5).reverse().map(session => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{session.subject}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {session.date.toLocaleDateString()} • {session.duration} min
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {session.correctAnswers}/{session.cardsStudied} correct
                          </div>
                          <div className="text-xs text-gray-500">
                            {((session.correctAnswers / session.cardsStudied) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Flashcard Collection</h2>
              <Button onClick={() => setShowAddCard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {flashcards.map(card => (
                <Card key={card.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(card.difficulty)}>
                          {card.difficulty}
                        </Badge>
                        <Badge variant="outline">{card.subject}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCard(card.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div>
                        <span className="text-sm font-medium">Front:</span>
                        <p className="text-sm">{card.front}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Back:</span>
                        <p className="text-sm">{card.back}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {card.correctCount + card.incorrectCount} reviews
                      </span>
                      <span>
                        {getAccuracyRate(card).toFixed(1)}% accuracy
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {showAddCard && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Flashcard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="card-subject">Subject</Label>
                      <Select
                        value={newCard.subject}
                        onValueChange={(value) => setNewCard(prev => ({ ...prev, subject: value }))}
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
                      <Label htmlFor="card-difficulty">Difficulty</Label>
                      <Select
                        value={newCard.difficulty}
                        onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                          setNewCard(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="card-front">Front (Question)</Label>
                    <Textarea
                      id="card-front"
                      placeholder="Enter the question or prompt..."
                      value={newCard.front}
                      onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="card-back">Back (Answer)</Label>
                    <Textarea
                      id="card-back"
                      placeholder="Enter the answer or explanation..."
                      value={newCard.back}
                      onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addCard}>Add Card</Button>
                    <Button variant="outline" onClick={() => setShowAddCard(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalCards}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Cards</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalReviews}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Reviews</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.overallAccuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.totalSessions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Sessions</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Card Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {flashcards
                    .filter(card => card.correctCount + card.incorrectCount > 0)
                    .sort((a, b) => getAccuracyRate(b) - getAccuracyRate(a))
                    .map(card => (
                      <div key={card.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{card.front.substring(0, 50)}...</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{card.subject}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {getAccuracyRate(card).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {card.correctCount}/{card.correctCount + card.incorrectCount} correct
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Flashcards;
