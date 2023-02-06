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

class Workout {
   date = new Date();
   id = (Date.now() + '').slice(-10);

   constructor(coords, distance, duration) {
      this.coords = coords; // [latitude, longitude]
      this.distance = distance; // in km
      this.duration = duration; // in min
   }
}

class Running extends Workout {
   constructor(coords, distance, duration, cadence) {
      super(coords, distance, duration);
      this.cadence = cadence;

      this.calcPace();
   }

   calcPace() {
      // min/km
      this.pace = this.duration / this.distance;
      return this.pace;
   }
}

class Cycling extends Workout {
   constructor(coords, distance, duration, elevationGain) {
      super(coords, distance, duration);
      this.elevationGain = elevationGain;

      this.calcSpeed();
   }

   calcSpeed() {
      // km/hr
      this.speed = this.distance / (this.duration / 60);
      return this.speed;
   }
}

/**
 * Application Architecture
 */
class App {
   // Private properties
   #map;
   #mapEvent;

   constructor() {
      this._getPosition();

      // Form submit to display on the map and in the list
      form.addEventListener('submit', this._newWorkout.bind(this));

      // Form input type toggle between Running and Cycling
      inputType.addEventListener('change', this._toggleElevationField);
   }

   // Get Current location coords using geolocation api
   _getPosition() {
      if (!navigator.geolocation) {
         console.log('Geolocation is not supported by your browser');
      } else {
         navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this),
            () => {
               // Error message when location isn't accessible
               alert('Geolocation error: User denied Geolocation.');
            }
         );
      }
   }

   /**
    * Success callback for geolocation api
    * Displaying a map using Leaflet library
    */
   _loadMap(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const coords = [latitude, longitude];

      // Map using Leaflet library
      this.#map = L.map('map').setView(coords, 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.#map);

      // Dealing with events (user clicks on map)
      this.#map.on('click', this._showForm.bind(this));
   }

   _showForm(e) {
      this.#mapEvent = e;
      form.classList.remove('hidden');
      inputDistance.focus();
   }

   // Form input type toggle between Running and Cycling
   _toggleElevationField() {
      inputElevation
         .closest('.form__row')
         .classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
   }

   // New workout display on the map
   _newWorkout(e) {
      e.preventDefault();

      // Clear input fields
      inputDistance.value =
         inputDuration.value =
         inputCadence.value =
         inputElevation.value =
            '';

      // Display marker and popup on the map (leaflet)
      const { lat, lng } = this.#mapEvent.latlng;
      L.marker([lat, lng])
         .addTo(this.#map)
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
   }
}

const app = new App();
