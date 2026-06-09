import { H as Hls } from "./hls-vendor-dru42stk.js";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMobileMenu() {
    const button = qs(".mobile-menu-button");
    const menu = qs(".mobile-nav");
    if (!button || !menu) return;
    button.addEventListener("click", () => {
        const isOpen = menu.hasAttribute("hidden") === false;
        if (isOpen) {
            menu.setAttribute("hidden", "");
            button.setAttribute("aria-expanded", "false");
        } else {
            menu.removeAttribute("hidden");
            button.setAttribute("aria-expanded", "true");
        }
    });
}

function setupCarousel() {
    qsa("[data-carousel]").forEach((carousel) => {
        const slides = qsa("[data-slide]", carousel);
        const dots = qsa("[data-slide-dot]", carousel);
        const prev = qs("[data-slide-prev]", carousel);
        const next = qs("[data-slide-next]", carousel);
        if (!slides.length) return;
        let active = 0;
        let timer = null;

        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
            dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
        };

        const schedule = () => {
            if (timer) window.clearInterval(timer);
            timer = window.setInterval(() => show(active + 1), 5200);
        };

        prev?.addEventListener("click", () => {
            show(active - 1);
            schedule();
        });
        next?.addEventListener("click", () => {
            show(active + 1);
            schedule();
        });
        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                show(Number(dot.dataset.slideDot || 0));
                schedule();
            });
        });
        carousel.addEventListener("mouseenter", () => timer && window.clearInterval(timer));
        carousel.addEventListener("mouseleave", schedule);
        show(0);
        schedule();
    });
}

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function setupSearchAndFilters() {
    const inputs = qsa("[data-live-search]");
    const items = qsa("[data-search-item]");
    if (!items.length) return;

    const url = new URL(window.location.href);
    const initialQuery = url.searchParams.get("q") || "";
    qsa("[data-auto-query]").forEach((input) => {
        input.value = initialQuery;
    });

    let activeFilter = "all";

    const apply = () => {
        const query = normalizeText(inputs.map((input) => input.value).find(Boolean) || "");
        items.forEach((item) => {
            const keywords = normalizeText(`${item.dataset.title || ""} ${item.dataset.keywords || ""}`);
            const typeText = normalizeText(`${item.dataset.type || ""} ${item.dataset.genre || ""} ${item.dataset.keywords || ""}`);
            const queryMatch = !query || keywords.includes(query);
            const filterMatch = activeFilter === "all" || typeText.includes(normalizeText(activeFilter));
            item.classList.toggle("is-hidden", !(queryMatch && filterMatch));
        });
    };

    inputs.forEach((input) => input.addEventListener("input", apply));
    qsa("[data-filter-value]").forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filterValue || "all";
            qsa("[data-filter-value]").forEach((item) => item.classList.toggle("is-active", item === button));
            apply();
        });
    });
    qsa("[data-clear-search]").forEach((button) => {
        button.addEventListener("click", () => {
            inputs.forEach((input) => {
                input.value = "";
            });
            apply();
        });
    });
    apply();
}

function setupPlayers() {
    qsa("[data-player]").forEach((shell) => {
        const video = qs("video[data-stream]", shell);
        const button = qs("[data-player-toggle]", shell);
        if (!video) return;
        const stream = video.dataset.stream;
        let hls = null;

        if (stream) {
            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            }
        }

        const play = async () => {
            try {
                await video.play();
                shell.classList.add("is-playing");
            } catch (error) {
                shell.classList.remove("is-playing");
            }
        };

        button?.addEventListener("click", play);
        video.addEventListener("click", () => {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", () => shell.classList.add("is-playing"));
        video.addEventListener("pause", () => shell.classList.remove("is-playing"));
        video.addEventListener("ended", () => shell.classList.remove("is-playing"));
        window.addEventListener("pagehide", () => {
            if (hls) hls.destroy();
        });
    });
}

setupMobileMenu();
setupCarousel();
setupSearchAndFilters();
setupPlayers();
