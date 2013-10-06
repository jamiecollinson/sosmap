function initialize() {  
  
  google.maps.visualRefresh = true;
  
  mapOptions = {
    center: new google.maps.LatLng(31.50362930577303, 14.4140625),
    zoom: 2,
    minZoom: 2,
    maxZoom: 7,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };
  
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  var infoWindow = new google.maps.InfoWindow();
  
  // initialise country layer
  var countryLayer = new google.maps.FusionTablesLayer({
    query: {
      select: 'kml',
      from: '1y7kgNaV_rgIgFeWwcY6jCIKPPRrR-GJvXicf7sw'
    },
    styles: [{
      polygonOptions: {
        fillColor: "#E5E5E5"
      }
    },{
      where: 'status = \'fundraising\'',
      polygonOptions: {
        fillColor: "#EC7404"
      }
    },{
      where: 'status = \'active\'',
      polygonOptions: {
        fillColor: "#009AE0"
      }
    }],
    map: map,
    suppressInfoWindows: true
  });
  
  // add event listener for country layer
  google.maps.event.addListener(countryLayer, 'click', function(e) {
    windowControl(e, infoWindow, map);
  });
  
  // initialise village layer
  var villageLayer = new google.maps.FusionTablesLayer({
    query: {
      select: 'kml',
      from: '1_n1A_kTBRcXm_YcIpxV53zs4kj7kedMfioDOtkY'
    },
    styleId: 2,
    map: map,
    suppressInfoWindows: true
  });

  // add event listener for village layer
  google.maps.event.addListener(villageLayer, 'click', function(e) {
    windowControl(e, infoWindow, map);
  });
  
}

// Open the info window at the clicked location
function windowControl(e, infoWindow, map) {
  infoWindow.setOptions({
    content: e.infoWindowHtml,
    position: e.latLng,
    pixelOffset: e.pixelOffset
  });
  infoWindow.open(map);
}

google.maps.event.addDomListener(window, 'load', initialize);