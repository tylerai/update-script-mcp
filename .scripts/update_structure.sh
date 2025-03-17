#!/bin/bash

# Create directories if they don't exist
mkdir -p docs/architecture

# Base output file
STRUCTURE_FILE="docs/architecture/project-structure.md"
MEMORY_FILE="docs/architecture/project-memory.md"

# Generate base documentation
echo "# Project Structure Documentation" > $STRUCTURE_FILE
echo "\nLast updated: $(date)\n" >> $STRUCTURE_FILE

# Project Overview
echo "## Project Overview\n" >> $STRUCTURE_FILE
if [ -f "package.json" ]; then
    echo "### Package Information\n" >> $STRUCTURE_FILE
    echo "\`\`\`json" >> $STRUCTURE_FILE
    cat package.json | grep -A 3 '"name"\|"version"\|"description"' >> $STRUCTURE_FILE
    echo "\`\`\`\n" >> $STRUCTURE_FILE
fi

# Directory Structure
echo "## Directory Structure\n" >> $STRUCTURE_FILE
echo "\`\`\`" >> $STRUCTURE_FILE
find . -type d -not -path "*/\.*" -not -path "*/node_modules/*" -not -path "*/dist/*" | sort >> $STRUCTURE_FILE
echo "\`\`\`\n" >> $STRUCTURE_FILE

# Key Files
echo "## Key Files\n" >> $STRUCTURE_FILE
echo "Important configuration and entry point files:\n" >> $STRUCTURE_FILE
for file in package.json tsconfig.json .eslintrc.js jest.config.js next.config.js webpack.config.js README.md Dockerfile; do
    if [ -f "$file" ]; then
        echo "- \`$file\`" >> $STRUCTURE_FILE
    fi
done
echo "" >> $STRUCTURE_FILE

# Dependencies Section
if [ -f "package.json" ]; then
    echo "## Dependencies\n" >> $STRUCTURE_FILE
    echo "### Production Dependencies\n" >> $STRUCTURE_FILE
    echo "\`\`\`json" >> $STRUCTURE_FILE
    cat package.json | jq -r '.dependencies' >> $STRUCTURE_FILE
    echo "\`\`\`\n" >> $STRUCTURE_FILE
    
    echo "### Development Dependencies\n" >> $STRUCTURE_FILE
    echo "\`\`\`json" >> $STRUCTURE_FILE
    cat package.json | jq -r '.devDependencies' >> $STRUCTURE_FILE
    echo "\`\`\`\n" >> $STRUCTURE_FILE
fi

# Source Files
echo "## Source Files\n" >> $STRUCTURE_FILE
echo "Key source files and their purposes:\n" >> $STRUCTURE_FILE
find ./src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
    echo "### \`$file\`\n" >> $STRUCTURE_FILE
    echo "First 5 lines or until first comment block ends:\n" >> $STRUCTURE_FILE
    echo "\`\`\`typescript" >> $STRUCTURE_FILE
    head -n 10 "$file" | grep -B 10 -m 1 "^[^/]" >> $STRUCTURE_FILE
    echo "\`\`\`\n" >> $STRUCTURE_FILE
done

# Generate visual diagrams if available
if command -v mermaid-cli &> /dev/null; then
    echo "## Visual Diagrams\n" >> $STRUCTURE_FILE
    
    # Project structure diagram
    echo "\`\`\`mermaid" >> $STRUCTURE_FILE
    echo "graph TD" >> $STRUCTURE_FILE
    echo "    A[Project Root] --> B[src/]" >> $STRUCTURE_FILE
    echo "    B --> C[analyzers/]" >> $STRUCTURE_FILE
    echo "    B --> D[services/]" >> $STRUCTURE_FILE
    echo "    B --> E[templates/]" >> $STRUCTURE_FILE
    echo "\`\`\`\n" >> $STRUCTURE_FILE
fi

# Make the script executable
chmod +x .scripts/update_structure.sh

echo "Documentation generated successfully!" 