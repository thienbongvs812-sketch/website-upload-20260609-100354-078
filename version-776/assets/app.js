document.addEventListener('DOMContentLoaded', function () {
  setupMenu();
  setupHeroSlider();
  setupSearch();
  setupPlayers();
});

function setupMenu() {
  var button = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));

  if (slides.length < 2) {
    return;
  }

  var current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var nextIndex = Number(dot.getAttribute('data-slide') || '0');
      show(nextIndex);
    });
  });

  window.setInterval(function () {
    show(current + 1);
  }, 5200);
}

function setupSearch() {
  var areas = Array.prototype.slice.call(document.querySelectorAll('.searchable-area'));

  if (!areas.length) {
    return;
  }

  var searchInput = document.querySelector('.movie-search');
  var filters = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var term = normalize(searchInput ? searchInput.value : '');
    var values = {};

    filters.forEach(function (filter) {
      values[filter.getAttribute('data-filter')] = normalize(filter.value);
    });

    areas.forEach(function (area) {
      var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        var region = normalize(card.getAttribute('data-region'));
        var year = normalize(card.getAttribute('data-year'));
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesRegion = !values.region || region.indexOf(values.region) !== -1;
        var matchesYear = !values.year || year.indexOf(values.year) !== -1;

        card.classList.toggle('is-hidden', !(matchesTerm && matchesRegion && matchesYear));
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filters.forEach(function (filter) {
    filter.addEventListener('change', applyFilters);
  });
}

function setupPlayers() {
  var panels = Array.prototype.slice.call(document.querySelectorAll('.player-panel'));

  panels.forEach(function (panel) {
    var cover = panel.querySelector('.player-cover');
    var video = panel.querySelector('video');
    var externalTrigger = document.querySelector('[data-player-trigger]');

    if (cover) {
      cover.addEventListener('click', function () {
        startStream(panel);
      });
    }

    if (externalTrigger) {
      externalTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        startStream(panel);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startStream(panel);
        }
      });
    }
  });
}

function startStream(panel) {
  var source = panel.getAttribute('data-stream');
  var video = panel.querySelector('video');

  if (!source || !video) {
    return;
  }

  panel.classList.add('is-playing');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    if (video.src !== source) {
      video.src = source;
    }
    playVideo(video);
    return;
  }

  loadHls(function () {
    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
      }

      var hls = new window.Hls();
      video.hlsInstance = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo(video);
      });
    }
  });
}

function playVideo(video) {
  var promise = video.play();

  if (promise && typeof promise.catch === 'function') {
    promise.catch(function () {});
  }
}

function loadHls(callback) {
  if (window.Hls) {
    callback();
    return;
  }

  var existing = document.querySelector('script[data-hls-loader]');

  if (existing) {
    existing.addEventListener('load', callback, { once: true });
    return;
  }

  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
  script.async = true;
  script.setAttribute('data-hls-loader', 'true');
  script.addEventListener('load', callback, { once: true });
  document.head.appendChild(script);
}
