import React, { useState, useEffect } from 'react';
import { User, JournalEntry } from '../../types';
import Header from './Header';
import InteractionPanel from './InteractionPanel';
import JournalView from './JournalView';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    // Clear all old journal data that might have images
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('thrivesense_journal_')) {
        try {
          const data = localStorage.getItem(key);
          if (data && data.length > 100000) { // If data is larger than 100KB, it likely has images
            console.log('Clearing large localStorage entry:', key);
            localStorage.removeItem(key);
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    });

    // Load journal entries (should be clean now)
    const storedEntries = localStorage.getItem(`thrivesense_journal_${user.email}`);
    if (storedEntries) {
      try {
        const entries = JSON.parse(storedEntries);
        setJournalEntries(entries);
      } catch (error) {
        console.error('Failed to load journal entries:', error);
        localStorage.removeItem(`thrivesense_journal_${user.email}`);
        setJournalEntries([]);
      }
    }
  }, [user.email]);

  const addJournalEntry = (entry: JournalEntry) => {
    const updatedEntries = [entry, ...journalEntries];
    setJournalEntries(updatedEntries);
    
    // Don't store facial images in localStorage to avoid quota issues
    // Create a copy without the facialImage for storage
    const entriesForStorage = updatedEntries.map(e => ({
      ...e,
      facialImage: undefined // Remove image data before storing
    }));
    
    try {
      localStorage.setItem(`thrivesense_journal_${user.email}`, JSON.stringify(entriesForStorage));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // If storage fails, at least keep it in memory
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} onLogout={onLogout} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column for interaction */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 text-sm text-slate-400 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>
                  <strong>Disclaimer:</strong> This tool provides an analysis of your current emotional state based on your input. It is not a diagnostic tool and should not be used as a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
            <InteractionPanel onNewEntry={addJournalEntry} />
          </div>
          {/* Right column for journal view */}
          <div className="lg:col-span-7">
            <JournalView entries={journalEntries} user={user} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;