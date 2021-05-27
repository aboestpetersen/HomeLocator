import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import Map from 'ol/Map';
import View from 'ol/View';
import {GeoJSON} from 'ol/format';
import {Text, Style, Stroke, Fill} from 'ol/style';
import {Tile as TileLayer, Vector as VectorLayer, Group} from 'ol/layer';
import {fromLonLat, toLonLat} from 'ol/proj';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import {toStringHDMS} from 'ol/coordinate';
import {ScaleLine, ZoomToExtent, defaults as defaultControls, FullScreen} from 'ol/control';
import TopoJSON from 'ol/format/TopoJSON';
import Geocoder from 'ol-geocoder';
import LayerSwitcher from 'ol-layerswitcher';
import {Vector as VectorSource} from 'ol/source';
import XYZ from 'ol/source/XYZ';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import VectorImageLayer from 'ol/layer/VectorImage';

/**
 * Elements that make up the popup.
 */
 var container = document.getElementById('popup');
 var content_element = document.getElementById('popup-content');
 var info_element = document.getElementById('info-element');
 var closer = document.getElementById('popup-closer');
 
 /**
  * Create an overlay to anchor the popup to the map.
  */
 var overlay = new Overlay({
   element: container,
   autoPan: true,
   autoPanAnimation: {
     duration: 250,
   },
 });
 
 /**
  * Add a click handler to hide the popup.
  * @return {boolean} Don't follow the href.
  */
 closer.onclick = function () {
   overlay.setPosition(undefined);
   closer.blur();
   return false;
 };

// Designate Center of Map
const denmarkLonLat = [10.835589, 56.232371];
const denmarkWebMercator = fromLonLat(denmarkLonLat);

// 100km Grid Styling
var classification_search_100km = function (feature, resolution){
  const fuzzyvalue = feature.get('fuzzyvalue')
  var layercolor
  if (fuzzyvalue < 0.05) {
    layercolor='rgba(0, 0, 0, 0)'
    }
    else if (fuzzyvalue < 0.2) {
    layercolor='rgba(217, 200, 0, 0.6)';
    }
    else if (fuzzyvalue < 0.4) {
    layercolor='rgba(133, 200, 0, 0.6)';
    }
    else if (fuzzyvalue < 0.6) {
    layercolor='rgba(0, 200, 0, 0.6)';
    }
    else if (fuzzyvalue < 0.8) {
    layercolor='rgba(0, 150, 0, 0.6)';
    }
    else if (fuzzyvalue <= 1) {
    layercolor='rgba(0, 100, 0, 0.6)';
    }
    else { layercolor='rgba(217, 200, 0, 0)';
    }
  return new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0)',
      width: 0.1
    }),
    fill: new Fill({
      color: layercolor
    })
  })
};

// 30km Grid Styling
var classification_search_30km = function (feature, resolution){
  const fuzzyvalue = feature.get('fuzzyvalue')
  var layercolor
  if (fuzzyvalue < 0.05) {
    layercolor='rgba(0, 0, 0, 0)'
    }
    else if (fuzzyvalue < 0.2) {
    layercolor='rgba(217, 200, 0, 0.6)';
    }
    else if (fuzzyvalue < 0.4) {
    layercolor='rgba(133, 200, 0, 0.6)';
    }
    else if (fuzzyvalue < 0.6) {
    layercolor='rgba(0, 200, 0, 0.6)';
    }
    else if (fuzzyvalue < 0.8) {
    layercolor='rgba(0, 150, 0, 0.6)';
    }
    else if (fuzzyvalue <= 1) {
    layercolor='rgba(0, 100, 0, 0.6)';
    }
    else { layercolor='rgba(217, 200, 0, 0)';
    }
  return new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0)',
      width: 0.1
    }),
    fill: new Fill({
      color: layercolor
    })
  })
};

// 1km Grid Styling
var classification_search_1km = function (feature, resolution){
  const fuzzyvalue = feature.get('fuzzyvalue')
  var layercolor
  if (fuzzyvalue < 0.6) {
  layercolor='rgba(0, 100, 0, 0.6)';
  }
  else if (fuzzyvalue < 1.2) {
  layercolor='rgba(0, 150, 0, 0.6)';
  }
  else if (fuzzyvalue < 1.8) {
  layercolor='rgba(0, 200, 0, 0.6)';
  }
  else if (fuzzyvalue < 2.4) {
  layercolor='rgba(133, 200, 0, 0.6)';
  }
  else if (fuzzyvalue < 3) {
  layercolor='rgba(217, 200, 0, 0.6)';
  }
  else { layercolor='rgba(217, 200, 0, 0)';
  }
  return new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0)',
      width: 0.1
    }),
    fill: new Fill({
      color: layercolor
    })
  })
};

