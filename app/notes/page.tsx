'use client';
import { useState } from 'react';

export default function NotesPage() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);

  const handleAddNote = () => {
    if (!note.trim()) return;
    setNotes([...notes, note]);
    setNote('');
  };

  return (
    <main style={{
      maxWidth: 600,
      margin: '40px auto',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center' }}>📝 Quick Notes</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <input
          type="text"
          value={note}
          placeholder="Write a note..."
          onChange={(e) => setNote(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={handleAddNote}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>

      <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
        {notes.map((n, i) => (
          <li key={i}
            style={{
              background: '#f5f5f5',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '10px'
            }}
          >
            {n}
          </li>
        ))}
      </ul>
    </main>
  );
}
