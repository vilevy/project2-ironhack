const addBtn = document.querySelector('#add-place');
const itineraryForm = document.querySelector('#create-itinerary-form');
const hours = document.querySelector('#place-hours');
const minutes = document.querySelector('#place-minutes');
let placeId = '';
let placeName = '';
const placesArr = [];
const itinerarySummary = document.querySelector('#itineraty-summary');

// let deleteBtn = document.querySelectorAll('.tableDeleteDiv')

const deletePlaceFromItinerary = (i) => {
  const id = deleteBtn[i].getAttribute('target-id');
  const toDelete = document.querySelector(`#${id}`);
  toDelete.parentNode.removeChild(toDelete);
};

addBtn.addEventListener('click', () => {
  console.log(placesArr);
  // checks if time have already been set and sort places by time
  let checkTime = false;
  for (let i = 0; i < placesArr.length; i += 1) {
    if (placesArr[i].hours === hours.value && placesArr[i].minutes === minutes.value) {
      checkTime = true;
      break;
    }
  }

  if (checkTime) {
    document.querySelector('#alert-message').innerHTML = 'Time already taken!';
    document.querySelector('#alert-message').style.display = 'flex';
  } else {
    placesArr.push({
      hours: hours.value,
      minutes: minutes.value,
      place: placeName,
      id: placeId,
    });
    placesArr.sort((a, b) => {
      if (a.hours !== b.hours) {
        return a.hours.localeCompare(b.hours);
      }
      return a.minutes.localeCompare(b.minutes);
    });
    // prints data into itinerarySummary
    itinerarySummary.innerHTML = '';
    for (let i = 0; i < placesArr.length; i += 1) {
      itinerarySummary.innerHTML += `
        <div id="table-row-${placesArr[i].id}">
          <div class="tableTimeDiv">${placesArr[i].hours}:${placesArr[i].minutes}</div>
          <div class="tablePlaceDiv">${placesArr[i].place}</div>
          <div class="tableDeleteDiv" id="target-${placesArr[i].id}">Delete</div>
        </div>
      `;
    }
    // delete place from array, delete input hidden and tablRow div
    placesArr.forEach(((el) => {
      const deleteThisBtn = document.querySelector(`#target-${el.id}`);
      deleteThisBtn.addEventListener('click', () => {
        placesArr.forEach((newEl, newIdx) => {
          if (el.id === newEl.id) {
            placesArr.splice(newIdx, 1);
          }
        });
        const toDeleteHidden = document.querySelector(`#${el.id}`);
        const toDeleteDiv = document.querySelector(`#table-row-${el.id}`);
        toDeleteHidden.parentNode.removeChild(toDeleteHidden);
        toDeleteDiv.parentNode.removeChild(toDeleteDiv);
      });
    }));

    // creates hidden input with data
    const inputHidden = document.createElement('input');
    inputHidden.setAttribute('type', 'hidden');
    inputHidden.setAttribute('name', 'place');
    inputHidden.setAttribute('id', placeId);
    inputHidden.setAttribute('value', `${hours.value}:${minutes.value}:${placeName}:${placeId}`);
    itineraryForm.append(inputHidden);
  }
  // change values back to default
  hours.value = '';
  minutes.value = '';
  addBtn.disabled = true;
});

const initMap = () => {
  addBtn.disabled = true;

  const map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -33.8688,
      lng: 151.2195,
    },
    zoom: 13,
  });
  const card = document.getElementById('pac-card');
  const input = document.getElementById('pac-input');
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  const autocomplete = new google.maps.places.Autocomplete(input);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);

  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(
    ['place_id', 'address_components', 'geometry', 'icon', 'name'],
  );

  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autocomplete.addListener('place_changed', () => {
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();
    placeId = place.place_id;
    placeName = place.name;
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      document.querySelector('#alert-message').innerHTML = `No details available for input: '${place.name}'`;
      document.querySelector('#alert-message').style.display = 'flex';
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17); // Why 17? Because it looks good.
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    let address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || ''),
        (place.address_components[3] && place.address_components[3].short_name || ''),
        (place.address_components[4] && place.address_components[4].short_name || ''),
      ].join(' ');
    }

    infowindowContent.children['place-icon'].src = place.icon;
    infowindowContent.children['place-name'].textContent = place.name;
    infowindowContent.children['place-address'].textContent = address;
    infowindow.open(map, marker);
  });
};

const checkHoursAndMinutes = () => {
  if (hours.value === '' || minutes.value === '') {
    addBtn.disabled = true;
  } else {
    addBtn.disabled = false;
  }
};

hours.addEventListener('change', checkHoursAndMinutes);
minutes.addEventListener('change', checkHoursAndMinutes);

window.onload = initMap();

let city = '';
// let cityId = '';

const searchCity = () => {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  const autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (document.getElementById('city-search')), {
      types: ['(cities)'],
    },
  );

  const fillInAddress = () => {
    // Get the place details from the autocomplete object.
    city = autocomplete.getPlace();
    const cityD = city.getDetails();
    console.log(cityD);
    // cityId = city.id;
  };

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
};


window.onload = searchCity();

// mapa com details
/* function initMap2() {
  const map = new google.maps.Map(document.getElementById('map2'), {
    center: { lat: -33.866, lng: 151.196 },
    zoom: 15,
  });

  const request = {
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    // fields: ['name', 'formatted_address', 'place_id', 'opening_hours', 'geometry']
  };

  const infowindow = new google.maps.InfoWindow();
  const service = new google.maps.places.PlacesService(map);

  service.getDetails(request, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
      });
      google.maps.event.addListener(marker, 'click',() => {
        infowindow.setContent(`<div><strong>${place.name}</strong><br>`
          + `Phone: ${place.international_phone_number}<br>`
          + `Place ID: ${place.place_id}<br>${
            place.formatted_address}</div>`);
        infowindow.open(map, this);
      });
    }
  });
}

window.onload = initMap2();
 */

// const subscribeBtn = document.querySelector('#subscribe-btn');
// subscribeBtn.addEventListener('click', () => {

// });