// Municipalities Boundary Style
var style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000'
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3
    })
  })
});

// DK Boundary Style
var dk_style = new Style({
  fill: new Fill({
    color: 'rgba(220, 241, 247, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000'
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3
    })
  })
});

var highlightStyle = new Style({
  fill: new Fill({
    color: 'rgba(255,255,255,0.7)',
  }),
  stroke: new Stroke({
    color: '#3399CC',
    width: 3,
  }),
});

// Regions Boundary
var dk_boundary = new VectorLayer({
  title: 'Regions',
  visible: true,
  source: new VectorSource({
    format: new TopoJSON(),
    url: "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/denmark/denmark-counties.json",
  }),
  style: function(feature) {
    dk_style.getText().setText(feature.get('NAME_1'));
    return dk_style;
  },
  minResolution: 401,
});

// Pull Municipalities Boundaries from GitHub
var municipalities = new VectorLayer({
  title: 'Municipalities',
  visible: false,
  source: new VectorSource({
    format: new GeoJSON(),
    url: "https://raw.githubusercontent.com/Neogeografen/dagi/master/geojson/kommuner.geojson",
  }),
  style: function(feature) {
    style.getText().setText(feature.get('KOMNAVN'));
    return style;
  },
  minResolution: 15,
  maxResolution: 400,
});

// Add OSM hospitals layer
var hospitals_geojson = require('./data/hospitals_epsg4326.geojson')

var hospitals = new VectorLayer({
  title: 'Hospitals',
  source: new VectorSource({
    format: new GeoJSON(),
    url: hospitals_geojson,
  }),
  maxResolution: 15,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 230, 161, 0.6)',
    }),
    stroke: new Stroke({
      color: '#b58604',
      width: 1,
    }),
  }),
});

// Add OSM Schools layer
var schools_geojson = require('./data/schools_epsg4326.geojson')

var schools = new VectorLayer({
  title: 'Schools',
  source: new VectorSource({
    format: new GeoJSON(),
    url: schools_geojson,
  }),
  maxResolution: 15,
  style: new Style({
    fill: new Fill({
      color: 'rgba(216, 193, 227, 0.6)',
    }),
    stroke: new Stroke({
      color: '#ad31e8',
      width: 1,
    }),
  }),
});

// Add OSM Leisure/Parks layer
var leisureparks_geojson = require('./data/leisureparks_epsg4326.geojson')

var leisureparks = new VectorLayer({
  title: 'Leisure/Parks',
  source: new VectorSource({
    format: new GeoJSON(),
    url: leisureparks_geojson,
  }),
  maxResolution: 15,
  style: new Style({
    fill: new Fill({
      color: 'rgba(173, 237, 182, 0.6)',
    }),
    stroke: new Stroke({
      color: '#08961b',
      width: 1,
    }),
  }),
});

// Add Universities from GitHub
var universities_geojson = require('./data/universities_epsg4326.geojson')

var universities = new VectorLayer({
  title: 'Universities',
  source: new VectorSource({
    format: new GeoJSON(),
    url: universities_geojson,
  }),
  maxResolution: 15,
  style: new Style({
    fill: new Fill({
      color: 'rgba(121, 131, 242, 0.6)',
    }),
    stroke: new Stroke({
      color: '#1420a3',
      width: 1,
    }),
  }),
});

/*

WEIGHTED GRIDS

*/

// Add Weighted Grid (100km Resolution)
var grid100km_geojson = require('./data/weighted_grid100km.geojson')

var grid100km = new VectorLayer({
  title: 'Weighted Grid (100km)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid100km_geojson,
  }),
  minResolution: 400,
  style: classification_search_100km
});

// Add Weighted Grid (30km Resolution)
var grid30km_geojson = require('./data/weighted_grid30km.geojson')

var grid30km = new VectorLayer({
  title: 'Weighted Grid (30km)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid30km_geojson,
  }),
  minResolution: 15,
  maxResolution: 400,
  style: classification_search_30km
});

// Add Weighted Grid (1km Resolution - Fyn)
var grid1km_fyn_geojson = require('./data/weighted_grid1km_Fyn.geojson')

var grid1km_fyn = new VectorLayer({
  title: 'Weighted Grid (1km - Fyn)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid1km_fyn_geojson,
    strategy: bboxStrategy,
  }),
  maxResolution: 15,
  style: classification_search_1km,
  visible: false,
});

// Add Weighted Grid (1km Resolution - Hovestadden)
var grid1km_hovedstad_geojson = require('./data/weighted_grid1km_hovestad.geojson')

