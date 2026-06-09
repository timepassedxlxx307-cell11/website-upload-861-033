(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var dotsBox = hero.querySelector('[data-hero-dots]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('hero-slide--active', slideIndex === current);
      });
      if (dotsBox) {
        Array.prototype.slice.call(dotsBox.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5000);
    }

    if (dotsBox) {
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张');
        dot.addEventListener('click', function () {
          setSlide(index);
          startTimer();
        });
        dotsBox.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }

    setSlide(0);
    startTimer();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]')).forEach(function (panel) {
    var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-card]'));
    var searchInput = panel.querySelector('[data-filter-search]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var count = panel.querySelector('[data-filter-count]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function refresh() {
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var text = normalize(card.textContent);
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1 && title.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部作品';
      }
    }

    [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', refresh);
        control.addEventListener('change', refresh);
      }
    });

    refresh();
  });

  Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing-image');
    });
  });
})();
