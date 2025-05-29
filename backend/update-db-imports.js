/**
 * This script updates all model files to use the new database selector
 */

const fs = require('fs');
const path = require('path');

// Directory containing model files
const modelsDir = path.join(__dirname, 'models');

// Get all .js files in the models directory
const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));

console.log(`Found ${modelFiles.length} model files to update`);

// Process each model file
modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the database import
  const updatedContent = content.replace(
    "const db = require('../config/db');", 
    "const db = require('../config/db-selector');"
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  console.log(`Updated database import in ${file}`);
});

console.log('All model files have been updated to use the database selector');
