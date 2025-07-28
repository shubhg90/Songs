let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songList = [];
    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songList.push(element.href.split(`${folder}/`)[1]);
        }
    }

    songs = songList;

    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";
    for (const song of songList) {
        songul.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt=""> 
                <div class="info">
                    <div>${decodeURIComponent(song)}</div>
                    <div>Shubh</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="plays.svg" alt="">
                </div>
            </li>`;
    }

    document.querySelectorAll(".songlist li").forEach(e => {
        e.addEventListener("click", () => {
            const track = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playmusic(track);
        });
    });

    return songList;
}

const playmusic = (track, pause = false) => {
    currentsong.src = `${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        document.getElementById("play").src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let as = await fetch(`songs`);
    let res = await as.text();

    let div = document.createElement("div");
    div.innerHTML = res;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let e of anchors) {
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];
            try {
                let a = await fetch(`songs/${folder}/info.json`);
                let response = await a.json();

                cardContainer.innerHTML += `
                    <div class="card" data-folder="${folder}">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="44px" height="40px" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#000" stroke-width="1.5"></circle>
                                <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="#000"></path>
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
            } catch (err) {
                console.warn(`Could not fetch info.json for ${folder}`);
            }
        }
    }
}

async function main() {
    document.querySelector('.cardContainer').addEventListener('click', async (event) => {
        const card = event.target.closest('.card');
        if (card) {
            const newSongs = await getSongs(`songs/${card.dataset.folder}`);
            if (newSongs.length > 0) {
                playmusic(newSongs[0]);
            }
        }
    });

    displayAlbums();

    const play = document.getElementById("play");
    const next = document.getElementById("next");
    const previous = document.getElementById("previous");

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
