const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

if (!FIRECRAWL_API_KEY) {
  console.error('Error: FIRECRAWL_API_KEY environment variable is required');
  process.exit(1);
}

class FinalScraper {
  constructor() {
    this.providers = {
      bitrise: {
        name: 'Bitrise',
        description: 'Mobile-focused CI/CD platform',
        pages: [
          { url: 'https://bitrise.io/docs', title: 'Bitrise Documentation Overview' },
          { url: 'https://devcenter.bitrise.io/en/builds.html', title: 'Builds' },
          { url: 'https://devcenter.bitrise.io/en/workflows.html', title: 'Workflows' },
          { url: 'https://devcenter.bitrise.io/en/steps-and-workflows.html', title: 'Steps and Workflows' },
          { url: 'https://devcenter.bitrise.io/en/references/basics-of-bitrise-yml.html', title: 'Bitrise YAML Basics' },
          { url: 'https://devcenter.bitrise.io/en/references/workflows-reference.html', title: 'Workflow Reference' }
        ]
      },
      appcircle: {
        name: 'Appcircle',
        description: 'Mobile DevOps platform',
        pages: [
          { url: 'https://docs.appcircle.io/getting-started-with-appcircle', title: 'Getting Started with Appcircle' },
          { url: 'https://docs.appcircle.io/build/build-process-management', title: 'Build Process Management' },
          { url: 'https://docs.appcircle.io/workflows', title: 'Workflows' },
          { url: 'https://docs.appcircle.io/build/platform-build-guides/building-ios-applications', title: 'Building iOS Applications' },
          { url: 'https://docs.appcircle.io/build/platform-build-guides/building-android-applications', title: 'Building Android Applications' }
        ]
      }
    };
  }

  async scrapePage(pageInfo) {
    try {
      console.log(`  Scraping: ${pageInfo.title} (${pageInfo.url})`);
      
      const response = await axios.post(
        `${FIRECRAWL_API_URL}/scrape`,
        {
          url: pageInfo.url,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success && response.data.data) {
        const markdown = response.data.data.markdown || '';
        
        // Skip if content is too short or contains error indicators
        if (markdown.length < 200 || 
            markdown.includes('404') || 
            markdown.toLowerCase().includes('page not found') ||
            markdown.toLowerCase().includes('not found')) {
          console.warn(`  Skipping ${pageInfo.title} - insufficient or error content`);
          return null;
        }
        
        return {
          url: pageInfo.url,
          content: markdown,
          title: pageInfo.title
        };
      }
      
      console.warn(`  No content returned for ${pageInfo.title}`);
      return null;
    } catch (error) {
      console.error(`  Error scraping ${pageInfo.title}:`, error.message);
      return null;
    }
  }

  async scrapeProvider(providerKey) {
    const provider = this.providers[providerKey];
    if (!provider) {
      console.error(`Provider ${providerKey} not found`);
      return;
    }

    console.log(`\nScraping comprehensive documentation for ${provider.name}...`);
    
    const pages = [];
    
    for (const pageInfo of provider.pages) {
      const pageData = await this.scrapePage(pageInfo);
      if (pageData) {
        pages.push(pageData);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (pages.length === 0) {
      console.error(`No valid pages scraped for ${provider.name}`);
      return;
    }

    // Create comprehensive document
    let document = [];
    
    // Add header
    document.push(`---
title: ${provider.name} Complete Pipeline Reference
provider: ${provider.name}
description: ${provider.description}
generated_at: ${new Date().toISOString()}
pages_included: ${pages.length}
---

# ${provider.name} Complete Pipeline Reference

${provider.description} - Complete documentation for mobile CI/CD pipelines.

## Table of Contents

`);

    // Add table of contents
    pages.forEach((page, index) => {
      const sectionNumber = index + 1;
      document.push(`${sectionNumber}. [${page.title}](#section-${sectionNumber})`);
    });
    
    document.push('\n\n---\n');

    // Add all page content
    pages.forEach((page, index) => {
      const sectionNumber = index + 1;
      document.push(`
## ${sectionNumber}. ${page.title} {#section-${sectionNumber}}

*Source: [${page.url}](${page.url})*

${page.content}

---
`);
    });

    // Save the comprehensive document
    const outputPath = path.join(__dirname, '..', 'docs', `${providerKey}.mdc`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, document.join('\n'));
    
    console.log(`✓ Saved ${providerKey}.mdc (${pages.length} pages combined)`);
  }

  async scrapeAll() {
    for (const providerKey of Object.keys(this.providers)) {
      await this.scrapeProvider(providerKey);
    }
  }
}

// CLI interface
if (require.main === module) {
  const scraper = new FinalScraper();
  const provider = process.argv[2];
  
  if (provider && scraper.providers[provider]) {
    scraper.scrapeProvider(provider).catch(console.error);
  } else if (provider) {
    console.error(`Unknown provider: ${provider}`);
    console.log('Available providers:', Object.keys(scraper.providers).join(', '));
  } else {
    scraper.scrapeAll().catch(console.error);
  }
}

module.exports = FinalScraper;