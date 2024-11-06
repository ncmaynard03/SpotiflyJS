import ApiInterface from './apiInterface.js';
import DbManager from './dbManager.js';

export default class Library {
  constructor(token) {
    this.api = new ApiInterface(token);
    this.dbm = new DbManager();
    this.pullAlbums();
   
  }

  async pullAlbums(){
    albums = await this.api.fetchAlbums();
    this.addAlbums(albums, true)
  }

  addAlbums(albums, saved=false) {
  }

  addTracks(json, saved=false) {
  }

  getAlbums() {
    
  }

  getArtists() {

  }

  getTracks() {

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
