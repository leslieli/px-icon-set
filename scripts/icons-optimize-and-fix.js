'use strict';

/**
 * Scans the `icons/src/` directory for .svg files. Grabs the source code from
 * each file, runs it through the svgo optimizer, and places a new .svg file
 * with the same name in `icons/optimized`.
 *
 * Also bundles all optimized icons as <g> groups without a wrapper <svg> in
 * `icons/optimized/_optimized.html`.
 *
 * TO RUN:
 * You need node 7.6+
 * If you're on 7.x run with the flag node --harmony-async-await
 * If you're on 8.x no flag
 *
 */

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
  const ending = inFolder.slice(3);
  const outFolder = `optimized${ending}`;

  const dirpath = path.join(__dirname, '..', 'icons', inFolder);
  const fileList = await getFileList(dirpath);
  const fileNames = fileList.filter(f => f.slice(-4) === '.svg');
  const outpath = path.join(__dirname, '..', 'icons', outFolder, `_optimized${ending}.html`);
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
  console.log(`Optimized ${fileNames.length} icons. All optimized <g> tags are available in a single file in icons/optimized/_optimized.html`);
};

/**
 * Strips the <svg> wrapper before placing optimized icon into the outfile.
 * Leaves behind only a <g> tag ready to go into iron-iconset-svg.
 */
function cleanForOutfile(string, name) {
  // We assume that they all have a title filed and our content starts after it...
  var ending = '</title>',
      endingStart = string.indexOf(ending),
      index = endingStart + 8,

      //Fix our name, get rid of .svg, 32x32, and replace _ with -
      n = name.split('.')[0].slice(0,-6).split('_').join('-'),
      g = `<g id="${n}">`,

      // get our real content
      s = string.slice(index).replace('</svg>','</g>').replace(/\sid="\w+"/, '').split('\n').filter(s=>s.length).map(s=>s.trim()).join('');

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

optimizeFromSrc();

exports = module.exports = {
  read,
  write
};
