// Elements
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const contentSection = document.getElementById("content-section");
const artistsSortBtn = document.getElementById("artists-sort-button");
const artistsReverse = document.getElementById("artists-reversed");
const contextMenu = document.getElementById("context-menu");


// Configuration variables
let CLIENT_ID;
let REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPE = "user-library-modify, user-library-read, user-read-currently-playing, user-read-playback-state";

let library = new Library();
let api = new ApiInterface(null, library);
library.api = api;
let filter = new Filter(library);

// Fetch environment variables from the server
fetch("/env")
  .then((response) => response.json())
  .then((data) => {
    CLIENT_ID = data.SPOTIFY_CLIENT_ID;
    REDIRECT_URI = data.SPOTIFY_REDIRECT_URI;
  })
  .catch((error) =>
    console.error("Error fetching environment variables:", error)
  );

// Check for token in URL or local storage
let token = localStorage.getItem("token");
const hash = window.location.hash;

if (!token && hash) {
  const hashParams = new URLSearchParams(hash.substring(1));
  token = hashParams.get("access_token");
  window.location.hash = "";
  localStorage.setItem("token", token);
}

if (token) {
  api.token = token;
  showContent();
} else {
  showLogin();
}

// Event listeners
loginButton.addEventListener("click", () => {
  window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("token");
  token = null;
  api.token = token;
  showLogin();
});

artistsSortBtn.addEventListener("click", () => {
  var options = ["Name", "Albums", "Tracks"]
  var index = Math.max(0, options.indexOf(artistsSortBtn.innerText));
  artistsSortBtn.innerHTML = options[(index + 1) % options.length];
  renderArtists()
})

artistsReverse.addEventListener('click', () => {
  renderArtists()
})

document.addEventListener('click', () => {
  contextMenu.style.display = 'none';
})

// Functions
function showLogin() {
  loginButton.disabled = false;
  logoutButton.disabled = true;
  contentSection.style.display = "none";
}

async function showContent() {
  loginButton.disabled = true;
  logoutButton.disabled = false;
  contentSection.style.display = "flex";

  await api.fetchFromSpotify();

  renderAlbums();
  renderArtists();
  renderTracks();
}

function renderArtists() {
  let artists = filter.getSortedArtists(artistsSortBtn.innerText, artistsReverse.checked);
  let selected = library.selectedArtistIds;

  let artistsList = document.getElementById("artists-list");
  artistsList.innerHTML = ""; // Clear the existing content
  
  artists.forEach((artist) => {
    const artistDiv = document.createElement("div");
    artistDiv.className = "artist";
    artistDiv.setAttribute("key", artist.id);

    if (selected.includes(artist.id)) {
      artistDiv.classList.add("selected");
    }

    artistDiv.addEventListener("click", (e) => {
      library.handleArtistClick(artist.id, e.ctrlKey);

      if (!e.ctrlKey) {
        document.querySelectorAll('.artist.selected').forEach(el => {
          el.classList.remove('selected');
        });
      }

      artistDiv.classList.toggle("selected", library.selectedArtistIds.includes(artist.id));
      renderAlbums();
      renderTracks();
    });

    const artistNameP = document.createElement("p");
    artistNameP.className = "artist-name";
    artistNameP.innerHTML = `<b>${artist.name}</b>`;
    artistDiv.appendChild(artistNameP);

    // Add artist info
    const artistInfoDiv = document.createElement("div");
    artistInfoDiv.className = "artist-info";


    const artistStatsDiv = document.createElement("div");
    artistStatsDiv.className = "artist-stats";

    const albumsCountP = document.createElement("p");
    albumsCountP.textContent = `${artist.albums.length} Albums`;
    artistStatsDiv.appendChild(albumsCountP);

    const tracksCountP = document.createElement("p");
    tracksCountP.textContent = `${artist.tracks.length} Tracks`;
    artistStatsDiv.appendChild(tracksCountP);

    artistInfoDiv.appendChild(artistStatsDiv);
    artistDiv.appendChild(artistInfoDiv);

    artistsList.appendChild(artistDiv);
  });
}

