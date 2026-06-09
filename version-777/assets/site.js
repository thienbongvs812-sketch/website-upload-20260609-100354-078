(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (slides.length > 1) {
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 6500);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');
    if (filterInput && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.searchable-card'));
        var clear = document.querySelector('[data-clear-filter]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var empty = document.querySelector('[data-empty-state]');
        var apply = function () {
            var query = filterInput.value.trim().toLowerCase();
            var typeValue = typeSelect ? typeSelect.value : '';
            var regionValue = regionSelect ? regionSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var type = card.getAttribute('data-type') || '';
                var region = card.getAttribute('data-region') || '';
                var ok = (!query || text.indexOf(query) !== -1) && (!typeValue || type === typeValue) && (!regionValue || region === regionValue);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };
        filterInput.addEventListener('input', apply);
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        if (regionSelect) {
            regionSelect.addEventListener('change', apply);
        }
        if (clear) {
            clear.addEventListener('click', function () {
                filterInput.value = '';
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                apply();
                filterInput.focus();
            });
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
            apply();
        }
    }
})();

function initVideoPlayer(src) {
    var shell = document.querySelector('.player-shell');
    if (!shell) {
        return;
    }
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    var loaded = false;
    var hls = null;
    var attach = function () {
        if (loaded) {
            return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else {
            video.src = src;
        }
    };
    var play = function () {
        attach();
        video.setAttribute('controls', 'controls');
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    };
    if (overlay) {
        overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
