var physicsObjects = [];

function enablePhysics() {
    var header = document.getElementById("header-text");
    header.removeAttribute("onclick");
    init(header, true);
    var code = document.getElementsByTagName("p");
    for(var i = 0; i < code.length; i++) {
        init(code[i], false);
    }
    window.setInterval(calc, 16);
}

function init(element, pad) {
    var id = getID();
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
        var eid = id + "-" + i;
        s += (pad ? "&nbsp;" : "") + "<span id=\"" + eid + "\">" + element.innerHTML.charAt(i) + "</span>";
        physicsObjects.push({
            id: eid,
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
        physicsObjects[i].vx = (Math.random() - 0.5) * 10;
        physicsObjects[i].vy = (Math.random() - 0.5) * 10;
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
        if(obj.y + obj.height + obj.vy > screen.height - 200) {
            obj.vy = -obj.vy * 0.5;
            /*if(Math.random() > 0.1) {
                obj.vx = Math.random() * 10;
            } else {
                obj.vx = -Math.random() * 10;
            }*/
            obj.vx *= 0.9;
            if(Math.abs(obj.vy) < 4) {
                obj.vy *= Math.random() * 10;
            }
        } else {
            obj.vy += 0.981;
        }
        if((obj.vx < 0 && outOfBoundsX(obj.x + obj.vx)) || (obj.vx > 0 && outOfBoundsX(obj.x + obj.vx + obj.width))) {
            obj.vx = -10 * Math.sign(obj.vx);
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
    return Math.round(Math.random() * 100000);
}
