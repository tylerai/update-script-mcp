# Contributing to Update Script MCP

Thank you for considering contributing to Update Script MCP! This document outlines the process for contributing to the project and how to get started as a contributor.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. Please be respectful and considerate of others when contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/tylerbuilds/update-script-mcp.git
   cd update-script-mcp
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/issue-you-are-fixing
   ```

## Development Workflow

1. **Make your changes** in your feature branch.
2. **Run tests** to ensure your changes don't break existing functionality:
   ```bash
   npm test
   ```
3. **Build the project** to make sure it compiles:
   ```bash
   npm run build
   ```
4. **Test your changes manually** by linking the package locally:
   ```bash
   npm link
   ```

## Code Style

We follow these coding conventions:

- Use TypeScript for all new code
- Follow the ESLint configuration included in the project
- Write code in a functional style where possible
- Use descriptive variable names
- Include JSDoc comments for public APIs
- Keep line lengths reasonable (under 100 characters when possible)

## Commit Messages

Follow these guidelines for commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Pull Request Process

1. **Update the README.md** with details of changes if applicable.
2. **Update the CHANGELOG.md** to document your changes.
3. **Submit a pull request** to the main repository.
4. **Address review comments** if requested by maintainers.

Your pull request should:
- Have a clear descriptive title
- Link to any relevant issues it addresses
- Include screenshots or animated GIFs for UI changes
- Pass all CI checks

## Feature Requests

If you have ideas for new features:

1. Check the issues to see if it's already been suggested
2. If not, create a new issue using the feature request template
3. Clearly describe the feature and its benefits
4. Be open to discussion about implementation details

## Reporting Bugs

When reporting bugs:

1. Use the bug report template
2. Include detailed steps to reproduce the issue
3. Describe the expected behavior versus what actually happened
4. Include information about your environment (OS, Node.js version, etc.)
5. Add screenshots if applicable

## Documentation

Improvements to documentation are always welcome! This includes:

- README updates
- Code comments
- Examples and usage guides
- Updating USAGE.md with new features or clearer instructions

## Testing

We aim for good test coverage. When adding new features:

- Write unit tests for new functionality
- Ensure existing tests pass with your changes
- Consider edge cases in your tests

## Licensing

By contributing to Update Script MCP, you agree that your contributions will be licensed under the project's MIT license.

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with your question
- Reach out to the maintainers

Thank you for your contributions! 