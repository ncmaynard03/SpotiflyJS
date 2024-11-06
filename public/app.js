import Library from './library.js';

const contentSection = document.getElementById("content-section");
const artistsSortBtn = document.getElementById("artists-sort-button");
const artistsReverse = document.getElementById("artists-reversed");
const contextMenu = document.getElementById("context-menu");

document.addEventListener('DOMContentLoaded', async () => {
	console.log("Home.html DOM Loaded")

	function getQueryParam(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

	// Store the access token in localStorage
	const accessToken = getQueryParam('token');

	if (accessToken) {
		localStorage.setItem('spotifyAccessToken', accessToken);
	}

	// Now you can use the access token for API requests
	console.log('Access token stored:', localStorage.getItem('spotifyAccessToken'));

	const library = new Library(accessToken);
  
	const artistList = document.getElementById('artists-list')
	const albumList = document.getElementById('albums-list')
	const trackList = document.getElementById(`tracks-list`)
  
	fastPullDisplay();

	async function fastPullDisplay() {
    console.log("fastPullDisplay()");
		var allTracksPulled = false;
		var allAlbumsPulled = false;
		var count = 0;

		while (!allTracksPulled || !allAlbumsPulled) {
			if (!allTracksPulled) {
				// count = await library.pullTracks(3);
				if (count == 0) { allTracksPulled = true }
			}
			if (!allAlbumsPulled) {
				// count = await library.pullAlbums(1);
				if (count == 0) { allAlbumsPulled = true }
			}
			display();
		}
	}

	function display() {
    console.log("display()");
    displayArtists();
		displayAlbums();
		displayTracks();
	}

	function displayArtists() {
		let artists = library.getArtists()
		artistList.innerHTML = ""
		artists.forEach(artist => {

			const artistDiv = document.createElement("div");
			artistDiv.className = "artist";
			artistDiv.setAttribute("key", artist.id);

			var selected = library.selectedArtistIds;

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
				displayAlbums();
				displayTracks();
			});

			const artistNameP = document.createElement("p");
			artistNameP.className = "artist-name";
			artistNameP.innerHTML = `<b>${artist.name}</b>`

			artistDiv.appendChild(artistNameP)

			artistList.appendChild(artistDiv);
		}
		)

	}

	function displayAlbums() {
		let albums = library.getAlbums()
		albumList.innerHTML = ""
		albums.forEach(album => {

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
				displayTracks()
			});

			const img = document.createElement("img")
			img.src = album.imageUrl;
			img.alt = album.name
			albumDiv.appendChild(img)

			const albumInfoDiv = document.createElement("div");

			const albumNameP = document.createElement("p");
			albumNameP.className = "album-name";
			albumNameP.innerHTML = `<b>${album.name}</b>`

			albumInfoDiv.appendChild(albumNameP);

			const artistNameP = document.createElement("p");
			artistNameP.className = "artist-name";
			artistNameP.innerHTML = album.artist.name;
			albumInfoDiv.appendChild(artistNameP);

			albumDiv.appendChild(albumInfoDiv)

			albumList.appendChild(albumDiv);
		}
		)

	}

	function displayTracks() {
		let tracks = library.getTracks();
		trackList.innerHTML = ""
		tracks.forEach(track => {

			const trackDiv = document.createElement("div");
			trackDiv.className = "track";
			trackDiv.setAttribute("key", track.id);

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

			const img = document.createElement("img")
			img.src = track.album.imageUrl;
			img.alt = track.album.name
			trackDiv.appendChild(img)

			const albumInfoDiv = document.createElement("div");

			const trackNameP = document.createElement("p");
			trackNameP.innerHTML = `<b>${track.name}</b>`
			albumInfoDiv.appendChild(trackNameP);

			const albumNameP = document.createElement("p");
			albumNameP.innerHTML = track.album.name;
			albumInfoDiv.appendChild(albumNameP);

			const artistNameP = document.createElement("p");
			artistNameP.innerHTML = `${track.artist}`;
			albumInfoDiv.appendChild(artistNameP);

			trackDiv.appendChild(albumInfoDiv)

			trackList.appendChild(trackDiv);
		})
	}
});


// Check for token in URL or local storage
let token = localStorage.getItem("token");
const hash = window.location.hash;

if (token) {
  api.token = token;
  showContent();
} else if (hash) {
  const hashParams = new URLSearchParams(hash.substring(1));
  token = hashParams.get("access_token");
  window.location.hash = "";
  localStorage.setItem("token", token);
}


artistsSortBtn.addEventListener("click", () => {
  var options = ["Name", "Albums", "Tracks"];
  var index = Math.max(0, options.indexOf(artistsSortBtn.innerText));
  artistsSortBtn.innerHTML = options[(index + 1) % options.length];
  renderArtists();
})

artistsReverse.addEventListener('click', () => {
  renderArtists();
})

document.addEventListener('click', () => {
  contextMenu.style.display = 'none';
})
