/**
 *
 * Map settings
 *
 */

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
    maxBoundsViscosity: 1.0,
    renderer: L.canvas()
});

const southWest = zeldaMap.unproject([0, imageheight], 8),
    northEast = zeldaMap.unproject([imagewidth, 0], 8),
    bounds = L.latLngBounds(southWest, northEast)

zeldaMap.setView(L.latLng(-1432, 395), 5);

/**
 *
 * Map Layers
 *
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
sky.addTo(zeldaMap);

let previousBaseLayer;
let currentBaseLayer= 'Sky';
let control;
zeldaMap.on('baselayerchange', (e) => {
    previousBaseLayer = currentBaseLayer;
    currentBaseLayer = e.name;
    updateLayers();
})

function setMapStyle(style) {
    for (let key in baseLayers) {
        zeldaMap.removeLayer(baseLayers[key]);
    }
    baseLayers[style].addTo(zeldaMap);
}

/**
 *
 * Map Zoom
 *
 */

L.control.zoom({
    position: 'bottomright'
}).addTo(zeldaMap);

/**
 *
 * Set Map Markers
 *
 */

for (var i = 0; i < allMarkers.length; i++) {
    const categoryMarkers = allMarkers[i];

    L.geoJSON(categoryMarkers, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    }).addTo(zeldaMap);

    const menu_options = {
        groupCheckboxes: false,
        collapsed: false,
        groupsCollapsable: true,
        groupsExpandedClass: 'bi bi-caret-down-square-fill',
        groupsCollapsedClass: 'bi bi-caret-right-square-fill',
    };

    //control = L.control.groupedLayers(baseLayers, groupedOverlays['Surface']).addTo(zeldaMap);
}

/**
 *
 * Functions
 *
 */
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

    for (category in groupedOverlays[currentBaseLayer]) {
        for (subcat in groupedOverlays[currentBaseLayer][category]) {
            for (marker in groupedOverlays[currentBaseLayer][category][subcat]._layers) {
                groupedOverlays[currentBaseLayer][category][subcat]._layers[marker].addTo(groupedOverlays[currentBaseLayer][category][subcat]);
            }
            control.addOverlay(groupedOverlays[currentBaseLayer][category][subcat], subcat, category)
        }
    }
}

function addToOverlays(map, category, subcat) {
    if (!(map in groupedOverlays)) {
        groupedOverlays[map] = {};
    }
    if (!(category in groupedOverlays[map])) {
        groupedOverlays[map][category] = {};
    }
    if (!(subcat in groupedOverlays[map][category])) {
        groupedOverlays[map][category][subcat] = new L.LayerGroup();
    }
}

function pointToLayer(feature, latlng) {
    addToOverlays(feature.properties.map, feature.properties.category, feature.properties.subcat);

    const markerOptions = {
        icon: feature.properties.icon,
        color: feature.properties.color
    };

    /*var customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="custom-marker-content">A</div>'
    });*/

    // TODO: REVIEW
    let customIcon;
    customIcon = L.divIcon({
        className: 'map-icon-svg',
        html: "<div class='circle circleMap-medium ' style='background-color: " + feature.properties.color + "; "
            + "border-color: " + feature.properties.color + "'>"
            + "<span class='icon-" + feature.properties.subcat + " icnText-medium'></span>"
            + "</div>"
    });
    /*if (zeldaMap.getZoom() > 4) {
        customIcon = L.divIcon({
            className: 'map-icon-svg',
            html: "<div class='circle circleMap-small' style='background-color: " + feature.properties.color + "; "
                + "border-color: " + feature.properties.color + "'>"
                + "<span class='icon-" + "fairy" + " icnText-small'></span>"
                + "</div>"
        });
    } else {
        customIcon = L.divIcon({
            className: 'map-icon-svg',
            html: "<div class='circle circleMap-medium ' style='background-color: " + feature.properties.color + "; "
                + "border-color: " + feature.properties.color + "'>"
                + "<span class='icon-" + "fairy" + " icnText-medium'></span>"
                + "</div>"
        });
    }*/


    return L.marker(latlng, { icon: customIcon });
}

function onEachFeature(feature, layer) {
    feature.layer = layer;

    if (feature.properties.title && feature.properties.category !== 'Labels') {
        layer.bindPopup(
            '<div>'
            +feature.properties.title
            +'<br />'+feature.properties.description
            +'<br />'+feature.properties.position
            +'</div>'
        )
    }

    layer.addTo(groupedOverlays[feature.properties.map][feature.properties.category][feature.properties.subcat]);
}

/**
 *
 * Map Selection
 *
 */
const mapMenuOptions = document.querySelectorAll('.map-option');
mapMenuOptions.forEach((option) => {
    option.addEventListener('click', () => {
        mapMenuOptions.forEach((btn) => btn.classList.remove('selected'));
        option.classList.add('selected');
    });
});

const mapOptions = document.getElementsByClassName('map-option');
for (let i = 0; i < mapOptions.length; i++) {
    mapOptions[i].addEventListener('click', function() {
        const style = this.getAttribute('data-style');
        setMapStyle(style);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const defaultOption = document.querySelector('.map-option.selected');
    defaultOption.classList.add('selected');
});

/**
 *
 * Map Menu Options
 *
 */
/*let navigation = document.querySelector('.navigation');
navigation.onclick = function () {
    navigation.classList.toggle('active')
}*/

$(".category-item").click(function() {
    let itemInfo = this.id.split(".")
    let category = itemInfo[0]
    let id = itemInfo[1]
 console.log(this.id)

    //L.control.groupedLayers(baseLayers, groupedOverlays[currentBaseLayer][category][id]._layers).addTo(zeldaMap);
    removeLayers()
});

function removeLayers() {
    let category
    let subcat
    let marker

    if (currentBaseLayer) {
        for (category in groupedOverlays[currentBaseLayer]) {
            for (subcat in groupedOverlays[currentBaseLayer][category]) {
                for (marker in groupedOverlays[currentBaseLayer][category][subcat]._layers) {
                    groupedOverlays[currentBaseLayer][category][subcat]._layers[marker].remove();
                }
                removeLayer(groupedOverlays[currentBaseLayer][category][subcat]);
            }
        }
    }


}

function removeLayer(layer) {
    var id = L.Util.stamp(layer);
    var _layer = _getLayer(id, layer);
    if (_layer) {
        layer._layers.splice(layer._layers.indexOf(_layer), 1);
    }
    if (!layer._container) {
        return;
    }
    return this;
}

function _getLayer(id, layer) {
    layer._layers.forEach((lay) => {
        if (lay && L.stamp(lay.layer) === id) {
            return lay;
        }
    });
}

/*

    for (category in groupedOverlays[currentBaseLayer]) {
        for (subcat in groupedOverlays[currentBaseLayer][category]) {
            for (marker in groupedOverlays[currentBaseLayer][category][subcat]._layers) {
                groupedOverlays[currentBaseLayer][category][subcat]._layers[marker].addTo(groupedOverlays[currentBaseLayer][category][subcat]);
            }
            control.addOverlay(groupedOverlays[currentBaseLayer][category][subcat], subcat, category)
        }
    }

 */