(function () {
  var header = document.querySelector('[data-site-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var backTop = document.querySelector('[data-back-top]');

  function updateScrollState() {
    var scrolled = window.scrollY > 20;
    if (header) {
      header.classList.toggle('is-scrolled', scrolled);
    }
    if (backTop) {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    }
  }

  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var grid = document.querySelector('[data-movie-grid]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var pageSearch = document.querySelector('[data-page-search]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var sortFilter = document.querySelector('[data-sort-filter]');
  var count = document.querySelector('[data-filter-count]');

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.tags,
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(pageSearch && pageSearch.value);
    var typeValue = normalize(typeFilter && typeFilter.value);
    var yearValue = normalize(yearFilter && yearFilter.value);
    var visible = 0;

    cards.forEach(function (card) {
      var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
      var matchesType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1 || normalize(card.dataset.tags).indexOf(typeValue) !== -1;
      var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
      var show = matchesKeyword && matchesType && matchesYear;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = '当前显示 ' + visible + ' 部影片';
    }
  }

  function applySort() {
    if (!grid || !sortFilter) {
      return;
    }
    var value = sortFilter.value;
    var sorted = cards.slice().sort(function (a, b) {
      if (value === 'year-asc') {
        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
      }
      if (value === 'heat-desc') {
        return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
      }
      return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
    });
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  if (pageSearch) {
    var query = getParam('q');
    if (query) {
      pageSearch.value = query;
    }
    pageSearch.addEventListener('input', applyFilters);
  }

  [typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('change', applyFilters);
    }
  });

  if (sortFilter) {
    sortFilter.addEventListener('change', function () {
      applySort();
      applyFilters();
    });
  }

  applySort();
  applyFilters();
})();
