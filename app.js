class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentTrack = 0;
        this.isPlaying = false;
        this.userTracks = JSON.parse(localStorage.getItem('userTracks')) || [];
        this.init();
    }

    async init() {
        // 🔥 LOAD REAL INTERNET MUSIC (20 FREE tracks instantly!)
        await this.loadRealMusic();
        this.bindEvents();
    }

    // 🔥 NEW: Real Internet Music (NO API key needed!)
    async loadRealMusic() {
        console.log('🎵 Loading 20 FREE internet tracks...');
        
        const tracks = [];
        for(let i = 1; i <= 20; i++) {
            tracks.push({
                title: `Song ${i}`,
                artist: `SoundHelix Artist ${i}`,
                duration: `${Math.floor(Math.random()*4+2)}:${Math.floor(Math.random()*60).toString().padStart(2,'0')}`,
                src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i}.mp3`
            });
        }
        
        this.playlist = tracks;
        console.log(`✅ Loaded ${this.playlist.length} REAL internet tracks!`);
        this.render();
    }

    bindEvents() {
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.render();
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.render();
        });

        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
            if (e.code === 'ArrowRight') this.nextTrack();
            if (e.code === 'ArrowLeft') this.prevTrack();
        });
    }

    playTrack(index) {
        this.currentTrack = index;
        const track = [...this.playlist, ...this.userTracks][index];
        this.audio.src = track.src;
        this.audio.play();
        this.render();
        this.saveCurrentTrack();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    }

    nextTrack() {
        const totalTracks = this.playlist.length + this.userTracks.length;
        this.currentTrack = (this.currentTrack + 1) % totalTracks;
        this.playTrack(this.currentTrack);
    }

    prevTrack() {
        const totalTracks = this.playlist.length + this.userTracks.length;
        this.currentTrack = (this.currentTrack - 1 + totalTracks) % totalTracks;
        this.playTrack(this.currentTrack);
    }

    async handleFileUpload(file) {
        const track = {
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'User Upload',
            duration: '00:00',
            src: URL.createObjectURL(file),
            file: file
        };

        this.userTracks.unshift(track);
        localStorage.setItem('userTracks', JSON.stringify(this.userTracks));
        this.render();
    }

    saveCurrentTrack() {
        localStorage.setItem('currentTrack', this.currentTrack);
    }

    render() {
        const allTracks = [...this.playlist, ...this.userTracks];
        const currentTrack = allTracks[this.currentTrack];

        document.getElementById('app').innerHTML = `
            <div class="header">
                <h1>🎵 Music Station</h1>
                <p>20 FREE Internet Tracks + Your Uploads</p>
            </div>

            <div class="player-container">
                <div class="audio-controls">
                    <button class="control-btn" onclick="player.prevTrack()" title="Previous (←)">⏮</button>
                    <button class="control-btn" onclick="player.togglePlay()" id="playBtn" title="Play/Pause (Space)">
                        ${this.isPlaying ? '⏸' : '▶'}
                    </button>
                    <button class="control-btn" onclick="player.nextTrack()" title="Next (→)">⏭</button>
                </div>
                
                <audio id="audio-player" controls></audio>
                
                <div id="current-track">
                    ${currentTrack ? `${currentTrack.title} - ${currentTrack.artist}` : 'Select a track to start'}
                </div>
                
                <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.7;">
                    Total: ${allTracks.length} tracks | Internet: ${this.playlist.length} | Yours: ${this.userTracks.length}
                </div>
            </div>

            <div class="playlist">
                ${allTracks.map((track, index) => `
                    <div class="track-item ${index === this.currentTrack ? 'active' : ''}" 
                         onclick="player.playTrack(${index})" 
                         title="Click to play • ${track.src.includes('soundhelix') ? '🌐 Internet' : '💾 Local'}">
                        <div class="track-title">
                            ${track.src.includes('soundhelix') ? '🌐' : '💾'} ${track.title}
                        </div>
                        <div class="track-duration">${track.artist} • ${track.duration}</div>
                    </div>
                `).join('')}
            </div>

            <div class="upload-section">
                <h3 style="margin-bottom: 0.5rem;">📁 Add Your Own Music</h3>
                <p style="margin-bottom: 1rem; opacity: 0.8;">Drag MP3 files here (stored in browser)</p>
                <input type="file" id="fileInput" multiple accept="audio/*" style="display:none">
                <button class="upload-btn" onclick="document.getElementById('fileInput').click()">
                    📂 Choose Files
                </button>
            </div>
        `;

        // File upload handler
        document.getElementById('fileInput').addEventListener('change', (e) => {
            Array.from(e.target.files).forEach(file => {
                if (file.type.startsWith('audio/')) {
                    this.handleFileUpload(file);
                }
            });
        });

        // Drag & drop
        document.querySelector('.upload-section').addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.style.background = 'rgba(78, 205, 196, 0.2)';
        });

        document.querySelector('.upload-section').addEventListener('dragleave', (e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        });

        document.querySelector('.upload-section').addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            Array.from(e.dataTransfer.files).forEach(file => {
                if (file.type.startsWith('audio/')) {
                    this.handleFileUpload(file);
                }
            });
        });

        document.getElementById('audio-player').src = this.audio.src;
    }
}

// 🔥 START THE PLAYER
const player = new MusicPlayer();