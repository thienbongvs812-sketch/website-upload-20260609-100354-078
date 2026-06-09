(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var target = Number(dot.getAttribute('data-target-slide') || '0');
                show(target);
                restart();
            });
        });

        show(0);
        restart();
    }

    function setupFilter() {
        selectAll('.search-scope').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var cards = selectAll('.movie-card', scope);
            if (!input || !cards.length) {
                return;
            }
            input.addEventListener('input', function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    card.classList.toggle('is-filtered-out', value && haystack.indexOf(value) === -1);
                });
            });
        });
    }

    function attachStream(video) {
        var stream = video.getAttribute('data-stream');
        if (!stream || video.dataset.ready === '1') {
            return;
        }
        video.dataset.ready = '1';
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        }
    }

    function setupPlayers() {
        selectAll('.movie-video').forEach(function (video) {
            var shell = video.closest('.video-shell');
            var overlay = shell ? shell.querySelector('.play-overlay') : null;

            function begin() {
                attachStream(video);
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', begin);
                video.addEventListener('play', function () {
                    overlay.classList.add('is-hidden');
                });
                video.addEventListener('pause', function () {
                    if (!video.ended) {
                        overlay.classList.add('is-hidden');
                    }
                });
                video.addEventListener('ended', function () {
                    overlay.classList.remove('is-hidden');
                });
            }

            video.addEventListener('pointerdown', function () {
                attachStream(video);
            }, { once: true });
        });

        selectAll('[data-play-jump]').forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                var video = document.querySelector('.movie-video');
                if (!video) {
                    return;
                }
                video.scrollIntoView({ behavior: 'smooth', block: 'center' });
                window.setTimeout(function () {
                    attachStream(video);
                    var result = video.play();
                    if (result && typeof result.catch === 'function') {
                        result.catch(function () {});
                    }
                }, 260);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilter();
        setupPlayers();
    });
}());
