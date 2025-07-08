const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

if (!FIRECRAWL_API_KEY) {
  console.error('Error: FIRECRAWL_API_KEY environment variable is required');
  process.exit(1);
}

class FirecrawlDeepScraper {
  constructor() {
    this.providers = {
      bitrise: {
        name: 'Bitrise',
        startUrl: 'https://devcenter.bitrise.io/en/builds.html',
        includePatterns: [
          'devcenter.bitrise.io/en/builds',
          'devcenter.bitrise.io/en/workflows',
          'devcenter.bitrise.io/en/steps',
          'devcenter.bitrise.io/en/pipelines',
          'devcenter.bitrise.io/en/yml'
        ],
        maxPages: 20
      },
      codemagic: {
        name: 'Codemagic',
        startUrl: 'https://docs.codemagic.io/yaml-quick-start/building-a-flutter-app/',
        includePatterns: [
          'docs.codemagic.io/yaml',
          'docs.codemagic.io/flutter',
          'docs.codemagic.io/react-native',
          'docs.codemagic.io/ios',
          'docs.codemagic.io/android'
        ],
        maxPages: 20
      },
      circleci: {
        name: 'CircleCI',
        startUrl: 'https://circleci.com/docs/configuration-reference/',
        includePatterns: [
          'circleci.com/docs/configuration-reference',
          'circleci.com/docs/sample-config',
          'circleci.com/docs/ios',
          'circleci.com/docs/android',
          'circleci.com/docs/workflows',
          'circleci.com/docs/orb-intro'
        ],
        maxPages: 15
      },
      'github-actions': {
        name: 'GitHub Actions',
        startUrl: 'https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions',
        includePatterns: [
          'docs.github.com/en/actions/using-workflows',
          'docs.github.com/en/actions/automating-builds-and-tests',
          'docs.github.com/en/actions/deployment',
          'docs.github.com/en/actions/publishing-packages'
        ],
        maxPages: 15
      },
      'gitlab-ci': {
        name: 'GitLab CI',
        startUrl: 'https://docs.gitlab.com/ee/ci/yaml/',
        includePatterns: [
          'docs.gitlab.com/ee/ci/yaml',
          'docs.gitlab.com/ee/ci/mobile_devops',
          'docs.gitlab.com/ee/ci/examples',
          'docs.gitlab.com/ee/ci/pipelines',
          'docs.gitlab.com/ee/ci/jobs'
        ],
        maxPages: 15
      },
      appcircle: {
        name: 'Appcircle',
        startUrl: 'https://docs.appcircle.io/workflows',
        includePatterns: [
          'docs.appcircle.io/workflows',
          'docs.appcircle.io/build/building-ios-applications',
          'docs.appcircle.io/build/building-android-applications',
          'docs.appcircle.io/environment-variables',
          'docs.appcircle.io/workflows/common-workflow-steps'
        ],
        maxPages: 20
      },
      'azure-devops': {
        name: 'Azure DevOps',
        startUrl: 'https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema',
        includePatterns: [
          'azure/devops/pipelines/yaml-schema',
          'azure/devops/pipelines/ecosystems/android',
          'azure/devops/pipelines/ecosystems/xcode',
          'azure/devops/pipelines/tasks',
          'azure/devops/pipelines/process'
        ],
        maxPages: 15
      },
      jenkins: {
        name: 'Jenkins',
        startUrl: 'https://www.jenkins.io/doc/book/pipeline/syntax/',
        includePatterns: [
          'jenkins.io/doc/book/pipeline',
          'jenkins.io/doc/pipeline/steps',
          'plugins.jenkins.io/android',
          'plugins.jenkins.io/xcode',
          'plugins.jenkins.io/gradle'
        ],
        maxPages: 15
      },
      'xcode-cloud': {
        name: 'Xcode Cloud',
        startUrl: 'https://developer.apple.com/documentation/xcode/xcode-cloud-workflow-reference',
        includePatterns: [
          'developer.apple.com/documentation/xcode/xcode-cloud',
          'developer.apple.com/documentation/xcode/configuring',
          'developer.apple.com/documentation/xcode/writing-custom-build-scripts'
        ],
        maxPages: 10
      },
      'firebase-app-distribution': {
        name: 'Firebase App Distribution',
        startUrl: 'https://firebase.google.com/docs/app-distribution',
        includePatterns: [
          'firebase.google.com/docs/app-distribution',
          'firebase.google.com/docs/app-distribution/ios',
          'firebase.google.com/docs/app-distribution/android'
        ],
        maxPages: 15
      }
    };
  }

