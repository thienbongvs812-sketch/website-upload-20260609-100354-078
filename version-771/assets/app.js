(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupNavigation();
        setupCarousel();
        setupFilters();
        setupSearchPage();
        setupPlayers();
    });

    function setupNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var mobile = document.querySelector('.mobile-nav');
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = mobile.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
        var prev = carousel.querySelector('[data-carousel-prev]');
        var next = carousel.querySelector('[data-carousel-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === index);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
        inputs.forEach(function (input) {
            var root = input.closest('main') || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-card]'));
            var empty = root.querySelector('[data-filter-empty]');
            function applyFilter() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-title') || '').toLowerCase();
                    var matched = !value || haystack.indexOf(value) !== -1;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('visible', visible === 0);
                }
            }
            input.addEventListener('input', applyFilter);
            applyFilter();
        });
    }

    function setupSearchPage() {
        var form = document.querySelector('.search-page-form');
        var input = document.getElementById('searchInput');
        var results = document.getElementById('searchResults');
        var state = document.getElementById('searchState');
        if (!form || !input || !results || !state || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function card(movie) {
            var tags = movie.tags.slice(0, 2).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card">' +
                '<a href="' + movie.href + '" class="movie-card-link">' +
                '<span class="movie-poster">' +
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="poster-shade"></span>' +
                '<span class="card-play">▶</span>' +
                '<span class="card-type">' + escapeHtml(movie.type) + '</span>' +
                '</span>' +
                '<span class="movie-card-body">' +
                '<strong>' + escapeHtml(movie.title) + '</strong>' +
                '<span class="movie-meta">' + escapeHtml(movie.region) + ' · ' + movie.year + '</span>' +
                '<span class="tag-row">' + tags + '</span>' +
                '</span>' +
                '</a>' +
                '</article>';
        }

        function runSearch() {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                results.innerHTML = '';
                state.textContent = '输入关键词后显示匹配影片';
                state.classList.add('visible');
                return;
            }
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return movie.search.indexOf(query) !== -1;
            }).slice(0, 180);
            results.innerHTML = matched.map(card).join('');
            if (matched.length === 0) {
                state.textContent = '未找到匹配影片';
                state.classList.add('visible');
            } else {
                state.classList.remove('visible');
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            url.searchParams.set('q', input.value.trim());
            window.history.replaceState(null, '', url.toString());
            runSearch();
        });
        input.addEventListener('input', runSearch);
        runSearch();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var trigger = player.querySelector('.player-cover');
            var source = player.getAttribute('data-source');
            var hls = null;
            var initialized = false;

            function attachSource() {
                if (!video || !source || initialized) {
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                attachSource();
                player.classList.add('is-playing');
                video.setAttribute('controls', 'controls');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (trigger) {
                trigger.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!initialized) {
                        play();
                    }
                });
                window.addEventListener('beforeunload', function () {
                    if (hls) {
                        hls.destroy();
                    }
                });
            }
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
