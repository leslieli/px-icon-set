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

describe('px-icon', () => {
  let pxIcon;
  let ironIcon;

  beforeEach((done) => {
    pxIcon = fixture('PxIconFixture');
    flush(() => {
      ironIcon = Polymer.dom(pxIcon.root).querySelector('iron-icon');
      done();
    });
  });

  it('passes the requested icon to iron-icon', () => {
    expect(ironIcon.icon).to.equal('px-fea:bug');
  });

  it('updates the requested icon by passing it to iron-icon', () => {
    pxIcon.icon = 'px-nav:favorite';
    expect(ironIcon.icon).to.equal('px-nav:favorite');
  });

  it('sets the correct size for the icon based on its set', () => {
    expect(ironIcon.getComputedStyleValue('--iron-icon-width')).to.equal('32px');
    expect(ironIcon.getComputedStyleValue('--iron-icon-height')).to.equal('32px');
  });

  it('sets its size when the icon is changed to one from a different-sized set', () => {
    pxIcon.icon = 'px-nav:favorite';
    expect(ironIcon.getComputedStyleValue('--iron-icon-width')).to.equal('22px');
    expect(ironIcon.getComputedStyleValue('--iron-icon-height')).to.equal('22px');
  });
});
