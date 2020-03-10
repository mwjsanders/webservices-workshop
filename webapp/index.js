import 'ol/ol.css'
import { Map, View } from 'ol'
import WMTSSource from 'ol/source/WMTS'
import TileLayer from 'ol/layer/Tile.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import { get as getProjection, fromLonLat } from 'ol/proj'
import { getTopLeft, getWidth, getCenter } from 'ol/extent.js'
import Point from 'ol/geom/Point'
import { Text, Fill, Stroke, Style } from 'ol/style'
import MultiLineString from 'ol/geom/MultiLineString'
import VectorLayer from 'ol/layer/Vector'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import snelwegen from './snelwegen.json'

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
    attributions: 'BRT achtergrondkaart: <a href="http://www.kadaster.nl">Kadaster</a>',
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default'
  })
})

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
}

const snelwegenSource = new VectorSource({
  features: (new GeoJSON(
  )).readFeatures(snelwegen)
})

const snelwegenLayer = new VectorLayer({
  source: snelwegenSource,
  style: styleFunc,
  declutter: true
})

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

const map = new Map({ // eslint-disable-line no-unused-vars
  layers: [
    baseMapLayer,
    snelwegenLayer,
    selectionLayer
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([5.43, 52.18]),
    zoom: 8
  })
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
