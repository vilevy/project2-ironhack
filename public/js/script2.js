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
    let city = autocomplete.getPlace();
    // cityId = city.id;
  };

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
};


window.onload = searchCity();
