// This is the wrapper for custom tests, called upon web components ready state
function runCustomTests() {
  // This is the placeholder suite to place custom tests in
  // Use testCase(options) for a more convenient setup of the test cases

  suite('Custom Automation Tests for px-icon', function() {
    var icon = document.getElementById('px_icon'),
        iron = icon.querySelector('iron-icon');
    assert.equal(iron.icon, 'px:aircraft');
  });
}
