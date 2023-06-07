// ------ Functions ------ //

function getSpotifyAccessTokens() {
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

  fetch(reqURL, {
    method: "POST",
    headers: reqHeaders,
    body: reqBody,
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var timeToExpire = data.expires_in;
      data.expiryDate = currentDateTime
        .add(timeToExpire, "second")
        .format("YYYY-MM-DD HH:mm:ss");
      localStorage.setItem("temporarySpotifyAccessToken", JSON.stringify(data));
      console.log("Success: token received");
    })
    .catch(function (error) {
      console.log(error);
    });
}

// ----------------------- //
