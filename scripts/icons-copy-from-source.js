'use strict';

const fs = require('fs');
const path = require('path');
const icons = require('../icons/src/_src');

for (let {name,html} of icons) {
  let filePath = path.join(__dirname, 'icons', 'src', `${name}.svg`);
  let svg = `<svg version="1.1" viewBox="0 0 32 32"  height="32px" width="32px" fill="none" stroke="black">${html}</svg>`;
  fs.writeFile(filePath, svg, 'utf8', err => {
    if (err) throw err;
  });
};
