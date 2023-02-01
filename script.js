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

function success(position) {
   const latitude = position.coords.latitude;
   const longitude = position.coords.longitude;
   const coords = [latitude, longitude];

   const map = L.map('map').setView(coords, 13);

   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   }).addTo(map);

   L.marker(coords)
      .addTo(map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();
}

function error() {
   alert('Geolocation error: User denied Geolocation.');
}

if (!navigator.geolocation) {
   console.log('Geolocation is not supported by your browser');
} else {
   navigator.geolocation.getCurrentPosition(success, error);
}
