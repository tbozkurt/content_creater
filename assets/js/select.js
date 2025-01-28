var selecting = false;
var startMouse, stopMouse;
IDE.sahne.on("mousedown", function(e){
    if(!e.evt.button){
        if (e.target.Layer) {
            return;
        }
        e.evt.preventDefault();

        startMouse = IDE.sahne.getPointerPosition();
        startMouse.x -= IDE.layer.x;
        startMouse.y -= IDE.layer.y;

        stopMouse = IDE.sahne.getPointerPosition();
        stopMouse.x -= IDE.layer.x;
        stopMouse.y -= IDE.layer.y;

        IDE.selectRect.width(0);
        IDE.selectRect.height(0);
        selecting = true;
    }
});


IDE.sahne.on("mousemove", function(e){
    if (!selecting) {
        return;
    }
    e.evt.preventDefault();

    stopMouse = IDE.sahne.getPointerPosition();
    stopMouse.x -= IDE.layer.x;
    stopMouse.y -= IDE.layer.y;

    IDE.selectRect.setAttrs({
        visible: true,
        x: Math.min(startMouse.x, stopMouse.x),
        y: Math.min(startMouse.y, stopMouse.y),
        width: Math.abs(stopMouse.x - startMouse.x),
        height: Math.abs(stopMouse.y - startMouse.y),
    });
});


IDE.sahne.on("mouseup", function(e){
    selecting = false;
    if (!IDE.selectRect.visible()) {
        return;
    }
    e.evt.preventDefault();

    IDE.selectRect.visible(false);
    var selectRect = IDE.selectRect.getClientRect();

    var localEX = utils.getLayers();
    if(localEX.length){
        var selected = localEX.filter(function(obj){
            if(!obj.Layer.lock && !obj.Layer.hide){
                return haveIntersection(selectRect, obj.getClientRect());
            }
        });

        selected.map(function(obj){
            selectItem({shiftKey: true, layer: obj});
        });

        getProp(true);
    }
});


function haveIntersection(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
        r2.x + r2.width < r1.x ||
        r2.y > r1.y + r1.height ||
        r2.y + r2.height < r1.y);
}

