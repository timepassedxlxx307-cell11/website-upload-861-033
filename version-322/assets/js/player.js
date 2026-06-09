(function () {
  function playVideo(video) {
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var shell = button ? button.closest('.player-shell') : null;
    var started = false;
    var hlsInstance = null;

    function start() {
      if (!video || started) {
        if (video) {
          playVideo(video);
        }
        return;
      }

      started = true;

      if (shell) {
        shell.classList.add('is-playing');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.url;
        playVideo(video);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(config.url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
        return;
      }

      video.src = config.url;
      playVideo(video);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        start();
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
