# 📱 Mobile CI Rules for Local Agents

A comprehensive collection of mobile CI/CD documentation from all major providers, automatically converted to `.mdc` format for optimal consumption by local AI agents and development tools.

## 🎯 Purpose

This repository aggregates and maintains up-to-date documentation from the leading mobile CI/CD platforms, making it easy for local AI agents to provide accurate, current information about mobile development pipelines. Each provider's documentation is combined into a single comprehensive `.mdc` file that's optimized for AI consumption.

**Key Goals:**
- **🚀 Accelerate CI Adoption**: Help teams quickly understand and implement mobile CI/CD solutions
- **🔄 Simplify Migration**: Provide comprehensive documentation to ease migration between different CI platforms
- **🤖 Enable AI-Assisted Development**: Optimize documentation format for local AI agents to provide contextual CI/CD guidance
- **📚 Centralize Knowledge**: Single source of truth for mobile CI/CD best practices across all major platforms

## 📁 Repository Structure

```
docs/
├── appcircle.mdc                # Appcircle (514 lines, 4 pages)
├── azure-devops.mdc             # Azure DevOps (4,210 lines)
├── bitrise.mdc                  # Bitrise (610 lines, 4 pages)
├── circleci.mdc                 # CircleCI (6,224 lines)
├── codemagic.mdc                # Codemagic (4,438 lines)
├── firebase-app-distribution.mdc # Firebase App Distribution (7,544 lines)
├── gitlab-ci.mdc                # GitLab CI (17,708 lines)
├── jenkins.mdc                  # Jenkins (8,607 lines)
└── xcode-cloud.mdc              # Xcode Cloud (847 lines)
```

**Total: ~51,500 lines of comprehensive mobile CI documentation**

Each `.mdc` file contains:
- **Complete pipeline reference** with multiple documentation pages combined into one file
- **Table of contents** for easy navigation
- **Source URLs** for each section
- **YAML frontmatter** with metadata (provider, description, generation timestamp)
- **Clean markdown** optimized for LLM consumption

## 🚀 Supported CI/CD Providers

| Provider | Focus | Documentation Coverage |
|----------|-------|----------------------|
| **Bitrise** | Mobile-first CI/CD | API, workflows, builds, testing, deployment |
| **Codemagic** | Flutter/React Native specialist | REST API, YAML config, platform builds |
| **CircleCI** | General CI/CD with mobile support | Android/iOS, testing, deployment |
| **GitHub Actions** | Native GitHub integration | Mobile workflows, marketplace actions |
| **GitLab CI** | DevOps platform | Mobile DevOps, iOS/Android guides |
| **Appcircle** | Enterprise mobile CI/CD | Build management, signing, distribution |
| **Azure DevOps** | Microsoft ecosystem | Mobile pipelines, signing, testing |
| **Jenkins** | Open-source automation | Android/iOS plugins, pipeline setup |
| **Xcode Cloud** | Apple's official CI/CD | iOS/macOS workflows, App Store integration |
| **Firebase App Distribution** | Google's distribution platform | CLI, Gradle, Fastlane integration |

## 🤖 Using with Local AI Agents

### For Cursor/VS Code

1. **Clone this repository** to your local machine:
   ```bash
   git clone https://github.com/tuist/mobile-ci-rules.git
   cd mobile-ci-rules
   ```

2. **Reference in your prompts:**
   ```
   Using the mobile CI documentation in ./docs/[provider].mdc, help me set up [specific task]
   ```

3. **Example prompts for CI adoption and migration:**
   - "Using ./docs/bitrise.mdc, help me migrate from Jenkins to Bitrise for iOS builds"
   - "Compare ./docs/github-actions.mdc and ./docs/circleci.mdc to choose the best CI for my React Native project"
   - "Reference ./docs/codemagic.mdc to set up my first Flutter CI pipeline"
   - "Using ./docs/circleci.mdc, help me migrate my existing Android builds from local scripts"
   - "Compare signing approaches across ./docs/bitrise.mdc and ./docs/appcircle.mdc for iOS deployment"

