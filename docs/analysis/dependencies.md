# Dependency Analysis

## Files Analyzed

Total files: 73

## File Dependencies

### ./direct-test.js

Imports:
- path
- fs
- child_process

### ./dist/analyzers/DependencyAnalyzer.js

Imports:
- fs-extra
- path
- glob

### ./dist/analyzers/DiagramGenerator.js

Imports:
- fs-extra
- path
- glob
- ./DependencyAnalyzer.js

### ./dist/analyzers/MetricsAnalyzer.js

Imports:
- fs-extra
- path
- glob

### ./dist/index.js

Imports:
- @modelcontextprotocol/sdk/server/index.js
- @modelcontextprotocol/sdk/server/stdio.js
- @modelcontextprotocol/sdk/types.js
- ./services/FileHandler.js
- ./mcp-tools.js

### ./dist/mcp-tools.js

Imports:
- @modelcontextprotocol/sdk/types.js
- fs
- path
- child_process
- ./analyzers/MetricsAnalyzer.js
- ./analyzers/DiagramGenerator.js
- ./analyzers/DependencyAnalyzer.js

### ./dist/services/FileHandler.js

Imports:
- fs-extra
- path
- child_process
- chokidar
- ../templates/TemplateGenerator.js
- ../analyzers/DependencyAnalyzer.js
- ../analyzers/MetricsAnalyzer.js
- ../analyzers/DiagramGenerator.js
- ../mcp-tools.js

### ./dist/src/analyzers/DependencyAnalyzer.js

Imports:
- fs-extra
- path
- glob

### ./dist/src/analyzers/DiagramGenerator.js

Imports:
- fs-extra
- path
- glob
- ./DependencyAnalyzer.js

### ./dist/src/analyzers/MetricsAnalyzer.js

Imports:
- fs-extra
- path
- glob

### ./dist/src/index.d.ts

Imports:
- ./types.js

### ./dist/src/index.js

Imports:
- @modelcontextprotocol/sdk/server/index.js
- @modelcontextprotocol/sdk/server/stdio.js
- @modelcontextprotocol/sdk/types.js
- ./services/FileHandler.js
- ./mcp-tools.js

### ./dist/src/mcp-tools.d.ts

Imports:
- @modelcontextprotocol/sdk/types.js

### ./dist/src/mcp-tools.js

Imports:
- @modelcontextprotocol/sdk/types.js
- fs
- path
- child_process
- ./analyzers/MetricsAnalyzer.js
- ./analyzers/DiagramGenerator.js
- ./analyzers/DependencyAnalyzer.js

### ./dist/src/services/FileHandler.d.ts

Imports:
- ../types.js

### ./dist/src/services/FileHandler.js

Imports:
- fs-extra
- path
- child_process
- chokidar
- ../templates/TemplateGenerator.js
- ../analyzers/DependencyAnalyzer.js
- ../analyzers/MetricsAnalyzer.js
- ../analyzers/DiagramGenerator.js
- ../mcp-tools.js

### ./dist/src/templates/TemplateGenerator.js

Imports:
- fs-extra
- path
- child_process

### ./dist/templates/TemplateGenerator.js

Imports:
- fs-extra
- path
- child_process

### ./dist/templates/blank-js/tailwind.config.js

Imports:
- tailwindcss-animate

### ./dist/tests/UpdateScriptServer.test.js

Imports:
- @jest/globals
- ../src/index.js
- ./mocks/FileHandler.mock.js

### ./dist/tests/command-execution.test.js

Imports:
- ./mocks/FileHandler.mock.js

### ./dist/tests/mocks/FileHandler.mock.d.ts

Imports:
- ../../src/types.js

### ./dist/tests/types.test.js

Imports:
- ../src/types.js

### ./esm-test.js

Imports:
- path
- fs
- child_process
- url

### ./examples/demo-project/src/pages/Home.js

Imports:
- react
- ../components/Button
- ../utils/helpers

### ./examples/demo.js

Imports:
- child_process
- @modelcontextprotocol/sdk

### ./examples/feature-demo.js

Imports:
- child_process
- @modelcontextprotocol/sdk/client/mcp.js
- path
- fs
- url

### ./generate-memory.js

Imports:
- fs
- path
- child_process

### ./src/analyzers/DependencyAnalyzer.ts

Imports:
- fs-extra
- path
- glob

### ./src/analyzers/DiagramGenerator.ts

Imports:
- fs-extra
- path
- glob
- ./DependencyAnalyzer.js

### ./src/analyzers/MetricsAnalyzer.ts

Imports:
- fs-extra
- path
- glob

### ./src/index.ts

Imports:
- @modelcontextprotocol/sdk/server/index.js
- @modelcontextprotocol/sdk/server/stdio.js
- ./services/FileHandler.js
- child_process
- path
- fs

### ./src/mcp-tools.ts

Imports:
- fs
- path
- child_process
- ./analyzers/MetricsAnalyzer.js
- ./analyzers/DiagramGenerator.js
- ./analyzers/DependencyAnalyzer.js

### ./src/services/FileHandler.ts

Imports:
- fs-extra
- path
- child_process
- chokidar
- @modelcontextprotocol/sdk/types.js
- ../templates/TemplateGenerator.js
- ../analyzers/DependencyAnalyzer.js
- ../analyzers/MetricsAnalyzer.js
- ../analyzers/DiagramGenerator.js

### ./src/templates/TemplateGenerator.ts

Imports:
- fs-extra
- path
- child_process

### ./src/templates/blank-js/tailwind.config.ts

Imports:
- tailwindcss
- tailwindcss-animate

### ./test-direct.ts

Imports:
- ./src/services/FileHandler
- path
- fs
- child_process

### ./test-manual/direct-test.js

Imports:
- path
- fs
- ../dist/mcp-tools.js

### ./test-manual/list-tools.js

Imports:
- child_process

### ./test-manual/src/components/Dialog.tsx

Imports:
- react
- @radix-ui/react-dialog
- ../utils/date
- ../utils/analytics

### ./test-manual/test-single-tool.js

Imports:
- child_process
- path
- fs

### ./test-manual/test-tools.js

Imports:
- child_process
- path
- fs

### ./test-mcp.js

Imports:
- ./dist/index.js
- child_process
- url
- path
- fs

### ./test-memory-bank.js

Imports:
- ./dist/services/FileHandler.js

### ./test-simple.js

Imports:
- path
- fs
- child_process

### ./test/integration.test.ts

Imports:
- vitest
- fs-extra
- path
- child_process
- ./components/App
- ./utils
- react
- ./Button
- ../utils
- react

### ./tests/UpdateScriptServer.test.ts

Imports:
- @jest/globals
- ../src/index.js
- ./mocks/FileHandler.mock.js
- ../src/types.js

### ./tests/command-execution.test.ts

Imports:
- @jest/globals
- ./mocks/FileHandler.mock.js
- ../src/types.js

### ./tests/mocks/FileHandler.mock.ts

Imports:
- ../../src/types.js

### ./vitest.config.ts

Imports:
- vitest/config

