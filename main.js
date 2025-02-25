const JELLYFIN_URL = "http://192.168.10.109:8096";
const API_KEY = "e4476148524b4897815e5cae4ea5f636";
function fetchMovies() {
    fetchItems("Movie");
}

function fetchTVShows() {
    fetchItems("Series");
}
