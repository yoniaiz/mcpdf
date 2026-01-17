# mcpdf

MCP server for intelligently reading and filling PDF forms through conversational interaction with AI assistants.

## Features

mcpdf provides 7 MCP tools for working with PDF forms:

- **open_pdf** - Open a PDF file and get document summary including page count, form fields, and document type. Validates the file and initializes the session.
- **list_fields** - List all form fields in the currently opened PDF with their metadata (name, type, page, current value). Supports pagination.
- **get_field_context** - Get detailed context for a specific form field including surrounding text, section name, and constraints. Useful for understanding ambiguous fields.
- **fill_field** - Fill a form field with user input. Supports text, checkbox, radio button, and dropdown fields. Uses elicitation to prompt for clarification if needed.
- **preview_pdf** - Open the current PDF in the system default PDF viewer for visual inspection. Supports macOS, Windows, and Linux.
- **save_pdf** - Save the modified PDF to a new file. Automatically generates a filename (e.g., `original_filled.pdf`) if no path is provided. Original file is never modified.
- **get_page_content** - Extract and return the text content of a specific page in the PDF.

## Workflow Example

Here is a typical workflow for filling a PDF form:

1.  **Open a PDF**: Start by opening a PDF file.
    ```
    open_pdf(path="/path/to/form.pdf")
    ```
2.  **Explore Fields**: List the available fields to understand what needs to be filled.
    ```
    list_fields()
    ```
3.  **Get Context**: If a field is unclear, get more context about it.
    ```
    get_field_context(fieldName="signature_date")
    ```
4.  **Fill Fields**: Fill the fields with values. The tool handles different field types (text, checkbox, etc.).
    ```
    fill_field(fieldName="full_name", value="John Doe")
    ```
5.  **Preview**: Check your work visually.
    ```
    preview_pdf()
    ```
6.  **Save**: Save the completed form to a new file.
    ```
    save_pdf()
    ```

## Installation

### Using npx (Recommended)

No installation needed. Use directly with npx:

```bash
npx -y mcpdf
```

### Global Installation

```bash
npm install -g mcpdf
# or
pnpm add -g mcpdf
```

## Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcpdf": {
      "command": "npx",
      "args": ["-y", "mcpdf"]
    }
  }
}
```

Or with global installation:

```json
{
  "mcpServers": {
    "mcpdf": {
      "command": "mcpdf"
    }
  }
}
```

## Usage with VS Code / Cursor

For quick installation, you can configure the MCP server using one of these methods:

**Method 1: User Configuration (Recommended)**
Add the configuration to your user-level MCP configuration file. Open the Command Palette (`Ctrl + Shift + P` / `Cmd + Shift + P`) and run `MCP: Open User Configuration`. This will open your user `mcp.json` file where you can add the server configuration.

**Method 2: Workspace Configuration**
Alternatively, you can add the configuration to a file called `.vscode/mcp.json` in your workspace. This will allow you to share the configuration with others.

### Configuration Example

```json
{
  "servers": {
    "mcpdf": {
      "command": "npx",
      "args": ["-y", "mcpdf"]
    }
  }
}
```

Or with global installation:

```json
{
  "servers": {
    "mcpdf": {
      "command": "mcpdf"
    }
  }
}
```

> For more details about MCP configuration in VS Code, see the [official VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).

## Troubleshooting

### Common Issues

-   **"File not found" error**:
    Ensure you are using the absolute path to the PDF file. Relative paths might not resolve correctly depending on the server's working directory.

-   **"PDF is password protected" error**:
    mcpdf currently does not support password-protected or encrypted PDF files. Please remove the password before opening.

-   **"Elicitation not appearing"**:
    If `fill_field` fails to prompt for clarification (elicitation), ensure your MCP client supports the `elicitation/create` capability.

-   **Preview not opening**:
    The `preview_pdf` tool relies on your system's default PDF viewer.
    -   **macOS**: Uses `open` command.
    -   **Windows**: Uses `start` command.
    -   **Linux**: Uses `xdg-open`.
    Ensure you have a default PDF viewer configured.

## Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd mcpdf

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run build` | Build the project with tsdown |
| `pnpm run dev` | Watch mode for development |
| `pnpm test` | Run tests with vitest |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Run ESLint with auto-fix |
| `pnpm run typecheck` | Run TypeScript type checking |
| `pnpm run check` | Run all checks (lint + typecheck + test) |
| `pnpm run inspect` | Launch MCP Inspector for visual testing |
| `pnpm run generate:fixtures` | Generate test PDF fixtures |

### Testing with MCP Inspector

The MCP Inspector is a visual testing tool for MCP servers. To test mcpdf:

```bash
# Build first
pnpm run build

# Launch inspector
pnpm run inspect
```

This will:
1. Start the MCP Inspector proxy server
2. Open your browser to `http://localhost:6274`
3. Allow you to interactively test all tools through the web UI

The inspector provides:
- Visual interface for testing tools
- Request/response inspection
- Tool schema validation
- Real-time server communication

For more information, see the [MCP Inspector documentation](https://modelcontextprotocol.io/docs/tools/inspector).

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
