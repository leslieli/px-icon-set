'use strict';

// This obj links the prefix to the final file name
// If you add a new set, register it here
const iconsetNames = {
  'com': 'communication',
  'doc': 'document',
  'fea': 'feature',
  'nav': 'navigation',
  'obj': 'object',
  'utl': 'utility',
  'vis': 'vis'
};

const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const svgo = new SVGO({
  full: true,
  multipass: true,
  js2svg: {
    pretty: true,
    indent: '  '
  },
  plugins: [
    {cleanupAttrs: true},
    {removeEditorsNSData: true},
    {removeEmptyAttrs: true},
    {removeEmptyContainers: true},
    {cleanUpEnableBackground: true},
    {convertStyleToAttrs: true},
    {convertPathData: true},
    {convertTransform: true},
    {removeUnknownsAndDefaults: true},
    {removeNonInheritableGroupAttrs: true},
    {removeUselessStrokeAndFill: true},
    {removeUnusedNS: true},
    {cleanupNumericValues: true},
    {mergePaths: true},
    {convertShapeToPath: true},
    {transformsWithOnePath: false},
    {removeAttrs: {attrs: '(class|stroke|fill)'}},
  ]
});

async function optimizeFromSrc() {
  console.log('Optimizing icons in icons/src/*.svg and placing the result in icons/optimized/*.svg');
  const inFolder = process.argv[2];
  const ending = inFolder.slice(4);
  const outFolder = `optimized-${ending}`;

  const dirpath = path.join(__dirname, '..', 'icons', inFolder);
  const fileList = await getFileList(dirpath);
  const fileNames = fileList.filter(f => f.slice(-4) === '.svg');
  const outpath = path.join(__dirname, '..', 'icons', outFolder, `_optimized-${ending}.html`);
  await write(outpath, '');
  const outws = fs.createWriteStream(outpath);

  for (let file of fileNames) {
    let srcpath = path.join(__dirname, '..', 'icons', inFolder, file);
    let destpath = path.join(__dirname, '..', 'icons', outFolder, file);
    let src = await read(srcpath);
    let optimized = await optimize(src);
    optimized = addAttrsForText(optimized);
    outws.write(cleanForOutfile(optimized, file) + '\n');
    await write(destpath, optimized);
  }

  outws.end();
  console.log(`Optimized ${fileNames.length} icons. All optimized <g> tags are available in a single file in icons/optimized-${ending}/_optimized.html`);

  console.log(`Copying optimized icons to icon set file`);

  const iconsetPath = path.join(__dirname, '..', `px-icon-set-${iconsetNames[ending]}.html`);
  const oldIconset = await read(iconsetPath);
  const optimized = await read(outpath);

  // First, get a list of ids to make sure we didnt loose any icons on accident
  const oldIconNames = getIconNames(oldIconset);
  const newIconNames = getIconNames(optimized);
  compareNamesAndPrint(oldIconNames, newIconNames);

  const [svgStart, svgEnd] = getSVGStuff(oldIconset);

  const newIconset = svgStart + '\n' + optimized + svgEnd;

  await write(iconsetPath, newIconset);

  console.log(`Icons copied to set px-icon-set-${iconsetNames[ending]}.html`);
};

/**
 * Strips the <svg> wrapper before placing optimized icon into the outfile.
 * Leaves behind only a <g> tag ready to go into iron-iconset-svg.
 */
function cleanForOutfile(string, name) {
  // We assume that they all have a title filed and our content starts after it...
  // FIXME This might not be a safe assumption. Probably a regex or something would be safer
  const ending = '</title>';
  const index = findIndex(ending,string);

  //Fix our name, get rid of .svg, 32x32, and replace _ with -
  // FIXME .slice(0,-6) might need to get smarter to only slice if the 16x16 is there
  const n = name.split('.')[0].slice(0,-6).split('_').join('-');
  const g = `<g id="${n}">`;

  // get our real content
  const s = string.slice(index).replace('</svg>','</g>').replace(/\sid="\w+"/, '').split('\n').filter(s=>s.length).map(s=>s.trim()).join('');

  return g + s;
};

/**
 * Text must inherit its color from the CSS color property so it can be themed
 * correctly with style variables. Adds the necessary fill and stroke attrs
 * inline to <text> tags.
 */
function addAttrsForText(string) {
  const match = string.match(/\<text/);
  if (match) {
    let prefix = string.slice(0, match.index);
    let suffix = string.slice(match.index+5);
    return `${prefix}<text fill="currentcolor" stroke="none" ${suffix}`;
  }
  else {
    return string;
  }
};

function getFileList(path) {
  return Promise.resolve(fs.readdirSync(path));
};

function read(path) {
  return new Promise(resolve => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) throw err;
      return resolve(data);
    });
  });
};

function optimize(string) {
  return new Promise(resolve => {
    svgo.optimize(string, result => {
      return resolve(result.data);
    });
  });
};

function write(path, string) {
  return new Promise(resolve => {
    fs.writeFile(path, string, 'utf8', err => {
      if (err) throw err;
      return resolve(path);
    });
  });
};

function getIconNames(src) {
  const re = /<g\s?id="([^"]+)/g;
  let names = [];
  let n;

  while(n = re.exec(src)) {
    names.push(n[1])
  }

  return names;
};

function getSVGStuff(svg) {
  const iStart = findIndex('<defs>', svg);
  const iEnd = svg.indexOf('</defs>');
  const start = svg.slice(0, iStart);
  const end = svg.slice(iEnd);

  return [start,end];
};

function findIndex(searchTerm, src) {
  const i = src.indexOf(searchTerm);
  return i + searchTerm.length;
};

function compareNamesAndPrint(oldName, newName) {
  newName.forEach(name => {
    const i = oldName.indexOf(name);
    if(i > -1) { oldName.splice(i,1); }
  });

  if(oldName.length) {
    console.log("\n\n********************************************************************************");
    console.log("\nSome icons are missing or were renamed. Is this intentional?");
    console.log(oldName.join('\n'));
    console.log('\n');
    console.log("********************************************************************************\n\n");
  }
};

optimizeFromSrc();

exports = module.exports = {
  read,
  write
};
