let FairyFountains = [
    {
        coords: [20748,10843],
        name: "Great Fairy Fountain",
        text: "Great Fairy Tera",
        level: "Surface"
    },
    {
        coords: [13336,18692],
        name: "Great Fairy Fountain",
        text: "Great Fairy XX",
        level: "Surface"
    },
    {
        coords: [23305,21543],
        name: "Great Fairy Fountain",
        text: "Great Fairy Cotera",
        level: "Surface"
    },
    {
        coords: [13628,6031],
        name: "Great Fairy Fountain",
        text: "Great Fairy XX",
        level: "Surface"
    },

    
]

function FairyFountainsUI(object) {
    return `
    <div>
        <h5>
            <a href="${location.protocol}//${location.host}${location.pathname}?z=${window.map.getMaxZoom()}&x=${object.coords[0]}&y=${object.coords[1]}">
                ${object.name}
            </a>
        </h5>
        <p>
            Level: ${object.level}</br>
            Location: ${object.coords[0]},${object.coords[1]}
        </p>
        <p>${object.text}</p>
    </div>
    `;
}

function getFairyFountains(level = null) {
    const icon = L.icon({
        iconUrl: '../../images/icons/fountain_r.png',
        iconSize: [25, 25],
    });

    let layerGroupArray = [];
    for (let object in FairyFountains) {
        if (FairyFountains[object].level == null || FairyFountains[object].level === level) {
            layerGroupArray.push(L.marker(FairyFountains[object].coords, { icon: icon }).bindPopup(FairyFountainsUI(FairyFountains[object])));
        }
    }

    return L.layerGroup(
        layerGroupArray
    );
}