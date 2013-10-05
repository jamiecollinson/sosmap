function initialize() {  
  
  mapOptions = {
    center: new google.maps.LatLng(31.50362930577303, 14.4140625),
    zoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };
  
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
}

google.maps.event.addDomListener(window, 'load', initialize);