'use strict';

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

   _setDescription() {
      // prettier-ignore
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      this.description = `${this.type[0].toUpperCase()}${this.type.slice(
         1
      )} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
   }
}

class Running extends Workout {
   type = 'running';

   constructor(coords, distance, duration, cadence) {
      super(coords, distance, duration);
      this.cadence = cadence;
      this.calcPace();
      this._setDescription();
   }

   calcPace() {
      // min/km
      this.pace = this.duration / this.distance;
      return this.pace;
   }
}

class Cycling extends Workout {
   type = 'cycling';

   constructor(coords, distance, duration, elevationGain) {
      super(coords, distance, duration);
      this.elevationGain = elevationGain;
      this.calcSpeed();
      this._setDescription();
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
   #mapZoomLevel = 13;
   #mapEvent;
   #workouts = [];

   constructor() {
      // Get user's position
      this._getPosition();

      // Get data from local storage
      this._getLocalStorage();

      // Submit form
      form.addEventListener('submit', this._newWorkout.bind(this));

      // Form input type toggle between Running and Cycling
      inputType.addEventListener('change', this._toggleElevationField);

      // Move to map popup, when click on workout list item
      containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
      this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.#map);

      // Dealing with events (user clicks on map)
      this.#map.on('click', this._showForm.bind(this));

      this.#workouts.forEach((work) => {
         this._renderWorkoutMarker(work);
      });
   }

   _showForm(e) {
      this.#mapEvent = e;
      form.classList.remove('hidden');
      inputDistance.focus();
   }

   _hideForm() {
      // Empty inputs
      inputDistance.value =
         inputDuration.value =
         inputCadence.value =
         inputElevation.value =
            '';

      form.style.display = 'none';
      form.classList.add('hidden');
      setTimeout(() => (form.style.display = 'grid'), 1000);
   }

   // Form input type toggle between Running and Cycling
   _toggleElevationField() {
      inputElevation
         .closest('.form__row')
         .classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
   }

   // New workout, display on the map
   _newWorkout(e) {
      const validInputs = (...inputs) =>
         inputs.every((input) => Number.isFinite(input));
      const allPositive = (...inputs) => inputs.every((input) => input > 0);

      e.preventDefault();

      // Get data from form
      const type = inputType.value;
      const distance = Number(inputDistance.value);
      const duration = Number(inputDuration.value);
      const { lat, lng } = this.#mapEvent.latlng;
      let workout;

      // If workout Running, create Running object
      if (type === 'running') {
         const cadence = Number(inputCadence.value);
         // Check if data is valid
         if (
            !validInputs(distance, duration, cadence) ||
            !allPositive(distance, duration, cadence)
         ) {
            alert('Inputs have to be positive numbers!');
         }

         workout = new Running([lat, lng], distance, duration, cadence);
      }

      // If workout Cycling, create Cycling object
      if (type === 'cycling') {
         const elevation = Number(inputElevation.value);
         // Check if data is valid
         if (
            !validInputs(distance, duration, elevation) ||
            !allPositive(distance, duration)
         ) {
            alert('Inputs have to be positive numbers!');
         }

         workout = new Cycling([lat, lng], distance, duration, elevation);
      }

      // Add new object to workout array
      this.#workouts.push(workout);

      // Render workout on the map as marker
      this._renderWorkoutMarker(workout);

      // Render workout in the list
      this._renderWorkout(workout);

      // Hide form + clear input fields
      this._hideForm();

      // set local storage to all workouts
      this._setLocalStorage();
   }

   // Render workout on the map as marker
   _renderWorkoutMarker(workout) {
      L.marker(workout.coords)
         .addTo(this.#map)
         .bindPopup(
            L.popup({
               maxWidth: 250,
               minWidth: 100,
               autoClose: false,
               closeOnClick: false,
               className: `${workout.type}-popup`,
            })
         )
         .setPopupContent(
            `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
         )
         .openPopup();
   }

   // Render workout in the list
   _renderWorkout(workout) {
      let html = `
         <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
               <span class="workout__icon">${
                  workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
               }</span>
               <span class="workout__value">${workout.distance}</span>
               <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
               <span class="workout__icon">⏱</span>
               <span class="workout__value">${workout.duration}</span>
               <span class="workout__unit">min</span>
            </div>
      `;

      if (workout.type === 'running') {
         html += `
            <div class="workout__details">
               <span class="workout__icon">⚡️</span>
               <span class="workout__value">${workout.pace.toFixed(1)}</span>
               <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
               <span class="workout__icon">🦶🏼</span>
               <span class="workout__value">${workout.cadence}</span>
               <span class="workout__unit">spm</span>
            </div>
         </li>
         `;
      }

      if (workout.type === 'cycling') {
         html += `
            <div class="workout__details">
               <span class="workout__icon">⚡️</span>
               <span class="workout__value">${workout.speed.toFixed(1)}</span>
               <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
               <span class="workout__icon">⛰</span>
               <span class="workout__value">${workout.elevationGain}</span>
               <span class="workout__unit">m</span>
            </div>
         </li>
         `;
      }

      form.insertAdjacentHTML('afterend', html);
   }

   // Move to map popup, when click on workout list item
   _moveToPopup(e) {
      const workoutEl = e.target.closest('.workout');

      // If there is no workout list then return nothing
      if (!workoutEl) return;

      // Get the clicked workout item details
      const workout = this.#workouts.find(
         (work) => work.id === workoutEl.dataset.id
      );

      this.#map.setView(workout.coords, this.#mapZoomLevel, {
         animate: true,
         duration: 1,
      });
   }

   // Store all workouts in the local storage
   _setLocalStorage() {
      localStorage.setItem('workouts', JSON.stringify(this.#workouts));
   }

   // Show workouts on the map when page loads
   _getLocalStorage() {
      const data = JSON.parse(localStorage.getItem('workouts'));

      // If there is no data do nothing
      if (!data) return;

      this.#workouts = data;

      this.#workouts.forEach((work) => {
         this._renderWorkout(work);
      });
   }

   // Remove Data from Local Storage
   reset() {
      localStorage.removeItem('workouts');
      location.reload();
   }
}

const app = new App();
