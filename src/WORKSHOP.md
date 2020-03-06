---
header-includes: 
- <script type="text/javascript" src="http://livejs.com/live.js"></script>
- <style>.caption{font-style:italic;}</style>
---

# PDOK Webservices Workshop
<!-- TOC -->
- [PDOK Webservices Workshop](#pdok-webservices-workshop)
    - [Introduction](#introduction)
        - [PDOK webservices](#pdok-webservices)
        - [SDI NL](#sdi-nl)
        - [Standards- OGC - Geonovum](#standards--ogc---geonovum)
        - [Findability / metadata / NGR](#findability--metadata--ngr)
    - [Focus on map services](#focus-on-map-services)
        - [WMS](#wms)
        - [Tiled WMS](#tiled-wms)
        - [Vector Tiles](#vector-tiles)
- [Workshop](#workshop)
    - [1. Setting up NPM project with OpenLayers](#1-setting-up-npm-project-with-openlayers)
    - [2. Adding base map to viewer](#2-adding-base-map-to-viewer)
    - [3. Adding WMS to viewer](#3-adding-wms-to-viewer)
        - [3.1 Adding WMS layer to viewer](#31-adding-wms-layer-to-viewer)
        - [3.2 Adding featureinfo on click to viewer](#32-adding-featureinfo-on-click-to-viewer)
    - [4. Adding a GeoJSON layer to your map](#4-adding-a-geojson-layer-to-your-map)
        - [4.1 Preprocessing the data](#41-preprocessing-the-data)
        - [4.2 Add a GeoJSON layer to the map](#42-add-a-geojson-layer-to-the-map)
    - [5. Using the PDOK Location Server](#5-using-the-pdok-location-server)
- [Referenties](#referenties)

<!-- /TOC -->



## Introduction

In this workshop you will build a dynamic map on a web page displaying the PDOK geo-webservices. The web application is build with OpenLayers version 6.2.1, an Open Source Javascript library. 

https://www.dropbox.com/sh/6j3e40thy9pspoi/AACS2NCHaT0h8JbKLTDSpZx9a?dl=0

### PDOK webservices

- Explain what PDOK is. 
- Explain what services we provide

### SDI NL

### Standards- OGC - Geonovum

### Findability / metadata / NGR

## Focus on map services

Explain differences between data en map services. Explain focus on Map services

### WMS

### Tiled WMS

### Vector Tiles 


# Workshop

## 1. Setting up NPM project with OpenLayers

> TODO: Summary of section. 

Run the following commands from the root of this repository:

```bash
mkdir webapp && cd webapp
npm init -y 
npm install ol
npm install --save-dev parcel-bundler eslint
```

Then setup ESLint by running `eslinit --init` and answer questions with:

- How would you like to use ESLint?
    - To check syntax, find problems, and enforce code style
- What type of modules does your project use? (Use arrow keys)
    - JavaScript modules (import/export)
- Which framework does your project use? 
    - None of these 
- Does your project use TypeScript? 
    - n
- Where does your code run?
    - Browser
- Which style guide do you want to follow? 
    - Use a popular style guide
- Which style guide do you want to follow? 
    - Standard: https://github.com/standard/standard
- What format do you want your config file to be in? (Use arrow keys)
    - JavaScript 
- Would you like to install them now with npm?
    - y

Now let's start coding, create the file `index.js` in the folder `webapp` with the following content:

```js
import 'ol/ol.css'
import { Map, View } from 'ol'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile.js'
import {fromLonLat} from 'ol/proj'

var map = new Map({ // eslint-disable-line no-unused-vars
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([5.43, 52.18]),
    zoom: 8
  })
})
```

The above JavaScript file uses the [`OSM`](https://openlayers.org/en/v6.2.1/apidoc/module-ol_source_OSM-OSM.html) class to add the [standard OpenStreetMap (OSM) tile layer](https://wiki.openstreetmap.org/wiki/Standard_tile_layer).

Create the file `index.html` in the folder `webapp` with the following content:

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>PDOK Webservices</title>
    <style>
        html,
        body {
            height: 100%;
            margin: 0px;
        }

        #map {
            height: 100%;
        }
    </style>
</head>

<body>
    <div id="map"></div>
    <script src="./index.js"></script>
</body>

</html>
```

Replace the empty `scripts` element in the `webapp/package.json` file with the following:

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "parcel index.html",
    "build": "parcel build --public-url . index.html"
}
```

No run the following command from the `webapp/` directory:

```
npm start
```

Visit [`http://localhost:1234/`](http://localhost:1234/) to view the results. If correct you should see a interactive map in your browser with the default OpenLayers basemap.

![First map!](images/viewer_step1.png "First map!")

## 2. Adding base map to viewer

> TODO: Summary of section. 

Replace the code in `viewer/index.js` with the following:

```js
import 'ol/ol.css'
import { Map, View } from 'ol'
import WMTSSource from 'ol/source/WMTS'
import TileLayer from 'ol/layer/Tile.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import { get as getProjection, fromLonLat } from 'ol/proj'
import { getTopLeft, getWidth } from 'ol/extent.js'

const projection = getProjection('EPSG:3857')
const projectionExtent = projection.getExtent()
const size = getWidth(projectionExtent) / 256
const resolutions = new Array(20)
const matrixIds = new Array(20)

for (let z = 0; z < 20; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  // see https://openlayers.org/en/latest/examples/wmts.html
  resolutions[z] = size / Math.pow(2, z)
  matrixIds[z] = z
}

const baseMapLayer = new TileLayer({
  extent: projectionExtent,
  source: new WMTSSource({
    url: 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts',
    layer: 'brtachtergrondkaartgrijs',
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    attributions: 'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default'
  })
})

const map = new Map({ // eslint-disable-line no-unused-vars
  layers: [
    baseMapLayer
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([5.43, 52.18]),
    zoom: 8
  })
})
```

![BRT-Achtergrondkaart](images/brta.png "BRT-Achtergrondkaart")

## 3. Adding WMS to viewer

> TODO: Summary of section. 

### 3.1 Adding WMS layer to viewer

Now we have good looking basemap it is time to display something on top of it. 

[*NWB Wegen*](https://www.pdok.nl/introductie/-/article/nationaal-wegen-bestand-nwb-) dataset which is also published as a WMS service. The *Geo Services* tab provides a [WMS service url](https://geodata.nationaalgeoregister.nl/nwbwegen/wms?request=GetCapabilities&service=wms). The URL provided links to the `capabilities` document, which describes what the service is capable of. The capabilities document lists which layers, styles, image formats and projections are available and more.

To add the `wegvakken` layer from the WMS service to the map add the following to the `view/index.js` document before the declaration of the `map` object and do not forget to add `wsmLayer` to the map object. We also need to set the zoomlevel of the initial view to `14` in order to see the WMS layer. This is due to the way this WMS service is configured, in the capabilities document the `wegvakken` layer has a `MaxScaleDenominator` property set to `50000`. This means that the layer is visible from scale `1:1` until `1:50000`. In terms of WMTS zoomlevels this means that layer is visible from zoomlevel `14` and up.

```js
import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'

const wmsSource = new ImageWMS({
  url: 'https://geodata.nationaalgeoregister.nl/nwbwegen/wms?',
  crossOrigin: 'anonymous',
  params: { LAYERS: 'wegvakken' }
})

const wsmLayer = new ImageLayer({
  extent: projectionExtent,
  source: wmsSource
})

const map = new Map({ // eslint-disable-line no-unused-vars
  layers: [
    baseMapLayer,
    wsmLayer
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([5.43, 52.18]),
    zoom: 14
  })
})

```
Your map application should now display the `wegvakken` layer:

![WMS layer](images/wms_layer.png "WMS layer")

> TODO: explain about scale dependent layer in the WMS, and other disadvantages of the WMS. 

### 3.2 Adding featureinfo on click to viewer

The WMS standard provides a mechanism to retrieve information of features, the underlying vector data of the map. The request do retrieve feature information is called `GetFeatureInfo`. The WMS specification does not require the implementation of the `GetFeatureInfo` request, therefore a client should always check in the [capabilities document](https://geodata.nationaalgeoregister.nl/nwbwegen/wms?request=GetCapabilities&service=wms) if the service support the `GetFeatureInfo` request. The NWB wegen WMS supports the `GetFeatureInfo` request, it is listed in the `Capability/Request` element in the XML. 

In this section we are going to add functionality so show a popup with feature information when a users clicks on the map. To do this add the following to the `body` element of `index.html`, before the `script.js` inclusion:

```html
<div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content"></div>
</div>
```

Add the following code to `index.js` before the `map` constant declaration:

```js
import Overlay from 'ol/Overlay'

// Elements that make up the popup.
var container = document.getElementById('popup')
var content = document.getElementById('popup-content')
var closer = document.getElementById('popup-closer')

// Create an overlay to anchor the popup to the map.
var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
})

// Add a click handler to hide the popup.
closer.onclick = function () {
  overlay.setPosition(undefined)
  closer.blur()
  return false
}
```

Add the `overlay` const to the `map` object:

```js
const map = new Map({
  layers: [
    baseMapLayer,
    wsmLayer
  ],
  target: 'map',
  overlays: [overlay],
  view: new View({
    center: fromLonLat([5.43, 52.18]),
    zoom: 14
  })
})
```

Add the `singleclick` eventhandler on the map object below the `map` declaration in `index.js`:

```js
map.on('singleclick', function(evt) {
  // clean content of popup on every new singeclick event
  if (content.childNodes.length > 0) content.childNodes[0].remove()
  var viewResolution = /** @type {number} */ (map.getView().getResolution());
  var url = wmsSource.getFeatureInfoUrl(
    evt.coordinate, viewResolution, 'EPSG:3857',
    {'INFO_FORMAT': 'application/json'});
  if (url) {
    fetch(url)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        // set overlay position to undefined to hide popup
        if (data.features.length == 0){
          overlay.setPosition(undefined)
          return
        }
        let ft = data.features[0]
        let table = document.createElement("table")
        var header = table.createTHead()
        var row = header.insertRow()
        let i=0
        Object.keys(ft.properties).forEach(function(item){
          let cell = row.insertCell(i)
          cell.innerHTML = item
          i++
        })
        let body = table.createTBody()
        row = body.insertRow()
        i=0
        Object.keys(ft.properties).forEach(function(item){
          let cell = row.insertCell(i)
          cell.innerHTML = ft.properties[item]
          i++
        })
        content.appendChild(table)
        overlay.setPosition(evt.coordinate)
      });
  }
});
```

And add the following CSS to a new `index.css` file in the root of the `webapp` folder:

```css
html, body {
    height: 100%;
    margin: 0px;
}

#map {
    height: 100%;
}

.ol-popup {
    position: absolute;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 280px;
    max-width: 600px;
    padding-top: 20px;
}

.ol-popup:after, .ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}

.ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
}

.ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
}

.ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
}

.ol-popup-closer:visited {
    text-decoration: inherit;
    color: inherit;
    cursor: auto;
}

.ol-popup-closer:after {
    content: "✖";
}

#popup-content {
    overflow-x: scroll;
}

table {
    border: none;
    border-collapse: collapse;
    font-family: sans-serif;
}

table td {
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    padding-left: 0.5em;
    padding-right: 0.5em;
}

thead>tr>td {
    border-bottom: 1px solid #ddd;
    font-weight: 600;
}

table td:first-child {
    border-left: none;
}

table td:last-child {
    border-right: none;
}

tbody td:nth-of-type(odd), thead td:nth-of-type(odd) {
    background: #E6E6E6;
}
```

Remove the `style` element from the `index.html` file and replace with:

```html
<link rel="stylesheet" type="text/css" href="index.css">
```


Reload the webapp in the browser,now the map should display a popover when a feature is clicked on the map.

![Feature information](images/get_feature_info.png "Feature information")

What happens in the background is that OpenLayers registers on which pixel coordinate a user clicks. This is information is combined with the query parameters of the previous WMS `GetMap` request, to create a `GetFeatureInfo` request. In the below example `GetFeatureInfo` request the user clicked on pixel coordinate `50,50` of an image with `WIDTH` and `HEIGHT` of `101,101`, [this](https://geodata.nationaalgeoregister.nl/nwbwegen/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=wegvakken&CRS=EPSG%3A3857&STYLES=&WIDTH=101&HEIGHT=101&BBOX=603781.6790671768%2C6831433.221161786%2C604746.696549277%2C6832398.238643886) is the corresponding `GetMap` request.

```
https://geodata.nationaalgeoregister.nl/nwbwegen/wms?SERVICE=WMS&
VERSION=1.3.0&
REQUEST=GetFeatureInfo&
FORMAT=image%2Fpng&
TRANSPARENT=true&
QUERY_LAYERS=wegvakken&
LAYERS=wegvakken&
INFO_FORMAT=application%2Fjson&
I=50&
J=50&
CRS=EPSG%3A3857&
STYLES=&
WIDTH=101&
HEIGHT=101&
BBOX=603781.6790671768%2C6831433.221161786%2C604746.696549277%2C6832398.238643886
```

## 4. Adding a GeoJSON layer to your map

>  TODO: The advantage of using WMS/WMTS services is that you do not have take rendering performance into consideration, that is the job the server. 

A different approach to displaying geographical data is, instead of using WMS and WMTS services, downloading the vector data in the client and displaying the vector data directly. In this scenario there is no need for a server and gives you complete freedom of styling of the data. One major drawback of this approach is performance, processing power on the client is limited; there is a upper limit on the number of features you can load in your map (at once).

When rendering geographical data directly on the client rendering performance is a concern. You can optimize for this by preprocessing your data to either:

1. Reduce the size of the dataset by removing features
2. Reduce the size of the dataset by simplifcation of the geometries (aggregation, generalization)

> TODO: include, yes, no? Another technique to improve performance is to load features from the data incrementally into map application, instead all of once. This can be done with the client side vector tile library [geojson-vt](https://github.com/mapbox/geojson-vt) JavaScript library. 

In this workshop we only do preprocessing of the data to reduce the size of the dataset. This is done by selecting only the motorways (A wegen) and joining the seperate segments into one geometry grouped by the roadletter and roadnumber combination (for instance group by A1, A2, A348 etcetera). We will use the `ogr2ogr` commandline utility for data processing.

### 4.1 Preprocessing the data

In this chapter we are going to create a map of the Dutch motor ways, directly rendered in the browser from a GeoJSON file. We will use the [NWB Wegen dataset](https://www.pdok.nl/introductie/-/article/nationaal-wegen-bestand-nwb-), PDOK provides WMS en WFS services and also a direct download service. In this case we will use the PDOK download service, since we want to obtain the full dataset.

```bash
curl "http://geodata.nationaalgeoregister.nl/nwbwegen/extract/nwbwegen.zip" -o ~/Downloads/nwbwegen.zip
unzip ~/Downloads/nwbwegen.zip -d ~/Downloads/nwbwegen/ && rm ~/Downloads/nwbwegen.zip
```

Open the Shapefile in QGIS to inspect data from the NWB wegen dataset, Shapefile is located in: `~/Downloads/nwbwegen/geogegevens/shapefile/nederland_totaal/wegvakken/wegvakken.shp`

![NWB Wegen in QGIS](images/qgis_nwb.png "NWB Wegen in QGIS")

You will notice that QGIS has a hard time rendering all the features at once when viewing the full extent of the Netherlands. This is a sure sign your browser will have a hard time rendering all this data. To make life easy for the browser we will extract only the motorways froms this dataset. 

Another concern is that the roads in the `wegvakken` layer from NWB-wegen are divided in many seperate segments. This is not ideal for styling and labelling the in the webapplication. Therefore we need to merge the geometries, and we can immediately group them by route-letter and route-number (A2, A10, A348, etcetera). 

First step is to convert the shapefile to GPKG and select only the `A` routes ([GeoPackage](https://en.wikipedia.org/wiki/GeoPackage) is the superior geospatial file format, although Shapefile is [refusing](https://twitter.com/shapefiie) to go away).

```bash
ogr2ogr -f GPKG /tmp/nwb.gpkg ~/Downloads/nwbwegen/geogegevens/shapefile/nederland_totaal/wegvakken/wegvakken.shp -sql "select * from wegvakken where routeltr = 'A'" -nln wegvakken_a
```

The add a new column `route` to the wegvakken table and set the value to `routeltr+routenr`:

```bash 
ogrinfo /tmp/nwb.gpkg -sql "alter table wegvakken_a add column route TEXT"
ogrinfo /tmp/nwb.gpkg -sql "update wegvakken_a set route=routeltr||routenr"
```
Now you are ready to group the geometries by the newly created `route` attribute and merge geometries of this group:

```bash
ogr2ogr -update -f GPKG  /tmp/nwb.gpkg /tmp/nwb.gpkg -sql "SELECT ST_Union(_ogr_geometry_) as geom, route FROM wegvakken_a GROUP BY route" -nln snelwegen -nlt MULTILINESTRING
```

Now convert the snelwegen layer in the GPKG to GeoJSON:

```bash
ogr2ogr -f GeoJSON snelwegen.json /tmp/nwb.gpkg -sql "select geom, route from snelwegen" -t_srs EPSG:3857 -nln snelwegen
```

Open `snelwegen.json` in QGIS, to verify whether you see the expected output, compare it with the intermediate layers in `/tmp/nwb.gpkg`. You can style the layer based on the `route` attribute:

![Snelwegen in QGIS](images/qgis_snelwegen.png "Snelwegen in QGIS")

Then copy the `snelwegen.json` file to the `webapp` folder.


### 4.2 Adding a GeoJSON layer to the map

Next we need to add some imports to the `index.js` file to display the GeoJSON file in your webapp:

```js
import Point from 'ol/geom/Point'
import { Text, Fill, Stroke, Style } from 'ol/style'
import MultiLineString from 'ol/geom/MultiLineString'
import VectorLayer from 'ol/layer/Vector'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
```

Remove the WMS layer and the click event handler, we are going to replace these with the GeoJSON layer. 

Add the following to `index.js` and do not forget to add the `snelwegenLayer` to the `map` object:

```js
function styleFunc (feature) {
  const styles = [
    new Style({
      stroke: new Stroke({
        color: 'red',
        width: 5
      })
    }),
    new Style({
      stroke: new Stroke({
        color: 'white',
        width: 1
      })
    })
  ]
  styles.push(new Style({
    geometry: function (feature) {
      var multiLineString = new MultiLineString(feature.getGeometry().getCoordinates())
      // labelPoint is the closest point on the line from the center of the extent of the geometry
      var labelPoint = multiLineString.getClosestPoint(getCenter(feature.getGeometry().getExtent()))
      return new Point(labelPoint)
    },
    text: new Text({
      text: feature.get('route'),
      font: '1em sans-serif',
      stroke: new Stroke({
        color: 'green',
        width: 6
      }),
      fill: new Fill({
        color: 'white'
      }),
      overflow: true
    })
  }))
  return styles
};

const snelwegenSource = new VectorSource({
  features: (new GeoJSON(
  )).readFeatures(snelwegen)
})

const snelwegenLayer = new VectorLayer({
  source: snelwegenSource,
  style: styleFunc,
  declutter: true
})
```

Refresh your browser to see the result:

![GeoJSON layer](images/geojson_layer.png "GeoJSON layer")

With a simple modification of the style function the labelling can be made dynamic, based on the exent of the current view, this way all features in the current view are labelled:

```javascript
var labelPoint = multiLineString.getClosestPoint(getCenter(map.getView().calculateExtent(map.getSize())))
```

However this is not an ideal solution either due to the jumping labels on every zoomchange. 

> TODO: This can off course also be solved, but as you may realise labelling is hard a problem. 

Since we have the actual vector data loaded in the viewer, it is fairly easy to highlight selected features. Add the following to `index.js`:

```js
var selection = {}

const selectionLayer = new VectorLayer({
  declutter: true,
  source: snelwegenLayer.getSource(),
  style: function (feature) {
    if (feature.get('route') in selection) {
      return new Style({
        stroke: new Stroke({
          color: 'yellow',
          width: 1.5
        })
      })
    }
  }
})

map.on(['click'], function (event) {
  const features = map.getFeaturesAtPixel(event.pixel, { hitTolerance: 3 })
  if (!features.length) {
    selection = {}
    selectionLayer.changed()
    return
  }
  const feature = features[features.length - 1]
  const identifier = feature.get('route')
  selection = {}
  selection[identifier] = feature
  selectionLayer.changed()
})
```

Do not forget to add the new `selectionLayer` to the map. Now when a feature on the map is clicked it will be highlighted.


![GeoJSON highlight](images/geojson_highlight.png "GeoJSON highlight")

## 5. Using the PDOK Location Server



> TODO: Introduction about the location server, or maybe in the general introduction

### 5.1 Adding a custom control to the map

See docs here: https://github.com/PDOK/locatieserver/wiki/API-Locatieserver


1. Install autocomplete npm dependency: ` npm install autocompleter`
2. Remove `popup` html elements from `index.html`
3. Add css to `index.css`: 

```css
.ol-zoom.ol-control{
  top: 2em;
}
```
4. Add js:

```js
import { Control } from 'ol/control'
import WKT from 'ol/format/WKT'
import autocomplete from 'autocompleter'
import 'autocompleter/autocomplete.css'

const locatieServerUrl = 'https://geodata.nationaalgeoregister.nl/locatieserver/v3'

var LocationServerControl = /* @__PURE__ */(function (Control) {
  function LocationServerControl (optOptions) {
    var options = optOptions || {}
    var input = document.createElement('input')
    input.id = 'input-loc'
    var element = document.createElement('div')
    element.className = 'input-loc ol-unselectable ol-control'
    element.appendChild(input)
    Control.call(this, {
      element: element,
      target: options.target
    })
  }
  if (Control) LocationServerControl.__proto__ = Control // eslint-disable-no-proto
  LocationServerControl.prototype = Object.create(Control && Control.prototype)
  LocationServerControl.prototype.constructor = LocationServerControl
  return LocationServerControl
}(Control))

map.addControl(new LocationServerControl())
```

### 5.2 Retrieve suggestions from Locatie Server

6. add autocomplete:

```js
autocomplete({
      input: input,
      fetch: function (text, update) {
        fetch(`${locatieServerUrl}/suggest?q=${text}`)
          .then((response) => {
            return response.json()
          })
          .then((data) => {
            const suggestions = []
            data.response.docs.forEach(function (item) {
              const name = item.weergavenaam
              const id = item.id
              suggestions.push({ label: name, value: id })
            })
            update(suggestions)
          })
      }
    })
```

### 5.3 Retrieve selected object from Locatie Server

```js
onSelect: function (item) {
        input.value = item.label
        const id = item.value
        fetch(`${locatieServerUrl}/lookup?id=${id}&fl=id,geometrie_ll`)
          .then((response) => {
            return response.json()
          })
          .then((data) => {
            const wktLoc = data.response.docs[0].geometrie_ll
            const format = new WKT()
            const feature = format.readFeature(wktLoc, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857'
            })
            const ext = feature.getGeometry().getExtent()
            map.getView().fit(ext, map.getSize())
          })
      }
```

6. As you can see, the `lookup` endpoint returns a geometry of the requested object. You can make this geometry visible by creating a `VectorSource` and `VectorLayer`, add the feature to the `VectorSource` and add the `VectorLayer` to the map.  

```js
const vectorSource = new VectorSource()

const vectorLayer = new VectorLayer({
  source: vectorSource,
  declutter: true
})
```

In the promise fulfillment of the `lookup` fetch add after creating the feature form WKT:

```js
vectorSource.clear()
vectorSource.addFeature(feature)
```






# Referenties

- [GeoNovum Whitepaper Geo-standaarden](https://docs.geostandaarden.nl/wp/wpgs/)
- [Open Geospatial Consortium (OGC)](https://en.wikipedia.org/wiki/Open_Geospatial_Consortium)
- 