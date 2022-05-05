// This code is very ugly and unoptimized

const scaleX = 10;
const inset = 20;

function getMax(map) {
    var temp = Number.MIN_VALUE;
    Object.entries(map).forEach(e => {
        e[1].forEach(i => {
            if(i > temp) temp = i;
        });
    });
    return Math.pow(10, Math.ceil(Math.log10(temp)));
}

var canvases = document.getElementsByClassName("graph");
var c = {};
for(var i = 0; i < canvases.length; i++) {
    var setName = canvases[i].dataset.set;
    if(!(setName in sets)) {
        console.log("Missing set: " + setName);
        continue;
    }
    var set = sets[setName];
    c[set.name] = {};
    c[set.name]["canvas"] = canvases[i].getContext("2d");
    canvases[i].width = (set.max - set.min) * scaleX;
    c[set.name]["width"] = canvases[i].width - inset;
    c[set.name]["height"] = canvases[i].height - inset;
    c[set.name]["maxY"] = getMax(set.map);
}

var enabled = {};

function scale(dataset, n) {
    if(n == 0) return 0;
    return c[dataset.name]["height"] * Math.log(n + 1) / Math.log(c[dataset.name]["maxY"] + 1);
}

function drawGridlines(dataset) {
    c[dataset.name]["canvas"].strokeStyle = "#AAAAAA";
    c[dataset.name]["canvas"].beginPath();
    c[dataset.name]["canvas"].moveTo(inset, c[dataset.name]["height"]);
    c[dataset.name]["canvas"].lineTo(c[dataset.name]["width"], c[dataset.name]["height"]);
    c[dataset.name]["canvas"].stroke();
    c[dataset.name]["canvas"].strokeStyle = "#E0E0E0";
    c[dataset.name]["canvas"].font = "11px sans-serif";
    c[dataset.name]["canvas"].fillText("10", 0, c[dataset.name]["height"]);
    c[dataset.name]["canvas"].font = "8px sans-serif";
    c[dataset.name]["canvas"].fillText("0", 13, c[dataset.name]["height"] - 6);
    var pow = 1;
    for(var i = 1; i <= c[dataset.name]["maxY"]; i *= 10) {
        c[dataset.name]["canvas"].font = "11px sans-serif";
        c[dataset.name]["canvas"].fillText("10", 0, c[dataset.name]["height"] - scale(dataset, i));
        c[dataset.name]["canvas"].font = "8px sans-serif";
        c[dataset.name]["canvas"].fillText(pow, 13, c[dataset.name]["height"] - scale(dataset, i) - 6);
        for(var j = 0; j <= i * 10; j += i) {
            var y = scale(dataset, i + j);
            c[dataset.name]["canvas"].beginPath();
            c[dataset.name]["canvas"].moveTo(inset, c[dataset.name]["height"] - y);
            c[dataset.name]["canvas"].lineTo(c[dataset.name]["width"] + inset, c[dataset.name]["height"] - y);
            c[dataset.name]["canvas"].stroke();
        }
        pow++;
    }
    var zeroOffset = -1;
    if(dataset.min < 0) {
        zeroOffset = -dataset.min;
    } else if(dataset.min == 0) {
        zeroOffset = 0;
    }
    c[dataset.name]["canvas"].font = "11px sans-serif";
    for(var k = 0; k < c[dataset.name]["width"]; k++) {
        var x = ((k * c[dataset.name]["width"]) / (dataset.max - dataset.min)) + inset;
        if(k % 2 == 0) {
            var actualY = k - (zeroOffset > 0 ? zeroOffset : 0);
            var w = c[dataset.name]["canvas"].measureText(actualY).width;
            c[dataset.name]["canvas"].fillText(actualY, x - (w / 2), c[dataset.name]["height"] + 11);
        }
        if(k == zeroOffset) c[dataset.name]["canvas"].strokeStyle = "#AAAAAA";
        c[dataset.name]["canvas"].beginPath();
        c[dataset.name]["canvas"].moveTo(x, 0);
        c[dataset.name]["canvas"].lineTo(x, c[dataset.name]["height"]);
        c[dataset.name]["canvas"].stroke();
        if(k == zeroOffset) c[dataset.name]["canvas"].strokeStyle = "#E0E0E0";
    }
}

