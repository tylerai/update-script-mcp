# Project Structure Documentation
\nLast updated: Mon Mar 17 13:18:26 GMT 2025\n
## Project Overview\n
### Package Information\n
```json
  "name": "update-script-mcp",
  "version": "0.1.0",
  "description": "MCP server for automatic project structure documentation",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tylerbuilds/update-script-mcp.git"
```\n
## Directory Structure\n
```
.
./dist
./docs
./docs/architecture
./examples
./examples/demo-project
./examples/demo-project/src
./examples/demo-project/src/components
./examples/demo-project/src/pages
./examples/demo-project/src/utils
./node_modules
./src
./src/analyzers
./src/services
./src/templates
./src/templates/blank-js
./src/templates/blank-js/app
./src/templates/blank-js/components
./src/templates/blank-js/hooks
./src/templates/blank-js/lib
./tests
./tests/mocks
```\n
## Key Files\n
Important configuration and entry point files:\n
- `package.json`
- `tsconfig.json`
- `jest.config.js`
- `README.md`
- `Dockerfile`

## Dependencies\n
### Production Dependencies\n
```json
{
  "@modelcontextprotocol/sdk": "^1.5.0",
  "chokidar": "^3.5.3",
  "fs-extra": "^11.2.0",
  "glob": "^10.3.10"
}
```\n
### Development Dependencies\n
```json
{
  "@types/fs-extra": "^11.0.4",
  "@types/glob": "^8.1.0",
  "@types/jest": "^29.5.12",
  "@types/node": "^20.11.19",
  "jest": "^29.7.0",
  "shx": "^0.3.4",
  "tailwindcss": "^3.4.1",
  "ts-jest": "^29.1.2",
  "ts-node": "^10.9.2",
  "typescript": "^5.3.3"
}
```\n
## Source Files\n
Key source files and their purposes:\n
### `./src/analyzers/MetricsAnalyzer.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
import fs from 'fs-extra';
```\n
### `./src/analyzers/DependencyAnalyzer.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
import fs from 'fs-extra';
```\n
### `./src/analyzers/DiagramGenerator.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
import fs from 'fs-extra';
```\n
### `./src/types.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
export const OPERATIONS = [
```\n
### `./src/mcp-tools.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
/**
 * Custom MCP tools for the update-script project
```\n
### `./src/templates/TemplateGenerator.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
import fs from 'fs-extra';
```\n
### `./src/templates/blank-js/next.config.js`\n
First 5 lines or until first comment block ends:\n
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
```\n
### `./src/templates/blank-js/tailwind.config.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
import type { Config } from 'tailwindcss';
```\n
### `./src/templates/blank-js/postcss.config.js`\n
First 5 lines or until first comment block ends:\n
```typescript
module.exports = {
```\n
### `./src/index.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
#!/usr/bin/env node
```\n
### `./src/services/FileHandler.ts`\n
First 5 lines or until first comment block ends:\n
```typescript
import fs from "fs-extra";
```\n
