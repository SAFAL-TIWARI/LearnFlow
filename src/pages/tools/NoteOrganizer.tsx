
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Calendar,
  Download,
  Trash2,
  Edit3,
  Save,
  X,
  BookOpen,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  category: 'lecture' | 'assignment' | 'research' | 'personal';
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

const NoteOrganizer = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', color: 'bg-blue-500' },
    { id: '2', name: 'Physics', color: 'bg-green-500' },
    { id: '3', name: 'Chemistry', color: 'bg-purple-500' },
    { id: '4', name: 'Computer Science', color: 'bg-orange-500' },
  ]);

  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddNote, setShowAddNote] = useState(false);

  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    subject: '',
    tags: [],
    category: 'lecture'
  });

  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const addNote = () => {
    if (newNote.title && newNote.content && newNote.subject) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title || '',
        content: newNote.content || '',
        subject: newNote.subject || '',
        tags: newNote.tags || [],
        category: newNote.category || 'lecture',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes(prev => [note, ...prev]);
      setNewNote({
        title: '',
        content: '',
        subject: '',
        tags: [],
        category: 'lecture'
      });
      setShowAddNote(false);
      setSelectedNote(note.id);
    }
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote === noteId) {
      setSelectedNote(null);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote({ ...note });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editingNote) {
      updateNote(editingNote.id, editingNote);
      setIsEditing(false);
      setEditingNote(null);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingNote(null);
  };

  const addTag = (noteId: string, tag: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note && tag.trim() && !note.tags.includes(tag.trim())) {
      updateNote(noteId, { tags: [...note.tags, tag.trim()] });
    }
  };

  const removeTag = (noteId: string, tagToRemove: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, { tags: note.tags.filter(tag => tag !== tagToRemove) });
    }
  };

  const exportNote = (note: Note) => {
    const content = `# ${note.title}\n\n**Subject:** ${note.subject}\n**Category:** ${note.category}\n**Created:** ${note.createdAt.toLocaleDateString()}\n**Tags:** ${note.tags.join(', ')}\n\n---\n\n${note.content}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSubject = filterSubject === 'all' || note.subject === filterSubject;
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;

    return matchesSearch && matchesSubject && matchesCategory;
  });

  const getSubjectColor = (subjectName: string) => {
    const subject = subjects.find(s => s.name === subjectName);
    return subject?.color || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lecture': return '📚';
      case 'assignment': return '📝';
      case 'research': return '🔬';
      case 'personal': return '💭';
      default: return '📄';
    }
  };

  const selectedNoteData = notes.find(note => note.id === selectedNote);
  const displayNote = isEditing ? editingNote : selectedNoteData;

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/tools')}
          className="mr-4"
        >
          Back to Tools
        </Button>
        <h1 className="text-3xl font-bold">Note Organizer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Notes List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
                <Button
                  onClick={() => setShowAddNote(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No notes found</p>
                  {searchTerm && <p className="text-xs">Try adjusting your search</p>}
                </div>
              ) : (
                filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedNote === note.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedNote(note.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm line-clamp-2">{note.title}</h3>
                      <span className="text-xs">{getCategoryIcon(note.category)}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      <div className={`w-2 h-2 rounded-full ${getSubjectColor(note.subject)}`}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{note.subject}</span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {note.content.substring(0, 100)}...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            +{note.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {note.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {showAddNote ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="note-title">Title</Label>
                    <Input
                      id="note-title"
                      placeholder="Enter note title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-subject">Subject</Label>
                    <Select
                      value={newNote.subject}
                      onValueChange={(value) => setNewNote(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="note-category">Category</Label>
                  <Select
                    value={newNote.category}
                    onValueChange={(value: 'lecture' | 'assignment' | 'research' | 'personal') =>
                      setNewNote(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">📚 Lecture</SelectItem>
                      <SelectItem value="assignment">📝 Assignment</SelectItem>
                      <SelectItem value="research">🔬 Research</SelectItem>
                      <SelectItem value="personal">💭 Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea
                    id="note-content"
                    placeholder="Write your note here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    rows={12}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addNote}>Create Note</Button>
                  <Button variant="outline" onClick={() => setShowAddNote(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : displayNote ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSubjectColor(displayNote.subject)}`}></div>
                    <div>
                      {isEditing ? (
                        <Input
                          value={editingNote?.title || ''}
                          onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        <CardTitle className="flex items-center gap-2">
                          <span>{getCategoryIcon(displayNote.category)}</span>
                          {displayNote.title}
                        </CardTitle>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <span>{displayNote.subject}</span>
                        <span>•</span>
                        <span>{displayNote.category}</span>
                        <span>•</span>
                        <span>Updated {displayNote.updatedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={saveEdit} size="sm">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => startEditing(displayNote)} variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button onClick={() => exportNote(displayNote)} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          onClick={() => deleteNote(displayNote.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tags */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm font-medium">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayNote.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        {!isEditing && (
                          <button
                            onClick={() => removeTag(displayNote.id, tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {!isEditing && (
                      <Input
                        placeholder="Add tag..."
                        className="w-24 h-6 text-xs"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(displayNote.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>
                  {isEditing ? (
                    <Textarea
                      value={editingNote?.content || ''}
                      onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
                      rows={20}
                      className="resize-none"
                    />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        {displayNote.content}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center text-gray-500">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Note Selected</h3>
                  <p>Select a note from the sidebar or create a new one to get started</p>
                  <Button
                    onClick={() => setShowAddNote(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Note
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

export default NoteOrganizer;
