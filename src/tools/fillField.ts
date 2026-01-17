import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ElicitRequestSchema, ElicitResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { PdfReadOnlyFieldError } from '../pdf/errors.js';
import { getFieldByName } from '../pdf/fields.js';
import { PdfFieldType } from '../pdf/types.js';
import { fillField } from '../pdf/writer.js';
import { getActiveSession, markSessionModified } from '../state/session.js';
import { formatToolError } from '../utils/errors.js';

export function registerFillFieldTool(server: McpServer): void {
  server.registerTool(
    'fill_field',
    {
      description:
        'Fill a form field in the currently opened PDF. Uses interactive elicitation to request the correct value type (string, boolean, or enum) from the user.',
      inputSchema: {
        fieldName: z.string().describe('Name of the field to fill'),
      },
    },
    async ({ fieldName }, extra) => {
      try {
        const session = getActiveSession();
        const { document } = session;

        // 1. Find the field to get its type and options
        const field = getFieldByName(document, fieldName);

        // 2. Check if read-only
        if (field.readOnly) {
          throw new PdfReadOnlyFieldError(fieldName);
        }

        // 3. Construct schema based on field type
        let valueSchema: Record<string, unknown>;

        switch (field.type) {
          case PdfFieldType.Checkbox:
            valueSchema = { type: 'boolean' };
            break;
          case PdfFieldType.Radio:
          case PdfFieldType.Dropdown:
            valueSchema = {
              type: 'string',
              enum: field.options || [],
            };
            break;
          case PdfFieldType.Text:
          case PdfFieldType.Multiline:
          default:
            valueSchema = { type: 'string' };
            break;
        }

        // Add description if available to help the user
        if (field.description) {
          valueSchema.description = field.description;
        }

        // 4. Send elicitation request
        const request = ElicitRequestSchema.parse({
          method: 'elicitation/create',
          params: {
            mode: 'form',
            message: `Please provide a value for field "${fieldName}"`,
            requestedSchema: {
              type: 'object',
              properties: {
                [fieldName]: valueSchema,
              },
              required: [fieldName],
            },
          },
        });

        const result = await extra.sendRequest(request, ElicitResultSchema);

        // 5. Handle result
        if (
          result.action === 'accept' &&
          result.content &&
          typeof result.content === 'object' &&
          !Array.isArray(result.content) &&
          fieldName in result.content
        ) {
          const value = (result.content as Record<string, unknown>)[fieldName];

          // Ensure value is string or boolean (primitive types supported by fillField)
          if (typeof value === 'string' || typeof value === 'boolean') {
            const fillResult = fillField(document, fieldName, value);
            markSessionModified();

            return {
              content: [
                {
                  type: 'text',
                  text: `Successfully filled field "${fieldName}" with value: ${fillResult.value} (Previous: ${fillResult.previousValue})`,
                },
              ],
            };
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: 'Field filling cancelled or declined by user.',
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
