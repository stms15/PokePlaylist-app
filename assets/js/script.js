/**********************************************/
/*        ------ PokeAPI Search ------        */
/**********************************************/

// Get HTML search elements
var searchInputEl = document.querySelector("#search-input");
var searchButtonEl = document.querySelector("#search-button");

// Search button function
searchButtonEl.addEventListener("click", function (event) {
  event.preventDefault();
  var searchPokemon = searchInputEl.value.trim();
  searchPokemon = searchPokemon.toLowerCase();
  var searchUrl = "https://pokeapi.co/api/v2/pokemon/" + searchPokemon;
  getPokemonDetails(searchUrl);
});

// Fetch data from URL
function getPokemonDetails(searchUrl) {
  fetch(searchUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          readData(data);
        });
      } else if (response.status === 404) {
        cardContainerEl.textContent = "No results found.";
      } else {
        console.log("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      console.log("Could not connect to PokeAPI.");
    });
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
}

// Source: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const teamContainer = document.getElementById("teamContainer");
const cardContainer = document.getElementById("card-container");

function initiateDrag() {
  dragula([teamContainer, cardContainer]);
}

window.addEventListener("load", initiateDrag);
