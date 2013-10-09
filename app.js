function initialize() {  

  var villageTable = '1_n1A_kTBRcXm_YcIpxV53zs4kj7kedMfioDOtkY';
  var countryTable = '1y7kgNaV_rgIgFeWwcY6jCIKPPRrR-GJvXicf7sw';
  var googleBrowserKey = 'AIzaSyD2NNOm9P6iW0Kw8NHb1SwcMwD4YB1fUiw';
    
  var mapOptions = {
    center: new google.maps.LatLng(31.50362930577303, 14.4140625),
    zoom: 2,
    minZoom: 2,
    maxZoom: 7,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false
  };
  
  google.maps.visualRefresh = true;
  
  // initialise map
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  // add event listener for map
  google.maps.event.addListener(map, 'zoom_changed', function(e) {
    villages.updateIconSize();
  });
  
  // initialise info panel
  var infoPanel = new panelControl(map);
  
  // initialise info window
  var infoWindow = new google.maps.InfoWindow();
  
  // initialise village layer & add to window so villages.callback is available
  var villages = new villageControl(map, villageTable, googleBrowserKey);
  window.villages = villages;
  
  // initialise country layer
  var countries = new countryControl(map, countryTable);
  // add event listener for country layer
  google.maps.event.addListener(countries.countries, 'click', function(e) {
    console.log('click');
    countries.onClick(e, infoPanel, villages);
  });
  
}

// controller for villages layer
function villageControl(map, villageTable, googleBrowserKey) {
  // jsonp query to get village data from fusion tables
  var script = document.createElement('script');
  var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
  url.push('sql=');
  var query = 'SELECT name, lat, lng, iso_a2 FROM ' +
    villageTable;
  var encodedQuery = encodeURIComponent(query);
  url.push(encodedQuery);
  url.push('&callback=villages.callBack');
  url.push('&key=' + googleBrowserKey);
  script.src = url.join('');
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(script);
  
  var smallIcon = 'img/bg-marker-3.png';
  var largeIcon = 'img/bg-marker-2.png';
  
  this.villages = [];
  
  this.addAllToMap = function(map) {
    for (var i=0; i<this.villages.length; i++) {
      this.villages[i].setMap(map);
    }
  }
  
  this.addToMap = function(map, iso_a2) {
    var villages = this.villages;
    for (var i=0; i<villages.length; i++) {
      if (villages[i].iso_a2 === iso_a2) {
        villages[i].setAnimation(google.maps.Animation.DROP);
        villages[i].setMap(map);
      } else {
        villages[i].setMap();
      }
    }
  }
  
  this.updateIconSize = function() {
    var zoom = map.getZoom();
    var villages = this.villages;
    if (zoom < 5) {
      for (var i=0; i<villages.length; i++) {
        villages[i].setIcon(smallIcon);
      }
    } else {
      for (var i=0; i<villages.length; i++) {
        villages[i].setIcon(largeIcon);
      }
    }
  }
  
  this.callBack = function(data) {
    var rows = data['rows'];
    for (var i=0; i<rows.length; i++) {
      var latLng = new google.maps.LatLng(rows[i][1],rows[i][2]);
      var marker = new google.maps.Marker({
        position: latLng,
        title: rows[i][0],
        iso_a2: rows[i][3],
        icon: smallIcon
      });
      this.villages.push(marker);
    }
  }
  
}

// controller for country layer
function countryControl(map, countryTable) {  
  this.countries = new google.maps.FusionTablesLayer({
    query: {
      select: 'kml',
      from: countryTable
    },
    styles: [{
      where: 'status NOT EQUAL TO \'active\'',
      polygonOptions: {
        fillColor: "#999999",
        fillOpacity: 0.6
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
  
  this.onClick = function(e, infoPanel, villages) {
    var iso_a2 = e.row['iso_a2'].value;
    infoPanel.update(e);
    villages.addToMap(map, iso_a2);
    this.countries.setOptions({
      styles: [{
        where: 'status NOT EQUAL TO \'active\'',
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
        where: "iso_a2 LIKE '" + iso_a2 + "'",
        polygonOptions: {
        fillOpacity: 0.01
      }
      }]
    });
  }

}

// add custom control for country info panel
function panelControl(map) {
  var div = document.createElement('div');
  div.style.margin = '5px';
  div.style.backgroundColor = 'white';
  div.innerHTML = '<h1>Click on a country to see where we work</h1>';
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(div);  
  
  this.update = function(e) {
    div.innerHTML = '<h2>' + e.row['name'].value + '</h2>';
    div.innerHTML += '<p>Information goes here</p>';
  }
}

// open the info window at the clicked location
function windowControl(e, infoWindow, map) {
  var content = 'This will contain info about the facility';
  infoWindow.setOptions({
    content: content,
    position: e.latLng,
    pixelOffset: e.pixelOffset
  });
  infoWindow.open(map);
}

google.maps.event.addDomListener(window, 'load', initialize);