  async crawlProvider(providerKey) {
    const provider = this.providers[providerKey];
    if (!provider) {
      console.error(`Provider ${providerKey} not found`);
      return;
    }

    console.log(`\nCrawling ${provider.name} with Firecrawl...`);
    
    try {
      const response = await axios.post(
        `${FIRECRAWL_API_URL}/crawl`,
        {
          url: provider.startUrl,
          limit: provider.maxPages,
          includePaths: provider.includePatterns,
          maxDepth: 3,
          returnFormats: ['markdown'],
          onlyMainContent: true,
          waitFor: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        const jobId = response.data.id;
        console.log(`Crawl job started with ID: ${jobId}`);
        
        // Wait for crawl to complete
        const result = await this.waitForCrawlCompletion(jobId);
        
        if (result && result.data) {
          await this.processAndSaveCrawlResults(providerKey, provider, result.data);
        }
      }
    } catch (error) {
      console.error(`Error crawling ${providerKey}:`, error.message);
      
      // Fallback to single page scraping if crawl fails
      console.log(`Falling back to single page scraping for ${providerKey}...`);
      await this.fallbackScrape(providerKey, provider);
    }
  }

  async waitForCrawlCompletion(jobId, maxAttempts = 60) {
    console.log('Waiting for crawl to complete...');
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(
          `${FIRECRAWL_API_URL}/crawl/${jobId}`,
          {
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
            }
          }
        );

        if (response.data) {
          const status = response.data.status;
          console.log(`Crawl status: ${status} (${response.data.completed || 0}/${response.data.total || 0} pages)`);
          
          if (status === 'completed') {
            return response.data;
          } else if (status === 'failed') {
            console.error('Crawl failed');
            return null;
          }
        }
      } catch (error) {
        console.error('Error checking crawl status:', error.message);
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.error('Crawl timeout');
    return null;
  }

  async processAndSaveCrawlResults(providerKey, provider, pages) {
    console.log(`Processing ${pages.length} pages for ${provider.name}...`);
    
    let allContent = [];
    
    // Add header
    allContent.push(`---
title: ${provider.name} Complete Pipeline Reference
provider: ${provider.name}
generated_at: ${new Date().toISOString()}
pages_crawled: ${pages.length}
---

# ${provider.name} Complete Pipeline Reference

This comprehensive document contains all pipeline and workflow configuration documentation for ${provider.name}.

## Table of Contents

`);

    // Add table of contents
    const toc = [];
    pages.forEach((page, index) => {
      if (page.markdown) {
        const title = this.extractTitle(page.markdown) || `Page ${index + 1}`;
        const slug = this.slugify(title);
        toc.push(`- [${title}](#${slug})`);
      }
    });
    
    allContent.push(toc.join('\n'));
    allContent.push('\n\n---\n\n');

    // Add all page content
    pages.forEach((page, index) => {
      if (page.markdown) {
        const title = this.extractTitle(page.markdown) || `Page ${index + 1}`;
        const slug = this.slugify(title);
        
        allContent.push(`## ${title} {#${slug}}\n`);
        allContent.push(`*Source: ${page.url}*\n\n`);
        allContent.push(page.markdown);
        allContent.push('\n\n---\n\n');
      }
    });

    // Save the combined document
    const outputPath = path.join(__dirname, '..', 'docs', `${providerKey}-complete-reference.mdc`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, allContent.join('\n'));
    
    console.log(`✓ Saved ${providerKey}-complete-reference.mdc (${pages.length} pages combined)`);
  }

  extractTitle(markdown) {
    const lines = markdown.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
    }
    return null;
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async fallbackScrape(providerKey, provider) {
    // Use the original single URL scraping as fallback
    const urls = provider.includePatterns.slice(0, 5).map(pattern => {
      if (pattern.includes('://')) return pattern;
      return `https://${pattern}`;
    });

    let allContent = [];
    allContent.push(`---
title: ${provider.name} Pipeline Reference
provider: ${provider.name}
generated_at: ${new Date().toISOString()}
---

# ${provider.name} Pipeline Reference

This document contains the pipeline and workflow configuration reference for ${provider.name}.

`);

    for (const url of urls) {
      try {
        console.log(`Scraping: ${url}`);
        
        const response = await axios.post(
          `${FIRECRAWL_API_URL}/scrape`,
          {
            url: url,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000
          },
          {
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.success && response.data.data) {
          const content = response.data.data.markdown || '';
          if (content) {
            allContent.push(`\n---\n\n## Source: ${url}\n\n${content}\n`);
          }
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Save the combined document
    const outputPath = path.join(__dirname, '..', 'docs', `${providerKey}-reference.mdc`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, allContent.join('\n'));
    
    console.log(`✓ Saved ${providerKey}-reference.mdc (fallback mode)`);
  }

  async crawlAll() {
    console.log('Starting deep crawl documentation scraping...');
    
    // Clear existing files
    const docsDir = path.join(__dirname, '..', 'docs');
    const files = await fs.readdir(docsDir);
    for (const file of files) {
      if (file.endsWith('.mdc')) {
        await fs.remove(path.join(docsDir, file));
      }
    }
    
    for (const providerKey of Object.keys(this.providers)) {
      await this.crawlProvider(providerKey);
      
      // Wait between providers to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log('\nDeep crawl completed!');
  }
}

// CLI interface
if (require.main === module) {
  const scraper = new FirecrawlDeepScraper();
  const provider = process.argv[2];
  
  if (provider && scraper.providers[provider]) {
    scraper.crawlProvider(provider).catch(console.error);
  } else if (provider) {
    console.error(`Unknown provider: ${provider}`);
    console.log('Available providers:', Object.keys(scraper.providers).join(', '));
  } else {
    scraper.crawlAll().catch(console.error);
  }
}

module.exports = FirecrawlDeepScraper;