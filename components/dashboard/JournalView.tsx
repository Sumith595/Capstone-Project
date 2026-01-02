import React, { useRef, useState } from 'react';
import { JournalEntry, User } from '../../types'; // Assuming User is now needed
import JournalEntryCard from './JournalEntryCard';
import MoodChart from './MoodChart';
import { exportJournalToPDF } from '../../services/pdfService';

interface JournalViewProps {
  entries: JournalEntry[];
  user: User; // User is needed for the new PDF service
}

const JournalView: React.FC<JournalViewProps> = ({ entries, user }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      // Pass the element, entries, and user to the new service
      await exportJournalToPDF(chartContainerRef.current, entries, user);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    // The main container no longer needs an ID for screen capture
    <div className="bg-slate-800 rounded-2xl shadow-lg p-6 space-y-6 ring-1 ring-slate-700 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">Your Journal</h2>
        <button
          onClick={handleExport}
          disabled={entries.length === 0 || isExporting}
          className="bg-slate-700 text-slate-200 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm transition-colors disabled:bg-slate-600/50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Export Journal to PDF"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </>
          )}
        </button>
      </div>

      {entries.length > 0 ? (
        <>
          {/* The ref is attached here to capture the chart specifically */}
          <div className="h-64" ref={chartContainerRef}>
            <MoodChart entries={entries} />
          </div>
          <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
            {entries.map(entry => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-100">No journal entries yet</h3>
          <p className="mt-1 text-sm text-slate-400">Create your first entry to get started.</p>
        </div>
      )}
    </div>
  );
};

export default JournalView;
