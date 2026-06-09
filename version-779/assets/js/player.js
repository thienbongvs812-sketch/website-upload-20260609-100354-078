import { H as Hls } from './hls-vendor.js';

var video = document.querySelector('[data-player-video]');
var button = document.querySelector('[data-player-button]');
var hlsInstance = null;

function hideButton() {
  if (button) {
    button.classList.add('is-hidden');
  }
}

function showButton() {
  if (button) {
    button.classList.remove('is-hidden');
  }
}

function attachStream() {
  if (!video || video.dataset.ready === 'true') {
    return;
  }

  var stream = video.dataset.stream;
  if (!stream) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
    video.dataset.ready = 'true';
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({ enableWorker: true });
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function () {
      hlsInstance.loadSource(stream);
    });
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(showButton);
    });
    video.dataset.ready = 'true';
    return;
  }

  video.src = stream;
  video.dataset.ready = 'true';
}

function startPlayback() {
  if (!video) {
    return;
  }
  hideButton();
  attachStream();
  video.play().catch(function () {
    if (video.readyState < 2) {
      video.addEventListener('canplay', function onCanPlay() {
        video.removeEventListener('canplay', onCanPlay);
        video.play().catch(showButton);
      });
    } else {
      showButton();
    }
  });
}

if (button) {
  button.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', function () {
    if (video.dataset.ready !== 'true') {
      startPlayback();
    }
  });
  video.addEventListener('playing', hideButton);
  video.addEventListener('error', showButton);
}

window.addEventListener('beforeunload', function () {
  if (hlsInstance) {
    hlsInstance.destroy();
  }
});
