import 'ol/ol.css'
import { Map, View } from 'ol'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile.js'
import { fromLonLat } from 'ol/proj'

const map = new Map({ // eslint-disable-line no-unused-vars
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([5.43, 52.18]),
    zoom: 7
  })
})
