document.addEventListener('DOMContentLoaded', function() {
  var layout = document.querySelector('.rec-layout');
  if (!layout) return;

  var tabs = Array.prototype.slice.call(layout.querySelectorAll('[data-rec-tab]'));

  var activateTab = function(key, options) {
    var target = tabs.find(function(tab) { return tab.dataset.recTab === key; });
    if (!target) return;

    tabs.forEach(function(tab) {
      var selected = tab === target;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    });

    if (options && options.focus) target.focus();
    if (options && options.updateHash && history.replaceState) {
      history.replaceState(null, '', '#' + key);
    }
  };

  tabs.forEach(function(tab, index) {
    tab.addEventListener('click', function() {
      activateTab(tab.dataset.recTab, { updateHash: true });
    });

    tab.addEventListener('keydown', function(event) {
      var offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!offset) return;
      event.preventDefault();
      var next = tabs[(index + offset + tabs.length) % tabs.length];
      activateTab(next.dataset.recTab, { focus: true, updateHash: true });
    });
  });

  var syncFromHash = function() {
    var key = decodeURIComponent(location.hash.slice(1));
    if (key) activateTab(key);
  };

  syncFromHash();
  window.addEventListener('hashchange', syncFromHash);

  // ---------- Detail modal ----------

  var modal = document.createElement('div');
  modal.className = 'rec-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = [
    '<button class="rec-modal__nav rec-modal__nav--prev" type="button" aria-label="上一个">‹</button>',
    '<div class="rec-modal__dialog" role="dialog" aria-modal="true" tabindex="-1">',
    '<button class="rec-modal__close" type="button" aria-label="关闭详情">×</button>',
    '<div class="rec-modal__content"></div>',
    '</div>',
    '<button class="rec-modal__nav rec-modal__nav--next" type="button" aria-label="下一个">›</button>'
  ].join('');
  document.body.appendChild(modal);

  var dialog = modal.querySelector('.rec-modal__dialog');
  var content = modal.querySelector('.rec-modal__content');
  var prevButton = modal.querySelector('.rec-modal__nav--prev');
  var nextButton = modal.querySelector('.rec-modal__nav--next');
  var siblings = [];
  var currentIndex = -1;
  var returnFocus = null;

  // ---------- Audio preview ----------

  var player = null;

  var destroyPlayer = function() {
    if (!player) return;
    player.audio.pause();
    player.audio.removeAttribute('src');
    player.audio.load();
    player = null;
  };

  var formatTime = function(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '--:--';
    var minutes = Math.floor(seconds / 60);
    var rest = Math.floor(seconds % 60);
    return minutes + ':' + (rest < 10 ? '0' : '') + rest;
  };

  var initPlayer = function() {
    var root = content.querySelector('[data-rec-audio]');
    if (!root) return;

    var audio = root.querySelector('.rec-audio__el');
    var toggle = root.querySelector('.rec-audio__toggle');
    var seek = root.querySelector('.rec-audio__seek');
    var fill = root.querySelector('.rec-audio__fill');
    var now = root.querySelector('.rec-audio__now');
    var dur = root.querySelector('.rec-audio__dur');
    var scrubbing = false;

    var paint = function() {
      var duration = audio.duration;
      var ratio = duration ? (scrubbing ? seek.value / 1000 : audio.currentTime / duration) : 0;
      var moment = scrubbing && duration ? ratio * duration : audio.currentTime;
      fill.style.width = (ratio * 100).toFixed(2) + '%';
      if (!scrubbing) seek.value = Math.round(ratio * 1000);
      now.textContent = formatTime(moment);
      seek.setAttribute('aria-valuetext', formatTime(moment) + ' / ' + formatTime(duration));
    };

    audio.addEventListener('loadedmetadata', function() {
      dur.textContent = formatTime(audio.duration);
      paint();
    });
    audio.addEventListener('durationchange', function() {
      dur.textContent = formatTime(audio.duration);
      paint();
    });
    audio.addEventListener('timeupdate', paint);
    audio.addEventListener('play', function() {
      root.classList.add('is-playing');
      toggle.setAttribute('aria-label', '暂停试听');
    });
    audio.addEventListener('pause', function() {
      root.classList.remove('is-playing');
      toggle.setAttribute('aria-label', '播放试听');
    });
    audio.addEventListener('ended', function() {
      audio.currentTime = 0;
      paint();
    });
    audio.addEventListener('error', function() {
      root.classList.add('is-error');
      toggle.disabled = true;
      dur.textContent = '无法播放';
    });

    toggle.addEventListener('click', function() {
      if (audio.paused) {
        audio.play()['catch'](function() {});
      } else {
        audio.pause();
      }
    });

    seek.addEventListener('input', function() {
      scrubbing = true;
      paint();
    });
    var commitSeek = function() {
      if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
      scrubbing = false;
      paint();
    };
    seek.addEventListener('change', commitSeek);
    seek.addEventListener('pointerup', commitSeek);

    // ±5s jumps instead of the slider's fine-grained step.
    seek.addEventListener('keydown', function(event) {
      var delta = { ArrowLeft: -5, ArrowRight: 5, ArrowDown: -5, ArrowUp: 5 }[event.key];
      if (delta === undefined || !audio.duration) return;
      event.preventDefault();
      audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + delta));
      paint();
    });

    player = { audio: audio };
    paint();
  };

  var showCard = function(index) {
    var card = siblings[index];
    var template = card && document.getElementById(card.dataset.recOpen);
    if (!template) return;

    destroyPlayer();
    currentIndex = index;
    content.replaceChildren(template.content.cloneNode(true));
    modal.style.setProperty('--rec-accent', getComputedStyle(card).getPropertyValue('--accent').trim());
    dialog.setAttribute('aria-label', card.getAttribute('aria-label') || '详情');
    dialog.scrollTop = 0;
    prevButton.disabled = index <= 0;
    nextButton.disabled = index >= siblings.length - 1;
    initPlayer();
  };

  var openModal = function(card) {
    siblings = Array.prototype.slice.call(card.closest('.rec-grid').querySelectorAll('[data-rec-open]'));
    returnFocus = card;
    showCard(siblings.indexOf(card));
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('rec-modal-open');
    dialog.focus();
  };

  var closeModal = function() {
    destroyPlayer();
    // Drop the cloned detail (platform embeds keep playing while they stay in the DOM).
    content.replaceChildren();
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('rec-modal-open');
    if (returnFocus) returnFocus.focus();
  };

  layout.addEventListener('click', function(event) {
    var card = event.target.closest('[data-rec-open]');
    if (card) openModal(card);
  });

  modal.addEventListener('click', function(event) {
    if (event.target === modal || event.target.closest('.rec-modal__close')) {
      closeModal();
    } else if (event.target === prevButton) {
      showCard(currentIndex - 1);
    } else if (event.target === nextButton) {
      showCard(currentIndex + 1);
    }
  });

  document.addEventListener('keydown', function(event) {
    if (!modal.classList.contains('is-open')) return;
    // Let the audio player handle arrow keys while its slider has focus.
    if (event.key !== 'Escape' && event.target.closest && event.target.closest('[data-rec-audio]')) return;

    if (event.key === 'Escape') {
      closeModal();
    } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
      showCard(currentIndex - 1);
    } else if (event.key === 'ArrowRight' && currentIndex < siblings.length - 1) {
      showCard(currentIndex + 1);
    }
  });
});
