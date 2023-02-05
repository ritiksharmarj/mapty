'use strict';

const months = [
   'January',
   'February',
   'March',
   'April',
   'May',
   'June',
   'July',
   'August',
   'September',
   'October',
   'November',
   'December',
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Global variables
let map, mapEvent;

// Success callback for geolocation api
const success = (position) => {
   const latitude = position.coords.latitude;
   const longitude = position.coords.longitude;
   const coords = [latitude, longitude];

   // Map using Leaflet library
   map = L.map('map').setView(coords, 13);

   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   }).addTo(map);

   // Dealing with events (user clicks on map)
   map.on('click', (e) => {
      mapEvent = e;
      form.classList.remove('hidden');
      inputDistance.focus();
   });
};

// Error callback for geolocation api
const error = () => {
   alert('Geolocation error: User denied Geolocation.');
};

/**
 * Get Current location coords using geolocation api
 * Displaying a map using Leaflet library
 */
if (!navigator.geolocation) {
   console.log('Geolocation is not supported by your browser');
} else {
   navigator.geolocation.getCurrentPosition(success, error);
}

/**
 * Display marker and popup on the map (leaflet)
 */
form.addEventListener('submit', (e) => {
   e.preventDefault();

   // Clear input fields
   inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
         '';

   const { lat, lng } = mapEvent.latlng;
   L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
         L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
         })
      )
      .setPopupContent('Running')
      .openPopup();
});

// Form input type toggle between Running and Cycling
inputType.addEventListener('change', () => {
   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
