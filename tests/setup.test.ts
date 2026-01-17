/**
 * Basic project setup tests
 */

import { describe, it, expect } from 'vitest';
import { VERSION, SERVER_NAME, createServer } from '../src/server.js';

describe('Project Setup', () => {
  it('should have a version exported', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('should have a server name exported', () => {
    expect(SERVER_NAME).toBe('mcpdf');
  });

  it('should be able to create a server instance', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it('should be able to create a server with custom options', () => {
    const server = createServer({
      name: 'custom-server',
      version: '2.0.0',
    });
    expect(server).toBeDefined();
  });
});
