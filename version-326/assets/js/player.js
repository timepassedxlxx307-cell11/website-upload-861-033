(function () {
  function attachPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-button]');
    var source = shell.getAttribute('data-m3u8');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !source) {
      return;
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function initialize() {
      if (initialized) {
        hideButton();
        playVideo();
        return;
      }
      initialized = true;
      hideButton();

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              video.src = source;
              playVideo();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else {
        video.src = source;
        playVideo();
      }
    }

    if (button) {
      button.addEventListener('click', initialize);
    }

    video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        initialize();
      } else {
        video.pause();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
})();
