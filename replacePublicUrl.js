const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'build', 'index.html');
const fileContent = fs.readFileSync(filePath, 'utf8');
const updatedContent = fileContent.replace(/%PUBLIC_URL%/g, ''); // replace with appropriate path

fs.writeFileSync(filePath, updatedContent, 'utf8');