var grid1km_hovestad = new VectorLayer({
  title: 'Weighted Grid (1km - Hovedstadden)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid1km_hovedstad_geojson,
    strategy: bboxStrategy,
  }),
  maxResolution: 15,
  style: classification_search_1km,
  visible: false,
});

// Add Weighted Grid (1km Resolution - Midtjylland)
var grid1km_midtjylland_geojson = require('./data/weighted_grid1km_Midtjylland.geojson')

var grid1km_midtjylland = new VectorLayer({
  title: 'Weighted Grid (1km - Midtjylland)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid1km_midtjylland_geojson,
    strategy: bboxStrategy,
  }),
  maxResolution: 15,
  style: classification_search_1km,
  visible: false,
});

// Add Weighted Grid (1km Resolution - Midtjylland W)
var grid1km_midtjyllandw_geojson = require('./data/weighted_grid1km_MidtjyllandW.geojson')

var grid1km_midtjyllandw = new VectorLayer({
  title: 'Weighted Grid (1km - Midtjylland West)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid1km_midtjyllandw_geojson,
    strategy: bboxStrategy,
  }),
  maxResolution: 15,
  style: classification_search_1km,
  visible: false,
});

// Add Weighted Grid (1km Resolution - Nordjylland)
var grid1km_nordjylland_geojson = require('./data/weighted_grid1km_Nordjylland.geojson')

var grid1km_nordjylland = new VectorLayer({
  title: 'Weighted Grid (1km - Nordjylland)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid1km_nordjylland_geojson,
    strategy: bboxStrategy,
  }),
  maxResolution: 15,
  style: classification_search_1km,
  visible: false,
});

// Add Weighted Grid (1km Resolution - Sjælland)
var grid1km_sjælland_geojson = require('./data/weighted_grid1km_Sjælland.geojson')

var grid1km_sjælland = new VectorLayer({
  title: 'Weighted Grid (1km - Sjælland)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid1km_sjælland_geojson,
    strategy: bboxStrategy,
  }),
  maxResolution: 15,
  style: classification_search_1km,
  visible: false,
});

// Add Weighted Grid (1km Resolution - Syddanmark)
var grid1km_syddanmark_geojson = require('./data/weighted_grid1km_Syddanmark.geojson')

var grid1km_syddanmark = new VectorLayer({
  title: 'Weighted Grid (1km - Syddanmark)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid1km_syddanmark_geojson,
    strategy: bboxStrategy,
  }),
  maxResolution: 15,
  style: classification_search_1km,
  visible: false,
});

/*

VectorImage Testing

*/

// Hovestadden VectorImage
var grid1km_vectorimage_hovestad_geojson = require('./data/weighted_grid1km_hovestad.geojson')

var grid1km_vectorimage_hovestad = new VectorImageLayer({
  title: 'Hovedstadden VectorImage',
  imageRatio: 2,
  source: new VectorSource({
    url: grid1km_vectorimage_hovestad_geojson,
    format: new GeoJSON(),
  }),
  visible: true,
  maxResolution: 15,
  style: classification_search_1km,
});

// Fyn VectorImage
var grid1km_vectorimage_fyn_geojson = require('./data/weighted_grid1km_Fyn.geojson')

var grid1km_vectorimage_fyn = new VectorImageLayer({
  title: 'Fyn VectorImage',
  imageRatio: 2,
  source: new VectorSource({
    url: grid1km_vectorimage_fyn_geojson,
    format: new GeoJSON(),
  }),
  visible: false,
  maxResolution: 15,
  style: classification_search_1km,
});


// Midtjylland VectorImage
var grid1km_vectorimage_midtjylland_geojson = require('./data/weighted_grid1km_Midtjylland.geojson')

var grid1km_vectorimage_midtjylland = new VectorImageLayer({
  title: 'Midtjylland VectorImage',
  imageRatio: 2,
  source: new VectorSource({
    url: grid1km_vectorimage_midtjylland_geojson,
    format: new GeoJSON(),
  }),
  visible: false,
  maxResolution: 15,
  style: classification_search_1km,
});

// Midtjylland West VectorImage
var grid1km_vectorimage_midtjyllandw_geojson = require('./data/weighted_grid1km_MidtjyllandW.geojson')

var grid1km_vectorimage_midtjyllandw = new VectorImageLayer({
  title: 'Midtjylland West VectorImage',
  imageRatio: 2,
  source: new VectorSource({
    url: grid1km_vectorimage_midtjyllandw_geojson,
    format: new GeoJSON(),
  }),
  visible: false,
  maxResolution: 15,
  style: classification_search_1km,
});

// Nordjylland VectorImage
var grid1km_vectorimage_nordjylland_geojson = require('./data/weighted_grid1km_Nordjylland.geojson')

