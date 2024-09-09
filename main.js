// Fetch Pokemon Data
const pokemon = fetch('https://pokeapi.co/api/v2/pokemon?limit=30');

let filteredPokemonData = []; // Declare this globally so it can be accessed by sorting functions

pokemon
  .then((response) => response.json())
  .then((data) => data.results)
  .then(async (allPokemon) => {
    // Fetch details for each Pokemon
    const allPokemonFetches = allPokemon.map((pokemon) =>
      fetch(pokemon.url).then((response) => response.json())
    );
    let allPokemonData = await Promise.all(allPokemonFetches);

    // Generate Pokemon cards dynamically
    const carousel = document.querySelector('.card-carousel');
    const totalBaseExpDiv = document.querySelector('.total-base-exp'); // Target div for displaying total base experience
    carousel.innerHTML = ''; // Clear existing content

    // Filter out Pokemon that are already in favorites
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    filteredPokemonData = allPokemonData.filter(pokemon => 
      !favorites.some(fav => fav.name === pokemon.name)
    );

    // Render the cards initially
    renderCards();

    // Calculate and display the initial total base experience
    updateTotalBaseExperience();
  });

// Function to render cards
const renderCards = () => {
  const carousel = document.querySelector('.card-carousel');
  carousel.innerHTML = ''; // Clear existing content
  
  // Find the name of the currently active Pokemon
  const activeCard = document.querySelector('.card.active');
  const activePokemonName = activeCard ? activeCard.querySelector('div').textContent : null;

  filteredPokemonData.forEach((pokemon, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    if ((activePokemonName && pokemon.name === activePokemonName) || 
        (!activePokemonName && index === 0)) {
      card.classList.add('active');
    }

    // Populate card with data, including the button
    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <div>${pokemon.name}</div>
      <div class="poke-data">Base Experience: ${pokemon.base_experience}</div>
      <button class="fav-btn">Add to Favorites</button>
    `;

    // Add event listener to the "Add to Favorites" button
    card.querySelector('.fav-btn').addEventListener('click', () => {
      addToFavorites(pokemon);
      // Remove from current array and re-render cards
      filteredPokemonData = filteredPokemonData.filter(p => p.name !== pokemon.name);
      renderCards(); // Re-render carousel with updated data
      updateTotalBaseExperience(); // Update total base experience when a card is removed
    });

    // Append card to the carousel
    carousel.appendChild(card);
  });

  // Initialize carousel functionality after loading cards
  initializeCarousel();
};

// Function to add Pokemon to local storage
function addToFavorites(pokemon) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.push(pokemon);
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Function to calculate and update the total base experience
function updateTotalBaseExperience() {
  const cards = document.querySelectorAll('.card'); // Get all current cards
  let totalBaseExp = 0;

  cards.forEach(card => {
    const baseExpElement = card.querySelector('.poke-data');
    const baseExpText = baseExpElement.textContent.match(/\d+/); // Extract the base experience number
    totalBaseExp += parseInt(baseExpText[0], 10); // Sum up base experience
  });

  // Update the total base experience in the target div
  const totalBaseExpDiv = document.querySelector('.total-base-exp');
  totalBaseExpDiv.textContent = `T.B.E.: ${totalBaseExp}`;
}

// Carousel Functionality
const initializeCarousel = () => {
  const slides = document.querySelectorAll('.card');
  const buttons = document.querySelectorAll('.slide-control-container button');

  let current = 0;
  let next = current < slides.length - 1 ? current + 1 : 0;
  let prev = current > 0 ? current - 1 : slides.length - 1;

  const update = () => {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev', 'next', 'hidden');
      if (index === current) {
        slide.classList.add('active');
      } else if (index === next) {
        slide.classList.add('next');
      } else if (index === prev) {
        slide.classList.add('prev');
      } else {
        slide.classList.add('hidden');
      }
    });
  };

  const updateIndex = (number) => {
    current = number;
    next = current < slides.length - 1 ? current + 1 : 0;
    prev = current > 0 ? current - 1 : slides.length - 1;
    update();
  };

  const goToNext = () => current < slides.length - 1 ? updateIndex(current + 1) : updateIndex(0);
  const goToPrev = () => current > 0 ? updateIndex(current - 1) : updateIndex(slides.length - 1);

  buttons[0].addEventListener('click', goToPrev);
  buttons[1].addEventListener('click', goToNext);

  // Initial update for carousel
  update();
};

// Sorting function
function sortPokemon(order) {
  // Sort the filteredPokemonData array
  filteredPokemonData.sort((a, b) => {
    if (order === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  // Re-render the cards with the sorted data
  renderCards();
  
  // Re-initialize the carousel
  initializeCarousel();
  
  // Update the total base experience
  updateTotalBaseExperience();
}

// Add event listeners for sorting buttons
document.getElementById('sort-a-z').addEventListener('click', () => sortPokemon('asc'));
document.getElementById('sort-z-a').addEventListener('click', () => sortPokemon('desc'));