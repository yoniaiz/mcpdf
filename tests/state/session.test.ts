import { describe, it, expect, beforeEach } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  setActiveSession,
  getActiveSession,
  isSessionActive,
  markSessionModified,
  clearSession,
  updateSessionPath,
  PdfSession
} from '../../src/state/session.js';
import { SessionError } from '../../src/utils/errors.js';

describe('Session State', () => {
  const mockDoc = {} as PDFDocument;
  const initialSession: PdfSession = {
    document: mockDoc,
    filePath: '/tmp/test.pdf',
    originalPath: '/tmp/test.pdf',
    pageCount: 5,
    isModified: false
  };

  beforeEach(() => {
    clearSession();
  });

  it('should start with no active session', () => {
    expect(isSessionActive()).toBe(false);
    expect(() => getActiveSession()).toThrow(SessionError);
  });

  it('should set and get active session', () => {
    setActiveSession(initialSession);
    expect(isSessionActive()).toBe(true);
    expect(getActiveSession()).toBe(initialSession);
  });

  it('should mark session as modified', () => {
    setActiveSession({ ...initialSession });
    expect(getActiveSession().isModified).toBe(false);

    markSessionModified();
    expect(getActiveSession().isModified).toBe(true);
  });

  it('should safely handle markSessionModified when no session is active', () => {
    expect(() => markSessionModified()).not.toThrow();
  });

  it('should clear session', () => {
    setActiveSession(initialSession);
    expect(isSessionActive()).toBe(true);

    clearSession();
    expect(isSessionActive()).toBe(false);
    expect(() => getActiveSession()).toThrow(SessionError);
  });

  it('should update session path and reset modified status', () => {
    setActiveSession({ ...initialSession, isModified: true });
    
    const newPath = '/tmp/new.pdf';
    updateSessionPath(newPath);
    
    const session = getActiveSession();
    expect(session.filePath).toBe(newPath);
    expect(session.originalPath).toBe('/tmp/test.pdf'); // Should not change
    expect(session.isModified).toBe(false);
  });
});
