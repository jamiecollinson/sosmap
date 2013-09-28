var map;
var countryInitOptions = {
  fillOpacity: 0.1,
  strokeOpacity: 0.1
};
var countryHoverOptions = {
  fillOpacity: 0.5
};
var areas = [];

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(0, 0),
    zoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };
  
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  loadCountries();
}

function loadCountries() {
  $.getJSON('countries.geo.json', function(response) {
    var data = GeoJSON(response, countryInitOptions);
    for (var i=0; i<data.length; i++) {
      if (data[i] instanceof Array) {
        for (var j=0; j<data[i].length; j++) { areas.push( data[i][j] ) }
      } else { areas.push( data[i] ) }
    }
    for (var i=0; i<areas.length; i++){
      areas[i].setMap(map);
      addHoverListener(areas[i]);
    }
  }) 
}

function addHoverListener(area) {
  google.maps.event.addListener(area, 'mouseover', function() {
    this.setOptions(countryHoverOptions);
  });
  google.maps.event.addListener(area, 'mouseout', function() {
    this.setOptions(countryInitOptions);
  }); 
}

google.maps.event.addDomListener(window, 'load', initialize);