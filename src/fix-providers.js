const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

if (!FIRECRAWL_API_KEY) {
  console.error('Error: FIRECRAWL_API_KEY environment variable is required');
  process.exit(1);
}

class FixProvidersScraper {
  constructor() {
    this.providers = {
      bitrise: {
        name: 'Bitrise',
        pages: [
          'https://devcenter.bitrise.io/',
          'https://devcenter.bitrise.io/en/builds/triggering-builds/triggering-builds.html',
          'https://devcenter.bitrise.io/en/builds/build-logs.html',
          'https://devcenter.bitrise.io/en/workflows/introduction-to-workflows.html',
          'https://devcenter.bitrise.io/en/steps-and-workflows/introduction-to-steps.html',
          'https://devcenter.bitrise.io/en/steps-and-workflows/step-inputs.html',
          'https://devcenter.bitrise.io/en/bitrise-yml/configuring-bitrise-yml.html',
          'https://devcenter.bitrise.io/en/bitrise-yml/env-vars-in-bitrise-yml.html',
          'https://devcenter.bitrise.io/en/testing/ios-testing/running-xcode-tests.html',
          'https://devcenter.bitrise.io/en/testing/android-testing/running-android-tests.html',
          'https://devcenter.bitrise.io/en/deploying/ios-deployment/deploying-to-app-store-connect.html',
          'https://devcenter.bitrise.io/en/deploying/android-deployment/deploying-to-google-play.html'
        ]
      },
      appcircle: {
        name: 'Appcircle',
        pages: [
          'https://docs.appcircle.io/build/build-process-management/build-profile-configuration',
          'https://docs.appcircle.io/workflows/why-to-use-workflows',
          'https://docs.appcircle.io/workflows/managing-workflows', 
          'https://docs.appcircle.io/workflows/common-workflow-steps',
          'https://docs.appcircle.io/workflows/ios-specific-workflow-steps',
          'https://docs.appcircle.io/workflows/android-specific-workflow-steps',
          'https://docs.appcircle.io/workflows/react-native-specific-workflow-steps',
          'https://docs.appcircle.io/workflows/flutter-specific-workflow-steps',
          'https://docs.appcircle.io/environment-variables/managing-variables',
          'https://docs.appcircle.io/build/building-ios-applications',
          'https://docs.appcircle.io/build/building-android-applications',
          'https://docs.appcircle.io/signing-identities/ios-certificates-and-provisioning-profiles',
          'https://docs.appcircle.io/signing-identities/android-keystores'
        ]
      }
    };
  }

  async scrapePage(url) {
    try {
      console.log(`  Scraping: ${url}`);
      
      const response = await axios.post(
        `${FIRECRAWL_API_URL}/scrape`,
        {
          url: url,
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
        const title = this.extractTitle(markdown) || this.extractTitleFromUrl(url);
        
        return {
          url: url,
          content: markdown,
          title: title
        };
      }
      
      console.warn(`  No content returned for ${url}`);
      return null;
    } catch (error) {
      console.error(`  Error scraping ${url}:`, error.message);
      return null;
    }
  }

  extractTitle(markdown) {
    if (!markdown) return null;
    const lines = markdown.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ') && !trimmed.includes('404') && !trimmed.toLowerCase().includes('not found')) {
        return trimmed.substring(2).trim();
      }
    }
    return null;
  }

  extractTitleFromUrl(url) {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1].replace('.html', '').replace(/-/g, ' ');
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }

  async scrapeProvider(providerKey) {
    const provider = this.providers[providerKey];
    if (!provider) {
      console.error(`Provider ${providerKey} not found`);
      return;
    }

    console.log(`\nScraping comprehensive documentation for ${provider.name}...`);
    
    const pages = [];
    
    for (const url of provider.pages) {
      const pageData = await this.scrapePage(url);
      if (pageData && pageData.content && pageData.content.length > 100) {
        // Skip pages that are clearly error pages
        if (!pageData.content.includes('404') && 
            !pageData.content.toLowerCase().includes('page not found') &&
            !pageData.title.toLowerCase().includes('untitled')) {
          pages.push(pageData);
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
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
generated_at: ${new Date().toISOString()}
pages_included: ${pages.length}
---

# ${provider.name} Complete Pipeline Reference

This comprehensive guide contains all pipeline, workflow, and build configuration documentation for ${provider.name}.

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

  async fixAll() {
    for (const providerKey of Object.keys(this.providers)) {
      await this.scrapeProvider(providerKey);
    }
  }
}

// CLI interface
if (require.main === module) {
  const scraper = new FixProvidersScraper();
  scraper.fixAll().catch(console.error);
}

module.exports = FixProvidersScraper;