var tileSize = 256,
    factorx = 1 / (tileSize / 3), // 3 image pixels per game unit
    factory = 1 / (tileSize / 3),
    imageheight = 30000,
    imagewidth = 36000;

L.CRS.Zelda = L.extend({}, L.CRS.Simple, {
    projection: L.Projection.LonLat,
    transformation: new L.Transformation(factorx, 70.31, -factory, 58.59),
});

var overlays = new Object(),
    markers = new Object(),
    groupedOverlays = new Object();

var zeldaMap = L.map("map", {
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

var southWest = zeldaMap.unproject([0, imageheight], 8),
    northEast = zeldaMap.unproject([imagewidth, 0], 8),
    bounds = L.latLngBounds(southWest, northEast)

zeldaMap.setView(L.latLng(-1432, 395), 5);

/* -------------- Map styles options -------------- */

/**
 * Change Style of Map
 * @type {string}
 */
var tile_url = 'https://raw.githubusercontent.com/jeluchu/hyrlink-map-assets/main/tiles/';
var sky = L.tileLayer(tile_url + 'sky_complete/{z}/{x}/{y}.png', { maxNativeZoom: 8, bounds: bounds, name: 'Sky' }),
    surface = L.tileLayer(tile_url + 'ground/{z}/{x}/{y}.png', { maxNativeZoom: 8, bounds: bounds, name: 'Surface' }),
    depths = L.tileLayer(tile_url + 'underground/{z}/{x}/{y}.png', { maxNativeZoom: 8, bounds: bounds, name: 'Depths' }),
    baseLayers = {
        "Sky": sky,
        "Surface": surface,
        "Depths": depths,
    };

var mapOptions = document.getElementsByClassName('map-option');
for (var i = 0; i < mapOptions.length; i++) {
    mapOptions[i].addEventListener('click', function() {
        var style = this.getAttribute('data-style');
        setMapStyle(style);
    });
}

const marker = L.marker([51.505, -0.09]).addTo(zeldaMap);

function setMapStyle(style) {
    for (var key in baseLayers) {
        zeldaMap.removeLayer(baseLayers[key]);
    }
    baseLayers[style].addTo(zeldaMap);

    //addMarkers(style)
}

// Crear capas de marcadores
var skyMarkers = L.layerGroup();
var surfaceMarkers = L.layerGroup();
var depthsMarkers = L.layerGroup();

// Marcadores para la capa Sky
var markerSky1 = L.marker([40.712776, -74.005974]).bindPopup('Marcador Sky 1');
var markerSky2 = L.marker([51.507351, -0.127758]).bindPopup('Marcador Sky 2');
markerSky1.addTo(skyMarkers);
markerSky2.addTo(skyMarkers);

// Marcadores para la capa Surface
var markerSurface1 = L.marker([48.856613, 2.352222]).bindPopup('Marcador Surface 1');
var markerSurface2 = L.marker([41.385063, 2.173404]).bindPopup('Marcador Surface 2');
markerSurface1.addTo(surfaceMarkers);
markerSurface2.addTo(surfaceMarkers);

// Marcadores para la capa Depths
var markerDepths1 = L.marker([35.689487, 139.691711]).bindPopup('Marcador Depths 1');
var markerDepths2 = L.marker([37.774929, -122.419416]).bindPopup('Marcador Depths 2');
markerDepths1.addTo(depthsMarkers);
markerDepths2.addTo(depthsMarkers);

// Asociar capas de marcadores a los tileLayers
sky.on('add', function() {
    zeldaMap.addLayer(skyMarkers);
    zeldaMap.removeLayer(surfaceMarkers);
    zeldaMap.removeLayer(depthsMarkers);
});

surface.on('add', function() {
    zeldaMap.removeLayer(skyMarkers);
    zeldaMap.addLayer(surfaceMarkers);
    zeldaMap.removeLayer(depthsMarkers);
});

depths.on('add', function() {
    zeldaMap.removeLayer(skyMarkers);
    zeldaMap.removeLayer(surfaceMarkers);
    zeldaMap.addLayer(depthsMarkers);
});
function clearMarkers(layer) {
    layer.clearLayers();
}

function addMarkers(layer) {
    switch (layer) {
        case 'Sky':
            zeldaMap.clearLayers();
            L.marker([-140.712776, -74.005974]).bindPopup('Marcador Sky 1').addTo(zeldaMap)
            L.marker([-51.507351, -0.127758]).bindPopup('Marcador Sky 2').addTo(zeldaMap)
            break;
        case 'Surface':
            zeldaMap.clearLayers();
            L.marker([48.856613, 2.352222]).bindPopup('Marcador Surface 1').addTo(zeldaMap)
            L.marker([451.385063, 2.173404]).bindPopup('Marcador Surface 2').addTo(zeldaMap)
            break;
        case 'Depths':
            zeldaMap.clearLayers();
            L.marker([135.689487, 139.691711]).bindPopup('Marcador Depths 1').addTo(zeldaMap)
            L.marker([137.774929, -122.419416]).bindPopup('Marcador Depths 2').addTo(zeldaMap)
            break
        default:
            console.log(`Sorry, we are out of ${"expr"}.`);
    }

}

/* -------------- End map styles options -------------- */

var fuseOptions = {
    position: 'topleft',
    maxResultLength: 50,
    threshold: 0.2,
    showInvisibleFeatures: false,
};

// var searchCtrl = L.control.fuseSearch(fuseOptions).addTo(zeldaMap);
sky.addTo(zeldaMap);
//new L.Hash(zeldaMap);

zeldaMap.on('baselayerchange', (e) => {
    previousBaseLayer = currentBaseLayer;
    currentBaseLayer = e.name;
    updateLayers();
})

var currentBaseLayer = 'Sky';
var previousBaseLayer;
function updateLayers() {

    // this entire function needs to be built into leaflet.groupedlayercontrol.js

    if (previousBaseLayer) {
        for (var category in groupedOverlays[previousBaseLayer]) {
            for (var subcat in groupedOverlays[previousBaseLayer][category]) {
                for (var marker in groupedOverlays[previousBaseLayer][category][subcat]._layers) {
                    groupedOverlays[previousBaseLayer][category][subcat]._layers[marker].remove();
                }
                control.removeLayer(groupedOverlays[previousBaseLayer][category][subcat]);
            }
        }
    }

    for (var category in groupedOverlays[currentBaseLayer]) {
        for (var subcat in groupedOverlays[currentBaseLayer][category]) {
            for (var marker in groupedOverlays[currentBaseLayer][category][subcat]._layers) {
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

/*  End set default selector map */

/*const markerA = L.marker([51.505, -0.09], {
    icon: L.icon({
        iconUrl: 'ruta/al/imagenA.png',
        iconSize: [30, 30]
    })
}).addTo(map);*/