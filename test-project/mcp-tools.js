// MCP Tools for Project Context Awareness
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get directory paths for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Remind me tool - Loads all documentation files to provide context awareness
 * This tool is meant to be called at the beginning of a new chat session
 * @returns {Object} Status and context data
 */
export async function remind_me() {
  console.log('Loading project context...');
  
  try {
    const cwd = process.cwd();
    const docsDir = path.join(cwd, 'docs');
    
    // Check if docs directory exists
    if (!fs.existsSync(docsDir)) {
      return {
        success: false,
        message: "Documentation directory not found. Please run project analysis first."
      };
    }
    
    // Load all documentation files
    const contextData = {
      metrics: {},
      diagram: {},
      dependencies: {},
      architecture: {}
    };
    
    // Load metrics
    const metricsPath = path.join(docsDir, 'analysis/metrics.markdown');
    if (fs.existsSync(metricsPath)) {
      contextData.metrics.content = fs.readFileSync(metricsPath, 'utf8');
      contextData.metrics.lastModified = fs.statSync(metricsPath).mtime;
    }
    
    // Load diagram
    const diagramPath = path.join(docsDir, 'diagrams/structure-diagram.md');
    if (fs.existsSync(diagramPath)) {
      contextData.diagram.content = fs.readFileSync(diagramPath, 'utf8');
      contextData.diagram.lastModified = fs.statSync(diagramPath).mtime;
    }
    
    // Load dependencies
    const dependenciesPath = path.join(docsDir, 'analysis/dependencies.md');
    if (fs.existsSync(dependenciesPath)) {
      contextData.dependencies.content = fs.readFileSync(dependenciesPath, 'utf8');
      contextData.dependencies.lastModified = fs.statSync(dependenciesPath).mtime;
    }
    
    // Load architecture/memory bank
    const architecturePath = path.join(docsDir, 'architecture/project-memory.md');
    if (fs.existsSync(architecturePath)) {
      contextData.architecture.content = fs.readFileSync(architecturePath, 'utf8');
      contextData.architecture.lastModified = fs.statSync(architecturePath).mtime;
    }
    
    // Store the context data in a temporary file for future reference
    const contextCachePath = path.join(cwd, '.mcp-context-cache.json');
    fs.writeFileSync(contextCachePath, JSON.stringify(contextData, null, 2));
    
    console.log('Project context loaded successfully.');
    
    // Return a minimal response to the user
    return {
      success: true,
      message: "I have regained contextual awareness of your project",
      details: "Context data loaded and cached for agent use."
    };
  } catch (error) {
    console.error('Error loading project context:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List recent changes in the project
 * @param {number} limit - Number of recent changes to list (default: 10)
 * @returns {Object} List of recent changes
 */
export async function list_recent_changes(limit = 10) {
  console.log(`Loading ${limit} most recent changes...`);
  
  try {
    const cwd = process.cwd();
    
    // Get git changes if it's a git repository
    let recentChanges = [];
    
    try {
      // Check if it's a git repository
      execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'ignore' });
      
      // Get recent git commits
      const gitLog = execSync(
        `git log --pretty=format:"%h|%ad|%an|%s" --date=short -n ${limit}`,
        { cwd }
      ).toString().trim();
      
      if (gitLog) {
        recentChanges = gitLog.split('\n').map(line => {
          const [hash, date, author, message] = line.split('|');
          return {
            type: 'commit',
            hash,
            date,
            author,
            message
          };
        });
      }
    } catch (gitError) {
      // Not a git repository or other git error
      console.log('Not a git repository or error running git commands. Using file modification times instead.');
    }
    
    // If git didn't work or didn't return enough changes, fall back to file modification times
    if (recentChanges.length < limit) {
      // Find most recently modified files
      const findCmd = `find . -type f -not -path "*/\\.*" -not -path "*/node_modules/*" -not -path "*/dist/*" -exec ls -lt {} \\; | head -n ${limit}`;
      
      try {
        const filesOutput = execSync(findCmd, { cwd }).toString();
        const fileLines = filesOutput.split('\n').filter(Boolean);
        
        for (const line of fileLines) {
          // Parse ls -lt output to get file info
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 8) {
            // Format: permissions links owner group size month day time filename
            const filePath = parts.slice(8).join(' ');
            const date = `${parts[5]} ${parts[6]} ${parts[7]}`;
            
            recentChanges.push({
              type: 'file_modified',
              path: filePath,
              date,
              size: parts[4]
            });
          }
        }
      } catch (findError) {
        console.error('Error finding recently modified files:', findError);
      }
    }
    
    // Limit to requested number
    recentChanges = recentChanges.slice(0, limit);
    
    return {
      success: true,
      changes: recentChanges
    };
  } catch (error) {
    console.error('Error listing recent changes:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// For direct testing of the tools
if (process.argv[2] === 'test') {
  const testFunction = process.argv[3] || 'remind_me';
  
  if (testFunction === 'remind_me') {
    remind_me().then(result => {
      console.log(JSON.stringify(result, null, 2));
    });
  } else if (testFunction === 'list_recent_changes') {
    const limit = parseInt(process.argv[4]) || 10;
    list_recent_changes(limit).then(result => {
      console.log(JSON.stringify(result, null, 2));
    });
  } else {
    console.error(`Unknown test function: ${testFunction}`);
    console.log('Available functions: remind_me, list_recent_changes');
  }
} 