var grid1km_vectorimage_nordjylland = new VectorImageLayer({
  title: 'Nordjylland VectorImage',
  imageRatio: 2,
  source: new VectorSource({
    url: grid1km_vectorimage_nordjylland_geojson,
    format: new GeoJSON(),
  }),
  visible: false,
  maxResolution: 15,
  style: classification_search_1km,
});

// Sjælland VectorImage
var grid1km_vectorimage_sjælland_geojson = require('./data/weighted_grid1km_Sjælland.geojson')

var grid1km_vectorimage_sjælland = new VectorImageLayer({
  title: 'Sjælland VectorImage',
  imageRatio: 2,
  source: new VectorSource({
    url: grid1km_vectorimage_sjælland_geojson,
    format: new GeoJSON(),
  }),
  visible: false,
  maxResolution: 15,
  style: classification_search_1km,
});

// Syddanmark VectorImage
var grid1km_vectorimage_syddanmark_geojson = require('./data/weighted_grid1km_Syddanmark.geojson')

var grid1km_vectorimage_syddanmark = new VectorImageLayer({
  title: 'Syddanmark VectorImage',
  imageRatio: 2,
  source: new VectorSource({
    url: grid1km_vectorimage_syddanmark_geojson,
    format: new GeoJSON(),
  }),
  visible: false,
  maxResolution: 15,
  style: classification_search_1km,
});

var isolayer = new VectorLayer({
  title: 'isolayer',
  source: new VectorSource({
    format: new GeoJSON(),
    url: universities_geojson,
  }),
  maxResolution: 15,
  style: new Style({
    fill: new Fill({
      color: 'rgba(121, 131, 242, 0.6)',
    }),
    stroke: new Stroke({
      color: '#1420a3',
      width: 1,
    }),
  }),
});

// Scaleline
var scaleline = new ScaleLine();

// Legend/Layer Visibilty
var layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});

var key = 'XtxbqBNbF5eQwYXV37Ym'; // ABP's Key
var attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a> ' +
  '<a href="https://eng.sdfe.dk/" target="_blank">&copy; SDFE</a> ';

// Define layers to be mapped
var layers = [
  // Basemaps
  new Group({
    title: 'Basemap',
    fold: 'open',
    layers: [
      new TileLayer({
        title: 'OpenStreetMap',
        source: new OSM(),
        type: 'base'
      }),
      new TileLayer({
        title: 'MapTiler',
        source: new XYZ({
          attributions: attributions,
          url: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=' + key,
          maxZoom: 20,
          crossOrigin: '',
        }),
        type: 'base'
      }),
    ]
  }),
  // Data layers
  new Group({
    title: 'Data',
    layers: [
      new Group({
        title: 'Criteria Grids',
        layers: [
          grid100km,
          grid30km,
          //grid1km_fyn,
          //grid1km_hovestad,
          //grid1km_midtjylland,
          //grid1km_midtjyllandw,
          //grid1km_nordjylland,
          //grid1km_sjælland,
          //grid1km_syddanmark,
          grid1km_vectorimage_hovestad,
          grid1km_vectorimage_fyn,
          grid1km_vectorimage_midtjylland,
          grid1km_vectorimage_midtjyllandw,
          grid1km_vectorimage_nordjylland,
          grid1km_vectorimage_sjælland,
          grid1km_vectorimage_syddanmark
        ],
        fold: 'close',
      }),
      //universities,
      municipalities,
      //hospitals,
      //schools,
      //leisureparks,
      dk_boundary,
      //isolayer
    ]
  })
];

// Instantiate Geocoder.
var geocoder = new Geocoder('nominatim', {
  provider: 'osm',
  lang: 'en',
  placeholder: 'Enter Address (Denmark Only)...',
  limit: 5,
  keepOpen: false,
  debug: true,
  autoComplete: true,
  countrycodes: 'dk'
});

// Display pin for geocoding result.
geocoder.getLayer().setVisible(true);

// Define map view.
var mapView = new View({
  center: denmarkWebMercator,
  zoom: 7
});

// Define map
var map = new Map({
  controls: defaultControls().extend([scaleline, geocoder, layerSwitcher, new FullScreen(), new ZoomToExtent({
    extent: [
      644247.2179725806,
      7066697.228365138,
      1768177.2818778122,
      8142930.58662042],
  })]),
  layers: layers,
  view: mapView,
  target: 'map'
});