function renderAlbums() {
  console.log("Rendering albums")
  let albums = filter.getSortedAlbums();

  let albumsList = document.getElementById("albums-list");
  albumsList.innerHTML = "";

  //appends each album div to the list
  albums.forEach(album => {

    //Album div has 3 columns: image, data, buttons
    const albumDiv = document.createElement("div");
    albumDiv.className = "album";
    albumDiv.setAttribute("key", album.id);

    albumDiv.addEventListener("click", (e) => {
      library.handleAlbumClick(album.id, e.ctrlKey);

      // Remove selected class from all elements if Ctrl is not pressed
      if (!e.ctrlKey) {
        document.querySelectorAll('.album.selected').forEach(el => {
          el.classList.remove('selected');
        });
      }

      // Toggle the selected class on the clicked element
      albumDiv.classList.toggle("selected", library.selectedAlbumIds.includes(album.id));
      renderTracks()
    });

    //album image column
    const img = document.createElement("img");
    img.src = album.imageUrl;
    img.alt = album.name;
    
    //info column 
    const albumInfoDiv = document.createElement("div");
    albumInfoDiv.className = "album-info";
    
    //album name
    const albumNameP = document.createElement("p");
    albumNameP.className = "album-name";
    albumNameP.innerHTML = `<b>${album.name}</b>`;
    albumInfoDiv.appendChild(albumNameP);
    
    //artist name
    const artistNameP = document.createElement("p");
    artistNameP.className = "album-name";
    artistNameP.textContent = album.artist.name;
    albumInfoDiv.appendChild(artistNameP);
    
    //saved vs total tracks
    const savedTrackNumberP = document.createElement("p");
    savedTrackNumberP.className="album-name";
    savedTrackNumberP.innerHTML = `${album.savedTracks.length}/${album.totalTracks} Tracks`;
    albumInfoDiv.appendChild(savedTrackNumberP);
    
    //button column
    const albumButtonDiv = document.createElement("div");
    albumButtonDiv.className = "album-buttons";
    
    //save album button (if added from track)
    if(!album.saved){
      const albumSaveButton = document.createElement("button");
      albumSaveButton.innerHTML = "Save album"
      albumSaveButton.addEventListener("click", async (e) => {
        await album.save();
        renderAlbums();
      })
      albumButtonDiv.appendChild(albumSaveButton);
    }
    
    //saved or all tracks button 
    if(album.totalTracks != album.savedTracks.length){
      const albumSelectedOnlyButton = document.createElement("button");
      albumSelectedOnlyButton.innerHTML = "Saved Tracks";

      if (album.showAllTracks) {
        albumSelectedOnlyButton.innerHTML = "All Tracks";
      }
      albumSelectedOnlyButton.addEventListener("click", async (e) => {
        album.showAllTracks = !album.showAllTracks;
        if (album.showAllTracks) {
          albumSelectedOnlyButton.innerHTML = " All Tracks ";
        } else {
          albumSelectedOnlyButton.innerHTML = "Saved Tracks";
        }
        e.stopPropagation();
        await album.getTracks();
        renderTracks();
      });
      albumButtonDiv.appendChild(albumSelectedOnlyButton);
    }
    
    //Col 1
    albumDiv.appendChild(img);
    
    //col 2
    albumDiv.appendChild(albumInfoDiv);

    //col 3
    albumDiv.appendChild(albumButtonDiv);
    
    //album item
    albumsList.appendChild(albumDiv);



  });
}

async function renderTracks() {
  tracks = await filter.getSortedTracks();
  let tracksList = document.getElementById("tracks-list");
  tracksList.innerHTML = "";
  
  //appends each track div to the list
  tracks.forEach((track) => {
  //3 columns
    const trackDiv = document.createElement("div");
    trackDiv.className = "track";
    trackDiv.setAttribute("key", track.id);

    //left click listener
    trackDiv.addEventListener('click', (e) => {
      library.handleTrackClick(track, e.ctrlKey);

      // Remove selected class from all elements if Ctrl is not pressed
      if (!e.ctrlKey) {
        document.querySelectorAll('.track.selected').forEach(el => {
          el.classList.remove('selected');
        });
      }

      // Toggle the selected class on the clicked element
      trackDiv.classList.toggle("selected", library.selectedTrackIds.includes(track.id));
      // renderTracks()

    })

    //right click listener
    trackDiv.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showTrackContextMenu(e, track);
    })

    //col1
    const img = document.createElement("img");
    img.src = track.album.imageUrl;
    img.alt = track.album.name;

    trackDiv.appendChild(img);

    //col2
    const trackInfoDiv = document.createElement("div");
    trackInfoDiv.className = "track-info";

    const trackNameP = document.createElement("p");
    trackNameP.className = "track-name";
    trackNameP.innerHTML = `<b>${track.name}</b>`;
    trackInfoDiv.appendChild(trackNameP);

    const albumNameP = document.createElement("p");
    albumNameP.className = "track-name";
    albumNameP.innerHTML = track.album.name;
    trackInfoDiv.appendChild(albumNameP);

    const artistNameP = document.createElement("p");
    artistNameP.className = "track-name";
    artistNameP.textContent = track.artist.name;
    trackInfoDiv.appendChild(artistNameP);

    trackDiv.appendChild(trackInfoDiv);

    //col3
    const trackButtonDiv = document.createElement("div");
    trackButtonDiv.className = "track-buttons";

    if(!track.saved){
      const saveTrackButton = document.createElement("button");
      saveTrackButton.innerHTML = "Save";
      saveTrackButton.addEventListener('click', async (e) => {
        await track.save();
        trackButtonDiv.removeChild(saveTrackButton);  
        renderAlbums();
      })
      trackButtonDiv.appendChild(saveTrackButton);
    } 
    trackDiv.appendChild(trackButtonDiv);

    //context menu


    tracksList.appendChild(trackDiv);
  });
}

function showTrackContextMenu(e, track){
  let menuList = contextMenu.querySelector('ul');
  while (menuList.firstChild) {
    menuList.removeChild(menuList.firstChild);
  }

  const li_queue = document.createElement('li');
  li_queue.textContent = "Add to queue";
  li_queue.addEventListener('click', async (e) => {
    await track.queue();
  })
  menuList.appendChild(li_queue);


  if(track.saved){
    const li_unsave = document.createElement('li');
    li_unsave.textContent = "Unsave track";
    menuList.appendChild(li_unsave);  
  } else {
    const li_save = document.createElement('li');
    li_save.textContent = "Save track";
    menuList.appendChild(li_save);  
  }

  // Position and display the menu
  contextMenu.style.display = 'block';
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.style.left = `${e.clientX}px`;
}
