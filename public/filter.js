class Filter {
  constructor(library) {
    this.library = library;
    this.albums = null;
  }

  getSortedArtists(sortBy, reverse) {
    var artists = this.library.getArtistsBy();
    if (sortBy == "Name") {
      artists.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    } else if (sortBy == "Albums") {
      artists = artists.sort((a, b) => {
        return b.albums.length - a.albums.length;
      });
    } else {
      artists = artists.sort((a, b) => {
        return b.tracks.length - a.tracks.length;
      });
    }

    if (reverse) {
      artists.reverse();
    }

    return artists;
  }

  getSortedAlbums(sortBy, reverse) {
    console.log("getting sorted albums");
    var albums = this.library.getAlbumsBy();
    this.albums = albums;
    return albums;
  }

  getSortedTracks(sortBy, reverse) {
    var tracks = this.library.getTracksBy();
    return tracks;
  }
}