/*
var outsidercoordinate;

// Popup showing the position the user clicked
var popup = new Overlay({
  element: document.getElementById('popup'),
});
map.addOverlay(popup);

// Click Event for Popup (Work in Progress)
map.on('click', function (evt) {
  var element = popup.getElement();
  var coordinate = evt.coordinate;
  var coords = toLonLat(evt.coordinate);
  window.outsidercoordinate = coords;
  var hdms = toStringHDMS(toLonLat(coordinate));
  console.log(coordinate);
  console.log(coords)
  //console.log(toStringHDMS);

  $(element).popover('dispose');
  popup.setPosition(coordinate);
  $(element).popover({
    container: element,
    placement: 'top',
    animation: false,
    html: true,
    content: '<p>(WORK IN PROGRESS) The location you clicked was:</p><code>' + hdms + '</code>',
  });
  $(element).popover('show');
});

var selected = null;

map.on('pointermove', function (e) {
  if (selected !== null) {
    selected.setStyle(undefined);
    selected = null;
  }

  map.forEachFeatureAtPixel(e.pixel, function (f) {
    selected = f;
    f.setStyle(highlightStyle);
    return true;
  });
});

// API KEY 5b3ce3597851110001cf6248eff557cdb07c480cabced1a36192d99a

document.getElementById('isochroneActivate').onclick = function() {
  var isotransportation = window.rdValue;
  var isotimelimit = document.getElementById('myRange').value;
  var coordinate = window.outsidercoordinate;
  var coordinaterequest = coordinate.toString();
  console.log(coordinaterequest);
  console.log(isotimelimit);
  console.log(coordinate);
  console.log(isotransportation);
  console.log('{"locations":[[' + coordinate.toString() + ']],"range":['+ isotimelimit.toString() + ']"range_type":"time","units":"mi"}');

  var request = require('request');

  request({
    method: 'POST',
    url: 'https://api.openrouteservice.org/v2/isochrones/' + isotransportation,
    body: '{"locations":[[' + coordinate.toString() + ']],"range":['+ isotimelimit.toString() + '],"range_type":"time","units":"mi"}',
    headers: {
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      'Authorization': '5b3ce3597851110001cf6248eff557cdb07c480cabced1a36192d99a',
      'Content-Type': 'application/json; charset=utf-8'
    }}, function (error, response, body) {
    console.log('Status:', response.statusCode);
    console.log('Headers:', JSON.stringify(response.headers));
    console.log(response)
    console.log('Response:', body);
    var isochronejson = GeoJSON.parse(body);
    isolayer.getSource().clear();
    isolayer.getSource().addFeatures(isochronejson);
  });
};


// LAv om med den her?? https://github.com/GIScience/openrouteservice-js
*/

/*
DEFINE & UPDATE SLIDERS
*/

// Universities Slider
var sliderUni = document.getElementById("uniDistance");
var outputUni = document.getElementById("outUni");
outputUni.innerHTML = sliderUni.value;

// Update slider value
sliderUni.oninput = function() {
  outputUni.innerHTML = this.value;
};

// School Slider
var sliderSchools = document.getElementById("schoolDistance");
var outputSchools = document.getElementById("outSchool");
outputSchools.innerHTML = sliderSchools.value;

// Update slider value
sliderSchools.oninput = function() {
  outputSchools.innerHTML = this.value;
};

// Parks Slider
var sliderParks = document.getElementById("parksDistance");
var outputParks = document.getElementById("outParks");
outputParks.innerHTML = sliderParks.value;

// Update slider value
sliderParks.oninput = function() {
  outputParks.innerHTML = this.value;
};

// Roads Slider
var sliderRoads = document.getElementById("roadsDistance");
var outputRoads = document.getElementById("outRoads");
outputRoads.innerHTML = sliderRoads.value;

// Update slider value
sliderRoads.oninput = function() {
  outputRoads.innerHTML = this.value;
};

// Coastlines Slider
var sliderCoasts = document.getElementById("coastDistance");
var outputCoasts = document.getElementById("outCoast");
outputCoasts.innerHTML = sliderCoasts.value;

// Update slider value
sliderCoasts.oninput = function() {
  outputCoasts.innerHTML = this.value;
};

// Hospitals Slider
var sliderHospitals = document.getElementById("hospitalsDistance");
var outputHospitals = document.getElementById("outHospitals");
outputHospitals.innerHTML = sliderHospitals.value;

// Update slider value
sliderHospitals.oninput = function() {
  outputHospitals.innerHTML = this.value;
};

// Supermarkets Slider
var sliderMarkets = document.getElementById("marketsDistance");
var outputMarkets = document.getElementById("outMarkets");
outputMarkets.innerHTML = sliderMarkets.value;

// Update slider value
sliderMarkets.oninput = function() {
  outputMarkets.innerHTML = this.value;
};

// Water Bodies Slider
var sliderWater = document.getElementById("waterDistance");
var outputWater = document.getElementById("outWater");
outputWater.innerHTML = sliderWater.value;

// Update slider value
sliderWater.oninput = function() {
  outputWater.innerHTML = this.value;
};

