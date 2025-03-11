"use strict";

if (lowerMessage.includes('bật') || lowerMessage.includes('phát')) {
  var songMatch = allSongs.find(function (song) {
    return lowerMessage.includes(song.name.toLowerCase()) || lowerMessage.includes(song.artist.toLowerCase());
  });

  if (!songMatch) {
    Object.keys(playlists).forEach(function (playlist) {
      if (lowerMessage.includes(playlist.toLowerCase())) {
        songMatch = playlists[playlist][0]; // Lấy bài đầu tiên trong playlist
      }
    });
    Object.keys(albums).forEach(function (album) {
      if (lowerMessage.includes(album.toLowerCase())) {
        songMatch = albums[album][0]; // Lấy bài đầu tiên trong album
      }
    });
  }

  if (songMatch && songMatch.src) {
    window.playAudio(songMatch);
    messageElement.textContent = "\u0110ang b\u1EADt b\xE0i \"".concat(songMatch.name, "\" c\u1EE7a ").concat(songMatch.artist, " \u0111\xE2y!");
  } else {
    messageElement.textContent = "Tớ không bật được bài này, sorry nha!";
  }
}
//# sourceMappingURL=chatbot.dev.js.map
