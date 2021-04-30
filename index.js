import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import Map from 'ol/Map';
import View from 'ol/View';
import {GeoJSON, WFS, GML3, KML, GML} from 'ol/format';
import {Text, Style, Stroke, Fill} from 'ol/style';
import {Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer, Group} from 'ol/layer';
import {fromLonLat, toLonLat, transform} from 'ol/proj';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import {toStringHDMS} from 'ol/coordinate';
import {Control, ScaleLine, ZoomToExtent, defaults as defaultControls, FullScreen} from 'ol/control';
import TopoJSON from 'ol/format/TopoJSON';
import Geocoder from 'ol-geocoder';
import LayerGroup from 'ol/layer/Group';
import SourceOSM from 'ol/source/OSM';
import SourceStamen from 'ol/source/Stamen';
import LayerSwitcher from 'ol-layerswitcher';
import {BaseLayerOptions, GroupLayerOptions} from 'ol-layerswitcher';
import Draw from 'ol/interaction/Draw';
import {Vector as VectorSource} from 'ol/source';
import XYZ from 'ol/source/XYZ';
import Select from 'ol/interaction/Select';
import {altKeyOnly, click, pointerMove} from 'ol/events/condition';

// Designate Center of Map
const denmarkLonLat = [10.835589, 56.232371];
const denmarkWebMercator = fromLonLat(denmarkLonLat);

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
  visible: true,
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

/*
// Add cities from GitHub
var cities = new VectorLayer({
  title: 'Cities',
  source: new VectorSource({
    format: new GeoJSON(),
    url: "https://raw.githubusercontent.com/drei01/geojson-world-cities/master/cities.geojson",
  }),
  style: function(feature) {
    style.getText().setText(feature.get('CITIES'));
    return style;
  },
  minResolution: 15,
  maxResolution: 400,
});
*/

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

// Add Weighted Grid (100km Resolution)
var grid100km_geojson = require('./data/weighted_grid100km.geojson')

var grid100km = new VectorLayer({
  title: 'Weighted Grid (100km)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid100km_geojson,
  }),
  minResolution: 400,
  fill: new Fill({
    color: 'rgba(158, 240, 255, 0.6)',
  }),
  style: new Style({
    stroke: new Stroke({
      color: '#0095b0',
      width: 1,
    }),
  }),
});

// Add Weighted Grid (100km Resolution)
var grid30km_geojson = require('./data/weighted_grid30km.geojson')

var grid30km = new VectorLayer({
  title: 'Weighted Grid (30km)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid30km_geojson,
  }),
  minResolution: 15,
  maxResolution: 400,
  fill: new Fill({
    color: 'rgba(158, 240, 255, 0.6)',
  }),
  style: new Style({
    stroke: new Stroke({
      color: '#0095b0',
      width: 1,
    }),
  }),
});

// Add Weighted Grid (1km Resolution)
var grid1km_geojson = require('./data/weighted_grid1km.geojson')

var grid1km = new VectorLayer({
  title: 'Weighted Grid (1km)',
  source: new VectorSource({
    format: new GeoJSON(),
    url: grid1km_geojson,
  }),
  maxResolution: 15,
  fill: new Fill({
    color: 'rgba(158, 240, 255, 0.6)',
  }),
  style: new Style({
    stroke: new Stroke({
      color: '#0095b0',
      width: 1,
    }),
  }),
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
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

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
      grid100km,
      grid30km,
      grid1km,
      universities,
      municipalities,
      hospitals,
      schools,
      leisureparks,
      //cities,
      dk_boundary,
      isolayer
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

/*
var zoomToExtentControl = new ZoomToExtent({
  extent: [346219.65, 8159203.94, 2074586.54, 7003599.95]
});
*/

// Define map
var map = new Map({
  controls: defaultControls().extend([scaleline, geocoder, layerSwitcher, new FullScreen()]),
  layers: layers,
  view: mapView,
  target: 'map'
});

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

var view = map.getView();
var zoom = view.getZoom();
var center = view.getCenter();

document.getElementById('zoom-restore').onclick = function() {
  view.setCenter(center);
  view.setZoom(zoom);
};

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
