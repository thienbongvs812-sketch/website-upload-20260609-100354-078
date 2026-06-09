(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                var open = mobileNav.hasAttribute("hidden");
                if (open) {
                    mobileNav.removeAttribute("hidden");
                    menuToggle.setAttribute("aria-expanded", "true");
                } else {
                    mobileNav.setAttribute("hidden", "");
                    menuToggle.setAttribute("aria-expanded", "false");
                }
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }

            function play() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    play();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    play();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    play();
                });
            });
            show(0);
            play();
        }

        var searchInput = document.getElementById("searchInput");
        var filterRegion = document.getElementById("filterRegion");
        var filterYear = document.getElementById("filterYear");
        var filterType = document.getElementById("filterType");
        var resetFilters = document.getElementById("resetFilters");
        var grid = document.querySelector("[data-search-grid]");
        var emptyState = document.querySelector("[data-empty-state]");

        if (grid) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .movie-list-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (searchInput && initialQuery) {
                searchInput.value = initialQuery;
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilters() {
                var query = normalize(searchInput && searchInput.value);
                var region = normalize(filterRegion && filterRegion.value);
                var year = normalize(filterYear && filterYear.value);
                var type = normalize(filterType && filterType.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    var ok = true;

                    if (query && text.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")) !== region) {
                        ok = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        ok = false;
                    }
                    if (type && normalize(card.getAttribute("data-type")) !== type) {
                        ok = false;
                    }

                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            [searchInput, filterRegion, filterYear, filterType].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            if (resetFilters) {
                resetFilters.addEventListener("click", function () {
                    if (searchInput) {
                        searchInput.value = "";
                    }
                    if (filterRegion) {
                        filterRegion.value = "";
                    }
                    if (filterYear) {
                        filterYear.value = "";
                    }
                    if (filterType) {
                        filterType.value = "";
                    }
                    applyFilters();
                });
            }

            applyFilters();
        }

        Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(function (video) {
            var src = video.getAttribute("data-hls");
            var frame = video.closest(".video-frame");
            var button = frame ? frame.querySelector(".video-start") : null;
            var attached = false;

            function attach() {
                if (attached || !src) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                }
            }

            function start() {
                attach();
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            attach();

            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("play", function () {
                if (frame) {
                    frame.classList.add("playing");
                }
            });
            video.addEventListener("pause", function () {
                if (frame) {
                    frame.classList.remove("playing");
                }
            });
        });
    });
})();
