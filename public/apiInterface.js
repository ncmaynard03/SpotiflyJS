export default class ApiInterface {
  
  constructor(token) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  async fetchAlbums(){
    let pages = 0;
    let maxPages = 2;
    let fetchUrl = "https://api.spotify.com/v1/me/albums";

    let albums = [];
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
        fetchUrl = next;

        albums.push(...items);
        
        if(pages++ < maxPages && maxPages > 0) {
          break;
        };

      } catch (error) {
        console.error("Failed to fetch albums:", error);
        break;
      }
    }
    console.log(`Pulled ${pages} album pages from Spotify`);
    return albums;
  }

  async fetchTracks(){
    pages = 0;
    maxPages = 2;
    let fetchUrl = "https://api.spotify.com/v1/me/tracks";

    let tracks = [];
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
        fetchUrl = next;

        tracks.push(...items);
        
        if(pages++ < maxPages && maxPages > 0) {
          break;
        };

      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        break;
      }
    }
    console.log(`Pulled ${pages} track pages from Spotify`);
    return tracks;
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
