
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var opened = mobileMenu.classList.toggle("is-open");
        menuButton.classList.toggle("is-open", opened);
        menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    if (searchInput && cards.length) {
      var runFilter = function () {
        var keyword = searchInput.value.trim().toLowerCase();
        var category = categoryFilter ? categoryFilter.value : "";
        var region = regionFilter ? regionFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";
        var visible = false;

        cards.forEach(function (card) {
          var content = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          var matched = true;

          if (keyword && content.indexOf(keyword) === -1) {
            matched = false;
          }
          if (category && card.getAttribute("data-category") !== category) {
            matched = false;
          }
          if (region && card.getAttribute("data-region") !== region) {
            matched = false;
          }
          if (type && card.getAttribute("data-type") !== type) {
            matched = false;
          }

          card.classList.toggle("card-hidden", !matched);
          if (matched) {
            visible = true;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("hidden", visible);
        }
      };

      searchInput.addEventListener("input", runFilter);
      [categoryFilter, regionFilter, typeFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("change", runFilter);
        }
      });
    }
  });
})();
