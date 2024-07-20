class ApiInterface {
  constructor(token, library) {
    this.token = token;
    this.library = library;
    library.pullAlbumFunction = this.fetchAlbumFromSpotify.bind(this);
    this.albumJson = [];
    this.trackJson = [];
  }

  getToken() {
    return this.token;
  }

  async fetchFromSpotify() {
    var albumFetchLimit = -1; //number of calls made for albums and tracks
    var trackFetchLimit = -3; //number of calls made for albums and tracks
    // Clear existing album and track data
    this.albumJson = [];
    this.trackJson = [];

    // Fetch albums from Spotify
    let fetchUrl = "https://api.spotify.com/v1/me/albums";

    while (fetchUrl) {
      try {
        const response = await axios.get(fetchUrl, {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
          },
          params: {
            limit: 50,
          },
        });

        const { items, next } = response.data;
        items.forEach((item) => {
          this.library.addAlbum(item.album, true);
        });

        fetchUrl = next;

        //limits albums for testing/dev
        if (albumFetchLimit > -1) {
          if (albumFetchLimit == 0) {
            fetchUrl = null;
          }
          albumFetchLimit -= 1;
        }
      } catch (error) {
        console.error("Failed to fetch albums:", error);
        break;
      }
    }
    console.log("Pulled albums from Spotify");

    // Fetch tracks from Spotify
    fetchUrl = "https://api.spotify.com/v1/me/tracks";
    while (fetchUrl) {
      try {
        const response = await axios.get(fetchUrl, {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
          },
          params: {
            limit: 50,
          },
        });

        const { items, next } = response.data;
        items.forEach((item) => {
          this.library.addTrack(item.track, true);
        });

        fetchUrl = next;

        //limits albums for testing/dev
        if (trackFetchLimit > -1) {
          if (trackFetchLimit == 0) {
            fetchUrl = null;
          }
          trackFetchLimit -= 1;
        }
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        break;
      }
    }
    console.log("Pulled tracks from Spotify");
  }

  async fetchAlbumFromSpotify(albumId) {
    console.log("fetching album: " + albumId);

    let albumTracks = [];

    // Fetch albums from Spotify
    let fetchUrl = "https://api.spotify.com/v1/albums/" + albumId;

    while (fetchUrl) {
      try {
        const response = await axios.get(fetchUrl, {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,  
          },
          params: {
            limit: 50,
          },
        });

        const { tracks, next } = response.data;
        tracks.items.forEach((item) => {
          albumTracks.push(item);
        });

        fetchUrl = next;
      } catch (error) {
        console.error("Failed to fetch albums:", error);
        break;
      }
    }
    console.log("Pulled albums from Spotify");

    return albumTracks;
  }

  async saveAlbum(albumId) {
    const url = "https://api.spotify.com/v1/me/albums";
    try {
      const response = await axios.put(
        url,
        {
          ids: [albumId], // Array of album IDs to save
        },
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`, // Ensure you have a valid access token
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Album saved successfully", response.data);
    } catch (error) {
      console.error("Failed to save album:", error);
    }
  }

  async saveTrack(trackId) {
    const url = "https://api.spotify.com/v1/me/tracks";
    try {
      const response = await axios.put(
        url,
        {
          ids: [trackId], // Array of album IDs to save
        },
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`, // Ensure you have a valid access token
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Album saved successfully", response.data);
    } catch (error) {
      console.error("Failed to save album:", error);
    }
  }

  async queueTrack(trackId) {
    let fetchUrl = "https://api.spotify.com/v1/me/player/queue";

    try {
      const response = await axios.get(fetchUrl, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });


      response.data.queue.forEach((item) => {
        console.log(item.name);
      })

    } catch (error) {
      console.error("Failed to fetch albums:", error);
    }
  }
}
