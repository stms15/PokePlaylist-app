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
