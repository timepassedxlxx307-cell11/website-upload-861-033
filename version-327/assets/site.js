
(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterFields = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function textOf(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-year')
    ].join(' '));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = filterInput ? normalize(filterInput.value) : '';
    var visible = 0;

    cards.forEach(function (card) {
      var matched = !query || textOf(card).indexOf(query) !== -1;

      filterFields.forEach(function (field) {
        var value = normalize(field.value);
        var key = field.getAttribute('data-filter-field');

        if (value && key) {
          var cardValue = normalize(card.getAttribute('data-' + key));
          matched = matched && cardValue.indexOf(value) !== -1;
        }
      });

      card.classList.toggle('is-hidden', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput || filterFields.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && filterInput) {
      filterInput.value = initialQuery;
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilters);
    }

    filterFields.forEach(function (field) {
      field.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();
