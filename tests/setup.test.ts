import { describe, it, expect } from 'vitest';
import { VERSION } from '../src/index.js';

describe('Project Setup', () => {
  it('should have a version exported', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('should be able to import from src', () => {
    expect(typeof VERSION).toBe('string');
  });
});
