function initialize() {  

  villageTable = '1_n1A_kTBRcXm_YcIpxV53zs4kj7kedMfioDOtkY';
  countryTable = '1y7kgNaV_rgIgFeWwcY6jCIKPPRrR-GJvXicf7sw';
    
  mapOptions = {
    center: new google.maps.LatLng(31.50362930577303, 14.4140625),
    zoom: 2,
    minZoom: 2,
    maxZoom: 7,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };
  google.maps.visualRefresh = true;
  
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  // initialise info window
  var infoWindow = new google.maps.InfoWindow();
  
  // initialise country layer
  var countryLayer = new google.maps.FusionTablesLayer({
    query: {
      select: 'kml',
      from: countryTable
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
  
  // initialise village layer
  var villageLayer = new google.maps.FusionTablesLayer({
    query: {
      select: 'kml',
      from: villageTable
    },
    styleId: 2,
    map: map,
    suppressInfoWindows: true
  });

  // add event listener for country layer
  google.maps.event.addListener(countryLayer, 'click', function(e) {
    windowControl(e, infoWindow, map);
    villageLayer.setOptions({
      query: {
        select: 'kml',
        from: villageTable,
        where: "iso_a2 LIKE '" + e.row['iso_a2'].value + "'"
      }
    });
  });
  
  // add event listener for village layer
  google.maps.event.addListener(villageLayer, 'click', function(e) {
    windowControl(e, infoWindow, map);
  });
  
  // add event listener for info window
  google.maps.event.addListener(infoWindow, 'closeclick', function(e) {
    villageLayer.setOptions({
      query: {
        select: 'kml',
        from: villageTable
      }
    });
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