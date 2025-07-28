// === BLOCK FORBIDDEN FETCHES ===
;(function(){
  const nativeFetch = window.fetch
  const blocked = [
    '/songs/songs/info.json',
    '/songs/undefined'
  ]

  window.fetch = function(resource, init) {
    const url = typeof resource === 'string'
      ? resource
      : resource.url

    // reject any request whose URL endsWith one of our blocked patterns
    for (const pat of blocked) {
      if (url.endsWith(pat)) {
        return Promise.reject(
          new Error(`Blocked by client policy: ${pat}`)
        )
      }
    }
    return nativeFetch.apply(this, arguments)
  }
})()
// ================================


let currentsong = new Audio();
let songs;
let currfolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://localhost:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songList = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songList.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Update global songs array and UI
    songs = songList;

    // Populate the song list in the UI
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";
    for (const song of songList) {
        songul.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt=""> 
                <div class="info">
                    <div>${String(song).replaceAll("%20", " ")}</div>
                    <div>Shubh</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="plays.svg" alt="">
                </div>
            </li>
        `;
    }

    // Add click listeners to each song
    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            const track = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playmusic(track);
        });
    });

    return songList;
}


const playmusic = (track, pause = false) => {

    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}
async function displayAlbums() {
    let as = await fetch(`http://localhost:5500/songs`)
    let res = await as.text();

    let div = document.createElement("div")
    div.innerHTML = res;
    let anchors = div.getElementsByTagName("a")
     let cardContainer = document.querySelector(".cardContainer")
   let array =  Array.from(anchors).forEach(async e=>{
   //for (let index = 0; index < array.length; index++) {
   //onst e = array[index];
    
   
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];
            //Get the meta data 
            
            let a = await fetch(`http://localhost:5500/songs/${folder}/info.json`)
            let response = await a.json();
            
            console.log(response)
            
           
cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card"  data-folder="${folder}" >
                        <div class="play ">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="44px" height="40px"
                                color="#008000" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#000000" stroke-width="1.5"></circle>
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="#000000"></path>
                            </svg>

                        </div>

                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }
    })
    
 //load the playlist whenever card is displayed
const cards = document.getElementsByClassName("card");

for (const card of cards) {
  card.addEventListener("click", async event => {
    console.log(event.currentTarget.dataset);
    songs =await getSongs(`songs/${event.currentTarget.dataset.folder}`);


  });
}
}
    



async function main() {
   // In main(), replace the for-loop with:
document.querySelector('.cardContainer').addEventListener('click', async (event) => {
    const card = event.target.closest('.card');
    if (card) {
        const newSongs = await getSongs(`songs/${card.dataset.folder}`);
        if (newSongs.length > 0) {
            playmusic(newSongs[0]); // Automatically play first song
        }
    }
});


    //display all the albums
    displayAlbums()


    //attach an event listener to play , next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        } else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
    //listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";


    })
    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100

    })
    //add evenlistener in hamburger icon
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add eventlistener for close icon
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";

    })

    //add event listener to previous
    previous.addEventListener("click", () => {
        console.log("click")
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })



    //next eventlistener
    next.addEventListener("click", () => {
        console.log("clicked")
        currentsong.pause()

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })
    //add change event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value)
        currentsong.volume = parseInt(e.target.value) / 100
    })

   
//add event listener to volume 
document.querySelector(".volume>img").addEventListener("click" , e=>{
    console.log(e.target)
    if(e.target.src.includes("volume.svg")){
       e.target.src = e.target.src.replace ("volume.svg" , "mute.svg") 
       currentsong.volume = 0 
       document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else{
       e.target.src = e.target.src.replace ("mute.svg" , "volume.svg") 
        currentsong.volume = .10
         document.querySelector(".range").getElementsByTagName("input")[0].value = 10
    }
})
}
main()
