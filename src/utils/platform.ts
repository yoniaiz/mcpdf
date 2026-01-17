/**
 * Platform-specific utilities for mcpdf
 */

import { exec } from 'node:child_process';
import os from 'node:os';
import { promisify } from 'node:util';
import { PdfPreviewError } from '../pdf/errors.js';

const execAsync = promisify(exec);

/**
 * Open a file in the system's default application
 * @param path Absolute path to the file to open
 * @throws {PdfPreviewError} If opening the file fails
 */
export async function openFile(path: string): Promise<void> {
  const platform = os.platform();
  let command: string;

  switch (platform) {
    case 'darwin':
      command = `open "${path}"`;
      break;
    case 'win32':
      command = `start "" "${path}"`;
      break;
    case 'linux':
      command = `xdg-open "${path}"`;
      break;
    default:
      throw new PdfPreviewError(`Unsupported platform: ${platform}`);
  }

  try {
    await execAsync(command);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new PdfPreviewError(`Failed to execute command '${command}': ${errorMessage}`);
  }
}
