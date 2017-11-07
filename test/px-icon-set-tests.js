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