### For Codeium/Copilot

The `.mdc` files are optimized for AI consumption with:
- **Structured metadata** at the beginning of each file
- **Clean markdown formatting** without navigation clutter
- **Preserved code blocks** with proper syntax highlighting
- **Source URLs** for verification and updates

### For Custom Agents

Each `.mdc` file includes frontmatter with:
```yaml
---
title: Provider Complete Pipeline Reference
provider: Provider Name
description: Brief description
generated_at: 2025-07-08T13:43:44.299Z
pages_included: 4
---
```

This metadata provides:
- **Source traceability** with page count and generation timestamp
- **Clean structure** with one comprehensive file per provider
- **LLM optimization** without navigation clutter or metadata.json files

## 🔄 Automated Updates

Documentation is automatically updated via GitHub Actions:

- **📅 Weekly Schedule**: Every Sunday at 3 AM UTC
- **🔧 Manual Trigger**: Via GitHub Actions interface
- **📦 Incremental Updates**: Only changed files are committed

### Manual Update

To update documentation for a specific provider:

1. Go to **Actions** → **Manual Documentation Update**
2. Select the provider or choose "all"
3. Optionally create a PR instead of direct commit
4. Run the workflow

### Local Updates

```bash
# Install dependencies
npm install

# Set up API key (required)
export FIRECRAWL_API_KEY=your_api_key_here

# Update all providers (comprehensive scraper)
npm run scrape:comprehensive

# Update specific provider
node src/comprehensive-scraper.js bitrise

# Fix specific providers (if needed)
node src/final-scraper.js
```

## 💡 Usage Examples

### Setting up iOS CI with Bitrise
```bash
# Reference the complete Bitrise documentation
cat docs/bitrise.mdc
```

### Android CI with Appcircle
```bash
# Get comprehensive Appcircle pipeline reference
cat docs/appcircle.mdc
```

### Flutter CI with Codemagic
```bash
# Review complete Codemagic documentation
cat docs/codemagic.mdc
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Firecrawl API key (get from [firecrawl.dev](https://firecrawl.dev))

### Setup

```bash
git clone https://github.com/tuist/mobile-ci-rules.git
cd mobile-ci-rules
npm install

# Set up environment variable
export FIRECRAWL_API_KEY=your_api_key_here
```

### Adding a New Provider

1. **Update configuration** in `src/comprehensive-scraper.js`
2. **Add provider object** with name, description, and page URLs
3. **Test scraping** with `node src/comprehensive-scraper.js new-provider`
4. **Verify output** in `docs/new-provider.mdc`

### Scraper Configuration

The scraper uses Firecrawl API and automatically:
- **Extracts main content** only, removing navigation and clutter
- **Preserves code blocks** with syntax highlighting
- **Combines multiple pages** into single comprehensive files
- **Handles rate limiting** (2-3 seconds between requests)
- **Validates content** to skip 404/error pages
- **Generates clean .mdc files** optimized for LLM consumption

## 📈 Quality Assurance

- **Content validation**: Minimum 200 character requirement, skip error pages
- **Comprehensive coverage**: Multiple pages combined per provider
- **Format consistency**: Standardized `.mdc` output with YAML frontmatter
- **Update tracking**: GitHub Actions automation with change detection
- **Error handling**: Skip 404s, "not found", and "untitled" pages

## 🤝 Contributing

1. **Fork the repository**
2. **Add or update provider configurations**
3. **Test your changes** with local scraping
4. **Submit a pull request** with clear description

### Provider Addition Guidelines

- Focus on **mobile-specific** CI/CD platforms
- Ensure **comprehensive documentation** coverage
- Include **API references** when available
- Maintain **consistent naming** conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [agent-rules](https://github.com/steipete/agent-rules) - Original inspiration for AI-optimized documentation
- [Firecrawl](https://firecrawl.dev) - Web scraping API used for clean content extraction

---

*Last updated: Automatically via GitHub Actions*