// Public Transport Stops Slider
var sliderPstops = document.getElementById("pstopsDistance");
var outputPstops = document.getElementById("outPstops");
outputPstops.innerHTML = sliderPstops.value;

// Update slider value
sliderPstops.oninput = function() {
  outputPstops.innerHTML = this.value;
};

// Public Transport Stations Slider
var sliderPstations = document.getElementById("pstationsDistance");
var outputPstations = document.getElementById("outPstations");
outputPstations.innerHTML = sliderPstations.value;

// Update slider value
sliderPstations.oninput = function() {
  outputPstations.innerHTML = this.value;
};

// Restuarants Slider
var sliderRestuarants = document.getElementById("restuarantsDistance");
var outputRestuarants = document.getElementById("outRestuarants");
outputRestuarants.innerHTML = sliderRestuarants.value;

// Update slider value
sliderRestuarants.oninput = function() {
  outputRestuarants.innerHTML = this.value;
};

// Theatres Slider
var sliderTheatres = document.getElementById("theatreDistance");
var outputTheatres = document.getElementById("outTheatre");
outputTheatres.innerHTML = sliderTheatres.value;

// Update slider value
sliderTheatres.oninput = function() {
  outputTheatres.innerHTML = this.value;
};

// Cinemas Slider
var sliderCinemas = document.getElementById("cinemasDistance");
var outputCinemas = document.getElementById("outCinemas");
outputCinemas.innerHTML = sliderCinemas.value;

// Update slider value
sliderCinemas.oninput = function() {
  outputCinemas.innerHTML = this.value;
};

// Kindergarten Slider
var sliderKinder = document.getElementById("kinderDistance");
var outputKinder = document.getElementById("outKinder");
outputKinder.innerHTML = sliderKinder.value;

// Update slider value
sliderKinder.oninput = function() {
  outputKinder.innerHTML = this.value;
};

// Industry Slider
var sliderIndustry = document.getElementById("industryDistance");
var outputIndustry = document.getElementById("outIndustry");
outputIndustry.innerHTML = sliderIndustry.value;

// Update slider value
sliderIndustry.oninput = function() {
  outputIndustry.innerHTML = this.value;
};

/*

STLYE GRIDS BASED ON USER INPUT

Categories(field name): coastline(_coastline), hospitals(_hospitals), leisure parks(_leisurepa), roads(_roadsmean), schools(_schoolsme), supermarkets(_supermark), universities(_universit), water bodies(_waterbodi), public transport stations(_pt_statio), public transport stops(_pt_stopsm), restuarants(_restauran), theatres(_theatresm), cinemas(_cinemasme), and kindergartens(_kindermea)

*/

