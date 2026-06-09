(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        hero.addEventListener('mouseenter', function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });

        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    var movies = window.SEARCH_MOVIES || [];
    var input = document.getElementById('site-search-input');
    var region = document.getElementById('site-region-filter');
    var type = document.getElementById('site-type-filter');
    var year = document.getElementById('site-year-filter');
    var results = document.getElementById('search-results');
    var status = document.getElementById('search-status');

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 在线观看" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
            '<span class="poster-play">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>' +
            '<p class="movie-line">' + escapeHtml(movie.oneLine || '') + '</p>' +
            '<div class="movie-tags">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function queryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function applyFilters() {
        if (!results || !movies.length) {
            return;
        }
        var keyword = (input && input.value ? input.value : '').trim().toLowerCase();
        var regionValue = region && region.value ? region.value : '';
        var typeValue = type && type.value ? type.value : '';
        var yearValue = year && year.value ? String(year.value) : '';
        var filtered = movies.filter(function (movie) {
            var text = [
                movie.title,
                movie.region,
                movie.type,
                movie.genre,
                movie.year,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();
            if (keyword && text.indexOf(keyword) === -1) {
                return false;
            }
            if (regionValue && movie.region !== regionValue) {
                return false;
            }
            if (typeValue && movie.type !== typeValue) {
                return false;
            }
            if (yearValue && String(movie.year) !== yearValue) {
                return false;
            }
            return true;
        }).slice(0, 96);

        if (status) {
            status.textContent = filtered.length ? '匹配结果' : '未找到匹配内容';
        }
        results.innerHTML = filtered.map(card).join('');
    }

    if (input && results) {
        input.value = queryFromUrl();
        [input, region, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener('input', applyFilters);
                el.addEventListener('change', applyFilters);
            }
        });
        if (input.value) {
            applyFilters();
        }
    }
}());
