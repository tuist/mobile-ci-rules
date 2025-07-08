const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

if (!FIRECRAWL_API_KEY) {
  console.error('Error: FIRECRAWL_API_KEY environment variable is required');
  process.exit(1);
}

class ComprehensiveScraper {
  constructor() {
    this.providers = {
      bitrise: {
        name: 'Bitrise',
        pages: [
          'https://devcenter.bitrise.io/en/builds.html',
          'https://devcenter.bitrise.io/en/builds/configuring-build-settings.html',
          'https://devcenter.bitrise.io/en/builds/selective-builds.html',
          'https://devcenter.bitrise.io/en/workflows.html',
          'https://devcenter.bitrise.io/en/steps.html',
          'https://devcenter.bitrise.io/en/bitrise-yml/basics-of-bitrise-yml.html',
          'https://devcenter.bitrise.io/en/bitrise-yml/workflows.html',
          'https://devcenter.bitrise.io/en/pipelines/pipelines-overview.html'
        ]
      },
      codemagic: {
        name: 'Codemagic',
        pages: [
          'https://docs.codemagic.io/yaml-quick-start/building-a-flutter-app/',
          'https://docs.codemagic.io/yaml-quick-start/building-a-react-native-app/',
          'https://docs.codemagic.io/yaml-quick-start/building-a-native-ios-app/',
          'https://docs.codemagic.io/yaml-quick-start/building-a-native-android-app/',
          'https://docs.codemagic.io/yaml-basic-configuration/yaml-getting-started/',
          'https://docs.codemagic.io/yaml-basic-configuration/yaml-properties/',
          'https://docs.codemagic.io/yaml-running-builds/starting-builds-automatically/',
          'https://docs.codemagic.io/yaml-testing/testing/',
          'https://docs.codemagic.io/yaml-publishing/publishing/'
        ]
      },
      circleci: {
        name: 'CircleCI',
        pages: [
          'https://circleci.com/docs/configuration-reference/',
          'https://circleci.com/docs/sample-config/',
          'https://circleci.com/docs/workflows/',
          'https://circleci.com/docs/jobs-steps/',
          'https://circleci.com/docs/orb-intro/',
          'https://circleci.com/docs/executor-intro/',
          'https://circleci.com/docs/ios-tutorial/',
          'https://circleci.com/docs/android-tutorial/',
          'https://circleci.com/docs/parallelism-faster-jobs/'
        ]
      },
      'github-actions': {
        name: 'GitHub Actions',
        pages: [
          'https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions',
          'https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows',
          'https://docs.github.com/en/actions/using-jobs/using-jobs-in-a-workflow',
          'https://docs.github.com/en/actions/using-workflows/reusing-workflows',
          'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-swift',
          'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-java-with-gradle',
          'https://docs.github.com/en/actions/deployment/about-deployments/deploying-with-github-actions',
          'https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts'
        ]
      },
      'gitlab-ci': {
        name: 'GitLab CI',
        pages: [
          'https://docs.gitlab.com/ee/ci/yaml/',
          'https://docs.gitlab.com/ee/ci/yaml/index.html',
          'https://docs.gitlab.com/ee/ci/pipelines/',
          'https://docs.gitlab.com/ee/ci/pipelines/pipeline_architectures.html',
          'https://docs.gitlab.com/ee/ci/jobs/',
          'https://docs.gitlab.com/ee/ci/variables/',
          'https://docs.gitlab.com/ee/ci/mobile_devops.html',
          'https://docs.gitlab.com/ee/ci/examples/',
          'https://docs.gitlab.com/ee/ci/environments/'
        ]
      },
      appcircle: {
        name: 'Appcircle',
        pages: [
          'https://docs.appcircle.io/workflows',
          'https://docs.appcircle.io/workflows/why-to-use-workflows',
          'https://docs.appcircle.io/workflows/managing-workflows',
          'https://docs.appcircle.io/workflows/ios-specific-workflow-steps',
          'https://docs.appcircle.io/workflows/android-specific-workflow-steps',
          'https://docs.appcircle.io/workflows/common-workflow-steps',
          'https://docs.appcircle.io/environment-variables',
          'https://docs.appcircle.io/build/building-ios-applications',
          'https://docs.appcircle.io/build/building-android-applications'
        ]
      },
      'azure-devops': {
        name: 'Azure DevOps',
        pages: [
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/process/stages',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/process/jobs',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/process/tasks',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/ecosystems/android',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/ecosystems/xcode',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables',
          'https://learn.microsoft.com/en-us/azure/devops/pipelines/artifacts/artifacts-overview'
        ]
      },
      jenkins: {
        name: 'Jenkins',
        pages: [
          'https://www.jenkins.io/doc/book/pipeline/syntax/',
          'https://www.jenkins.io/doc/book/pipeline/jenkinsfile/',
          'https://www.jenkins.io/doc/book/pipeline/shared-libraries/',
          'https://www.jenkins.io/doc/pipeline/steps/',
          'https://www.jenkins.io/doc/book/pipeline/docker/',
          'https://plugins.jenkins.io/android-emulator/',
          'https://plugins.jenkins.io/xcode-plugin/',
          'https://plugins.jenkins.io/gradle/'
        ]
      },
      'xcode-cloud': {
        name: 'Xcode Cloud',
        pages: [
          'https://developer.apple.com/documentation/xcode/xcode-cloud-workflow-reference',
          'https://developer.apple.com/documentation/xcode/configuring-your-first-xcode-cloud-workflow',
          'https://developer.apple.com/documentation/xcode/writing-custom-build-scripts',
          'https://developer.apple.com/documentation/xcode/environment-variable-reference',
          'https://developer.apple.com/documentation/xcode/integrating-with-other-services'
        ]
      },
      'firebase-app-distribution': {
        name: 'Firebase App Distribution',
        pages: [
          'https://firebase.google.com/docs/app-distribution',
          'https://firebase.google.com/docs/app-distribution/get-started',
          'https://firebase.google.com/docs/app-distribution/ios/distribute-fastlane',
          'https://firebase.google.com/docs/app-distribution/android/distribute-fastlane',
          'https://firebase.google.com/docs/app-distribution/android/distribute-gradle',
          'https://firebase.google.com/docs/app-distribution/ios/distribute-cli',
          'https://firebase.google.com/docs/app-distribution/android/distribute-cli',
          'https://firebase.google.com/docs/app-distribution/set-up-alerts'
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
        return {
          url: url,
          content: response.data.data.markdown || '',
          title: this.extractTitle(response.data.data.markdown) || 'Untitled'
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
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
    }
    return null;
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
      if (pageData && pageData.content) {
        pages.push(pageData);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (pages.length === 0) {
      console.error(`No pages successfully scraped for ${provider.name}`);
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

  async scrapeAll() {
    console.log('Starting comprehensive documentation scraping...');
    
    // Clear existing .mdc files in docs directory
    const docsDir = path.join(__dirname, '..', 'docs');
    const files = await fs.readdir(docsDir);
    for (const file of files) {
      if (file.endsWith('.mdc')) {
        await fs.remove(path.join(docsDir, file));
      }
    }
    
    // Remove old provider directories
    for (const providerKey of Object.keys(this.providers)) {
      const dirPath = path.join(docsDir, providerKey);
      if (await fs.pathExists(dirPath)) {
        await fs.remove(dirPath);
      }
    }
    
    // Scrape all providers
    for (const providerKey of Object.keys(this.providers)) {
      try {
        await this.scrapeProvider(providerKey);
      } catch (error) {
        console.error(`Error scraping ${providerKey}:`, error.message);
      }
    }
    
    console.log('\nComprehensive scraping completed!');
  }
}

// CLI interface
if (require.main === module) {
  const scraper = new ComprehensiveScraper();
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

module.exports = ComprehensiveScraper;