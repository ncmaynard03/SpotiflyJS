

export default class DbManager {
    constructor(){
        this.db;
        const r = indexedDB.deleteDatabase('SpotiflyDB');

        const request = indexedDB.open('SpotiflyDB', 1);
        console.log("New DBManager");

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            const albumStore = db.createObjectStore('albums', { keyPath: 'id' });
            albumStore.createIndex('name', 'name');
            albumStore.createIndex('artist_id', 'artist_id');
            albumStore.createIndex('art_link', 'art_link');
            albumStore.createIndex('track_count', 'track_count');
            albumStore.createIndex('saved', 'saved');
            albumStore.createIndex('total_tracks', 'total_tracks');
            albumStore.createIndex('show_all_tracks', 'show_all_tracks');

            const trackStore = db.createObjectStore('tracks', {keyPath: 'id'});
            trackStore.createIndex('name', 'name');
            trackStore.createIndex('album_id', 'album_id');
            trackStore.createIndex('artist_id', 'artist_id');
            trackStore.createIndex('track_num', 'track_num');
            trackStore.createIndex('saved', 'saved');

            const artistStore = db.createObjectStore('artists', {keyPath: 'id'});
            artistStore.createIndex('name', 'name');


            console.log(trackStore)
            console.log('db created');
        }

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("db loaded");
        }

        request.onerror = (event) => {
            console.log("error opening db", event);
        }
    }

    addAlbum = (album) =>{
        const transaction = this.db.transaction("albums", "readwrite");
        const objectStore = transaction.objectStore("albums");

        const request = objectStore.add(album);

        request.onsuccess = () => {
            console.log("Album added")
        }

        request.onerror = (event) => {
            console.error("Error adding album", event.target.error);
        }
    }

    getAlbums = () => {
        const transaction = this.db.transactoin("albums", "readonly");
        const objectStore = transaction.objectStore('albums');

        const request = objectStore.openCursor();
        const albums = [];

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if(cursor) {
                albums.push(cursor.value);
                cursor.continue();
            } else {
                
            }
        }
    }
}