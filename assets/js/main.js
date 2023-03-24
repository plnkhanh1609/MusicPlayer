const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const USER_STORAGE_KEY = 'f8-player'

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const btnRandom = $(".btn-random");
const btnLoop = $(".btn-repeat");
const togglePlay = $(".btn-toggle-play");
const player = $(".player");
const playlist = $(".playlist");
let progress = $(".progress");
const app = {
    currentIndex: 0,
    prevCd: 0,
    isPlay: false,
    isRandom: false,
    isRepeat: false,
    config:JSON.parse(localStorage.getItem(USER_STORAGE_KEY))|| {},
    setConfig(key,value){
        this.config[key] = value
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: "Free With You",
            singer: "Rnla & yaeow",
            img: "./assets/imgs/free-with-you.jpg",
            path: "./assets/songs/free-with-you.mp3",
        },
        {
            name: "Be Alright",
            singer: "Dean Lewis",
            img: "./assets/imgs/be-alright.jpg",
            path: "./assets/songs/be-alright.mp3",
        },
        {
            name: "Golden Hour",
            singer: "JVKE",
            img: "./assets/imgs/golden-hour.jpg",
            path: "./assets/songs/golden-hour.mp3",
        },
        {
            name: "Imagination",
            singer: "Shawn Mendes",
            img: "./assets/imgs/imagination.jpg",
            path: "./assets/songs/imagination.mp3",
        },
    ],
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function () {
        const _this = app;
        const cdWitdh = cd.offsetWidth;
        //Xử lý CD quay
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 15000,
                iterations: Infinity,
            }
        );
        cdThumbAnimate.pause();
        document.onscroll = function () {
            const scollTop =
                document.documentElement.scrollTop || window.scrollY;

            const newcdWidth = cdWitdh - scollTop;
            cd.style.width = newcdWidth > 0 ? newcdWidth + "px" : 0;
            // cd.style.opacity = newcdWidth/cdWitdh;
        };
        //Btn play
        togglePlay.onclick = function () {
            _this.isPlay ? audio.pause() : audio.play();
        };
        audio.onplay = function () {
            cdThumbAnimate.play();
            _this.cdPlay();
        };
        audio.onpause = function () {
            cdThumbAnimate.pause();
            _this.cdPause();
        };

        //Progress
        audio.ontimeupdate = function () {
            const lengthAudio = audio.duration;
            let currenTime = audio.currentTime;
            if (lengthAudio) {
                const progressPercent = (currenTime / lengthAudio) * 100;
                progress.value = progressPercent;
            } else progress.value = 0;
        };
        progress.oninput = function (e) {
            const value = e.target.value;
            audio.currentTime = (value * audio.duration) / 100;
        };

        //click song
        playlist.onclick = (e) => {
            const songClick = e.target.closest(".song:not(.active)");
            if (songClick &&  !e.target.closest(".option")) {
                _this.currentIndex = Number(songClick.dataset.id);
                $(`[data-id="${this.prevCd}"]`).classList.remove("active");
                _this.loadCurentSong();
                _this.cdPlay();
            }
        };
        
        //Check song end ?
        audio.onended = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else if (_this.isRepeat) {
                audio.play();
            } else {
                _this.nextSong();
            }
            audio.play();
        };
        //nextSong
        $(".btn-next").onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
        };
        //preSong
        $(".btn-prev").onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
        };

        //randomSong
        btnRandom.onclick = function () {
            _this.isRandom = !_this.isRandom;
            btnRandom.classList.toggle("active",_this.isRandom);
            if (btnLoop.classList.contains("active")) {
                btnLoop.classList.remove("active");
                _this.isRepeat = false;
                _this.setConfig('isRepeat',_this.isRepeat);
                
            }
            _this.setConfig('isRandom',_this.isRandom);
        };
        //loopSong
        btnLoop.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            btnLoop.classList.toggle("active",_this.isRepeat);
            if (btnRandom.classList.contains("active")) {
                btnRandom.classList.remove("active");
                _this.isRandom = false;
                _this.setConfig('isRandom', _this.isRandom);
            }
            _this.setConfig('isRepeat',_this.isRepeat);

        };
    },
    render: function () {
        const htmls = this.songs.map(
            (item, index) =>
                `<div class="song" data-id="${index}"">
        <div
            class="thumb"
            style="
                background-image: url('${item.img}');
            "
        ></div>
        <div class="body">
            <h3 class="title">${item.name}</h3>
            <p class="author">${item.singer}</p>
        </div>
        <div class="option">
            <i class="fas fa-ellipsis-h"></i>
        </div>
    </div>`
        );
        $(".playlist").innerHTML = htmls.join("");
    },
    loadConfig(){
        this.isRepeat = this.config.isRepeat;
        this.isRandom = this.config.isRandom;
        if(this.isRepeat){
            btnLoop.classList.add('active')
        }
        if(this.isRandom){
            btnRandom.classList.add('active')
        }
    },
    loadCurentSong() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.img})`;
        audio.src = this.currentSong.path;
        const songActive = $(`[data-id="${this.currentIndex}"]`);
        songActive.classList.add("active");
        this.scrollToActiveSong(songActive);
        this.prevCd = this.currentIndex;
    },

    scrollToActiveSong(activeSong) {
        setTimeout(function () {
            activeSong.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 500);
    },
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        $(`[data-id="${this.prevCd}"]`).classList.remove("active");
        this.loadCurentSong();
    },
    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        $(`[data-id="${this.prevCd}"]`).classList.remove("active");
        this.loadCurentSong();
    },
    randomSong() {
        let rdNum = Math.floor(Math.random() * this.songs.length);
        rdNum == this.currentIndex
            ? this.randomSong()
            : (this.currentIndex = rdNum);
        $(`[data-id="${this.prevCd}"]`).classList.remove("active");
        this.loadCurentSong();
    },
    cdPlay() {
        this.isPlay = true;
        player.classList.add("playing");
        audio.play();
    },
    cdPause() {
        this.isPlay = false;
        player.classList.remove("playing");
        audio.pause();
    },
    start() {
        
        this.loadConfig()
        //Định nghĩa các thuộc tính
        this.defineProperties();
        //Lắng nghe / xử lý các sự kiện (DOM events)
        // Render playlist
        this.render();
        this.loadCurentSong();
        this.handleEvents();
    },
};

app.start();
