// Test script to generate the AI-optimized memory bank
import { FileHandler } from './dist/services/FileHandler.js';

// Create the file handler with minimal required config
const handler = new FileHandler({
  rootPath: process.cwd(),
  historyFile: './history.json'
});

// Run the command to generate the memory bank
async function main() {
  try {
    console.log('Generating project documentation and memory bank...');
    const result = await handler.handleCommand({
      operation: 'run_update',
      cwd: process.cwd()
    });
    
    if (result.success) {
      console.log('✅ Success!');
      console.log('Message:', result.content);
      
      // Check if the memory bank file exists
      const fs = await import('fs');
      const path = await import('path');
      const memoryBankPath = path.join(process.cwd(), 'docs/architecture/project-memory.md');
      
      if (fs.existsSync(memoryBankPath)) {
        console.log('Memory bank file exists at:', memoryBankPath);
        console.log('Memory bank content preview:');
        const content = fs.readFileSync(memoryBankPath, 'utf8');
        console.log(content.substring(0, 500) + '...');
      } else {
        console.log('❌ Memory bank file does not exist at expected path:', memoryBankPath);
      }
    } else {
      console.error('❌ Failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 