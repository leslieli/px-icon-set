'use strict';

/**
 * Copies the icon <g> groups in `icons/src/_src.html` to their own individual
 * icon .svg files in `icons/src/[name].svg`. The name is harvested from the
 * <g> tag's ID.
 *
 * The `_src.html` file should have each <g> tag on its own line, with no line
 * breaks in the <g> tag. There should only be <g> tags in the file, and
 * nothing else.
 */

const fs = require('fs');
const path = require('path');
const {read,write} = require('./icons-optimize');

async function copyIconsFromSource() {
  const srcpath = path.join(__dirname, '..', 'icons', 'src');
  const iconfilepath = path.join(__dirname, '..', 'icons', 'src', '_src.html');
  const iconFileText = await read(iconfilepath);
  const groupLines = getGroupLines(iconFileText);
  const groups = processGroupLines(groupLines);

  for (let {name, html} of groups) {
    let svgpath = path.join(__dirname, '..', 'icons', 'src', `${name}.svg`);
    let svg = `<svg version="1.1" viewBox="0 0 32 32"  height="32px" width="32px" fill="none" stroke="black">${html}</svg>`;
    await write(svgpath, svg);
  };

  console.log(groups.length);
};

function getGroupLines(fileText) {
  return fileText.split('\n').map(l => l.trim()).filter(l => l.slice(0,2) === '<g');
};

function processGroupLines(lines) {
  return lines.reduce((acc, line) => {
    let match = line.match(/\<g id\=\"([a-zA-Z-]+)\"/);
    if (!match) return acc;
    return acc.concat([{name: match[1], html:line}]);
  }, []);
};

copyIconsFromSource();
