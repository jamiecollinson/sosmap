function initialize() {  

  var villageTable = '1_mE4L4_OPopMUvn8ynWNYGqsa0wyYzY0Gu8cvG8';
  var countryTable = '1w-fDJdEdo6ds_3c4J3n9yMNql7XY3TjX_QiGz74';
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
  var villages = new villageControl(map, villageTable, googleBrowserKey, infoWindow);
  window.villages = villages;
  
  // initialise country layer
  var countries = new countryControl(map, countryTable, infoPanel, villages, infoWindow);
  
}

// controller for villages layer
function villageControl(map, villageTable, googleBrowserKey, infoWindow) {
  // jsonp query to get village data from fusion tables
  var script = document.createElement('script');
  var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
  url.push('sql=');
  var query = 'SELECT programme, lat, lng, iso_a2, location_estimate,'
    + 'CV,YF1,YF2,KG,SL1,SL2,TC1,TC2,SC1_child,SC1_adult,SC2,MC,MC_days,EP,EP_days,CV_families,SC_families'
    + ' FROM ' + villageTable;
  var encodedQuery = encodeURIComponent(query);
  url.push(encodedQuery);
  url.push('&callback=villages.callBack');
  url.push('&key=' + googleBrowserKey);
  script.src = url.join('');
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(script);
  
  var smallIcon = 'img/sos-marker-small.png';
  var largeIcon = 'img/sos-marker-large.png';
  
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
        location_estimate: rows[i][4] == 'TRUE',
        cv: parseInt(rows[i][5]),
        yf1: parseInt(rows[i][6]),
        yf2: parseInt(rows[i][7]),
        kg: parseInt(rows[i][8]),
        sl1: parseInt(rows[i][9]),
        sl2: parseInt(rows[i][10]),
        tc1: parseInt(rows[i][11]),
        tc2: parseInt(rows[i][12]),
        sc1: parseInt(rows[i][13]) + parseInt(rows[i][14]),
        sc1_child: parseInt(rows[i][13]),
        sc1_adult: parseInt(rows[i][14]),
        sc2: parseInt(rows[i][15]),
        mc: parseInt(rows[i][16]),
        mc_days: parseInt(rows[i][17]),
        ep: parseInt(rows[i][18]),
        ep_days: parseInt(rows[i][19]),
        cv_families: parseInt(rows[i][20]),
        sc_families: parseInt(rows[i][21]),
        icon: smallIcon
      });
      // add click listener
      google.maps.event.addListener(marker, 'click', function(e) {
        var content = '<h2>' + this.title + '</h2>';
        if (this.location_estimate) { content += '<p><em>Location of this marker is approximate</em></p>' }
        if (this.cv > 0) { content += '<p>Sponsored children: ' + this.cv + ' (' + this.cv_families + ' SOS families)</p>' }
        if (this.sc1 > 0) { 
          content += '<p>People helped by family strengthening programmes: ' + this.sc1 
            + ' (' + this.sc1_child + ' children and ' + this.sc1_adult + ' adults in ' + this.sc_families + ' families)</p>';
        }
        if (this.sc2 > 0) { content += '<p>People helped by social programmes: ' + this.sc2 + '</p>' }
        if (this.mc > 0) { content += '<p>Medical treatments given: ' + this.mc + '</p>' }
        if (this.ep > 0) { content += '<p>Emergency programme services delivered: ' + this.ep + '</p>' }
        if (this.kg > 0) { content += '<p>Children in nursery school: ' + this.kg + '</p>' }
        if (this.sl1 > 0) { content += '<p>Children in primary school: ' + this.sl1 + '</p>' }
        if (this.sl2 > 0) { content += '<p>Children in secondary school: ' + this.sl2 + '</p>' }
        if (this.tc2 > 0) { content += '<p>Students in vocational training centres: ' + this.tc2 + '</p>' }
        content += '<p><a href="#">This will link to the village page</a></p>';

        infoWindow.setOptions({
          content: content,
          position: e.latLng,
          pixelOffset: e.pixelOffset
        });
        infoWindow.open(map);
      });
      this.villages.push(marker);
    }
  }
  
}

