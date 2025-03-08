const express = require("express");
const axios = require("axios");
const path = require("path");
const { engine } = require("express-handlebars");

const app = express();
const PORT = 3031;

const JELLYFIN_URL = "http://192.168.10.109:8096";
const API_KEY = "e4476148524b4897815e5cae4ea5f636";
app.use((req, res, next) => {
    res.locals.JELLYFIN_URL = JELLYFIN_URL;
    res.locals.API_KEY = API_KEY;
    next();
});
//Middleware
app.engine("html", engine({ 
    extname: ".html", 
    defaultLayout: false,
    partialsDir: path.join(__dirname, "views/partials") 
}));
app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));

//Json
app.use(express.json());

//Static Routes
app.use("/public", express.static(path.join(__dirname, "public")));
// Home route
app.get("/", (req, res) => {
    res.render("index");
});

// Fetch Movies
app.get("/movies", async (req, res) => {
    try {
        const response = await axios.get(`${JELLYFIN_URL}/Items?IncludeItemTypes=Movie&Recursive=true`, {
            headers: { "X-Emby-Token": API_KEY }
        });
        res.render("movies", { movies: response.data.Items });
    } catch (error) {
        res.render("movies", { movies: [] });
    }
});

// Fetch TV Shows
app.get("/series", async (req, res) => {
    try {
        const response = await axios.get(`${JELLYFIN_URL}/Items?IncludeItemTypes=Series&Recursive=true`, {
            headers: { "X-Emby-Token": API_KEY }
        });
        res.render("series", { series: response.data.Items });
    } catch (error) {
        res.render("series", { series: [] });
    }
});

// Fetch Episodes
app.get("/episodes/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`${JELLYFIN_URL}/Items?ParentId=${id}&IncludeItemTypes=Episode&Recursive=true`, {
            headers: { "X-Emby-Token": API_KEY }
        });
        res.render("episodes", { episodes: response.data.Items });
    } catch (error) {
        res.render("episodes", { episodes: [] });
    }
});
// Fetch and play an episode
app.get("/player/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        // Fetch User ID (Replace 'USERNAME' with your actual Jellyfin username)
        const userResponse = await axios.get(`${JELLYFIN_URL}/Users`, {
            headers: { "X-Emby-Token": API_KEY }
        });

        if (!userResponse.data || userResponse.data.length === 0) {
            throw new Error("No users found in Jellyfin.");
        }

        const userId = userResponse.data[0].Id; // Get first user

        // Fetch episode details using correct endpoint
        const response = await axios.get(`${JELLYFIN_URL}/Users/${userId}/Items/${id}`, {
            headers: { "X-Emby-Token": API_KEY }
        });

        // Construct the file URL
        const fileUrl = `${JELLYFIN_URL}/Items/${id}/file?api_key=${API_KEY}`;

        // Render the player page
        res.render("player", { 
            item: response.data,
            fileUrl: fileUrl 
        });

    } catch (error) {
        console.error("Error fetching episode:", error.message);
        res.render("player", { item: {}, fileUrl: "" });
    }
});
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));