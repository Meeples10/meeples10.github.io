var physicsObjects = [];

function enablePhysics() {
    var header = document.getElementById("header-text");
    header.removeAttribute("onclick");
    init(header);
    var code = document.getElementsByTagName("code");
    for(var i = 0; i < code.length; i++) {
        init(code[i]);
    }
    window.setInterval(calc, 16);
}

function init(element) {
    var s = "";
    var skip = false;
    for(var i = 0; i < element.innerHTML.length; i++) {
        if(element.innerHTML.charAt(i) == "<") {
            skip = true;
        }
        if(element.innerHTML.charAt(i) == ">") {
            skip = false;
            s += ">";
            continue;
        }
        if(skip) {
            s += element.innerHTML.charAt(i);
            continue;
        }
        var id = getID();
        s += "<span id=\"" + id + "\">" + element.innerHTML.charAt(i) + "</span>";
        physicsObjects.push({
            id: id,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            vx: 0,
            vy: 0
        });
    }
    element.innerHTML = s;
    for(var i = 0; i < physicsObjects.length; i++) {
        var bounds = document.getElementById(physicsObjects[i].id).getBoundingClientRect();
        physicsObjects[i].x = bounds.left;
        physicsObjects[i].y = bounds.top;
        physicsObjects[i].width = bounds.width;
        physicsObjects[i].height = bounds.height;
    }
    for(var i = 0; i < physicsObjects.length; i++) {
        var e = document.getElementById(physicsObjects[i].id);
        e.style.position = "absolute";
        e.style.left = physicsObjects[i].x + "px";
        e.style.top = physicsObjects[i].y + "px";
    }
}

function calc() {
    for(var i = 0; i < physicsObjects.length; i++) {
        var obj = physicsObjects[i];
        obj.vy += 0.981;
        if(obj.y + obj.height + obj.vy > screen.height - 200) {
            obj.vy = -obj.vy * 0.5;
            if(Math.random() > 0.5) {
                obj.vx = Math.random() * 10;
            } else {
                obj.vx = -Math.random() * 10;
            }
            if(Math.abs(obj.vy) < 4) {
                obj.vy *= Math.random() * 10;
            }
        }
        if((obj.vx < 0 && outOfBoundsX(obj.x + obj.vx)) || (obj.vx > 0 && outOfBoundsX(obj.x + obj.vx + obj.width))) {
            obj.vx *= -1;
        }
        obj.x += obj.vx;
        obj.y += obj.vy;
        var e = document.getElementById(obj.id);
        e.style.left = obj.x + "px";
        e.style.top = obj.y + "px";
    }
}

function outOfBoundsX(x) {
    return x < 0 || (x + 100) >= screen.width;
}


function getID() {
    return Math.round(Math.random() * 10000);
}
