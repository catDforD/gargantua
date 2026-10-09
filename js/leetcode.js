document.addEventListener('DOMContentLoaded', function() {
  var layout = document.querySelector('.lc-layout');
  if (!layout) return;

  var items = Array.prototype.slice.call(layout.querySelectorAll('[data-lc-item]'));
  var difficultyButtons = Array.prototype.slice.call(layout.querySelectorAll('[data-lc-difficulty]'));
  var tagButtons = Array.prototype.slice.call(layout.querySelectorAll('[data-lc-tag]'));
  var searchInput = layout.querySelector('[data-lc-search]');
  var countTarget = layout.querySelector('[data-lc-count]');
  var emptyHint = layout.querySelector('[data-lc-empty]');

  var state = { difficulty: 'all', tag: '', query: '' };

  var setPressed = function(buttons, active, matcher) {
    buttons.forEach(function(button) {
      var isActive = matcher(button);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  var update = function() {
    var visible = 0;

    items.forEach(function(item) {
      var tags = (item.dataset.lcTags || '').split(' ').filter(Boolean);
      var matchesDifficulty = state.difficulty === 'all' || item.dataset.lcDifficulty === state.difficulty;
      var matchesTag = !state.tag || tags.indexOf(state.tag) !== -1;
      var matchesQuery = !state.query || (item.dataset.lcSearch || '').indexOf(state.query) !== -1;
      var show = matchesDifficulty && matchesTag && matchesQuery;

      item.hidden = !show;
      if (show) visible += 1;
    });

    if (countTarget) countTarget.textContent = String(visible);
    if (emptyHint) emptyHint.hidden = visible !== 0;
  };

  difficultyButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      state.difficulty = button.dataset.lcDifficulty;
      setPressed(difficultyButtons, null, function(current) {
        return current.dataset.lcDifficulty === state.difficulty;
      });
      update();
    });
  });

  tagButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      state.tag = button.dataset.lcTag;
      setPressed(tagButtons, null, function(current) {
        return current.dataset.lcTag === state.tag;
      });
      update();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      state.query = searchInput.value.trim().toLowerCase();
      update();
    });
  }
});
