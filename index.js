import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import {GeoJSON, WFS, GML3, KML, GML} from 'ol/format';
import {Text, Style, Stroke, Fill} from 'ol/style';
import {Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer} from 'ol/layer';
import {fromLonLat, toLonLat, transform} from 'ol/proj';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import {toStringHDMS} from 'ol/coordinate';
import {Control, ScaleLine, ZoomToExtent, defaults as defaultControls} from 'ol/control';
import TopoJSON from 'ol/format/TopoJSON';
import Geocoder from 'ol-geocoder';
import LayerGroup from 'ol/layer/Group';
import SourceOSM from 'ol/source/OSM';
import SourceStamen from 'ol/source/Stamen';
import LayerSwitcher from 'ol-layerswitcher';
import {BaseLayerOptions, GroupLayerOptions} from 'ol-layerswitcher';

// Designate Center of Map
const denmarkLonLat = [10.835589, 56.232371];
const denmarkWebMercator = fromLonLat(denmarkLonLat);

// Home Icon for default extent button
var home_icon = document.createElement('home');
home_icon.innerHTML = '<img src="https://image.flaticon.com/icons/png/512/69/69524.png" width="20" height="20">';

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
});

// Add OSM hospitals layer
var hospitals = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'hospitals.geojson',
  }),
  style:new Style({
       stroke:new Stroke({
        color:'rgba(255,0,0,0.5)',
         width:60
    }),
    fill:new Fill({
    color:'rgba(255,0,0,0.5)',
    })
    })
});

// Scaleline
var scaleline = new ScaleLine();

// Legend/Layer Visibilty
var layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});


// Define layers to be mapped
var layers = [
  new TileLayer({
    source: new OSM(),
  }),
  municipalities,
  hospitals,
  cities,
  dk_boundary
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
  controls: defaultControls().extend([scaleline, geocoder, layerSwitcher]),
  layers: layers,
  view: mapView,
  target: 'map'
});

// Popup showing the position the user clicked
var popup = new Overlay({
  element: document.getElementById('popup'),
});
map.addOverlay(popup);

// Click Event for Popup (Work in Progress)
map.on('click', function (evt) {
  var element = popup.getElement();
  var coordinate = evt.coordinate;
  var hdms = toStringHDMS(toLonLat(coordinate));

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