const initMap = () => {
  const markers = [];

  const bounds = new google.maps.LatLngBounds();


  const map = new google.maps.Map(document.getElementById('map'));

  // fit the map to the newly inclusive bounds
  map.fitBounds(bounds);
  const listener = google.maps.event.addListener(map, 'idle', () => {
    if (map.getZoom() > 16) map.setZoom(16);
    google.maps.event.removeListener(listener);
  });

  const infowindow = new google.maps.InfoWindow({
    maxWidth: 250,
  });


  const placePlaces = (places) => {
    for (let i = 0; i < places[0].places.length; i += 1) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(parseFloat(places[0].places[i].lat), parseFloat(places[0].places[i].long)),
        map,
      });
      bounds.extend(marker.position);
      markers.push(marker);
      google.maps.event.addListener(marker, 'click', () => {
        infowindow.setContent(`<div><strong>${places[0].places[i].name}</strong>`);
        infowindow.open(map, marker);
      });
    }
  };


  const getPlaces = () => {
    const id = document.URL.slice(document.URL.indexOf('itinerary/itinerary/') + 'itinerary/itinerary/'.length);
    axios.get(`/itinerary/api/${id}`)
      .then((response) => {
        placePlaces(response.data.places);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getPlaces();
};


window.onload = initMap();
