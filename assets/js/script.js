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
  songToAdd = await searchSpotify("fire");
  songs.push(songToAdd);

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
