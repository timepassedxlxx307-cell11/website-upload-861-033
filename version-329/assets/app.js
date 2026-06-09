(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
        applySearchQuery();
    });

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var root = form.closest("main") || document;
            var list = root.querySelector("[data-filter-list]");
            if (!list) {
                list = document.querySelector("[data-filter-list]");
            }
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.children);
            var input = form.querySelector("[data-filter-input]");
            var category = form.querySelector("[data-category-filter]");
            var year = form.querySelector("[data-year-filter]");
            var empty = root.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var categoryValue = category ? category.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var content = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matchKeyword = !keyword || content.indexOf(keyword) !== -1;
                    var matchCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
                    var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    var shouldShow = matchKeyword && matchCategory && matchYear;
                    card.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function applySearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (!query) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".video-box"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector(".video-start");
            var source = box.getAttribute("data-video-src");
            var hlsInstance = null;
            if (!video || !button || !source) {
                return;
            }

            function load() {
                if (box.getAttribute("data-loaded") === "true") {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                video.controls = true;
                box.setAttribute("data-loaded", "true");
            }

            function play() {
                load();
                box.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        box.classList.remove("is-playing");
                    });
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (box.getAttribute("data-loaded") !== "true") {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
