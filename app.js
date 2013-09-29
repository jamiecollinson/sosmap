function initialize() {
  areas = [];
  
  mapOptions = {
    center: new google.maps.LatLng(31.50362930577303, 14.4140625),
    zoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };
  countryInitOptions = {
    fillColor: '008FCC',
    fillOpacity: 0.5,
    strokeOpacity: 0
  };
  countryHoverOptions = {
    fillColor: 'EC7404',
    fillOpacity: 0.5,
    strokeOpacity: 0
  };
  countrySelectOptions = {
    fillColor: 'EC7404',
    fillOpacity: 0.8,
    strokeOpacity: 1
  };
  
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  loadCountries();
}

function loadCountries() {
  $.getJSON('countries.geo.json', function(countries) {
    $.getJSON('countries.sos.json', function(soscountries) {
      for (var i=0; i<countries.features.length; i++) {
        //add ID to properties so it can be used later
        countries.features[i].properties.id = countries.features[i].id;
        //add continent to properties
        for (var j=0; j<soscountries.length; j++) {
          if (soscountries[j].id == countries.features[i].id) {
            countries.features[i].properties.continent = soscountries[j].continent;
          }
        }
      }
      countries = GeoJSON(countries);
      for (var i=0; i<countries.length; i++) {
        if (countries[i] instanceof Array) {
          for (var j=0; j<countries[i].length; j++) { areas.push( countries[i][j] ) }
        } else { areas.push( countries[i] ) }
      }
      for (var i=0; i<areas.length; i++) { 
        areas[i].setMap(map);
        areas[i].setOptions(countryInitOptions);
      }
      addAreaListeners();
    });
  });
}

function addAreaListeners() {
  for (var i=0; i<areas.length; i++){
    google.maps.event.addListener(areas[i], 'mouseover', function() {
      for (var j=0; j<areas.length; j++){
        if (areas[j].geojsonProperties.id == this.geojsonProperties.id && map.getZoom()>2) {
          areas[j].setOptions(countrySelectOptions);
        } else if (areas[j].geojsonProperties.continent == this.geojsonProperties.continent) {
          areas[j].setOptions(countryHoverOptions);
        }
      }
    });
    google.maps.event.addListener(areas[i], 'mouseout', function() {
      for (var j=0; j<areas.length; j++){
        areas[j].setOptions(countryInitOptions);
      }
    });
    google.maps.event.addListener(areas[i], 'click', function(event) {
      if (map.getZoom() <= 2) {
        if (this.geojsonProperties.continent == 'middle east'){
          map.setZoom(5);
        } else {
          map.setZoom(3);
        }
        map.setCenter(event.latLng);
      }
    });
  }
}

google.maps.event.addDomListener(window, 'load', initialize);