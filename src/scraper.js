const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const fs = require('fs-extra');
const path = require('path');
const { providers } = require('./config');

class DocumentationScraper {
  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      bulletListMarker: '-',
      linkStyle: 'inlined',
      linkReferenceStyle: 'full'
    });
    
    // Configure turndown rules for better .mdc format
    this.turndownService.addRule('preserveCodeBlocks', {
      filter: ['pre', 'code'],
      replacement: (content, node) => {
        if (node.nodeName === 'PRE') {
          const codeElement = node.querySelector('code');
          const language = codeElement ? this.extractLanguage(codeElement) : '';
          return `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
        }
        return `\`${content}\``;
      }
    });

    // Fix numbered lists to prevent escaping
    this.turndownService.addRule('numberedLists', {
      filter: 'ol',
      replacement: (content, node) => {
        const items = content.split('\n').filter(line => line.trim());
        return items.map((item, index) => {
          const cleanItem = item.replace(/^\d+\\\.\s*/, '').trim();
          return `${index + 1}. ${cleanItem}`;
        }).join('\n') + '\n';
      }
    });

    // Clean up bullet lists
    this.turndownService.addRule('bulletLists', {
      filter: 'ul',
      replacement: (content, node) => {
        const items = content.split('\n').filter(line => line.trim());
        return items.map(item => {
          const cleanItem = item.replace(/^[\*\-\+]\s*/, '').trim();
          return `- ${cleanItem}`;
        }).join('\n') + '\n';
      }
    });

    // Remove empty links and improve link formatting
    this.turndownService.addRule('cleanLinks', {
      filter: 'a',
      replacement: (content, node) => {
        const href = node.getAttribute('href');
        if (!href || href === '#' || !content.trim()) {
          return content;
        }
        return `[${content}](${href})`;
      }
    });
  }

  extractLanguage(codeElement) {
    // Extract language from class attributes
    const className = codeElement.className || '';
    const languageMatch = className.match(/language-(\w+)/);
    return languageMatch ? languageMatch[1] : '';
  }

  async fetchPage(url) {
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return null;
    }
  }

  cleanContent(html) {
    const $ = cheerio.load(html);
    
    // Remove navigation, headers, footers, and other non-content elements
    $('nav, header, footer, .navbar, .sidebar, .breadcrumb, .toc, .advertisement').remove();
    $('.nav, .navigation, .menu, .header, .footer, .ads, .social, .github-link').remove();
    $('.edit-page, .page-meta, .last-updated, .edit-link, .print-link').remove();
    $('.feedback, .rating, .survey, .newsletter-signup').remove();
    $('script, style, noscript, iframe').remove();
    
    // Remove common metadata elements
    $('.timestamp, .author, .tags, .category, .share-buttons').remove();
    $('.reading-time, .word-count, .estimated-reading-time').remove();
    
    // Remove table of contents that aren't part of main content
    $('.table-of-contents, .toc-container, #toc').remove();
    
    // Try to find main content area
    const contentSelectors = [
      'main article',
      'main .content',
      '.main-content article',
      '.documentation .content',
      '.doc-content',
      '.article-content',
      '.markdown-body',
      '.prose',
      'article',
      'main',
      '.content',
      '.main-content',
      '.documentation',
      '.container .row .col'
    ];
    
    let mainContent = null;
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0 && element.text().trim().length > 100) {
        mainContent = element.first();
        break;
      }
    }
    
    // If no main content found, try body but remove known non-content elements
    if (!mainContent) {
      mainContent = $('body');
      mainContent.find('nav, header, footer, aside, .sidebar').remove();
    }
    
    // Clean up remaining unwanted elements within content
    mainContent.find('.edit-page, .github-edit-link, .improve-page').remove();
    mainContent.find('.page-last-modified, .page-contributors').remove();
    
    return mainContent.html() || '';
  }

  convertToMarkdown(html) {
    let markdown = this.turndownService.turndown(html);
    
    // Post-process the markdown to clean it up
    markdown = this.postProcessMarkdown(markdown);
    
    return markdown;
  }

  postProcessMarkdown(markdown) {
    // Remove multiple consecutive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    // Fix escaped numbers in lists
    markdown = markdown.replace(/(\d+)\\\./g, '$1.');
    
    // Remove standalone navigation items and metadata
    const lines = markdown.split('\n');
    const cleanedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Remove lines that look like navigation metadata
      if (trimmed.match(/^\[\d+\s+(months?|days?|years?)\s+ago\]/)) continue;
      if (trimmed.match(/^\d+\s+min\s+read$/)) continue;
      if (trimmed === 'Cloud' || trimmed === 'Self-hosted') continue;
      if (trimmed.match(/^On This Page$/)) continue;
      if (trimmed.match(/^In this article$/)) continue;
      if (trimmed.match(/^Table of contents$/)) continue;
      if (trimmed === 'Note' && lines[i + 1] && !lines[i + 1].trim().startsWith('#')) continue;
      
      // Remove single-word lines that are likely navigation
      if (trimmed.length < 3 && !trimmed.match(/^#+/) && !trimmed.match(/^[-*+]/) && !trimmed.match(/^\d+\./)) continue;
      
      // Fix malformed numbered lists
      if (trimmed.match(/^\d+\.\s+\d+\.\s+/)) {
        // This is a malformed list like "1. 1. Content"
        const fixed = trimmed.replace(/^\d+\.\s+(\d+\.\s+.*)/, '$1');
        cleanedLines.push(line.replace(trimmed, fixed));
        continue;
      }
      
      cleanedLines.push(line);
    }
    
    // Rejoin lines
    markdown = cleanedLines.join('\n');
    
    // Fix header hierarchy issues
    markdown = markdown.replace(/^#{6,}/gm, '#####');
    
    // Ensure proper spacing around headers
    markdown = markdown.replace(/^(#+[^\n]+)$/gm, '\n$1\n');
    
    // Clean up list formatting
    markdown = markdown.replace(/^\*\s+/gm, '- ');
    
    // Remove empty list items
    markdown = markdown.replace(/^[-*+]\s*$/gm, '');
    
    // Fix malformed numbered lists that got through
    markdown = markdown.replace(/^(\d+)\.\s+(\d+)\.\s+/gm, '$2. ');
    
    // Ensure proper paragraph breaks before and after lists
    markdown = markdown.replace(/^(\d+\.\s)/gm, '\n$1');
    markdown = markdown.replace(/^(-\s)/gm, '\n$1');
    
    // Add missing newlines after sentences that should be separate paragraphs
    markdown = markdown.replace(/([.!?])\s*([A-Z][^.!?]*[.!?])/g, '$1\n\n$2');
    
    // Fix code blocks that might be malformed
    markdown = markdown.replace(/```(\w*)\n`([^`]+)`\n```/g, '```$1\n$2\n```');
    
    // Final cleanup of excessive whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.trim();
    
    return markdown;
  }

  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  async scrapeProvider(providerKey) {
    const provider = providers[providerKey];
    if (!provider) {
      console.error(`Provider ${providerKey} not found`);
      return;
    }

    console.log(`\nScraping ${provider.name}...`);
    const outputDir = path.join(__dirname, '..', 'docs', providerKey);
    await fs.ensureDir(outputDir);

    const results = {
      provider: provider.name,
      scraped_at: new Date().toISOString(),
      base_url: provider.baseUrl,
      documents: []
    };

    for (const docPath of provider.docs) {
      const url = `${provider.baseUrl}${docPath}`;
      const html = await this.fetchPage(url);
      
      if (!html) {
        console.warn(`Skipping ${url} - failed to fetch`);
        continue;
      }

      const cleanedHtml = this.cleanContent(html);
      const markdown = this.convertToMarkdown(cleanedHtml);
      
      if (markdown.trim().length < 100) {
        console.warn(`Skipping ${url} - content too short`);
        continue;
      }

      // Create filename from path
      const filename = this.sanitizeFilename(docPath.replace(/^\//, '').replace(/\//g, '-')) + '.mdc';
      const filePath = path.join(outputDir, filename);
      
      // Add metadata header
      const content = `---
title: ${provider.name} - ${docPath}
source_url: ${url}
provider: ${provider.name}
scraped_at: ${new Date().toISOString()}
---

${markdown}`;

      await fs.writeFile(filePath, content);
      
      results.documents.push({
        path: docPath,
        url: url,
        filename: filename,
        content_length: markdown.length
      });
      
      console.log(`✓ Saved ${filename}`);
      
      // Rate limiting to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Skip saving metadata.json since only documentation files are needed

    console.log(`Completed ${provider.name}: ${results.documents.length} documents`);
  }

  async scrapeAll() {
    console.log('Starting documentation scraping...');
    
    for (const providerKey of Object.keys(providers)) {
      try {
        await this.scrapeProvider(providerKey);
      } catch (error) {
        console.error(`Error scraping ${providerKey}:`, error.message);
      }
    }
    
    console.log('Scraping completed!');
  }
}

// CLI interface
if (require.main === module) {
  const { program } = require('commander');
  
  program
    .version('1.0.0')
    .description('Mobile CI Documentation Scraper');

  program
    .command('scrape [provider]')
    .description('Scrape documentation for a specific provider or all providers')
    .action(async (provider) => {
      const scraper = new DocumentationScraper();
      
      if (provider) {
        await scraper.scrapeProvider(provider);
      } else {
        await scraper.scrapeAll();
      }
    });

  program
    .command('list')
    .description('List available providers')
    .action(() => {
      console.log('Available providers:');
      for (const [key, provider] of Object.entries(providers)) {
        console.log(`  ${key} - ${provider.name}`);
      }
    });

  program.parse();
}

module.exports = DocumentationScraper;