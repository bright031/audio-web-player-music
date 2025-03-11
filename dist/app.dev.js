"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

document.addEventListener('DOMContentLoaded', function () {
  var audioPlayer = document.getElementById('audio-player');
  var playButton = document.querySelector('.play i');
  var prevButton = document.querySelector('.prev');
  var nextButton = document.querySelector('.next');
  var shuffleButton = document.querySelector('.shuffle');
  var showPlaylistButton = document.querySelector('.show-playlist');
  var progressBar = document.getElementById('progress');
  var musicPlayer = document.querySelector('.music-player');
  var suggestions = document.querySelector('.music-suggestions');
  var refreshButton = document.querySelector('.refresh');
  var playerCover = document.getElementById('album-cover');
  var playerTitle = document.getElementById('song-name');
  var playerArtist = document.getElementById('artist-name');
  var currentTimeDisplay = document.getElementById('current-time');
  var totalTimeDisplay = document.getElementById('total-time');
  var currentSongIndex = 0;
  var currentPlaylist = [];
  var currentPlayingItem = null;
  var currentSource = ""; // Hàm tải bài hát

  function loadSong(song) {
    return regeneratorRuntime.async(function loadSong$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            audioPlayer.src = song.src;
            playerCover.src = song.cover;
            playerTitle.textContent = song.name;
            playerArtist.textContent = song.artist;
            audioPlayer.load();

          case 5:
          case "end":
            return _context.stop();
        }
      }
    });
  }

  function playPause() {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playButton.classList.replace('fa-play', 'fa-pause');
    } else {
      audioPlayer.pause();
      playButton.classList.replace('fa-pause', 'fa-play');
    }
  }

  function updateProgress() {
    var progress = audioPlayer.currentTime / audioPlayer.duration * 100;
    progressBar.value = progress;
  }

  progressBar.addEventListener('input', function () {
    var newTime = progressBar.value / 100 * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
  });

  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    loadSong(currentPlaylist[currentSongIndex]).then(function () {
      audioPlayer.play();
      playButton.classList.replace('fa-play', 'fa-pause');
    });
  }

  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    loadSong(currentPlaylist[currentSongIndex]).then(function () {
      audioPlayer.play();
      playButton.classList.replace('fa-play', 'fa-pause');
    });
  }

  function shuffleSong() {
    var randomIndex;

    do {
      randomIndex = Math.floor(Math.random() * currentPlaylist.length);
    } while (randomIndex === currentSongIndex);

    currentSongIndex = randomIndex;
    loadSong(currentPlaylist[currentSongIndex]).then(function () {
      audioPlayer.play();
      playButton.classList.replace('fa-play', 'fa-pause');
    });
  }

  document.querySelectorAll('.album-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var albumName = item.querySelector('h3').textContent;

      if (currentSource === "album" && currentPlaylist === albums[albumName]) {
        musicPlayer.classList.remove('visible');
        audioPlayer.pause();
        playButton.classList.replace('fa-pause', 'fa-play');
        suggestions.style.display = 'block';
        return;
      }

      currentSource = "album";
      currentPlaylist = albums[albumName];
      currentSongIndex = 0;
      loadSong(currentPlaylist[currentSongIndex]).then(function () {
        musicPlayer.classList.add('visible');
        suggestions.style.display = 'none';
        setTimeout(function () {
          audioPlayer.play();
          playButton.classList.replace('fa-play', 'fa-pause');
        }, 500);
      });
    });
  });
  document.querySelectorAll('.playlist-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var playlistName = item.querySelector('h3').textContent;

      if (currentSource === "playlist" && currentPlaylist === playlists[playlistName]) {
        musicPlayer.classList.remove('visible');
        audioPlayer.pause();
        playButton.classList.replace('fa-pause', 'fa-play');
        suggestions.style.display = 'block';
        return;
      }

      currentSource = "playlist";
      currentPlaylist = playlists[playlistName];
      currentSongIndex = 0;
      loadSong(currentPlaylist[currentSongIndex]).then(function () {
        musicPlayer.classList.add('visible');
        suggestions.style.display = 'none';
        setTimeout(function () {
          audioPlayer.play();
          playButton.classList.replace('fa-play', 'fa-pause');
        }, 500);
      });
    });
  });

  function showSongList() {
    var playlistSongs = document.querySelector('.playlist-songs');

    if (!playlistSongs) {
      playlistSongs = document.createElement('ul');
      playlistSongs.classList.add('playlist-songs');
      document.body.appendChild(playlistSongs);
    }

    playlistSongs.innerHTML = '';
    currentPlaylist.forEach(function (song, index) {
      var songItem = document.createElement('li');
      songItem.textContent = "".concat(song.name, " - ").concat(song.artist);
      songItem.addEventListener('click', function () {
        currentSongIndex = index;
        loadSong(currentPlaylist[currentSongIndex]).then(function () {
          audioPlayer.play();
          playButton.classList.replace('fa-play', 'fa-pause');
        });
      });
      playlistSongs.appendChild(songItem);
    });
    playlistSongs.style.display = playlistSongs.style.display === 'none' ? 'block' : 'none';
  }

  function loadSongs() {
    var grid = document.getElementById('suggestions-grid');
    grid.innerHTML = '';

    var shuffledSongs = _toConsumableArray(songs).sort(function () {
      return Math.random() - 0.5;
    });

    shuffledSongs.forEach(function (song) {
      var songItem = document.createElement('div');
      songItem.classList.add('song-item');
      songItem.setAttribute('data-src', song.src);
      songItem.innerHTML = "\n                <img src=\"".concat(song.cover, "\" alt=\"").concat(song.name, "\">\n                <div class=\"song-info\">\n                    <p class=\"song-title\">").concat(song.name, "</p>\n                    <p class=\"artist\">").concat(song.artist, "</p>\n                </div>\n                <div class=\"play-icon\">\n                    <i class=\"fa-solid fa-play\"></i>\n                </div>\n            ");
      songItem.addEventListener('click', function () {
        return playAudio(song);
      });
      songItem.querySelector('.play-icon').addEventListener('click', function (event) {
        event.stopPropagation();
        playAudio(song);
      });
      grid.appendChild(songItem);
    });
  }

  function playAudio(song) {
    if (currentSource !== "songs") {
      currentSource = "songs";
      currentPlaylist = songs;
    }

    currentSongIndex = currentPlaylist.findIndex(function (s) {
      return s.src === song.src;
    });

    if (currentSongIndex === -1) {
      // Nếu bài hát không có trong playlist hiện tại, thêm vào và phát
      currentPlaylist.push(song);
      currentSongIndex = currentPlaylist.length - 1;
    }

    loadSong(currentPlaylist[currentSongIndex]).then(function () {
      audioPlayer.play();
      playButton.classList.replace('fa-play', 'fa-pause');
      musicPlayer.classList.add('visible');

      if (currentPlayingItem) {
        currentPlayingItem.classList.remove('playing');
      }

      currentPlayingItem = document.querySelector(".song-item[data-src=\"".concat(song.src, "\"]"));

      if (currentPlayingItem) {
        currentPlayingItem.classList.add('playing');
      }
    });
  }

  audioPlayer.addEventListener('ended', nextSong);
  audioPlayer.addEventListener('timeupdate', function () {
    updateProgress();
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
  });
  audioPlayer.addEventListener('loadedmetadata', function () {
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
  });
  playButton.addEventListener('click', playPause);
  nextButton.addEventListener('click', nextSong);
  prevButton.addEventListener('click', prevSong);
  shuffleButton.addEventListener('click', shuffleSong);
  showPlaylistButton.addEventListener('click', showSongList);
  refreshButton.addEventListener('click', loadSongs);
  var logo = document.querySelector('.logo img');
  logo.addEventListener('click', function () {
    location.reload();
  });

  function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return "".concat(minutes, ":").concat(secs < 10 ? '0' : '').concat(secs);
  }

  loadSongs(); // Expose các hàm ra global scope để chatbot gọi

  window.playAudio = playAudio;
  window.playPause = playPause;
  window.nextSong = nextSong;
  window.shuffleSong = shuffleSong;
});
//# sourceMappingURL=app.dev.js.map
