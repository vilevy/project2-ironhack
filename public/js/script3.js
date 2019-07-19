const initMap = () => {
  const mapCenter = {
    lat: -23.5660039,
    lng: -46.6514117,
  };

  const markers = [];

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: mapCenter,
  });

  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  function placePlaces(places) {
    if (places.length > 0) {
      places.forEach((place) => {
        const center = {
          lat: place.lat,
          lng: place.long,
        };
        const pin = new google.maps.Marker({
          position: center,
          map,
          title: place.name,
        });
        markers.push(pin);
      });
    } else {
      const center = {
        lat: places.lat,
        lng: places.long,
      };
      const pin = new google.maps.Marker({
        position: center,
        map,
        title: places.name,
      });
      markers.push(pin);
    }
  }

  // infowindowContent.children['place-icon'].src = place.icon;
  // infowindowContent.children['place-name'].textContent = place.name;
  // infowindowContent.children['place-address'].textContent = address;
  infowindow.open(map, marker);


  function getPlaces() {
    axios.get('/getplaces')
      .then((response) => {
        placePlaces(response.places);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getPlaces();



  // const map = new google.maps.Map(document.getElementById('map'), {
  //   center: {
  //     lat: -33.8688,
  //     lng: 151.2195,
  //   },
  //   zoom: 13,
  // });

  // const infowindow = new google.maps.InfoWindow();
  // const infowindowContent = document.getElementById('infowindow-content');
  // infowindow.setContent(infowindowContent);
  // const marker = new google.maps.Marker({
  //   map,
  //   anchorPoint: new google.maps.Point(0, -29),
  // });


  // autocomplete.addListener('place_changed', () => {
  //   infowindow.close();
  //   marker.setVisible(false);
  //   const place = autocomplete.getPlace();
  //   placeId = place.place_id;
  //   placeName = place.name;
  //   lat = place.geometry.viewport.na.j;
  //   long = place.geometry.viewport.ga.j;
  //   if (!place.geometry) {
  //     // User entered the name of a Place that was not suggested and
  //     // pressed the Enter key, or the Place Details request failed.
  //     document.querySelector('#alert-message').innerHTML = `No details available for input: '${place.name}'`;
  //     document.querySelector('#alert-message').style.display = 'flex';
  //     return;
  //   }

  //   // If the place has a geometry, then present it on a map.
  //   if (place.geometry.viewport) {
  //     map.fitBounds(place.geometry.viewport);
  //   } else {
  //     map.setCenter(place.geometry.location);
  //     map.setZoom(17); // Why 17? Because it looks good.
  //   }
  //   marker.setPosition(place.geometry.location);
  //   marker.setVisible(true);

  //   infowindowContent.children['place-icon'].src = place.icon;
  //   infowindowContent.children['place-name'].textContent = place.name;
  //   // infowindowContent.children['place-address'].textContent = address;
  //   infowindow.open(map, marker);
  // });
};


window.onload = initMap();

// ////////////////////////////

// const mapCenter = {
//   lat: -23.5660039,
//   lng: -46.6514117,
// };

// const markers = [];

// const map = new google.maps.Map(document.getElementById('map'), {
//   zoom: 13,
//   center: mapCenter,
// });

// const infowindow = new google.maps.InfoWindow();
// const infowindowContent = document.getElementById('infowindow-content');
// infowindow.setContent(infowindowContent);
// const marker = new google.maps.Marker({
//   map,
//   anchorPoint: new google.maps.Point(0, -29),
// });

// function placePlaces(places) {
//   if (places.length > 0) {
//     places.forEach((place) => {
//       const center = {
//         lat: place.location.coordinates[1],
//         lng: place.location.coordinates[0],
//       };
//       const pin = new google.maps.Marker({
//         position: center,
//         map,
//         title: place.name,
//       });
//       markers.push(pin);
//     });
//   } else {
//     const center = {
//       lat: places.location.coordinates[1],
//       lng: places.location.coordinates[0],
//     };
//     const pin = new google.maps.Marker({
//       position: center,
//       map,
//       title: places.name,
//     });
//     markers.push(pin);
//   }
// }

// infowindowContent.children['place-icon'].src = place.icon;
// infowindowContent.children['place-name'].textContent = place.name;
// // infowindowContent.children['place-address'].textContent = address;
// infowindow.open(map, marker);