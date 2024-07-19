

class Library {
  constructor() {
    this.artists = new Map();
    this.selectedArtistIds = [];
    this.albums = new Map();
    this.selectedAlbumIds = [];
    this.tracks = new Map();
    this.selectedTrackIds = [];
    this.api = null;

  }

  addAlbum(json, saved=false) {
    var album = new Album(json, this, saved);
    this.albums.set(album.id, album);

    var artistId = json.artists[0].id;
    if (!this.artists.has(artistId)) {
      this.artists.set(artistId, new Artist(json.artists[0]));
    }
    var artist = this.artists.get(artistId);

    album.artist = artist;
    artist.addAlbum(album);
  }

  addTrack(json, saved=false) {
    if(!this.tracks.has(json.id)) {
      let track = new Track(json, this, saved);
      
      this.tracks.set(track.id, track);
      
      let artistId = json.artists[0].id;
      var artist = this.artists.get(artistId);
      if (!this.artists.has(artistId)) {
        artist = new Artist(json.artists[0]);
        this.artists.set(artistId, artist);
      }
      track.artist = artist;
      artist.addTrack(track);
      
      let albumId = json.album.id;
      var album = this.albums.get(albumId);
      if (!this.albums.has(albumId)) {
        album = new Album(json.album, this);
        album.artist = artist;
        this.albums.set(albumId, album);
        artist.addAlbum(album);
      }
      album.addTrack(track, saved);
      track.album = album;
    } 
  }

  getAlbumsBy() {
    var artists = this.getArtistsBy();
    var tempAlbums = [];
    artists.forEach((artist) => {
      var albums = artist.albums;
      albums.forEach((album) => {
        tempAlbums.push(album);
      })
    })

    //if any artists are selected, filter by their albums
    if (this.selectedArtistIds.length > 0) {
      tempAlbums = tempAlbums.filter((album) =>
        this.selectedArtistIds.includes(album.artist.id)
      );
    }

    return tempAlbums;
  }

  getArtistsBy() {
    var tempArtists = Array.from(this.artists, (item) => item[1]);
    return tempArtists;
  }

  async getTracksBy() {
    var albums = this.getAlbumsBy();
    var tempTracks = []
    await albums.forEach(async album=>{
      var tracks = await album.getTracks();
      tracks.forEach(track=>{
        tempTracks.push(track);
      })
    })

    //filter selected artists
    if (this.selectedArtistIds.length > 0) {
      tempTracks = tempTracks.filter((track) =>
        this.selectedArtistIds.includes(track.artist.id)
      );
    }

    //filter selected albums 
    if (this.selectedAlbumIds.length > 0) {
      tempTracks = tempTracks.filter((track) =>
        this.selectedAlbumIds.includes(track.album.id)
      );
    }

    return tempTracks;
  }

  handleArtistClick(artistId, ctrl) {
    //if artist already selected, remove it
    if (this.selectedArtistIds.includes(artistId)) {
      let index = this.selectedArtistIds.indexOf(artistId);      
      this.selectedArtistIds.splice(index, 1);
      let artist = this.artists.get(artistId);
      
      //if any of removed artist's albums are selected, unselect those
      artist.albums.forEach((album) => {
        if(this.selectedAlbumIds.includes(album.id)){
          let albumInd = this.selectedAlbumIds.indexOf(album.id);
          this.selectedAlbumIds.splice(albumInd, 1);
        }
      })
    } 
    //if artist not already selected
    else {
      //if ctrl not pressed, clear selected artists and albums
      if (!ctrl) {
        this.selectedArtistIds = [];
        this.selectedAlbumIds = [];
      }
      //add artist to selected
      this.selectedArtistIds.push(artistId);
    }
  }