function draw(dataset, key) {
    c[dataset.name]["canvas"].beginPath();
    c[dataset.name]["canvas"].strokeStyle = "#" + getColor(key);
    c[dataset.name]["canvas"].moveTo(inset, c[dataset.name]["height"]);
    if(!(key in dataset.map)) return;
    for(var i = 0; i < dataset.map[key].length; i++) {
        c[dataset.name]["canvas"].lineTo(i * scaleX + inset, c[dataset.name]["height"] - scale(dataset, dataset.map[key][i]));
    }
    c[dataset.name]["canvas"].stroke();
}

function toggleDraw(name, key, state) {
    if(!(name in enabled)) enabled[name] = [];
    if(state) {
        if(enabled[name].indexOf(key) > -1) return;
        enabled[name].push(key);
    } else {
        var i = enabled[name].indexOf(key);
        if (i > -1) enabled[name].splice(i, 1);
    }
}

function populateLists(dataset) {
    var parent = document.getElementById(dataset.name + "-toggles");
    var keys = [];
    Object.entries(dataset.map).forEach(e => {
        keys.push(e[0]);
    });
    keys.sort();
    var buttonAll = document.createElement("button");
    buttonAll.innerHTML = "Show All";
    buttonAll.onclick = function() {
        keys.forEach(key => {
            document.getElementById("toggle-" + dataset.name + "-" + key).checked = true;
            toggleDraw(dataset.name, key, true);
        });
        redraw(dataset);
    };
    parent.appendChild(buttonAll);
    var buttonNone = document.createElement("button");
    buttonNone.innerHTML = "Hide All";
    buttonNone.onclick = function() {
        keys.forEach(key => {
            if(enabled[dataset.name].indexOf(key) != -1) {
                document.getElementById("toggle-" + dataset.name + "-" + key).checked = false;
                toggleDraw(dataset.name, key, false);
            }
        });
        redraw(dataset);
    };
    parent.appendChild(buttonNone);
    parent.appendChild(document.createElement("br"));
    keys.forEach(key => {
        var label = document.createElement("label");
        var toggle = document.createElement("input");   
        toggle.id = "toggle-" + dataset.name + "-" + key;
        label.htmlFor = toggle.id;
        label.innerHTML = key;
        label.className = "graph-toggle";
        label.style = "border-left: 1ex solid #" + getColor(key);
        toggle.type = "checkbox";
        toggle.onclick = function() {
            toggleDraw(dataset.name, key, this.checked);
            redraw(dataset);
        };
        label.appendChild(toggle);
        parent.appendChild(label);
        parent.appendChild(document.createElement("br"));
    });
}

function selectDefaults(dataset) {
    dataset.defaults.forEach(key => {
        document.getElementById("toggle-" + dataset.name + "-" + key).checked = true;
        toggleDraw(dataset.name, key, true);
    });
}

function redraw(dataset) {
    c[dataset.name]["canvas"].clearRect(0, 0, c[dataset.name]["width"] + inset, c[dataset.name]["height"] + inset);
    drawGridlines(dataset);
    enabled[dataset.name].forEach(key => {
        draw(dataset, key);
    });
}

var collapsibles = document.getElementsByClassName("collapsible");
for(var i = 0; i < collapsibles.length; i++) {
    collapsibles[i].onclick = function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if(content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    };
};

Object.entries(c).forEach(e => {
    populateLists(sets[e[0]]);
    selectDefaults(sets[e[0]]);
    redraw(sets[e[0]]);
});
