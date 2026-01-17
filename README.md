# mcpdf

MCP server for intelligently reading and filling PDF forms through conversational interaction with AI assistants.

## Features

mcpdf provides 7 MCP tools for working with PDF forms:

- **open_pdf** - Open a PDF file and get document summary including page count, form fields, and document type
- **list_fields** - List all form fields in the currently opened PDF with their metadata (name, type, page, current value)
- **get_field_context** - Get detailed context for a specific form field including surrounding text, section name, and constraints
- **fill_field** - Fill a form field with user input. Uses elicitation to prompt for the value based on field type
- **preview_pdf** - Open the current PDF in the system default PDF viewer for visual inspection
- **save_pdf** - Save the modified PDF to a new file. Original file is never modified
- **get_page_content** - Extract and return the text content of a specific page in the PDF

> **Note:** Currently in development. Tool implementations are placeholders and will be completed in Phase 2-3.

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
