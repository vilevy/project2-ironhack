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
          lat: parseInt(place.places[1].lat, 10),
          lng: parseInt(place.places[1].long, 10),
        };
        const pin = new google.maps.Marker({
          position: center,
          map,
          title: place.places[0].name,
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
    const id = document.URL.slice(document.URL.indexOf('itinerary/itinerary/') + 'itinerary/itinerary/'.length)
    axios.get(`/itinerary/api/${id}`)
      .then((response) => {
        placePlaces(response.data.places);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getPlaces();
};


window.onload = initMap();