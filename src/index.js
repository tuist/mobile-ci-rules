#!/usr/bin/env node

const { program } = require('commander');
const DocumentationScraper = require('./scraper');
const { providers } = require('./config');

async function main() {
  program
    .version('1.0.0')
    .description('Mobile CI Documentation Scraper and Converter')
    .option('-p, --provider <provider>', 'Scrape specific provider')
    .option('-l, --list', 'List all available providers')
    .option('-a, --all', 'Scrape all providers')
    .parse();

  const options = program.opts();

  if (options.list) {
    console.log('Available mobile CI providers:');
    console.log('==============================');
    for (const [key, provider] of Object.entries(providers)) {
      console.log(`${key.padEnd(20)} - ${provider.name}`);
      console.log(`${' '.repeat(20)}   ${provider.baseUrl}`);
      console.log(`${' '.repeat(20)}   ${provider.docs.length} documentation pages`);
      console.log();
    }
    return;
  }

  const scraper = new DocumentationScraper();

  if (options.provider) {
    if (!providers[options.provider]) {
      console.error(`Provider "${options.provider}" not found. Use --list to see available providers.`);
      process.exit(1);
    }
    await scraper.scrapeProvider(options.provider);
  } else if (options.all || (!options.provider && !options.list)) {
    await scraper.scrapeAll();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { DocumentationScraper, providers };