  handleAlbumClick(albumId, ctrl) {
    console.log("handling click: " + this.albums.get(albumId).name)
    //if album selected, remove it
    if (this.selectedAlbumIds.includes(albumId)) {
      let index = this.selectedAlbumIds.indexOf(albumId);
      this.selectedAlbumIds.splice(index, 1);
    } 
    //if not selected, 
    else {
      //if ctrl not pressed, clear selected albums
      if (!ctrl) {
        this.selectedAlbumIds = [];
      }
      this.selectedAlbumIds.push(albumId);
    }
  }

  handleTrackClick(track, ctrl) {
    console.log("handling click: " + track.name)
    //if track selected, remove it
    if (this.selectedTrackIds.includes(track.id)) {
      let index = this.selectedTrackIds.indexOf(track.id);
      this.selectedTrackIds.splice(index, 1);
    } 
    //if not selected, 
    else {
      //if ctrl not pressed, clear selected tracks
      if (!ctrl) {
        this.selectedTrackIds = [];
      }
      this.selectedTrackIds.push(track.id);
    }
  }

  async pullAlbumTracksFromSpotify(album) {
    let tracks = await this.api.fetchAlbumFromSpotify(album.id);
    tracks.forEach((track) => {
      let id = track.id;
      if (!album.hasTrack(id)) {
        let newTrack = new Track(track, this);
        album.addTrack(newTrack);
      }
    });
  }

  async saveAlbum(album){
    console.log("Saving album: " + album.name);
    album.saved = true;
    await this.api.saveAlbum(album.id);
  }

  async saveTrack(track){
    console.log("Saving track: " + track.name);
    track.saved = true;
    await this.api.saveTrack(track.id);
  }

  //todo
  async queueAlbum(album){

  }

  async queueTrack(track){
    this.api.queueTrack(track.id);
  }

}

class Album {
  constructor(json, library, saved=false) {
    this.library = library
    this.artist = null;
    this.savedTracks = [];
    this.allTracks = [];

    this.name = json.name;
    this.id = json.id;
    this.imageUrl = json.images[0].url;
    this.totalTracks = json.total_tracks;
    this.showAllTracks = false;
    this.saved = saved;
    
  }

  addTrack(track, saved=false){
    
    track.artist = this.artist;
    track.album = this;
    track.saved = saved;
    
    if(!this.hasTrack(track.id)){
      this.allTracks.push(track);
      this.allTracks.sort((a, b) => a.trackNumber - b.trackNumber);
    }
    
    if(saved && !this.savedTracks.includes(track)){
      this.savedTracks.push(track);
      this.savedTracks.sort((a, b) => a.trackNumber - b.trackNumber);
      this.artist.addTrack(track);  
    }
  }

  async getTracks(){
    //return only saved tracks?
    if(!this.showAllTracks){
      return this.savedTracks;  
    }

    //pulls tracks if not all are saved
    if (this.allTracks.length != this.totalTracks) {
      console.log("pulling tracks for album: " + this.name);
      await this.library.pullAlbumTracksFromSpotify(this);
    }

    //return all tracks
    return this.allTracks;
  }

  async save(){
    await this.library.saveAlbum(this);
  }
  
  hasTrack(id){
    return this.allTracks.some((track) => track.id === id);
  }
  
}

class Artist {
  constructor(json) {
    this.name = json.name;
    this.id = json.id;
    this.albums = [];
    this.tracks = [];
  }

  addAlbum(album) {
    if(this.has(album.id)) return;
    
    this.albums.push(album);
  }

  addTrack(track) {
    if(this.has(track.id)) return;

    this.tracks.push(track);
  }

  has(id) {
    return this.tracks.some(track => track.id === id) || this.albums.some(album => album.id === id);
  }
}

class Track {
  constructor(json, library, saved=false) {
    this.album = null;
    this.artist = null;
    this.id = json.id;
    this.name = json.name;
    this.trackNumber = json.track_number;
    this.saved = saved;
    this.library = library;
  }

  async save(){
    await this.library.saveTrack(this);
    this.album.addTrack(this, true);
  }

  async queue(){
    console.log("Queueing track: " + this.name);
    await this.library.queueTrack(this);
  }
}
