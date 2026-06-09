
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupImageFallbacks();
  });

  function setupMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      toggle.textContent = expanded ? '☰' : '×';
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (slides.length <= 1) {
      return;
    }

    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function setActive(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === active);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setActive(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setActive(index);
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setActive(active - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(active + 1);
        restartTimer();
      });
    }

    restartTimer();
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img[data-fallback-image]'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame');
        if (frame) {
          frame.classList.add('image-missing');
        }
      }, { once: true });
    });
  }
})();
