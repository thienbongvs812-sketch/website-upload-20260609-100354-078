(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
        var input = form.querySelector('[data-search-input]');
        var list = document.querySelector('[data-search-list]');
        if (!input || !list) {
            return;
        }
        var items = Array.prototype.slice.call(list.children);
        var applySearch = function () {
            var keyword = input.value.trim().toLowerCase();
            items.forEach(function (item) {
                var text = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '') + ' ' + item.textContent).toLowerCase();
                item.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
            });
        };
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applySearch();
        });
        input.addEventListener('input', applySearch);
    });
})();
