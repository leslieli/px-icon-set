'use strict';

/**
 * Scans the `icons/src/` directory for .svg files. Grabs the source code from
 * each file, runs it through the svgo optimizer, and places a new .svg file
 * with the same name in `icons/optimized`.
 *
 * Also bundles all optimized icons as <g> groups without a wrapper <svg> in
 * `icons/optimized/_optimized.html`.
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
  const dirpath = path.join(__dirname, '..', 'icons', 'src');
  const fileList = await getFileList(dirpath);
  const fileNames = fileList.filter(f => f.slice(-4) === '.svg');
  const outpath = path.join(__dirname, '..', 'icons', 'optimized', '_optimized.html');
  await write(outpath, '');
  const outws = fs.createWriteStream(outpath);

  for (let file of fileNames) {
    let srcpath = path.join(__dirname, '..', 'icons', 'src', file);
    let destpath = path.join(__dirname, '..', 'icons', 'optimized', file);
    let src = await read(srcpath);
    let optimized = await optimize(src);
    optimized = addAttrsForText(optimized);
    outws.write(cleanForOutfile(optimized) + '\n');
    await write(destpath, optimized);
  }

  outws.end();
  console.log(`Optimized ${fileNames.length} icons. All optimized <g> tags are available in a single file in icons/optimized/_optimized.html`);
};

/**
 * Strips the <svg> wrapper before placing optimized icon into the outfile.
 * Leaves behind only a <g> tag ready to go into iron-iconset-svg.
 */
function cleanForOutfile(string) {
  return string.replace('<svg viewBox="0 0 32 32" height="32" width="32">', '').replace('</svg>','').split('\n').filter(s=>s.length).map(s=>s.trim()).join('');
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
