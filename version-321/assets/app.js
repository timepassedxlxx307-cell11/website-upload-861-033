(function () {
    function toArray(list) {
        return Array.prototype.slice.call(list || []);
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = toArray(slider.querySelectorAll('.hero-slide'));
        var dots = toArray(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5600);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                activate(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                activate(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                activate(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupSearchForms() {
        toArray(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                if (!value) {
                    event.preventDefault();
                    return;
                }
                form.action = './search.html';
            });
        });
    }

    function setupFilters() {
        var cards = toArray(document.querySelectorAll('.movie-card[data-title]'));
        if (!cards.length) {
            return;
        }
        var queryInput = document.querySelector('[data-filter-query]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var noResult = document.querySelector('[data-no-result]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (queryInput && initial) {
            queryInput.value = initial;
        }
        function matches(card) {
            var q = normalize(queryInput && queryInput.value);
            var t = normalize(typeSelect && typeSelect.value);
            var r = normalize(regionSelect && regionSelect.value);
            var y = normalize(yearSelect && yearSelect.value);
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            if (q && text.indexOf(q) === -1) {
                return false;
            }
            if (t && normalize(card.getAttribute('data-type')) !== t) {
                return false;
            }
            if (r && normalize(card.getAttribute('data-region')).indexOf(r) === -1) {
                return false;
            }
            if (y && normalize(card.getAttribute('data-year')) !== y) {
                return false;
            }
            return true;
        }
        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.classList.toggle('hidden-card', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (noResult) {
                noResult.classList.toggle('show', visible === 0);
            }
        }
        [queryInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    window.setupMoviePlayer = function (streamUrl) {
        var video = document.querySelector('.video-player');
        var button = document.querySelector('.player-start');
        var status = document.querySelector('.player-status');
        if (!video || !streamUrl) {
            return;
        }
        var started = false;
        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }
        function begin() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            setStatus('正在加载影片…');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放失败，请稍后重试');
                    }
                });
            } else {
                setStatus('当前环境暂时无法播放此视频');
                started = false;
                return;
            }
            if (button) {
                button.classList.add('hidden');
            }
            video.play().then(function () {
                setStatus('');
            }).catch(function () {
                setStatus('点击播放按钮开始观看');
            });
        }
        if (button) {
            button.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener('playing', function () {
            setStatus('');
        });
        video.addEventListener('error', function () {
            setStatus('播放失败，请稍后重试');
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
})();
