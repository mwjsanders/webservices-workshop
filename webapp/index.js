import 'ol/ol.css'
import { Map, View } from 'ol'
import WMTSSource from 'ol/source/WMTS'
import TileLayer from 'ol/layer/Tile.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import { get as getProjection, fromLonLat } from 'ol/proj'
import { getTopLeft, getWidth } from 'ol/extent.js'
import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import Overlay from 'ol/Overlay'

var projection = getProjection('EPSG:3857')
var projectionExtent = projection.getExtent()
var size = getWidth(projectionExtent) / 256
var resolutions = new Array(20)
var matrixIds = new Array(20)

for (let z = 0; z < 20; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z)
  matrixIds[z] = z
}

const wmsSource = new ImageWMS({
  url: 'https://geodata.nationaalgeoregister.nl/nwbwegen/wms?',
  crossOrigin: 'anonymous',
  params: { LAYERS: 'wegvakken' }
})

const wsmLayer = new ImageLayer({
  extent: projectionExtent,
  source: wmsSource
})

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

const map = new Map({ // eslint-disable-line no-unused-vars
  layers: [
    baseMapLayer,
    wsmLayer
  ],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: fromLonLat([5.43, 52.18]),
    zoom: 14
  })
})

map.on('singleclick', function (evt) {
  // clean content of popup on every new singeclick event
  if (content.childNodes.length > 0) content.childNodes[0].remove()
  const viewResolution = /** @type {number} */ (map.getView().getResolution())
  const url = wmsSource.getFeatureInfoUrl(
    evt.coordinate, viewResolution, 'EPSG:3857',
    { INFO_FORMAT: 'application/json' })
  if (url) {
    fetch(url)
      .then(function (response) { return response.json() })
      .then(function (data) {
        // set overlay position to undefined to hide popup
        if (data.features.length === 0) {
          overlay.setPosition(undefined)
          return
        }
        const ft = data.features[0]
        const table = document.createElement('table')
        const header = table.createTHead()
        let row = header.insertRow()
        let i = 0
        Object.keys(ft.properties).forEach(function (item) {
          const cell = row.insertCell(i)
          cell.innerHTML = item
          i++
        })
        const body = table.createTBody()
        row = body.insertRow()
        i = 0
        Object.keys(ft.properties).forEach(function (item) {
          const cell = row.insertCell(i)
          cell.innerHTML = ft.properties[item]
          i++
        })
        content.appendChild(table)
        overlay.setPosition(evt.coordinate)
      })
  }
})
