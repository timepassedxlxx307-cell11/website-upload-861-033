
(function () {
  window.initializeMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-video');
    var button = document.getElementById('movie-play');
    var box = document.querySelector('[data-player-box]');
    var hlsInstance = null;
    var loaded = false;

    if (!video || !button || !streamUrl) {
      return;
    }

    function markPlaying() {
      if (box) {
        box.classList.add('is-playing');
      }
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal || !hlsInstance) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      loadStream();
      markPlaying();

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (box) {
            box.classList.remove('is-playing');
          }
        });
      }
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('play', markPlaying);

    video.addEventListener('pause', function () {
      if (box && video.currentTime === 0) {
        box.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