// Commit Search Button Feature
function commitSearchFunction() {
  // Calculate Weights for 100km Grid
  var source_100km = grid100km.getSource();
  var features_100km = source_100km.getFeatures();
  var counter_100 = 1; // Count features for testing
  
    features_100km.forEach(function(feature){
      var new_fuzzy_value_100km = (((parseInt(sliderCoasts.value)/(feature.get("_coastline")/1000)) + (parseInt(sliderHospitals.value)/(feature.get("_hospitals")/1000)) + (parseInt(sliderParks.value)/(feature.get("_leisurepa")/1000)) + (parseInt(sliderRoads.value)/(feature.get("_roadsmean")/1000)) + (parseInt(sliderSchools.value)/(feature.get("_schoolsme")/1000)) + (parseInt(sliderMarkets.value)/(feature.get("_supermark")/1000)) + (parseInt(sliderUni.value)/(feature.get("_universit")/1000)) + (parseInt(sliderWater.value)/(feature.get("_waterbodi")/1000)) + (parseInt(sliderPstations.value)/(feature.get("_pt_statio")/1000)) + (parseInt(sliderPstops.value)/(feature.get("_pt_stopsm")/1000)) + (parseInt(sliderRestuarants.value)/(feature.get("_restauran")/1000)) + (parseInt(sliderTheatres.value)/(feature.get("_theatresm")/1000)) + (parseInt(sliderCinemas.value)/(feature.get("_cinemasme")/1000)) + (parseInt(sliderKinder.value)/feature.get("_kindermea")) + (parseInt(sliderIndustry.value)/(feature.get("_industrie")/1000))) / 261.23441535189943); //15.28740076513416
      feature.set("fuzzyvalue", new_fuzzy_value_100km);
      console.log("100km->" + counter_100 + ". " + "Feature " + feature.get("id") + ": " + new_fuzzy_value_100km); // Log values for testing
      counter_100 += 1;
    });

  // Calculate Weights for 30km Grid
  var source_30km = grid30km.getSource();
  var features_30km = source_30km.getFeatures();
  //var counter_30 = 1; // Count features for testing

  features_30km.forEach(function(feature){
    var new_fuzzy_value_30km = (((parseInt(sliderCoasts.value)/(feature.get("_coastline")/1000)) + (parseInt(sliderHospitals.value)/(feature.get("_hospitals")/1000)) + (parseInt(sliderParks.value)/(feature.get("_leisurepa")/1000)) + (parseInt(sliderRoads.value)/(feature.get("_roadsmean")/1000)) + (parseInt(sliderSchools.value)/(feature.get("_schoolsme")/1000)) + (parseInt(sliderMarkets.value)/(feature.get("_supermark")/1000)) + (parseInt(sliderUni.value)/(feature.get("_universit")/1000)) + (parseInt(sliderWater.value)/(feature.get("_waterbodi")/1000)) + (parseInt(sliderPstations.value)/(feature.get("_pt_statio")/1000)) + (parseInt(sliderPstops.value)/(feature.get("_pt_stopsm")/1000)) + (parseInt(sliderRestuarants.value)/(feature.get("_restauran")/1000)) + (parseInt(sliderTheatres.value)/(feature.get("_theatresm")/1000)) + (parseInt(sliderCinemas.value)/(feature.get("_cinemasme")/1000)) + (parseInt(sliderKinder.value)/feature.get("_kindermea")) + (parseInt(sliderIndustry.value)/(feature.get("_industrie")/1000))) / 534.6083673974823);
    feature.set("fuzzyvalue", new_fuzzy_value_30km);
    //console.log("30km->" + counter_30 + ". " + "Feature " + feature.get("id") + ": " + new_fuzzy_value_30km); // Log values for testing
    //counter_30 += 1;
  });

  // Calculate Weights for 1km Grid
  var source_1km = grid1km_vectorimage_hovestad.getSource();
  var features_1km = source_1km.getFeatures();
  var counter_1 = 1; // Count features for testing

  features_1km.forEach(function(feature){
    var new_fuzzy_value_1km = (((feature.get("_coastline")/1000) / sliderCoasts.value) + ((feature.get("_hospitals")/1000) / sliderHospitals.value) + ((feature.get("_leisurepa")/1000) / sliderParks.value) + ((feature.get("_roadsmean")/1000) / sliderRoads.value) + ((feature.get("_schoolsme")/1000) / sliderSchools.value) + ((feature.get("_supermark")/1000) / sliderMarkets.value) + ((feature.get("_universit")/1000) / sliderUni.value) + ((feature.get("_waterbodi")/1000) / sliderWater.value) + ((feature.get("_pt_statio")/1000) / sliderPstations.value) + ((feature.get("_pt_stopsm")/1000) / sliderPstops.value) + ((feature.get("_restauran")/1000) / sliderRestuarants.value) + ((feature.get("_theatresm")/1000) / sliderTheatres.value) + ((feature.get("_cinemasme")/1000) / sliderCinemas.value) + ((feature.get("_kindermea")/1000) / sliderKinder.value) / 14);
    feature.set("fuzzyvalue", new_fuzzy_value_1km);
    console.log("1km->" + counter_1 + ". " + "Feature " + feature.get("id") + ": " + new_fuzzy_value_1km); // Log values for testing
    counter_1 += 1;
  });
 };

/*
// Calculate Weights for 1km Grid - CLEANED FILE
var source_1km = grid1km_vectorimage.getSource();
var features_1km = source_1km.getFeatures();
//var counter_1 = 1; // Count features for testing

features_1km.forEach(function(feature){
  var new_fuzzy_value_1km = ((feature.get("coastmean") / sliderCoasts.value) + (feature.get("hospitalsm") / sliderHospitals.value) + (feature.get("parksmean") / sliderParks.value) + (feature.get("roadsmean") / sliderRoads.value) + (feature.get("schoolsmea") / sliderSchools.value) + (feature.get("marketsmea") / sliderMarkets.value) + (feature.get("unimean") / sliderUni.value) + (feature.get("watermean") / sliderWater.value) + (feature.get("ptstatmean") / sliderPstations.value) + (feature.get("ptstopmean") / sliderPstops.value) + (feature.get("foodmean") / sliderRestuarants.value) + (feature.get("theatremea") / sliderTheatres.value) + (feature.get("cinemamean") / sliderCinemas.value) + (feature.get("kindermean") / sliderKinder.value) / 14);
  feature.set("fuzzyvalue", new_fuzzy_value_1km);
  //console.log("1km->" + counter_1 + ". " + "Feature " + feature.get("uid") + ": " + new_fuzzy_value_1km); // Log values for testing
  //counter_1 += 1;
  });
};
*/

