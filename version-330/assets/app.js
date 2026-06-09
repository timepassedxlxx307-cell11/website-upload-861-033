(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var filterScope = document.querySelector("[data-filter-scope]");
    if (filterScope) {
      var filters = Array.prototype.slice.call(filterScope.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(filterScope.querySelectorAll(".movie-card"));
      filters.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-filter");
          filters.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            var kind = card.getAttribute("data-kind") || "";
            card.style.display = value === "all" || kind === value ? "" : "none";
          });
        });
      });
    }

    var searchInput = document.querySelector("[data-search-input]");
    var searchResults = document.querySelector("[data-search-results]");
    if (searchInput && searchResults) {
      var searchCards = Array.prototype.slice.call(searchResults.querySelectorAll(".movie-card"));
      var runSearch = function () {
        var terms = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        searchCards.forEach(function (card) {
          var blob = (card.getAttribute("data-search") || "").toLowerCase();
          var visible = terms.length === 0 || terms.every(function (term) {
            return blob.indexOf(term) !== -1;
          });
          card.style.display = visible ? "" : "none";
        });
      };
      searchInput.addEventListener("input", runSearch);
    }
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.querySelector("[data-player-video]");
  var start = document.querySelector("[data-player-start]");
  if (!video || !sourceUrl) {
    return;
  }

  var isReady = false;
  var hlsInstance = null;

  function attachSource() {
    if (isReady) {
      return;
    }
    isReady = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function playVideo() {
    attachSource();
    if (start) {
      start.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  if (start) {
    start.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (start) {
      start.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance && hlsInstance.destroy) {
      hlsInstance.destroy();
    }
  });
}
