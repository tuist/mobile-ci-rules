# CI-LLMs Project Context

## Project Overview

This repository contains comprehensive mobile CI/CD documentation scraped from major providers and optimized for consumption by LLMs and AI development tools.

## What This Project Does

**Purpose**: Aggregate mobile CI/CD documentation from all major providers into a single, LLM-optimized repository that's automatically kept up-to-date.

**Key Features**:
- 9 comprehensive `.mdc` files covering all major mobile CI providers
- ~51,500 lines of combined documentation
- Automated weekly updates via GitHub Actions
- Clean format optimized for LLM consumption
- No metadata clutter - just pure documentation content

## Architecture

### Documentation Structure
Each provider gets a single comprehensive `.mdc` file that combines multiple documentation pages:

```
docs/
├── appcircle.mdc          # 514 lines, 4 pages combined
├── bitrise.mdc            # 610 lines, 4 pages combined  
├── circleci.mdc           # 6,224 lines
├── codemagic.mdc          # 4,438 lines
├── gitlab-ci.mdc          # 17,708 lines
└── ... (9 providers total)
```

### Scraping System
- **Primary**: `src/comprehensive-scraper.js` - Main scraper for all providers
- **Backup**: `src/final-scraper.js` - Curated URLs for problematic providers
- **API**: Uses Firecrawl for clean content extraction
- **Rate Limiting**: 2-3 seconds between requests
- **Content Validation**: Skips 404s, error pages, insufficient content

### Automation
- **GitHub Actions**: `.github/workflows/update-docs.yml`
- **Schedule**: Every Sunday at 3 AM UTC
- **Manual Triggers**: Can update specific providers
- **Change Detection**: Only commits when content actually changes

## Implementation History

### Initial Development
1. Started with basic Node.js scraper using axios + cheerio
2. Added 10 CI providers (later refined to 9)
3. Created individual files per documentation page

### User Feedback Iterations
1. **"Don't need metadata.json files"** → Removed all metadata.json, kept only in YAML frontmatter
2. **"Something looks off with markdown"** → Switched to Firecrawl API for better content
3. **"Combine referenced pages"** → Built comprehensive scraper that combines multiple pages
4. **"Too many 404/untitled parts"** → Created curated URL scraper with content validation

### Final Architecture
- Single comprehensive file per provider
- Clean markdown without navigation clutter
- YAML frontmatter with essential metadata only
- Robust error handling and content validation
- Automated updates with change detection

## Key Technical Decisions

### Why Firecrawl API?
- Better content extraction than cheerio
- Handles JavaScript-rendered content
- Removes navigation/clutter automatically
- More reliable than raw HTML parsing

### Why Single Files Per Provider?
- Easier for LLMs to consume complete context
- Reduces file proliferation
- Single source of truth per provider
- Better for vector embedding and search

### Why .mdc Extension?
- Distinguishes from regular markdown
- Indicates LLM-optimized content
- Consistent with agent-rules inspiration
- Clear purpose signaling

## Development Commands

```bash
# Set up API key (required for all scraping)
export FIRECRAWL_API_KEY=your_api_key_here

# Update all providers
npm run scrape:comprehensive

# Update specific provider
node src/comprehensive-scraper.js bitrise

# Fix problematic providers (if needed)
node src/final-scraper.js

# Test GitHub Actions locally (requires FIRECRAWL_API_KEY secret)
act -j update-documentation -s FIRECRAWL_API_KEY=your_api_key_here
```

## Content Quality Standards

### Validation Rules
- Minimum 200 characters per page
- Skip pages containing "404", "not found", "untitled"
- Verify actual content vs error pages
- Rate limit to be respectful to source sites

### Format Standards
- YAML frontmatter with provider metadata
- Table of contents for navigation
- Source URLs for each section
- Clean markdown without HTML artifacts
- Preserved code blocks with syntax highlighting

## Maintenance

### Regular Tasks
- Monitor GitHub Actions for failures
- Update provider URLs if sites restructure
- Add new providers as they emerge
- Refine content validation rules

### Provider Management
Each provider configuration includes:
- Name and description
- Array of documentation page URLs
- Title extraction for table of contents
- Source URL preservation for attribution

This project successfully bridges the gap between scattered mobile CI documentation and AI-consumable knowledge bases, providing a clean, comprehensive, and automatically updated resource for development teams and AI agents.