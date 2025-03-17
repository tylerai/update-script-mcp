# Project Structure

This document provides an overview of the project structure, explaining the purpose of key directories and files.

## Directory Structure Overview
```
  dist/
    analyzers/
    services/
    src/
      analyzers/
      services/
      templates/
    templates/
      blank-js/
    tests/
      mocks/
  docs/
    architecture/
  examples/
    demo-project/
      src/
        components/
        pages/
        utils/
  node_modules/
  src/
    analyzers/
    services/
    templates/
      blank-js/
        app/
        components/
        hooks/
        lib/
  tests/
    mocks/
```

## Key Components

### Application Code
Contains the core application code including components, utilities, and business logic.

### Tests
Contains test files for the application.

## Main Dependencies

```
"@modelcontextprotocol/sdk": "^1.5.0",
"chokidar": "^3.5.3",
"fs-extra": "^11.2.0",
"glob": "^10.3.10",
```

## Dev Dependencies

```
"@types/fs-extra": "^11.0.4",
"@types/glob": "^8.1.0",
"@types/jest": "^29.5.12",
"@types/node": "^20.11.19",
"jest": "^29.7.0",
"shx": "^0.3.4",
"tailwindcss": "^3.4.1",
"ts-jest": "^29.1.2",
"ts-node": "^10.9.2",
"typescript": "^5.3.3",
```


*This document was automatically generated.*