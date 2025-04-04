#!/usr/bin/env node

/**
 * Script to help apply translations to existing or new React Native components
 * 
 * Usage:
 * node scripts/apply-translations.js <target-file>
 * 
 * This script will:
 * 1. Read the target file
 * 2. Add necessary imports for translation
 * 3. Suggest replacements for Text components with TranslatedText
 * 4. Apply withTranslation HOC to the component
 * 
 * Note: This is a helper script and may require manual adjustments after running.
 */

const fs = require('fs');
const path = require('path');

// Check for file argument
if (process.argv.length < 3) {
  console.error('Please provide a target file path');
  console.error('Usage: node scripts/apply-translations.js <target-file>');
  process.exit(1);
}

const targetFile = process.argv[2];

// Verify file exists
if (!fs.existsSync(targetFile)) {
  console.error(`File not found: ${targetFile}`);
  process.exit(1);
}

// Read file content
let content = fs.readFileSync(targetFile, 'utf8');

// Check if the file is already using translations
const alreadyHasTranslations = 
  content.includes('TranslatedText') && 
  content.includes('withTranslation');

if (alreadyHasTranslations) {
  console.log('File already has translation components. Skipping...');
  process.exit(0);
}

// Step 1: Add imports
const importRegex = /import\s+React.*from\s+['"]react['"];?/;
const hasReactImport = importRegex.test(content);

// Determine the relative path to components
const targetDir = path.dirname(targetFile);
const componentsPath = path.relative(targetDir, 'components').replace(/\\/g, '/');
const utilsPath = path.relative(targetDir, 'utils').replace(/\\/g, '/');

// Fix paths if needed
const translatedPath = componentsPath === '' ? './translated' : `${componentsPath}/translated`;
const withTranslationPath = componentsPath === '' ? './withTranslation' : `${componentsPath}/withTranslation`;
const useAppTranslationPath = utilsPath === '' ? './useAppTranslation' : `${utilsPath}/useAppTranslation`;

// Add imports
if (hasReactImport) {
  content = content.replace(
    importRegex,
    `import React from 'react';\nimport TranslatedText from '${translatedPath}';\nimport withTranslation from '${withTranslationPath}';\nimport useAppTranslation from '${useAppTranslationPath}';`
  );
} else {
  // Add imports at the beginning
  content = `import React from 'react';\nimport TranslatedText from '${translatedPath}';\nimport withTranslation from '${withTranslationPath}';\nimport useAppTranslation from '${useAppTranslationPath}';\n\n${content}`;
}

// Step 2: Find component definition
const componentRegex = /\b(const|function)\s+(\w+)\s*=\s*(\(.*?\)|.*?=>\s*)/s;
const componentMatch = content.match(componentRegex);

if (!componentMatch) {
  console.error('Could not identify component definition. Manual inspection required.');
  process.exit(1);
}

const componentName = componentMatch[2];

// Step 3: Add translation parameter to props
if (content.includes(`${componentName} = ({`)) {
  content = content.replace(
    `${componentName} = ({`,
    `${componentName} = ({ translation,`
  );
} else if (content.includes(`${componentName} = (`)) {
  content = content.replace(
    `${componentName} = (`,
    `${componentName} = ({ translation }`
  );
} else if (content.includes(`function ${componentName}({`)) {
  content = content.replace(
    `function ${componentName}({`,
    `function ${componentName}({ translation,`
  );
} else if (content.includes(`function ${componentName}(`)) {
  content = content.replace(
    `function ${componentName}(`,
    `function ${componentName}({ translation }`
  );
}

// Step 4: Replace export with withTranslation HOC
const exportRegex = /export\s+default\s+(\w+|memo\(\w+\));?/;
const hasExport = exportRegex.test(content);

if (hasExport) {
  content = content.replace(
    exportRegex,
    `export default withTranslation(${componentName});`
  );
} else {
  // Add export at the end
  content += `\n\nexport default withTranslation(${componentName});\n`;
}

// Step 5: Find import for Text component
const textImportRegex = /import\s+{.*?Text.*?}\s+from\s+['"]react-native['"];?/;
const hasTextImport = textImportRegex.test(content);

// Step 6: Find Text usage and provide suggestions
console.log('\nSuggested Text to TranslatedText replacements:');
console.log('(You will need to apply these manually)');
console.log('----------------------------------------\n');

const textRegex = /<Text[^>]*>(.*?)<\/Text>/g;
let match;
let count = 0;

while ((match = textRegex.exec(content)) !== null) {
  const fullMatch = match[0];
  const textContent = match[1].trim();
  
  // Skip if it looks like a variable
  if (textContent.includes('{') || textContent.length === 0) continue;
  
  const replacement = fullMatch.replace(
    /<Text/,
    '<TranslatedText text="' + textContent + '"'
  ).replace(
    `>${textContent}</Text>`,
    ' />'
  );
  
  console.log(`Original: ${fullMatch}`);
  console.log(`Replace with: ${replacement}\n`);
  count++;
}

// Write updated content to file
fs.writeFileSync(targetFile, content, 'utf8');

console.log(`File updated: ${targetFile}`);
console.log(`- Added translation imports`);
console.log(`- Added translation parameter to ${componentName}`);
console.log(`- Applied withTranslation HOC`);
console.log(`- Found ${count} potential Text components to replace with TranslatedText`);
console.log('\nNow manually replace Text components with TranslatedText as suggested above.');
console.log('Also consider adding useAppTranslation hook for dynamic content or alerts.'); 