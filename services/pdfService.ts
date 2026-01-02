import { jsPDF } from 'jspdf';
import { JournalEntry, User } from '../types';

// This assumes html2canvas is loaded from CDN in index.html
declare const html2canvas: any;

// Helper to add header and footer to each page
const addHeaderAndFooter = (pdf: jsPDF, user: User, pageNumber: number, totalPages: number) => {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFontSize(10);
    pdf.setTextColor('#f59e0b'); // Amber
    pdf.text('Thrivesense Wellness Journal', 15, 15);
    pdf.setTextColor('#94a3b8'); // Slate 400
    pdf.text(`User: ${user.username}`, pageWidth - 15, 15, { align: 'right' });
    pdf.setDrawColor('#334155'); // Slate 700
    pdf.line(15, 20, pageWidth - 15, 20);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor('#64748b'); // Slate 500
    pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
};


export const exportJournalToPDF = async (
    chartElement: HTMLElement | null,
    entries: JournalEntry[],
    user: User,
    filename: string = 'Thrivesense_Journal.pdf'
): Promise<void> => {
    if (!chartElement) {
        console.error("Chart element not provided for PDF export.");
        alert("Unable to export PDF: Chart element not found.");
        return;
    }

    if (entries.length === 0) {
        alert("No journal entries to export.");
        return;
    }

    try {
        // Check if html2canvas is available
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded. Please refresh the page and try again.');
        }

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        let cursorY = 25; // Start cursor below header
        let pageNumber = 1;

        // --- Add Chart to the first page ---
        console.log('Generating chart image...');
        const canvas = await html2canvas(chartElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#1e293b', // slate-800
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth; // Fit to content width
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (cursorY + imgHeight > pageHeight - margin) {
            console.warn("Chart is too large, scaling down...");
            const scaledHeight = (pageHeight - margin - cursorY - 20);
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            pdf.addImage(imgData, 'PNG', margin, cursorY, scaledWidth, scaledHeight);
            cursorY += scaledHeight + 10;
        } else {
            pdf.addImage(imgData, 'PNG', margin, cursorY, imgWidth, imgHeight);
            cursorY += imgHeight + 10; // Add padding after chart
        }

        // --- Loop through entries and add them ---
        console.log(`Processing ${entries.length} journal entries...`);
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const formattedDate = new Date(entry.date).toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
            });

            const textLines = entry.transcribedText ? pdf.splitTextToSize(`"${entry.transcribedText}"`, contentWidth - 10) : [];
            const feedbackLines = pdf.splitTextToSize(entry.analysis.feedback, contentWidth - 25);
            const suggestionLines = pdf.splitTextToSize(entry.analysis.activitySuggestion, contentWidth - 25);
            const musicLines = entry.analysis.musicRecommendation ? 
                pdf.splitTextToSize(`♪ ${entry.analysis.musicRecommendation}`, contentWidth - 25) : [];
            
            const textBlockHeight = textLines.length > 0 ? (textLines.length * 5) + 5 : 0;
            const musicBlockHeight = musicLines.length > 0 ? (musicLines.length * 4) + 5 : 0;

            const entryHeight = 
                25 + // Header and metrics
                textBlockHeight +
                5 + // Spacing before feedback
                (feedbackLines.length * 4) +
                (suggestionLines.length * 4) +
                musicBlockHeight +
                15; // Padding

            // --- Check for page break ---
            if (cursorY + entryHeight > pageHeight - margin) {
                pageNumber++;
                pdf.addPage();
                cursorY = 25; // Reset cursor for new page
            }
            
            // --- Draw Entry Card ---
            pdf.setDrawColor('#334155'); // Slate 700
            pdf.setFillColor('#1e293b'); // Slate 800
            pdf.roundedRect(margin, cursorY, contentWidth, entryHeight - 5, 3, 3, 'FD');
            
            let innerCursorY = cursorY + 10;
            
            // Date and Mood
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor('#e2e8f0'); // Slate 100
            pdf.text(formattedDate, margin + 5, innerCursorY);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor('#94a3b8'); // Slate 400
            pdf.text(`AI Mood: ${entry.analysis.overallMood} (${entry.analysis.moodScore}/10)`, margin + 5, innerCursorY + 5);
            
            // Metrics
            pdf.text(`Sleep: ${entry.sleepHours} hrs`, contentWidth - 5, innerCursorY, {align: 'right'});
            pdf.text(`Stress: ${entry.stressLevel}/10`, contentWidth - 5, innerCursorY + 5, {align: 'right'});

            innerCursorY += 15;
            pdf.setDrawColor('#334155');
            pdf.line(margin + 5, innerCursorY, pageWidth - margin - 5, innerCursorY);
            innerCursorY += 10;

            // Journal Text
            if (textLines.length > 0) {
              pdf.setFont('helvetica', 'italic');
              pdf.setTextColor('#cbd5e1'); // Slate 300
              pdf.text(textLines, margin + 5, innerCursorY);
              innerCursorY += textLines.length * 5 + 5;
            }
            
            // AI Feedback Box
            const boxHeight = (feedbackLines.length * 4) + (suggestionLines.length * 4) + musicBlockHeight + 15;
            pdf.setFillColor('#334155'); // Slate 700
            pdf.roundedRect(margin + 5, innerCursorY - 2, contentWidth - 10, boxHeight, 2, 2, 'F');
            
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor('#e2e8f0'); // Slate 200
            pdf.text("Feedback:", margin + 7, innerCursorY + 3);
            pdf.setFont('helvetica', 'normal');
            pdf.text(feedbackLines, margin + 27, innerCursorY + 3);
            innerCursorY += feedbackLines.length * 4 + 5;
            
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor('#6ee7b7'); // Green 300
            pdf.text("Suggestion:", margin + 7, innerCursorY);
            pdf.setFont('helvetica', 'normal');
            pdf.text(suggestionLines, margin + 27, innerCursorY);
            innerCursorY += suggestionLines.length * 4 + 5;

            // Music Recommendation
            if (musicLines.length > 0) {
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor('#c084fc'); // Purple 300
                pdf.text("Music:", margin + 7, innerCursorY);
                pdf.setFont('helvetica', 'normal');
                pdf.text(musicLines, margin + 27, innerCursorY);
            }
            
            cursorY += entryHeight + 5; // Move master cursor down
        }

        // --- Add headers and footers to all pages ---
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            addHeaderAndFooter(pdf, user, i, totalPages);
        }

        console.log('Saving PDF...');
        pdf.save(filename);
        console.log('PDF export completed successfully!');

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
};