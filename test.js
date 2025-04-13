const path = require('path');
const fs = require('fs');

const localFilePath = path.join(__dirname,'/public/assets','profile.svg');
const fileName = Date.now() + '.svg';
const destPath = path.join(__dirname, '/uploads', fileName);
fs.copyFileSync(localFilePath, destPath);