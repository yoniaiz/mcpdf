import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFieldByName } from '../pdf/fields.js';
import { extractTextWithPositions } from '../pdf/text.js';
import { PdfRect, TextItem } from '../pdf/types.js';
import { getActiveSession } from '../state/session.js';

import { formatToolError } from '../utils/errors.js';

/**
 * Calculate the Euclidean distance between two points.
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Find text items that are spatially close to the field and likely to be its label.
 * Prioritizes text above or to the left of the field.
 */
function findLabelCandidates(fieldRect: PdfRect, textItems: TextItem[]): TextItem[] {
  const { x, y, width, height } = fieldRect;
  const MARGIN_X = 150; // Search up to 150pt to the left
  const MARGIN_Y = 50;  // Search up to 50pt above

  return textItems.filter((item) => {
    // Check if item is roughly on the same page area (optimization)
    if (Math.abs(item.x - x) > MARGIN_X + width) return false;
    if (Math.abs(item.y - y) > MARGIN_Y + height) return false;

    // 1. Text above the field (typical for vertical forms)
    // Item is above field top, but within margin
    const isAbove =
      item.y > y && // item is above field bottom
      item.y >= y + height - 5 && // item is roughly above the field top (relaxed with -5pt overlap)
      item.y <= y + height + MARGIN_Y && // within vertical margin
      item.x >= x - 20 && // roughly aligned with field left (allow small overhang)
      item.x <= x + width + 20; // roughly aligned with field right

    // 2. Text to the left of the field (typical for horizontal forms)
    const isLeft =
      item.x < x + 5 && // item is left of field (relaxed with +5pt overlap)
      item.x >= x - MARGIN_X && // within horizontal margin
      item.y >= y - 10 && // vertically aligned (allow small offset)
      item.y <= y + height + 10;

    return isAbove || isLeft;
  });
}

/**
 * Sort candidates by likely relevance (closest is better).
 */
function sortCandidates(fieldRect: PdfRect, candidates: TextItem[]): TextItem[] {
  const { x, y, width, height } = fieldRect;
  // Center of field top edge (for "above" labels)
  const fieldTopCenter = { x: x + width / 2, y: y + height };
  // Center of field left edge (for "left" labels)
  const fieldLeftCenter = { x: x, y: y + height / 2 };

  return candidates.sort((a, b) => {
    // For each item, calculate distance to relevant edge
    // Simple heuristic: min distance to either top-center or left-center
    const distA = Math.min(
      distance(a.x, a.y, fieldTopCenter.x, fieldTopCenter.y),
      distance(a.x, a.y, fieldLeftCenter.x, fieldLeftCenter.y)
    );
    const distB = Math.min(
      distance(b.x, b.y, fieldTopCenter.x, fieldTopCenter.y),
      distance(b.x, b.y, fieldLeftCenter.x, fieldLeftCenter.y)
    );
    return distA - distB;
  });
}

export function registerGetFieldContextTool(server: McpServer): void {
  server.registerTool(
    'get_field_context',
    {
      description:
        'Get detailed context for a specific form field including surrounding text, section name, and constraints',
      inputSchema: {
        fieldName: z.string().describe('Name of the field to get context for'),
      },
    },
    async ({ fieldName }) => {
      try {
        const session = getActiveSession();
        const document = session.document;
        const filePath = session.filePath;

        // 1. Get the field metadata
        const field = getFieldByName(document, fieldName);

        let inferredLabel: string | undefined;
        let nearbyText: string[] = [];

        // 2. If field has visual position, find surrounding text
        if (field.rect && field.page) {
          try {
            // Extract text with positions for the specific page
            const pageText = await extractTextWithPositions(filePath, field.page);
            
            if (pageText.items) {
              // Find likely labels
              const candidates = findLabelCandidates(field.rect, pageText.items);
              const sortedCandidates = sortCandidates(field.rect, candidates);

              // Take the top candidate as inferred label, and top 5 as context
              if (sortedCandidates.length > 0) {
                inferredLabel = sortedCandidates[0].text;
                nearbyText = sortedCandidates.slice(0, 5).map(c => c.text);
              }
            }
          } catch (error) {
            // If text extraction fails, we just don't return context, but tool succeeds with field metadata
            console.error(`Failed to extract text context for field ${fieldName}:`, error);
          }
        }

        // 3. Construct response
        const response = {
          field: {
            name: field.name,
            type: field.type,
            page: field.page,
            required: field.required,
            readOnly: field.readOnly,
            currentValue: field.currentValue,
            options: field.options,
            description: field.description, // Tooltip
          },
          context: {
            inferredLabel,
            nearbyText: nearbyText.length > 0 ? nearbyText : undefined,
            pageNumber: field.page,
          }
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: formatToolError(error),
            },
          ],
          isError: true,
        };
      }
    }
  );
}
