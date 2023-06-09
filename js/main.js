const tileSize = 256,
    factorx = 1 / (tileSize / 3),
    factory = 1 / (tileSize / 3),
    imageheight = 30000,
    imagewidth = 36000;

L.CRS.Zelda = L.extend({}, L.CRS.Simple, {
    projection: L.Projection.LonLat,
    transformation: new L.Transformation(factorx, 70.31, -factory, 58.59),
});

let overlays = {},
    markers = {},
    groupedOverlays = {};

const zeldaMap = L.map("map", {
    zoom: 0,
    minZoom: 0,
    maxZoom: 10,
    zoomControl: false,
    tileSize: 256,
    attributionControl: false,
    crs: L.CRS.Zelda,
    contextmenu: false,
    contextmenuWidth: 140,
    maxBoundsViscosity: 1.0
});

L.control.zoom({
    position: 'bottomright'
}).addTo(zeldaMap);

const southWest = zeldaMap.unproject([0, imageheight], 8),
    northEast = zeldaMap.unproject([imagewidth, 0], 8),
    bounds = L.latLngBounds(southWest, northEast)



zeldaMap.addLayer(getFairyFountains("Sky"))
zeldaMap.setView(L.latLng(-1432, 395), 5);

/* -------------- Map styles options -------------- */

/**
 * Change Style of Map
 * @type {string}
 */
const tile_url = 'https://raw.githubusercontent.com/jeluchu/hyrlink-map-assets/main/tiles/';
const sky = L.tileLayer(tile_url + 'sky_complete/{z}/{x}/{y}.png', { maxNativeZoom: 8, bounds: bounds, name: 'Sky' }),
    surface = L.tileLayer(tile_url + 'ground/{z}/{x}/{y}.png', { maxNativeZoom: 8, bounds: bounds, name: 'Surface' }),
    depths = L.tileLayer(tile_url + 'underground/{z}/{x}/{y}.png', { maxNativeZoom: 8, bounds: bounds, name: 'Depths' }),
    baseLayers = {
        "Sky": sky,
        "Surface": surface,
        "Depths": depths,
    };

const mapOptions = document.getElementsByClassName('map-option');
for (let i = 0; i < mapOptions.length; i++) {
    mapOptions[i].addEventListener('click', function() {
        const style = this.getAttribute('data-style');
        setMapStyle(style);
    });
}

function setMapStyle(style) {
    for (let key in baseLayers) {
        zeldaMap.removeLayer(baseLayers[key]);
    }
    baseLayers[style].addTo(zeldaMap);
}

/* -------------- End map styles options -------------- */
sky.addTo(zeldaMap);

zeldaMap.on('baselayerchange', (e) => {
    previousBaseLayer = currentBaseLayer;
    currentBaseLayer = e.name;
    updateLayers();
})

var currentBaseLayer = 'Sky';
var previousBaseLayer;
function updateLayers() {
    let category
    let subcat
    let marker


    if (previousBaseLayer) {
        for (category in groupedOverlays[previousBaseLayer]) {
            for (subcat in groupedOverlays[previousBaseLayer][category]) {
                for (marker in groupedOverlays[previousBaseLayer][category][subcat]._layers) {
                    groupedOverlays[previousBaseLayer][category][subcat]._layers[marker].remove();
                }
                control.removeLayer(groupedOverlays[previousBaseLayer][category][subcat]);
            }
        }
    }
    getFairyFountains("Surface")

    for (category in groupedOverlays[currentBaseLayer]) {
        for (subcat in groupedOverlays[currentBaseLayer][category]) {
            for (marker in groupedOverlays[currentBaseLayer][category][subcat]._layers) {
                groupedOverlays[currentBaseLayer][category][subcat]._layers[marker].addTo(groupedOverlays[currentBaseLayer][category][subcat]);
            }
            control.addOverlay(groupedOverlays[currentBaseLayer][category][subcat], subcat, category)
        }
    }
}

/*  Set default selector map */

const mapMenuOptions = document.querySelectorAll('.map-option');
mapMenuOptions.forEach((option) => {
    option.addEventListener('click', () => {
        mapMenuOptions.forEach((btn) => btn.classList.remove('selected'));
        option.classList.add('selected');
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const defaultOption = document.querySelector('.map-option.selected');
    defaultOption.classList.add('selected');
});

let navigation = document.querySelector('.navigation');
navigation.onclick = function () {
    navigation.classList.toggle('active')
}