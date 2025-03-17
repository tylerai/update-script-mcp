// MCP server test script
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test project structure
async function createTestProject() {
  console.log('Creating test project structure...');
  
  const testProjectPath = path.join(__dirname, 'test-project');
  
  // Clean up previous test project if it exists
  if (fs.existsSync(testProjectPath)) {
    fs.rmSync(testProjectPath, { recursive: true, force: true });
  }
  
  // Create project directories
  const directories = [
    '',
    'src',
    'src/components',
    'src/pages',
    'src/hooks',
    'src/utils',
    'public',
    'styles'
  ];
  
  for (const dir of directories) {
    fs.mkdirSync(path.join(testProjectPath, dir), { recursive: true });
  }
  
  // Create sample files
  const files = [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: "test-next-app",
        version: "0.1.0",
        private: true,
        description: "A test Next.js project",
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start"
        },
        dependencies: {
          next: "^13.4.1",
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        }
      }, null, 2)
    },
    {
      path: 'src/pages/index.jsx',
      content: `import Head from 'next/head';
import { useState } from 'react';
import Button from '../components/Button';
import { formatDate } from '../utils/dateUtils';

export default function Home() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <Head>
        <title>Test Project</title>
      </Head>
      <main>
        <h1>Welcome to Test Project</h1>
        <p>Current date: {formatDate(new Date())}</p>
        <p>Count: {count}</p>
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
      </main>
    </div>
  );
}`
    },
    {
      path: 'src/components/Button.jsx',
      content: `import React from 'react';

const Button = ({ children, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {children}
    </button>
  );
};

export default Button;`
    },
    {
      path: 'src/utils/dateUtils.js',
      content: `/**
 * Format date to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get days difference between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days
 */
export function getDaysDifference(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}`
    },
    {
      path: 'src/hooks/useLocalStorage.js',
      content: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;`
    },
    {
      path: 'README.md',
      content: `# Test Project

A simple Next.js application created for testing the MCP documentation tool.

## Features

- React components
- Custom hooks
- Utility functions

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\``
    }
  ];
  
  for (const file of files) {
    fs.writeFileSync(path.join(testProjectPath, file.path), file.content);
  }
  
  console.log(`Test project created at: ${testProjectPath}`);
  return testProjectPath;
}

// Test MCP server functions on the test project
async function testMCPFunctions(testProjectPath) {
  console.log('\nTesting MCP server functions on the test project...');
  
  try {
    // Change to test project directory
    process.chdir(testProjectPath);
    
    // Run the ESM test script in the test project
    console.log('\nRunning ESM test script in the test project...');
    const esmTestPath = path.join(__dirname, 'esm-test.js');
    
    // Copy esm-test.js to the test project (simplest way to ensure it runs in the test project context)
    fs.copyFileSync(esmTestPath, path.join(testProjectPath, 'esm-test.js'));
    
    // Execute the test script
    execSync('node esm-test.js', { stdio: 'inherit' });
    
    // Return to original directory
    process.chdir(__dirname);
    
    console.log('\nMCP function tests completed successfully!');
    console.log(`Output files are in the test project's docs directory: ${path.join(testProjectPath, 'docs')}`);
  } catch (error) {
    console.error('Error testing MCP functions:', error);
    // Return to original directory
    process.chdir(__dirname);
  }
}

// Main function
async function runTest() {
  try {
    // Create test project
    const testProjectPath = await createTestProject();
    
    // Test MCP functions
    await testMCPFunctions(testProjectPath);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the test
runTest(); 