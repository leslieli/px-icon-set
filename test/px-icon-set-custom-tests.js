// This is the wrapper for custom tests, called upon web components ready state
function runCustomTests() {
  suite('Custom Automation Tests for px-icon', function() {
    test('icon', function() {
      var icon = document.getElementById('px_icon'),
          iron = icon.querySelector('iron-icon');
      assert.equal(iron.icon, 'px-fea:bug');
    });
    test('sizes', function() {
      var icon = document.getElementById('px_icon'),
          iron = icon.querySelector('iron-icon');
      assert.equal(iron.getComputedStyleValue('--iron-icon-width'), '32px');
      assert.equal(iron.getComputedStyleValue('--iron-icon-height'), '32px');
    });
    test('updates icon', function() {
      var icon = document.getElementById('px_icon'),
          iron = icon.querySelector('iron-icon');
      icon.icon = 'px-nav:favorite';
      assert.equal(iron.icon, 'px-nav:favorite');
    });
    test('updates size', function() {
      var icon = document.getElementById('px_icon'),
          iron = icon.querySelector('iron-icon');
      assert.equal(iron.getComputedStyleValue('--iron-icon-width'), '22px');
      assert.equal(iron.getComputedStyleValue('--iron-icon-height'), '22px');
    });
  });
}
