
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var data = window.MOVIE_SEARCH_DATA || [];
    var keywordInput = document.getElementById('searchKeyword');
    var categoryInput = document.getElementById('searchCategory');
    var yearInput = document.getElementById('searchYear');
    var typeInput = document.getElementById('searchType');
    var runButton = document.getElementById('runSearch');
    var resetButton = document.getElementById('resetSearch');
    var summary = document.getElementById('searchSummary');
    var results = document.getElementById('searchResults');

    if (!keywordInput || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    keywordInput.value = params.get('q') || '';

    function includesText(value, needle) {
      return String(value || '').toLowerCase().indexOf(needle) !== -1;
    }

    function renderCard(movie) {
      var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <div class="poster-frame" data-title="' + escapeHtml(movie.title) + '">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback-image>',
        '      <div class="play-mask"><span>▶</span></div>',
        '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine || movie.category) + '</p>',
        '      <div class="tag-row">' + tags + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function runSearch() {
      var keyword = keywordInput.value.trim().toLowerCase();
      var category = categoryInput.value;
      var year = yearInput.value;
      var type = typeInput.value;

      var matches = data.filter(function (movie) {
        var textMatch = !keyword ||
          includesText(movie.title, keyword) ||
          includesText(movie.region, keyword) ||
          includesText(movie.type, keyword) ||
          includesText(movie.category, keyword) ||
          includesText(movie.year, keyword) ||
          includesText(movie.oneLine, keyword) ||
          (movie.tags || []).some(function (tag) { return includesText(tag, keyword); });

        var categoryMatch = !category || movie.category === category || (movie.tags || []).indexOf(category) !== -1;
        var yearMatch = !year || movie.year === year;
        var typeMatch = !type || movie.type === type || (type === '电影' && movie.type.indexOf('电影') !== -1);

        return textMatch && categoryMatch && yearMatch && typeMatch;
      });

      matches.sort(function (a, b) {
        if (Number(b.rating) !== Number(a.rating)) {
          return Number(b.rating) - Number(a.rating);
        }
        return Number(b.year || 0) - Number(a.year || 0);
      });

      var limit = 160;
      var visible = matches.slice(0, limit);
      results.innerHTML = visible.map(renderCard).join('');
      setupNewFallbacks();
      summary.textContent = '共找到 ' + matches.length + ' 部作品' + (matches.length > limit ? '，当前显示前 ' + limit + ' 部。' : '。');
    }

    function resetSearch() {
      keywordInput.value = '';
      categoryInput.value = '';
      yearInput.value = '';
      typeInput.value = '';
      results.innerHTML = '';
      summary.textContent = '请输入关键词或选择条件。';
      history.replaceState(null, '', window.location.pathname);
    }

    function setupNewFallbacks() {
      Array.prototype.slice.call(results.querySelectorAll('img[data-fallback-image]')).forEach(function (image) {
        image.addEventListener('error', function () {
          var frame = image.closest('.poster-frame');
          if (frame) {
            frame.classList.add('image-missing');
          }
        }, { once: true });
      });
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];
      });
    }

    runButton.addEventListener('click', runSearch);
    resetButton.addEventListener('click', resetSearch);
    [keywordInput, categoryInput, yearInput, typeInput].forEach(function (control) {
      control.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          runSearch();
        }
      });
      control.addEventListener('change', runSearch);
    });

    if (keywordInput.value) {
      runSearch();
    }
  });
})();
