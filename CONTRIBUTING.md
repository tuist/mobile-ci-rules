# Contributing to Mobile CI Documentation

Thank you for your interest in contributing to this project! This repository helps maintain up-to-date mobile CI/CD documentation for local AI agents.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/mobile-ci-docs.git
   cd mobile-ci-docs
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```

## 📋 Types of Contributions

### Adding New CI/CD Providers

1. **Update `src/config.js`** with provider details:
   ```javascript
   'new-provider': {
     name: 'New Provider Name',
     baseUrl: 'https://docs.newprovider.com',
     docs: [
       '/api/reference',
       '/getting-started',
       '/mobile-ci'
     ]
   }
   ```

2. **Create provider directory:**
   ```bash
   mkdir -p docs/new-provider
   ```

3. **Test scraping:**
   ```bash
   npm run scrape -- --provider new-provider
   ```

### Improving Documentation Coverage

- Add new documentation paths to existing providers
- Update URLs when documentation moves
- Improve content extraction for specific providers

### Enhancing the Scraper

- Better content extraction algorithms
- Support for new documentation formats
- Improved metadata handling
- Rate limiting improvements

## 🔍 Provider Selection Criteria

We focus on CI/CD platforms that:
- **Support mobile development** (iOS/Android)
- **Have comprehensive documentation** 
- **Are actively maintained**
- **Have significant user base**
- **Provide API/automation capabilities**

## 🛠️ Development Guidelines

### Code Style

- Use **ES2021** features
- Follow **ESLint** configuration
- Use **2-space indentation**
- Include **JSDoc** comments for functions
- Use **async/await** for asynchronous operations

### Testing

```bash
# Run linting
npm run lint

# Test scraping specific provider
npm run scrape -- --provider github-actions

# Test all providers (use sparingly)
npm run scrape -- --all
```

### Documentation Format

The scraper generates `.mdc` files with:
- **Frontmatter** with metadata
- **Clean markdown** without navigation
- **Preserved code blocks** with syntax highlighting
- **Source URLs** for verification

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature (provider, documentation path)
- **fix**: Bug fix
- **docs**: Documentation updates
- **style**: Code style changes
- **refactor**: Code refactoring
- **test**: Test updates
- **chore**: Maintenance tasks

### Examples

```
feat(providers): add TeamCity mobile CI support

Add configuration for TeamCity mobile CI/CD documentation
including Android and iOS build configurations.

Closes #123
```

```
fix(scraper): improve content extraction for GitLab CI

Better handling of GitLab's documentation structure
to extract mobile-specific content more accurately.
```

## 🔄 Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/add-new-provider
   ```

2. **Make your changes** and test thoroughly

3. **Commit your changes** following the commit guidelines

4. **Push to your fork:**
   ```bash
   git push origin feature/add-new-provider
   ```

5. **Create a Pull Request** with:
   - Clear description of changes
   - Screenshots if applicable
   - Test results
   - Breaking change notes if any

### PR Review Criteria

- **Code quality**: Follows style guidelines
- **Testing**: Changes are tested
- **Documentation**: Updated if necessary
- **Functionality**: Works as expected
- **Performance**: No significant performance degradation

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** of the issue
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Environment details** (Node.js version, OS)
6. **Error messages** or logs

## 💡 Feature Requests

For new features:

1. **Check existing issues** first
2. **Describe the use case**
3. **Explain the benefits**
4. **Consider implementation complexity**
5. **Discuss alternatives**

## 🏗️ Architecture Overview

```
src/
├── config.js          # Provider configurations
├── scraper.js         # Main scraping logic
├── index.js           # CLI interface
└── utils/             # Utility functions

.github/workflows/
├── update-docs.yml    # Automated updates
└── manual-update.yml  # Manual triggers

docs/
└── [provider]/       # Generated documentation
    ├── *.mdc         # Converted documentation
    └── metadata.json # Scraping metadata
```

## 📊 Quality Standards

### Documentation Quality

- **Minimum content length**: 100 characters
- **Proper formatting**: Clean markdown
- **Metadata accuracy**: Correct source URLs
- **Update frequency**: Weekly automated updates

### Code Quality

- **ESLint compliance**: No linting errors
- **Error handling**: Proper try-catch blocks
- **Rate limiting**: Respectful to source sites
- **Logging**: Informative console output

## 🤝 Community

- **Be respectful** and inclusive
- **Help others** learn and contribute
- **Follow the code of conduct**
- **Participate in discussions**

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Documentation**: Check the README first

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make mobile CI/CD documentation more accessible to developers and AI agents!