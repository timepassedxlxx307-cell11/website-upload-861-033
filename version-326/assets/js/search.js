(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function renderCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-card>' +
        '<a class="movie-card__poster" href="' + escapeHtml(item.url) + '" aria-label="观看 ' + escapeHtml(item.title) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="movie-card__score">' + escapeHtml(item.rating) + '</span>' +
          '<span class="movie-card__play">▶</span>' +
        '</a>' +
        '<div class="movie-card__body">' +
          '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p class="movie-card__meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
          '<p class="movie-card__line">' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="movie-card__tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function runSearch(query) {
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');
    var data = window.MOVIE_SEARCH_DATA || [];
    var keyword = normalize(query);
    var matched = data;

    if (keyword) {
      matched = data.filter(function (item) {
        return normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.category,
          item.genre,
          item.tags && item.tags.join(' '),
          item.oneLine
        ].join(' ')).indexOf(keyword) !== -1;
      });
    }

    if (count) {
      count.textContent = keyword ? '关键词“' + query + '”找到 ' + matched.length + ' 部作品' : '显示全部 ' + matched.length + ' 部作品';
    }

    if (results) {
      results.innerHTML = matched.slice(0, 500).map(renderCard).join('');
      if (matched.length > 500) {
        results.insertAdjacentHTML('beforeend', '<p class="search-page__count">结果较多，已展示前 500 部，请输入更精确关键词。</p>');
      }
    }
  }

  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var query = getQuery();

  if (input) {
    input.value = query;
  }

  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextQuery = input.value.trim();
      var nextUrl = nextQuery ? 'search.html?q=' + encodeURIComponent(nextQuery) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      runSearch(nextQuery);
    });
  }

  runSearch(query);
})();
