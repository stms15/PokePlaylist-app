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

  return song;
}

function displayPlaylist(playlist) {
  playlistDivEl = document.getElementById("playlist");
  var count = 0;

  console.log(playlist);
  for (let song of playlist) {
    console.log(song);
    var songDivEl = document.createElement("div");
    var songInfoDivEl = document.createElement("div");

    var songTitleEl = document.createElement("h5");
    var albumTitleEl = document.createElement("p");
    var albumImgEl = document.createElement("img");
    var artistEl = document.createElement("p");
    var listenLinkEl = document.createElement("a");

    songTitleEl.innerHTML = song.title;
    albumTitleEl.innerHTML = song.album.title;
    albumImgEl.src = song.album.artwork.url;
    artistEl.innerHTML = song.artist;
    listenLinkEl.innerHTML =
      "Listen on Spotify <span class='fa'>&#xf08e;</span>";
    listenLinkEl.href = song.url;
    listenLinkEl.target = "_blank";

    // add classes
    songDivEl.setAttribute(
      "class",
      "d-flex flex-column flex-sm-row justify-content-start align-items-center mb-3"
    );
    songInfoDivEl.setAttribute("class", "d-flex flex-column ms-4");
    albumImgEl.setAttribute("class", "album");
    listenLinkEl.setAttribute("class", "spotify-link");

    songInfoDivEl.appendChild(songTitleEl);
    songInfoDivEl.appendChild(artistEl);
    songInfoDivEl.appendChild(albumTitleEl);
    songInfoDivEl.appendChild(listenLinkEl);

    songDivEl.appendChild(albumImgEl);
    songDivEl.appendChild(songInfoDivEl);
    songDivEl.id = "song-" + (count + 1); // song element's id is "song-1", etc.
    playlistDivEl.appendChild(songDivEl);
  }
}

async function generatePlaylistListener() {
  for (let i = 0; i < 2; i++) {
    songToAdd = await searchSpotify("fire");
    songs.push(songToAdd);
  }

  displayPlaylist(songs);
}

// ----------------------- //

var songs = [];

generatePlaylistListener();

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

// Get HTML search elements
var searchInputEl = document.querySelector("#search-input");
var searchButtonEl = document.querySelector("#search-button");

// Search button function
searchButtonEl.addEventListener("click", function(event) {
  event.preventDefault();
  var searchPokemon = searchInputEl.value.trim();
  searchPokemon = searchPokemon.toLowerCase();
  var searchUrl = "https://pokeapi.co/api/v2/pokemon/" + searchPokemon;
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
        cardContainerEl.textContent = "No results found.";
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
    console.log("No data");
    return;
  }

  var cardContainerEl = document.querySelector("#card-container");
  cardContainerEl.textContent = "";

  // Create HTML for the info card
  var cardEl = document.createElement("div");
  cardEl.id = "text-card";
  cardEl.classList.add("card");
  cardEl.classList.add("pokemon-card");
  cardEl.classList.add("m-3");
  cardEl.classList.add("shadow-lg");

  var cardImageContainer = document.createElement("div");
  cardImageContainer.classList.add("image-container");

  var cardImage = document.createElement("img");
  cardImage.classList.add("pokemon-image");
  cardImage.classList.add("mt-2");
  cardImage.classList.add("mb-2");

  var cardBodyEl = document.createElement("div");
  cardBodyEl.classList.add("card-body");
  cardBodyEl.classList.add("text-center");

  var cardNameEl = document.createElement("div");
  cardNameEl.classList.add("d-flex");
  cardNameEl.classList.add("justify-content-between");

  var cardNameTitle = document.createElement("h5");
  var cardTypeSpan = document.createElement("span");
  var cardTypeIcon = document.createElement("img");
  cardTypeIcon.classList.add("type-image");

  var cardStatsEl = document.createElement("ul");
  var cardStatsHP = document.createElement("li");
  var cardStatsAtk = document.createElement("li");
  var cardStatsDef = document.createElement("li");
  var cardStatsSpA = document.createElement("li");
  var cardStatsSpD = document.createElement("li");
  var cardStatsSpe = document.createElement("li");
  cardStatsHP.classList.add("d-flex");
  cardStatsHP.classList.add("justify-content-between");
  cardStatsAtk.classList.add("d-flex");
  cardStatsAtk.classList.add("justify-content-between");
  cardStatsDef.classList.add("d-flex");
  cardStatsDef.classList.add("justify-content-between");
  cardStatsSpA.classList.add("d-flex");
  cardStatsSpA.classList.add("justify-content-between");
  cardStatsSpD.classList.add("d-flex");
  cardStatsSpD.classList.add("justify-content-between");
  cardStatsSpe.classList.add("d-flex");
  cardStatsSpe.classList.add("justify-content-between");

  cardEl.appendChild(cardImageContainer);
  cardImageContainer.appendChild(cardImage);
  cardEl.appendChild(cardBodyEl);
  cardBodyEl.appendChild(cardNameEl);
  cardNameEl.appendChild(cardNameTitle);
  cardNameEl.appendChild(cardTypeSpan);
  cardTypeSpan.appendChild(cardTypeIcon);
  cardBodyEl.appendChild(cardStatsEl);
  cardStatsEl.appendChild(cardStatsHP);
  cardStatsEl.appendChild(cardStatsAtk);
  cardStatsEl.appendChild(cardStatsDef);
  cardStatsEl.appendChild(cardStatsSpA);
  cardStatsEl.appendChild(cardStatsSpD);
  cardStatsEl.appendChild(cardStatsSpe);
  cardContainerEl.appendChild(cardEl);
  
  // Get Pokemon data
  var pokemonName = capitalizeFirstLetter(data.name);
  cardNameTitle.textContent = pokemonName;
  var pokemonTypes = data.types;
  var pokemonStats = data.stats;
  cardImage.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + data.id + ".png";
  cardTypeIcon.src = "./assets/imgs/" + capitalizeFirstLetter(pokemonTypes[0].type.name) + ".png";
  cardEl.style = "background-color: var(--" + pokemonTypes[0].type.name + ")";
  if (pokemonTypes.length === 2) {
    var cardTypeIcon2 = document.createElement("img");
    cardTypeIcon2.classList.add("type-image");
    cardTypeIcon2.src = "./assets/imgs/" + capitalizeFirstLetter(pokemonTypes[1].type.name) + ".png";
    cardTypeSpan.appendChild(cardTypeIcon2);
  }

  cardStatsHP.textContent = "HP: " + pokemonStats[0].base_stat;
  cardStatsAtk.textContent = "Attack: " + pokemonStats[1].base_stat;
  cardStatsDef.textContent = "Defense: " + pokemonStats[2].base_stat;
  cardStatsSpA.textContent = "Special Attack: " + pokemonStats[3].base_stat;
  cardStatsSpD.textContent = "Special Defense: " + pokemonStats[4].base_stat;
  cardStatsSpe.textContent = "Speed: " + pokemonStats[5].base_stat;
}

// Source: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}



const teamContainer = document.getElementById("cardContainer");
const cardContainer = document.getElementById("card-container");

function initiateDrag() {
dragula([teamContainer, cardContainer]);
}

window.addEventListener("load", initiateDrag);