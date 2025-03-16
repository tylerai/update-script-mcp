import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

export interface TemplateOptions {
  templateName: string;
  projectName: string;
  projectPath: string;
}

export class TemplateGenerator {
  private options: TemplateOptions;
  private templatesDir: string;
  
  constructor(options: TemplateOptions) {
    this.options = options;
    this.templatesDir = path.join(__dirname, this.options.templateName);
  }
  
  async generate(): Promise<{ success: boolean; message: string }> {
    try {
      // Validate template exists
      if (!fs.existsSync(this.templatesDir)) {
        return {
          success: false,
          message: `Template '${this.options.templateName}' not found.`,
        };
      }
      
      // Create target directory if it doesn't exist
      const targetDir = this.options.projectPath;
      
      if (fs.existsSync(targetDir)) {
        // Check if directory is empty
        const files = fs.readdirSync(targetDir);
        if (files.length > 0) {
          return {
            success: false,
            message: `Target directory '${targetDir}' is not empty.`,
          };
        }
      } else {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy template files
      await this.copyTemplateFiles(targetDir);
      
      // Update project name in package.json
      await this.updatePackageJson(targetDir);
      
      // Initialize git repository
      this.initGitRepo(targetDir);
      
      return {
        success: true,
        message: `Project '${this.options.projectName}' created successfully at '${targetDir}'.`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error generating project: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  private async copyTemplateFiles(targetDir: string): Promise<void> {
    await fs.copy(this.templatesDir, targetDir, {
      overwrite: true,
      filter: (src) => {
        // Skip node_modules if it exists in template
        return !src.includes('node_modules');
      },
    });
    
    console.log(`Copied template files from ${this.templatesDir} to ${targetDir}`);
  }
  
  private async updatePackageJson(targetDir: string): Promise<void> {
    const packageJsonPath = path.join(targetDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // Update project name
      packageJson.name = this.options.projectName;
      
      // Write updated package.json
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      
      console.log(`Updated package.json with project name '${this.options.projectName}'`);
    }
  }
  
  private initGitRepo(targetDir: string): void {
    try {
      // Initialize git repo if git is available
      execSync('git --version', { stdio: 'ignore' });
      
      // Check if .git directory already exists
      const gitDir = path.join(targetDir, '.git');
      if (!fs.existsSync(gitDir)) {
        execSync('git init', { cwd: targetDir, stdio: 'ignore' });
        console.log('Initialized git repository');
        
        // Create .gitignore if it doesn't exist
        const gitignorePath = path.join(targetDir, '.gitignore');
        if (!fs.existsSync(gitignorePath)) {
          const defaultGitignore = `
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/
/build

# Production
/dist
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# VS Code
.vscode/
`;
          
          fs.writeFileSync(gitignorePath, defaultGitignore.trim());
          console.log('Created .gitignore file');
        }
      }
    } catch (error) {
      console.log('Git not available, skipping repository initialization');
    }
  }
} 