// controller for country layer
function countryControl(map, countryTable, infoPanel, villages, infoWindow) {  
  this.countries = new google.maps.FusionTablesLayer({
    query: {
      select: 'kml',
      from: countryTable
    },
    styles: [{
      where: 'programmes = 0',
      polygonOptions: {
        fillColor: "#999999",
        fillOpacity: 0.6
      }
    },{
      where: 'programmes > 0',
      polygonOptions: {
        fillColor: "#009AE0"
      }
    }],
    map: map,
    suppressInfoWindows: true
  });
  
  // add event listener for country layer
  google.maps.event.addListener(this.countries, 'click', function(e) {
    var iso_a2 = e.row['iso_a2'].value;
    infoPanel.update(e, villages, iso_a2);
    infoWindow.close();
    villages.addToMap(map, iso_a2);
    this.setOptions({
      styles: [{
        where: "programmes = 0",
        polygonOptions: {
          fillColor: "#999999",
          fillOpacity: 0.8
        }
      },{
        where: "programmes > 0",
        polygonOptions: {
          fillColor: "#009AE0"
        }
      },{
        where: "iso_a2 CONTAINS '" + iso_a2 + "'",
        polygonOptions: {
          fillOpacity: 0.01
        }
      }]
    });
  });

}

// add custom control for country info panel
function panelControl(map) {
  var div = document.createElement('div');
  div.style.margin = '5px';
  div.style.padding = '5px';
  div.style.backgroundColor = 'white';
  div.innerHTML = '<h1>Click on a country to see where we work</h1>';
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(div);  
  
  this.update = function(e, villages, iso_a2) {
    var villages = villages.villages;
    var countryTotals = {
      cv: 0,
      yf1: 0,
      yf2: 0,
      kg: 0,
      sl1: 0,
      sl2: 0,
      tc1: 0,
      tc2: 0,
      sc1: 0,
      sc1_child: 0,
      sc1_adult: 0,
      sc2: 0,
      mc: 0,
      mc_days: 0,
      ep: 0,
      ep_days: 0,
      cv_families: 0,
      sc_families: 0,
    };
    for (var i=0; i<villages.length; i++) {
      if (villages[i].iso_a2 === iso_a2) {
        countryTotals.cv += villages[i].cv;
        countryTotals.yf1 += villages[i].yf1;
        countryTotals.yf2 += villages[i].yf2;
        countryTotals.kg += villages[i].kg;
        countryTotals.sl1 += villages[i].sl1;
        countryTotals.sl2 += villages[i].sl2;
        countryTotals.tc1 += villages[i].tc1;
        countryTotals.tc2 += villages[i].tc2;
        countryTotals.sc1 += villages[i].sc1;
        countryTotals.sc1_child += villages[i].sc1_child;
        countryTotals.sc1_adult += villages[i].sc1_adult;
        countryTotals.sc2 += villages[i].sc2;
        countryTotals.mc += villages[i].mc;
        countryTotals.mc_days += villages[i].mc_days;
        countryTotals.ep += villages[i].ep;
        countryTotals.ep_days += villages[i].ep_days;
        countryTotals.cv_families += villages[i].cv_families;
        countryTotals.sc_families += villages[i].sc_families;
      }
    }
    var content = '<h2>' + e.row['name'].value + '</h2>';
    content += '<p><em>Click on a marker to see details of each programme</em></p>';
    if (countryTotals.cv > 0) { 
      content += '<p>Sponsored children: ' + countryTotals.cv + ' (' + countryTotals.cv_families + ' SOS families)</p>' 
    }
    if (countryTotals.sc1 > 0) { 
      content += '<p>People helped by family strengthening programmes: ' + countryTotals.sc1 + '</p>';
    }
    if (countryTotals.sc2 > 0) { content += '<p>People helped by social programmes: ' + countryTotals.sc2 + '</p>' }
    if (countryTotals.mc > 0) { content += '<p>Medical treatments given: ' + countryTotals.mc + '</p>' }
    if (countryTotals.ep > 0) { content += '<p>Emergency programme services delivered: ' + countryTotals.ep + '</p>' }
    if (countryTotals.kg > 0) { content += '<p>Children in nursery school: ' + countryTotals.kg + '</p>' }
    if (countryTotals.sl1 > 0) { content += '<p>Children in primary school: ' + countryTotals.sl1 + '</p>' }
    if (countryTotals.sl2 > 0) { content += '<p>Children in secondary school: ' + countryTotals.sl2 + '</p>' }
    if (countryTotals.tc2 > 0) { content += '<p>Students in vocational training centres: ' + countryTotals.tc2 + '</p>' }
    content += '<p><a href="#">This will link to the country page</a></p>';
    
    div.innerHTML = content;
  }
}

google.maps.event.addDomListener(window, 'load', initialize);