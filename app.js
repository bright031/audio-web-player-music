document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playButton = document.querySelector('.play i');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const shuffleButton = document.querySelector('.shuffle');
    const showPlaylistButton = document.querySelector('.show-playlist');
    const progressBar = document.getElementById('progress');
    const musicPlayer = document.querySelector('.music-player');
    const suggestions = document.querySelector('.music-suggestions');
    const refreshButton = document.querySelector('.refresh');

    const playerCover = document.getElementById('album-cover');
    const playerTitle = document.getElementById('song-name');
    const playerArtist = document.getElementById('artist-name');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');

    let currentSongIndex = 0;
    let currentPlaylist = [];
    let currentPlayingItem = null;
    let currentSource = "";

    // Hàm tải bài hát
    async function loadSong(song) {
        audioPlayer.src = song.src;
        playerCover.src = song.cover;
        playerTitle.textContent = song.name;
        playerArtist.textContent = song.artist;
        audioPlayer.load();
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
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
    }

    progressBar.addEventListener('input', () => {
        const newTime = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = newTime;
    });

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        loadSong(currentPlaylist[currentSongIndex]).then(() => {
            audioPlayer.play();
            playButton.classList.replace('fa-play', 'fa-pause');
        });
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        loadSong(currentPlaylist[currentSongIndex]).then(() => {
            audioPlayer.play();
            playButton.classList.replace('fa-play', 'fa-pause');
        });
    }

    function shuffleSong() {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * currentPlaylist.length);
        } while (randomIndex === currentSongIndex);

        currentSongIndex = randomIndex;
        loadSong(currentPlaylist[currentSongIndex]).then(() => {
            audioPlayer.play();
            playButton.classList.replace('fa-play', 'fa-pause');
        });
    }

    document.querySelectorAll('.album-item').forEach(item => {
        item.addEventListener('click', () => {
            const albumName = item.querySelector('h3').textContent;
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
            loadSong(currentPlaylist[currentSongIndex]).then(() => {
                musicPlayer.classList.add('visible');
                suggestions.style.display = 'none';
                setTimeout(() => {
                    audioPlayer.play();
                    playButton.classList.replace('fa-play', 'fa-pause');
                }, 500);
            });
        });
    });

    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            const playlistName = item.querySelector('h3').textContent;
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
            loadSong(currentPlaylist[currentSongIndex]).then(() => {
                musicPlayer.classList.add('visible');
                suggestions.style.display = 'none';
                setTimeout(() => {
                    audioPlayer.play();
                    playButton.classList.replace('fa-play', 'fa-pause');
                }, 500);
            });
        });
    });

    function showSongList() {
        let playlistSongs = document.querySelector('.playlist-songs');
        if (!playlistSongs) {
            playlistSongs = document.createElement('ul');
            playlistSongs.classList.add('playlist-songs');
            document.body.appendChild(playlistSongs);
        }
        playlistSongs.innerHTML = '';
        currentPlaylist.forEach((song, index) => {
            const songItem = document.createElement('li');
            songItem.textContent = `${song.name} - ${song.artist}`;
            songItem.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentPlaylist[currentSongIndex]).then(() => {
                    audioPlayer.play();
                    playButton.classList.replace('fa-play', 'fa-pause');
                });
            });
            playlistSongs.appendChild(songItem);
        });
        playlistSongs.style.display = playlistSongs.style.display === 'none' ? 'block' : 'none';
    }

    function loadSongs() {
        const grid = document.getElementById('suggestions-grid');
        grid.innerHTML = '';
        let shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
        shuffledSongs.forEach(song => {
            const songItem = document.createElement('div');
            songItem.classList.add('song-item');
            songItem.setAttribute('data-src', song.src);
            songItem.innerHTML = `
                <img src="${song.cover}" alt="${song.name}">
                <div class="song-info">
                    <p class="song-title">${song.name}</p>
                    <p class="artist">${song.artist}</p>
                </div>
                <div class="play-icon">
                    <i class="fa-solid fa-play"></i>
                </div>
            `;
            songItem.addEventListener('click', () => playAudio(song));
            songItem.querySelector('.play-icon').addEventListener('click', (event) => {
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
        currentSongIndex = currentPlaylist.findIndex(s => s.src === song.src);
        if (currentSongIndex === -1) {
            // Nếu bài hát không có trong playlist hiện tại, thêm vào và phát
            currentPlaylist.push(song);
            currentSongIndex = currentPlaylist.length - 1;
        }
        loadSong(currentPlaylist[currentSongIndex]).then(() => {
            audioPlayer.play();
            playButton.classList.replace('fa-play', 'fa-pause');
            musicPlayer.classList.add('visible');
            if (currentPlayingItem) {
                currentPlayingItem.classList.remove('playing');
            }
            currentPlayingItem = document.querySelector(`.song-item[data-src="${song.src}"]`);
            if (currentPlayingItem) {
                currentPlayingItem.classList.add('playing');
            }
        });
    }

    audioPlayer.addEventListener('ended', nextSong);
    audioPlayer.addEventListener('timeupdate', () => {
        updateProgress();
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    });

    playButton.addEventListener('click', playPause);
    nextButton.addEventListener('click', nextSong);
    prevButton.addEventListener('click', prevSong);
    shuffleButton.addEventListener('click', shuffleSong);
    showPlaylistButton.addEventListener('click', showSongList);
    refreshButton.addEventListener('click', loadSongs);

    const logo = document.querySelector('.logo img');
    logo.addEventListener('click', () => {
        location.reload();
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    loadSongs();

    // Expose các hàm ra global scope để chatbot gọi
    window.playAudio = playAudio;
    window.playPause = playPause;
    window.nextSong = nextSong;
    window.shuffleSong = shuffleSong;
});


