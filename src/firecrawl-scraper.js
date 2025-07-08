const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

if (!FIRECRAWL_API_KEY) {
  console.error('Error: FIRECRAWL_API_KEY environment variable is required');
  process.exit(1);
}

class FirecrawlScraper {
  constructor() {
    this.providers = {
      bitrise: {
        name: 'Bitrise',
        urls: [
          'https://devcenter.bitrise.io/en/builds.html',
          'https://devcenter.bitrise.io/en/workflows.html',
          'https://devcenter.bitrise.io/en/steps.html',
          'https://bitrise.io/integrations/steps'
        ]
      },
      codemagic: {
        name: 'Codemagic',
        urls: [
          'https://docs.codemagic.io/yaml-quick-start/building-a-flutter-app/',
          'https://docs.codemagic.io/yaml-quick-start/building-a-react-native-app/',
          'https://docs.codemagic.io/yaml-quick-start/building-a-native-ios-app/',
          'https://docs.codemagic.io/yaml-quick-start/building-a-native-android-app/'
        ]
      },
      circleci: {
        name: 'CircleCI',
        urls: [
          'https://circleci.com/docs/configuration-reference/',
          'https://circleci.com/docs/sample-config/',
          'https://circleci.com/docs/ios-tutorial/',
          'https://circleci.com/docs/android-tutorial/'
        ]
      },
      'github-actions': {
        name: 'GitHub Actions',
        urls: [
          'https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions',
          'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-swift',
          'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-java-with-gradle'
        ]
      },
      'gitlab-ci': {
        name: 'GitLab CI',
        urls: [
          'https://docs.gitlab.com/ee/ci/yaml/',
          'https://docs.gitlab.com/ee/ci/examples/',
          'https://docs.gitlab.com/ee/ci/mobile_devops.html'
        ]
      },
      appcircle: {
        name: 'Appcircle',
        urls: [
          'https://docs.appcircle.io/workflows',
          'https://docs.appcircle.io/workflows/ios-specific-workflow-steps',
          'https://docs.appcircle.io/workflows/android-specific-workflow-steps'
        ]
      },
      'azure-devops': {
        name: 'Azure DevOps',
        urls: [
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/ecosystems/android',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/ecosystems/xcode'
        ]
      },
      jenkins: {
        name: 'Jenkins',
        urls: [
          'https://www.jenkins.io/doc/book/pipeline/syntax/',
          'https://www.jenkins.io/doc/book/pipeline/jenkinsfile/',
          'https://plugins.jenkins.io/android-emulator/',
          'https://plugins.jenkins.io/xcode-plugin/'
        ]
      },
      'xcode-cloud': {
        name: 'Xcode Cloud',
        urls: [
          'https://developer.apple.com/documentation/xcode/configuring-your-first-xcode-cloud-workflow',
          'https://developer.apple.com/documentation/xcode/xcode-cloud-workflow-reference'
        ]
      },
      'firebase-app-distribution': {
        name: 'Firebase App Distribution',
        urls: [
          'https://firebase.google.com/docs/app-distribution/ios/distribute-fastlane',
          'https://firebase.google.com/docs/app-distribution/android/distribute-gradle',
          'https://firebase.google.com/docs/app-distribution/android/distribute-fastlane'
        ]
      }
    };
  }

  async scrapeUrl(url) {
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
        return response.data.data.markdown || '';
      }
      
      console.warn(`No content returned for ${url}`);
      return '';
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return '';
    }
  }

  async scrapeProvider(providerKey) {
    const provider = this.providers[providerKey];
    if (!provider) {
      console.error(`Provider ${providerKey} not found`);
      return;
    }

    console.log(`\nScraping ${provider.name}...`);
    
    let allContent = [];
    
    // Add header
    allContent.push(`---
title: ${provider.name} Pipeline Reference
provider: ${provider.name}
generated_at: ${new Date().toISOString()}
---

# ${provider.name} Pipeline Reference

This document contains the pipeline and workflow configuration reference for ${provider.name}.

`);

    for (const url of provider.urls) {
      const content = await this.scrapeUrl(url);
      
      if (content) {
        // Add section header with source
        allContent.push(`\n---\n\n## Source: ${url}\n\n${content}\n`);
      }
      
      // Rate limiting - Firecrawl has rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Save the combined document
    const outputPath = path.join(__dirname, '..', 'docs', `${providerKey}-pipeline-reference.mdc`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, allContent.join('\n'));
    
    console.log(`✓ Saved ${providerKey}-pipeline-reference.mdc`);
  }

  async scrapeAll() {
    console.log('Starting Firecrawl documentation scraping...');
    
    // Clear existing provider directories first
    console.log('Clearing existing provider directories...');
    for (const providerKey of Object.keys(this.providers)) {
      const dirPath = path.join(__dirname, '..', 'docs', providerKey);
      if (await fs.pathExists(dirPath)) {
        await fs.remove(dirPath);
      }
    }
    
    // Now scrape all providers
    for (const providerKey of Object.keys(this.providers)) {
      try {
        await this.scrapeProvider(providerKey);
      } catch (error) {
        console.error(`Error scraping ${providerKey}:`, error.message);
      }
    }
    
    console.log('\nScraping completed!');
  }
  
  async scrapeSpecific(providerKey) {
    if (!this.providers[providerKey]) {
      console.error(`Provider ${providerKey} not found`);
      console.log('Available providers:', Object.keys(this.providers).join(', '));
      return;
    }
    
    await this.scrapeProvider(providerKey);
  }
}

// CLI interface
if (require.main === module) {
  const scraper = new FirecrawlScraper();
  const provider = process.argv[2];
  
  if (provider) {
    scraper.scrapeSpecific(provider).catch(console.error);
  } else {
    scraper.scrapeAll().catch(console.error);
  }
}

module.exports = FirecrawlScraper;