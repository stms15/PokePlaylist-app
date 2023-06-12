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

// Notes about the the style of the Pokemon cards:
//
// 1. The outer parent container's id is "card-container"
// 2. The classes needed for each new card are:
//       a) card
//       b) pokemon-card
//       c) m-3
//       d) shadow-lg
// 3. Each card has a <div class="image-container"> with the <img>
//    of the pokemon inside of it
// 4. Main images have classes:
//       a) pokemon-image
//       b) mt-2
//       c) mb-2
// 5. After the img div, there is a <div class="text-body text-center">
//    for all of the card text
// 6. Then there is a <div class="d-flex justify-content-between"> with
//    child elements
//       a) <h5>Name of Pokemon</5>
//       b) <img src=type images> (pngs for these are in the imgs
//           folder and are named by type, i.e "Fire.png")
// 7. After that div, but still a child of the "text-body" div, there
//    is a list with class "w-75"
// 8. There are 5 stats in the list
// 9. List elements have classes
//       a) d-flex
//       b) justify-content-between
//    and one of stat name or stat value has to be inside a <span> element.


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
var searchButtonEl = document.createElement("input");

searchFormEl.id = "search-form";
searchLabelEl.id = "search-label";
searchLabelEl.textContent = "PokeAPI Search";
searchLabelEl.for = "search-input";
searchInputEl.id = "search-input";
searchButtonEl.id = "search-button";
searchButtonEl.type = "submit";

searchFormEl.appendChild(searchLabelEl);
searchFormEl.appendChild(searchInputEl);
searchFormEl.appendChild(searchButtonEl);
containerEl.appendChild(searchFormEl);
containerEl.appendChild(titleEl);
containerEl.appendChild(dataEl);

// Search function
searchFormEl.addEventListener("submit", function(event) {
  event.preventDefault();
  
  var searchUrl = "https://pokeapi.co/api/v2/pokemon/" + searchInputEl.value.trim();
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
  
  var pokemonName = capitalizeFirstLetter(data.name);
  var pokemonTypes = data.types;
  var pokemonTypeConcat = capitalizeFirstLetter(pokemonTypes[0].type.name);
  var pokemonStats = data.stats;
  var pokemonImageEl = document.createElement("img");
  pokemonImageEl.src = data.sprites.front_default;

  if (pokemonTypes.length === 2) {
    pokemonTypeConcat += "/" + capitalizeFirstLetter(pokemonTypes[1].type.name);
  }

  titleEl.textContent = pokemonName;
  dataEl.textContent = `Type: ${pokemonTypeConcat}`;

  for (var i = 0; i < pokemonStats.length; i++) {
    var currentStat = document.createElement("div");
    currentStat.textContent = pokemonStats[i].stat.name + ": " + pokemonStats[i].base_stat;
    dataEl.appendChild(currentStat);
  }

  dataEl.appendChild(pokemonImageEl);
}

// Source: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getStarters() {
  var searchUrl = "https://pokeapi.co/api/v2/pokemon/bulbasaur";
  getPokemonDetails(searchUrl);

  searchUrl = "https://pokeapi.co/api/v2/pokemon/charmander";
  getPokemonDetails(searchUrl);

  searchUrl = "https://pokeapi.co/api/v2/pokemon/squirtle";
  getPokemonDetails(searchUrl);
}
