

(function () {
  'use strict';

  if (window.__ocfxBoard) return;
  window.__ocfxBoard = true;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function addFrame(button) {
    if (!button || button.classList.contains('nav')) return;

    var card = button.querySelector(':scope > .ocfx-hot-crop');
    if (!card) {
      card = document.createElement('span');
      card.className = 'ocfx-hot-crop';
      card.setAttribute('aria-hidden', 'true');
      button.insertBefore(card, button.firstChild);
    }
    syncCardCrop(button, card);

    if (!button.querySelector(':scope > .ocfx-hot-frame')) {
      var frame = document.createElement('span');
      frame.className = 'ocfx-hot-frame';
      frame.setAttribute('aria-hidden', 'true');
      button.appendChild(frame);
    }

    if (button.dataset.ocfxBoardBound === '1') return;
    button.dataset.ocfxBoardBound = '1';

    button.addEventListener('pointerenter', function () {
      syncCardCrop(button);
    }, { passive: true });

    button.addEventListener('focus', function () {
      syncCardCrop(button);
    });

    button.addEventListener('pointerdown', function (event) {
      press(button, event);
    }, { passive: true });

    button.addEventListener('keydown', function (event) {
      if (event.key === ' ' || event.key === 'Enter') press(button, null);
    });
  }

  function syncCardCrop(button, card) {
    card = card || button.querySelector(':scope > .ocfx-hot-crop');
    var board = button.closest('.oc-real');
    var image = board && board.querySelector(':scope > img.on');
    if (!card || !image) return;

    var src = image.currentSrc || image.src;
    var left = parseFloat(button.style.left);
    var top = parseFloat(button.style.top);
    var width = parseFloat(button.style.width);
    var height = parseFloat(button.style.height);
    if (!src || !(width > 0 && height > 0) || width >= 100 || height >= 100) return;

    card.style.setProperty('--ocfx-card-image', 'url("' + src.replace(/"/g, '\\"') + '")');
    card.style.setProperty('--ocfx-card-size', (10000 / width) + '% auto');
    card.style.setProperty(
      '--ocfx-card-position',
      (left / (100 - width)) * 100 + '% ' + (top / (100 - height)) * 100 + '%'
    );
    card.dataset.ready = '1';
  }

  function press(button, event) {
    button.classList.remove('ocfx-hot-press');
    void button.offsetWidth;
    button.classList.add('ocfx-hot-press');
    window.setTimeout(function () {
      button.classList.remove('ocfx-hot-press');
    }, 580);

    if (reduceMotion) return;

    var frame = button.querySelector(':scope > .ocfx-hot-frame');
    if (!frame) return;

    var rect = button.getBoundingClientRect();
    var x = event && event.clientX ? event.clientX - rect.left : rect.width / 2;
    var y = event && event.clientY ? event.clientY - rect.top : rect.height / 2;
    var ripple = document.createElement('span');
    ripple.className = 'ocfx-hot-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    frame.appendChild(ripple);
    window.setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 680);
  }

  function decorate(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.oc-real .oc-rh-hot').forEach(addFrame);
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      decorate(document);
    });
  }

  function boot() {
    decorate(document);
    if (!('MutationObserver' in window)) return;

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
          schedule();
          return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
