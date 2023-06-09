// ------ Functions ------ //

async function getSpotifyAccessTokens() {
  var clientId = "4ebd5d061ce94134b7f2e6ee78d3fdbb";
  var clientSecret = "3bff6b09802b447d821ff9e4b28fb7dc";
  var reqURL = "https://accounts.spotify.com/api/token";

  var reqHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  var reqBody =
    "grant_type=client_credentials&client_id=" +
    clientId +
    "&client_secret=" +
    clientSecret;

  var currentDateTime = dayjs();

  var response = await fetch(reqURL, {
    method: "POST",
    headers: reqHeaders,
    body: reqBody,
  });

  if (!response.ok) {
    throw new Error("Error: " + response.status);
  }
  var data = await response.json();
  var timeToExpire = data.expires_in;
  data.expiryDate = currentDateTime
    .add(timeToExpire, "second")
    .format("YYYY-MM-DD HH:mm:ss");
  localStorage.setItem("temporarySpotifyAccessToken", JSON.stringify(data));
  console.log("Success: token received");
}

async function searchSpotify(query) {
  var accessToken = JSON.parse(
    localStorage.getItem("temporarySpotifyAccessToken")
  );
  var limit = "1";
  var searchURL =
    "https://api.spotify.com/v1/search?q=" +
    query +
    "&type=track&limit=" +
    limit;
  var searchHeaders = {
    Authorization: accessToken.token_type + " " + accessToken.access_token,
  };

  var response = await fetch(searchURL, {
    method: "GET",
    headers: searchHeaders,
  });

  if (!response.ok) {
    throw new Error("Error: " + response.status);
  }
  var data = await response.json();
  var song = {
    title: data.tracks.items[0].name,
    album: {
      title: data.tracks.items[0].album.name,
      artwork: data.tracks.items[0].album.images[0],
    },
    artist: data.tracks.items[0].artists[0].name,
    url: data.tracks.items[0].external_urls.spotify,
  };

  console.log(song);

  var storedPlaylist = JSON.parse(localStorage.getItem("playlist"));
  if (storedPlaylist == null || storedPlaylist.length >= 6) {
    var playlist = [song];
    localStorage.setItem("playlist", JSON.stringify(playlist));
  } else {
    storedPlaylist.push(song);
    localStorage.setItem("playlist", JSON.stringify(storedPlaylist));
  }
}

// ----------------------- //

// Uncomment to test:

// getSpotifyAccessTokens();
// console.log(JSON.parse(localStorage.getItem("temporarySpotifyAccessToken")));
// searchSpotify("water+mad");
// console.log(JSON.parse(localStorage.getItem("playlist")));


/**********************************************/
/*        ------ PokeAPI Search ------        */
/**********************************************/

// Create HTML elements
var containerEl = document.createElement("div");
containerEl.id = "container";
document.body.appendChild(containerEl);

var titleEl = document.createElement("h2");
titleEl.id = "pokemon-name";

var dataEl = document.createElement("div");
dataEl.id = "pokemon-data";

var searchFormEl = document.createElement("form");
var searchLabelEl = document.createElement("label");
var searchInputEl = document.createElement("input");
var searchButtonEl = document.createElement("button");

searchFormEl.id = "search-form";
searchLabelEl.id = "search-label";
searchLabelEl.textContent = "PokeAPI Search";
searchInputEl.id = "search-input";
searchButtonEl.id = "search-button";
searchButtonEl.textContent = "Search";

searchFormEl.appendChild(searchLabelEl);
searchFormEl.appendChild(searchInputEl);
searchFormEl.appendChild(searchButtonEl);
containerEl.appendChild(searchFormEl);
containerEl.appendChild(titleEl);
containerEl.appendChild(dataEl);

// Search function
searchButtonEl.addEventListener("click", function(event) {
  event.preventDefault();
  
  var searchUrl = "https://pokeapi.co/api/v2/pokemon/" + searchInputEl.value;
  console.log(searchUrl);
  getPokemonDetails(searchUrl);
})

// Fetch data from URL
function getPokemonDetails(searchUrl) {
  fetch (searchUrl)
    .then (function (response) {
      if (response.ok) {
        response.json().then(function (data) {
            readData(data);
        })
      }
      else if (response.status === 404) {
        titleEl.textContent = `"${searchInputEl.value}"`;
        dataEl.textContent = "No results found.";
      }
      else {
        console.log("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      console.log("Could not connect to PokeAPI.");
    })
}

// Display data in HTML
function readData(data) {
  if (!data || data.length === 0) {
    titleEl.textContent = `"${searchInputEl.value}"`;
    dataEl.textContent = "No results found.";
    return;
  }
  console.log(data);
  var pokemonName = data.name;
  var pokemonTypes = data.types;
  var pokemonTypeConcat = pokemonTypes[0].type.name;
  console.log(pokemonTypes);
  if (pokemonTypes.length === 2) {
    pokemonTypeConcat += "/" + pokemonTypes[1].type.name;
  }
  console.log(pokemonTypeConcat);
  titleEl.textContent = pokemonName;
  dataEl.textContent = `Type: ${pokemonTypeConcat}`;
}