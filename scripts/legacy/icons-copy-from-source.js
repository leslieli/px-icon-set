/**
 * @license
 * Copyright (c) 2018, General Electric
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Copies the icon <g> groups in `px-icon-set.html` to their own individual
 * icon .svg files in `icons/src/[name].svg`. The name is harvested from the
 * <g> tag's ID.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require("jsdom");
const {read,write} = require('./icons-optimize');

async function copyIconsFromSource() {
  console.log('Copying icons from px-icon-set.html to icons/src/*.svg');

  const srcpath = path.join(__dirname, '..', 'icons', 'src');
  const iconfilepath = path.join(__dirname, '..', 'px-icon-set.html');
  const iconFileText = await read(iconfilepath);
  const groups = getIconGroups(iconFileText);

  for (let {name, html} of groups) {
    let svgpath = path.join(__dirname, '..', 'icons', 'src', `${name}.svg`);
    let svg = `<svg version="1.1" viewBox="0 0 32 32"  height="32px" width="32px" fill="none" stroke="black">${html}</svg>`;
    await write(svgpath, svg);
  };

  console.log(`Processed ${groups.length} icons.`);
};

function getIconGroups(html) {
  const dom = new JSDOM(html);
  const gs = Array.from(dom.window.document.querySelectorAll('g'));
  return gs.map(g => ({ name: g.id, html: g.outerHTML }))
};

copyIconsFromSource();
