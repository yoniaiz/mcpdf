import { PDFDocument } from 'pdf-lib';

/**
 * Interface for the active PDF session state
 */
export interface PdfSession {
  /** The loaded pdf-lib PDFDocument instance */
  document: PDFDocument;
  /** Absolute path to the current file (may change after save) */
  filePath: string;
  /** Absolute path to the file when first opened */
  originalPath: string;
  /** Total number of pages in the document */
  pageCount: number;
  /** Whether the document has been modified */
  isModified: boolean;
}

// Singleton state instance
let activeSession: PdfSession | null = null;

/**
 * Set the active PDF session
 * @param session The session to make active
 */
export function setActiveSession(session: PdfSession): void {
  activeSession = session;
}

/**
 * Get the active PDF session
 * @returns The active session
 * @throws Error if no session is active
 */
export function getActiveSession(): PdfSession {
  if (!activeSession) {
    throw new Error('No active PDF session');
  }
  return activeSession;
}

/**
 * Mark the active session as modified
 */
export function markSessionModified(): void {
  if (activeSession) {
    activeSession.isModified = true;
  }
}

/**
 * Clear the active session
 */
export function clearSession(): void {
  activeSession = null;
}

/**
 * Check if a session is currently active
 * @returns true if a session is active
 */
export function isSessionActive(): boolean {
  return activeSession !== null;
}
