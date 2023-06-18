/**********************************************/
/*        ------ PokeAPI Search ------        */
/*        Author: lexrayne                    */
/*        From script.js                      */
/**********************************************/

// Fetch data from URL - modified to get type & speed back
async function getPokemonDetails(searchUrl) {
  var response = await fetch(searchUrl);

  if (!response.ok) {
    console.log("Error: " + response.statusText);
  }

  var data = await response.json();
  return readData(data);
}

// Display data in HTML
function readData(data) {
  if (!data || data.length === 0) {
    console.log("No data");
    return;
  }

  var cardContainerEl = document.querySelector("#pokemon-team");

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
  var pokemonName = capitalizeFirstLetter(data.name.split("-")[0]);
  if (data.name === "ho-oh") {
    pokemonName = capitalizeFirstLetter(data.name);
  }
  cardNameTitle.textContent = pokemonName;
  var pokemonTypes = data.types;
  var pokemonStats = data.stats;
  cardImage.src =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" +
    data.id +
    ".png";
  cardTypeIcon.src =
    "./assets/imgs/" +
    capitalizeFirstLetter(pokemonTypes[0].type.name) +
    ".png";
  cardEl.style = "background-color: var(--" + pokemonTypes[0].type.name + ")";
  if (pokemonTypes.length === 2) {
    var cardTypeIcon2 = document.createElement("img");
    cardTypeIcon2.classList.add("type-image");
    cardTypeIcon2.src =
      "./assets/imgs/" +
      capitalizeFirstLetter(pokemonTypes[1].type.name) +
      ".png";
    cardTypeSpan.appendChild(cardTypeIcon2);
  }

  cardStatsHP.textContent = "HP: " + pokemonStats[0].base_stat;
  cardStatsAtk.textContent = "Attack: " + pokemonStats[1].base_stat;
  cardStatsDef.textContent = "Defense: " + pokemonStats[2].base_stat;
  cardStatsSpA.textContent = "Special Attack: " + pokemonStats[3].base_stat;
  cardStatsSpD.textContent = "Special Defense: " + pokemonStats[4].base_stat;
  cardStatsSpe.textContent = "Speed: " + pokemonStats[5].base_stat;

  //   Addition for Spotify: send needed data for search
  return [pokemonTypes[0].type.name, pokemonStats[5].base_stat];
}

// Source: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ***************************************** //

// ------------------------------------------ //
//              Functions used to             //
//           search Spotify for songs         //
// ------------------------------------------ //

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
      "d-flex flex-column flex-sm-row justify-content-start align-items-center m-3 card shadow-lg song-card"
    );
    songInfoDivEl.setAttribute(
      "class",
      "d-flex flex-column ms-4 me-3 flex-wrap"
    );
    albumImgEl.setAttribute("class", "album");
    listenLinkEl.setAttribute("class", "spotify-link");
    songDivEl.setAttribute("style", "max-width:550px");

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

function genreMatch(typing) {
  if (typing === "fire") {
    return "hip-hop";
  } else if (typing === "water") {
    return "blues";
  } else if (typing === "grass") {
    return "reggae";
  } else if (typing === "ice") {
    return "folk";
  } else if (typing === "normal") {
    return "pop";
  } else if (typing === "electric") {
    return "EDM";
  } else if (typing === "fighting") {
    return "alternative+rock";
  } else if (typing === "poison") {
    return "funk";
  } else if (typing === "ground") {
    return "country";
  } else if (typing === "flying") {
    return "rhythm+and+blues";
  } else if (typing === "psychic") {
    return "psychedelic";
  } else if (typing === "bug") {
    return "jazz";
  } else if (typing === "rock") {
    return "classic+rock";
  } else if (typing === "ghost") {
    return "soul";
  } else if (typing === "dark") {
    return "punk";
  } else if (typing === "dragon") {
    return "classical";
  } else if (typing === "steel") {
    return "heavy+metal";
  } else if (typing === "fairy") {
    return "dance-pop";
  } else {
    console.log("Invalid type");
    return typing;
  }
}

function matchSpeed(speedVal) {
  if (speedVal >= 160) {
    return "2020-2023";
  } else if (speedVal >= 140) {
    return "2010-2019";
  } else if (speedVal >= 120) {
    return "2000-2009";
  } else if (speedVal >= 100) {
    return "1990-1999";
  } else if (speedVal >= 80) {
    return "1980-1989";
  } else if (speedVal >= 60) {
    return "1970-1979";
  } else if (speedVal >= 40) {
    return "1960-1969";
  } else {
    return "1950-1959";
  }
}

// --------------------------------------- //

// --------------------------------------- //
//       Display team & generate           //
//          playlist functions             //
// --------------------------------------- //

async function generatePlaylist(typesArray, speedsArray) {
  // Get spotify access tokens if expired
  var spotifyAccessToken = JSON.parse(
    localStorage.getItem("temporarySpotifyAccessToken")
  );
  if (
    spotifyAccessToken == null ||
    dayjs().isAfter(spotifyAccessToken.expiryDate)
  ) {
    await getSpotifyAccessTokens();
  }
  var genres = [];
  var years = [];

  for (let i = 0; i < typesArray.length; i++) {
    genres.push(genreMatch(typesArray[i]));
    years.push(matchSpeed(speedsArray[i]));
  }

  //   Search for songs
  var songs = [];

  for (let k = 0; k < genres.length; k++) {
    // var queryToSearch = words[k] + "+genre:" + genres[k];
    var queryToSearch = "year:" + years[k] + "+genre:" + genres[k];
    songToAdd = await searchSpotify(queryToSearch);
    songs.push(songToAdd);
  }

  displayPlaylist(songs);
}

async function loadTeam() {
  // Get pokemon team info from local storage
  var savedTeam = JSON.parse(localStorage.getItem("teamData"));
  var pokemonToSearch = [
    savedTeam.pokemon1,
    savedTeam.pokemon2,
    savedTeam.pokemon3,
    savedTeam.pokemon4,
    savedTeam.pokemon5,
    savedTeam.pokemon6,
  ];

  var typings = [];
  var speeds = [];

  for (pokemon of pokemonToSearch) {
    if (pokemon !== null && pokemon !== "") {
      var results = await getPokemonDetails(
        "https://pokeapi.co/api/v2/pokemon/" + pokemon
      );
      typings.push(results[0]);
      speeds.push(results[1]);
    }
  }

  generatePlaylist(typings, speeds);
}

// --------------------------- //

// ---------- Main ----------- //

loadTeam();

var backToMainBttnEl = document.getElementById("back-to-main-button");

backToMainBttnEl.addEventListener("click", function (event) {
  location.href = "./index.html";
});
