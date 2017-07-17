// This is the wrapper for custom tests, called upon web components ready state
function runCustomTests() {
  suite('Custom Automation Tests for px-icon', function() {
    test('icon', function() {
      var icon = document.getElementById('px_icon'),
          iron = icon.querySelector('iron-icon');
      assert.equal(iron.icon, 'px:aircraft');
    });
  });
}
