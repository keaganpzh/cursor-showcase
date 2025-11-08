import { useState, useEffect } from 'react';
import { AiOutlineFileText, AiOutlinePlus, AiOutlineDelete, AiOutlineSave } from 'react-icons/ai';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  modifiedAt: number;
}

const STORAGE_KEY = 'webos-notes';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      }
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedNoteId, notes]);

  const loadNotes = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedNotes = JSON.parse(stored);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0 && !selectedNoteId) {
          setSelectedNoteId(parsedNotes[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      saveNotes(updatedNotes);
      if (selectedNoteId === id) {
        setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      }
    }
  };

  const handleSaveNote = () => {
    if (!selectedNoteId) return;
    
    const updatedNotes = notes.map(note => 
      note.id === selectedNoteId
        ? { ...note, title: title || 'Untitled Note', content, modifiedAt: Date.now() }
        : note
    );
    saveNotes(updatedNotes);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (selectedNoteId) {
      const updatedNotes = notes.map(note => 
        note.id === selectedNoteId
          ? { ...note, title: newTitle || 'Untitled Note', modifiedAt: Date.now() }
          : note
      );
      saveNotes(updatedNotes);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (selectedNoteId) {
      const updatedNotes = notes.map(note => 
        note.id === selectedNoteId
          ? { ...note, content: newContent, modifiedAt: Date.now() }
          : note
      );
      saveNotes(updatedNotes);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="h-full flex bg-white">
      <div 
        className="w-64 border-r flex flex-col"
        style={{
          background: 'linear-gradient(to bottom, #f8f8f8 0%, #ffffff 100%)',
          borderRight: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="p-3 border-b" style={{ borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>Notes</h2>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-md transition-all duration-150 hover:bg-gray-200"
              title="New Note"
            >
              <AiOutlinePlus className="text-base" style={{ color: '#007aff' }} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1.5 text-xs rounded-md border outline-none"
            style={{
              background: 'white',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              color: '#1d1d1f',
            }}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-xs" style={{ color: '#666' }}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedNoteId === note.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  style={{
                    background: selectedNoteId === note.id ? 'rgba(0, 122, 255, 0.1)' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate mb-1" style={{ color: '#1d1d1f' }}>
                        {note.title || 'Untitled Note'}
                      </div>
                      <div className="text-xs truncate mb-1" style={{ color: '#666' }}>
                        {note.content.substring(0, 50) || 'No content'}
                      </div>
                      <div className="text-xs" style={{ color: '#999' }}>
                        {new Date(note.modifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Delete Note"
                    >
                      <AiOutlineDelete className="text-xs" style={{ color: '#ff3b30' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div 
              className="border-b p-3 flex items-center justify-between"
              style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)',
                borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note title..."
                className="flex-1 text-sm font-medium outline-none bg-transparent"
                style={{ color: '#1d1d1f' }}
              />
              <button
                onClick={handleSaveNote}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all duration-150 flex items-center gap-1"
                style={{
                  background: '#007aff',
                  border: '0.5px solid rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0051d5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#007aff';
                }}
              >
                <AiOutlineSave className="text-xs" />
                Save
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing your note..."
              className="flex-1 w-full p-6 text-sm border-none outline-none resize-none bg-white"
              style={{
                color: '#1d1d1f',
                lineHeight: '1.8',
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AiOutlineFileText className="text-6xl mx-auto mb-4" style={{ color: '#999' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#1d1d1f' }}>No Note Selected</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>
                Select a note from the sidebar or create a new one
              </p>
              <button
                onClick={handleCreateNote}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-md transition-all duration-150 flex items-center gap-2 mx-auto"
                style={{
                  background: '#007aff',
                  border: '0.5px solid rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0051d5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#007aff';
                }}
              >
                <AiOutlinePlus />
                New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

