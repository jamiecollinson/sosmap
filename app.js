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
  
  // add custom control
  panelControl = new panelControl(map);
  
  // initialise info window
  infoWindow = new google.maps.InfoWindow();
  
  // initialise country layer
  countryLayer = new google.maps.FusionTablesLayer({
    query: {
      select: 'kml',
      from: countryTable
    },
    styles: [{
      polygonOptions: {
        fillColor: "#999999",
        fillOpacity: 0.5
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
  villageLayer = new google.maps.FusionTablesLayer({
    query: {
      select: 'kml',
      from: villageTable
    },
    map: map,
    styleId: 3,
    suppressInfoWindows: true
  });

  // add event listener for country layer
  google.maps.event.addListener(countryLayer, 'click', function(e) {
    panelControl.update(e);
    countryLayer.setOptions({
      styles: [{
        polygonOptions: {
          fillColor: "#999999",
          fillOpacity: 0.8
        }
      },{
        where: 'status = \'active\'',
        polygonOptions: {
          fillColor: "#009AE0"
        }
      },{
        where: "iso_a2 LIKE '" + e.row['iso_a2'].value + "'",
        polygonOptions: {
          fillOpacity: 0.01
        }
      }]
    });
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
  
}

// add custom control for country info panel
function panelControl(map) {
  div = document.createElement('div');
  div.style.margin = '5px';
  div.style.backgroundColor = 'white';
  div.innerHTML = '<h2>Choose a country</h2>';
  map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(div);  
  
  this.update = function(e) {
    div.innerHTML = '<h2>' + e.row['name'].value + '</h2>';
    div.innerHTML += '<p>Information goes here</p>';
  }
}

// open the info window at the clicked location
function windowControl(e, infoWindow, map) {
  content = 'This will contain info about the facility';
  infoWindow.setOptions({
    content: content,
    position: e.latLng,
    pixelOffset: e.pixelOffset
  });
  infoWindow.open(map);
}

google.maps.event.addDomListener(window, 'load', initialize);