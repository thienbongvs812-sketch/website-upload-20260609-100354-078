(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setHeaderState() {
    var header = document.querySelector('[data-header]');
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === index);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot') || '0');
        show(next);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('.filter-root'));
    roots.forEach(function (root) {
      var searchInput = root.querySelector('.filter-search');
      var yearSelect = root.querySelector('.filter-year');
      var regionSelect = root.querySelector('.filter-region');
      var sortSelect = root.querySelector('.sort-select');
      var grid = root.querySelector('[data-movie-grid]');
      var count = root.querySelector('.visible-count');
      var empty = root.querySelector('[data-empty-state]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');
      if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
      }

      function getValue(element) {
        return element ? element.value.trim().toLowerCase() : '';
      }

      function applySort(visibleCards) {
        var value = sortSelect ? sortSelect.value : 'year-desc';
        visibleCards.sort(function (a, b) {
          var yearA = Number(a.getAttribute('data-year') || 0);
          var yearB = Number(b.getAttribute('data-year') || 0);
          var scoreA = Number(a.getAttribute('data-score') || 0);
          var scoreB = Number(b.getAttribute('data-score') || 0);
          var titleA = a.getAttribute('data-title') || '';
          var titleB = b.getAttribute('data-title') || '';
          if (value === 'year-asc') {
            return yearA - yearB || titleA.localeCompare(titleB, 'zh-CN');
          }
          if (value === 'score-desc') {
            return scoreB - scoreA || yearB - yearA;
          }
          if (value === 'title-asc') {
            return titleA.localeCompare(titleB, 'zh-CN');
          }
          return yearB - yearA || titleA.localeCompare(titleB, 'zh-CN');
        });
        visibleCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function applyFilters() {
        var query = getValue(searchInput);
        var year = getValue(yearSelect);
        var region = getValue(regionSelect);
        var visibleCards = [];
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-text') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (year && cardYear !== year) {
            ok = false;
          }
          if (region && cardRegion.indexOf(region) === -1 && text.indexOf(region) === -1) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visibleCards.push(card);
          }
        });
        applySort(visibleCards);
        if (count) {
          count.textContent = String(visibleCards.length);
        }
        if (empty) {
          empty.hidden = visibleCards.length !== 0;
        }
      }

      [searchInput, yearSelect, regionSelect, sortSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilters);
          element.addEventListener('change', applyFilters);
        }
      });
      applyFilters();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-start]');
      var source = player.getAttribute('data-src') || '';
      var hlsInstance = null;
      if (!video || !source) {
        return;
      }

      function loadAndPlay() {
        player.classList.add('is-ready');
        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 60
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          }
          video.play().catch(function () {});
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', source);
          }
          video.play().catch(function () {});
          return;
        }
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener('click', loadAndPlay);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
    });
  }

  ready(function () {
    setHeaderState();
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    window.addEventListener('scroll', setHeaderState, { passive: true });
  });
})();