// Trigger 'Commit Search' button on click
let bttn = document.getElementById("commitButton");
bttn.addEventListener("click", commitSearchFunction, false);

map.addOverlay(overlay);

/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function (evt) {
var feature = map.forEachFeatureAtPixel(evt.pixel,
  function(feature, layer) {
    // Work only if the click on the grid layer
    if (layer == grid100km, grid30km) {
    return feature;
    }
  });
  // Show the property of the feature
  var content = 'This cell is a <b>' + (feature.get('fuzzyvalue')*100).toFixed(2).toString() + '%</b> match given your inputs!<br>';
  content += 'Avg Distance to <u>Coastline</u>: <b>' + (feature.get('_coastline')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Hospitals</u>: <b>' + (feature.get('_hospitals')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Parks</u>: <b>' + (feature.get('_leisurepa')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Major Roads</u>: <b>' + (feature.get('_roadsmean')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Schools</u>: <b>' + (feature.get('_schoolsme')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Grocery Stores</u>: <b>' + (feature.get('_supermark')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Universities</u>: <b>' + (feature.get('_universit')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Water Bodies</u>: <b>' + (feature.get('_waterbodi')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Bus Stops</u>: <b>' + (feature.get('_pt_stopsm')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Train Stations</u>: <b>' + (feature.get('_pt_statio')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Restaurants</u>: <b>' + (feature.get('_restauran')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Theatres</u>: <b>' + (feature.get('_theatresm')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Cinemas</u>: <b>' + (feature.get('_cinemasme')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Kindergartens</u>: <b>' + (feature.get('_kindermea')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content += 'Avg Distance to <u>Industry</u>: <b>' + (feature.get('_industrie')/1000).toFixed(0).toString() + ' km</b>' + '<br>';
  content_element.innerHTML = content;
  overlay.setPosition(evt.coordinate);

  var overall_percent = (feature.get('fuzzyvalue')*100).toFixed(2).toString();
  var coast_value = ((feature.get('_coastline')/1000)/sliderCoasts.value).toFixed(0).toString();
  var hospital_value = ((feature.get('_hospitals')/1000)/sliderHospitals.value).toFixed(0).toString();
  var parks_value = ((feature.get('_leisurepa')/1000)/sliderParks.value).toFixed(0).toString();
  var roads_value = ((feature.get('_roadsmean')/1000)/sliderRoads.value).toFixed(0).toString();
  var schools_value = ((feature.get('_schoolsme')/1000)/sliderSchools.value).toFixed(0).toString();
  var markets_value = ((feature.get('_supermark')/1000)/sliderMarkets.value).toFixed(0).toString();
  var uni_value = ((feature.get('_universit')/1000)/sliderUni.value).toFixed(0).toString();
  var water_value = ((feature.get('_waterbodi')/1000)/sliderWater.value).toFixed(0).toString();
  var ptstops_value = ((feature.get('_pt_stopsm')/1000)/sliderPstops.value).toFixed(0).toString();
  var ptstat_value = ((feature.get('_pt_statio')/1000)/sliderPstations.value).toFixed(0).toString();
  var rest_value = ((feature.get('_restauran')/1000)/sliderRestuarants.value).toFixed(0).toString();
  var theatre_value = ((feature.get('_theatresm')/1000)/sliderTheatres.value).toFixed(0).toString();
  var cinema_value = ((feature.get('_cinemasme')/1000)/sliderCinemas.value).toFixed(0).toString();
  var kinder_value = ((feature.get('_kindermea')/1000)/sliderKinder.value).toFixed(0).toString();
  var industry_value = ((feature.get('_industrie')/1000)/sliderIndustry.value).toFixed(0).toString();

  info_element.innerHTML = overall_percent;

  console.info(feature.getProperties());

  var ctx = document.getElementById('myChart').getContext('2d');
  // before drawing a new chart
  if (myChart != null) {
    myChart.destroy();
  }
  else {
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Coasts', 'Hospitals', 'Parks', 'Roads', 'Schools', 'Markets', 'Universities', 'Water Bodies', 'Bus Stops', 'Train Stations', 'Restaurants', 'Theatres', 'Cinemas', 'Kindergartens', 'Industry'],
            datasets: [{
                label: 'Percent Match (%)',
                data: [coast_value, hospital_value, parks_value, roads_value, schools_value, markets_value, uni_value, water_value, ptstops_value, ptstat_value, rest_value, theatre_value, cinema_value, kinder_value, industry_value],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
  }
});

// Change the cursor if on targer layer
map.on('pointermove', function(e) {
  if (e.dragging) return;

  var pixel = e.map.getEventPixel(e.originalEvent);
  var hit = false;
  e.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
    if (layer === grid100km, grid30km) {
          hit = true;
     }
  });

  e.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});