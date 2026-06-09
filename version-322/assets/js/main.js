(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  if (slides.length > 1) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterForms = document.querySelectorAll('[data-filter-form]');

  filterForms.forEach(function (form) {
    var scope = document.querySelector(form.getAttribute('data-filter-form')) || document;
    var items = Array.prototype.slice.call(scope.querySelectorAll('.js-filter-item'));
    var empty = document.querySelector(form.getAttribute('data-empty-target'));
    var params = new URLSearchParams(window.location.search);
    var queryInput = form.querySelector('[name="q"]');

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }

    function applyFilter() {
      var data = new FormData(form);
      var query = String(data.get('q') || '').trim().toLowerCase();
      var region = String(data.get('region') || '').trim();
      var type = String(data.get('type') || '').trim();
      var year = String(data.get('year') || '').trim();
      var visible = 0;

      items.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-type') || '',
          item.getAttribute('data-year') || '',
          item.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();

        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (region && item.getAttribute('data-region') !== region) {
          ok = false;
        }

        if (type && item.getAttribute('data-type') !== type) {
          ok = false;
        }

        if (year && item.getAttribute('data-year') !== year) {
          ok = false;
        }

        item.style.display = ok ? '' : 'none';

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    form.querySelectorAll('input, select').forEach(function (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });

    applyFilter();
  });
})();
