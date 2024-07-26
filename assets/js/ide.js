function Arayuz_addLayer(obj){
    var id = Layers.length;
    var hide = false;
    var lock = false;
    //obj.Layer = Object.assign(Layer, {id, hide, lock});
    obj.Layer.id = id;
    obj.Layer.hide = hide;
    obj.Layer.lock = lock;
    Layers.push(obj);

    var layerHtml = `<div class="layer">
        <div class="layerIcon"><img src="assets/img/${obj.Layer.type}_icon.png"></div>
        <div class="layerName">${obj.Layer.name}</div>
        <div class="layerZButon layerView"><img src="assets/img/hide.png"></div>
        <div class="layerZButon layerLock"><img src="assets/img/lock.png"></div>
    </div>`;

    var TempHTML = LayerSR.clicked(layerHtml);

    function Permission(shiftKey, object){
        var selectFound = false;

        for(var i=0; i<IDE.selectedLayers.length; i++){
            if(object.Layer.id === IDE.selectedLayers[i].Layer.id){
                selectFound = true;
                break;
            }
        }

        if(!selectFound && !shiftKey){
            IDE.selectedLayers = [];
        }else if(selectFound){
            IDE.selected = true;
        }

        if(!object.Layer.lock && !selectFound){
            selectItem({shiftKey: shiftKey, layer: object});
        }
    }

    Layers[id].on("mousedown", function(e){
        Permission(e.evt.shiftKey, obj)
    }).on("mouseup", function(){
        getProp();
    }).on("dragmove", function(){
        getProp();
    });

    var main = TempHTML.querySelector(".layer");
    var hideBtn = main.querySelector(".layerView");
    var lockBtn = main.querySelector(".layerLock");

    Object.assign(Layers[id].Layer, {main, hideBtn, lockBtn})

    main.addEventListener("mousedown", function(e){
        Permission(e.shiftKey, obj);
    })

    hideBtn.addEventListener("click", function(){
        console.log("view");
        if(obj.Layer.hide){
            obj.Layer.hide = false;
            obj.Layer.hideBtn.style.opacity = 0.2;
            obj.show();
        }else{
            obj.Layer.hide = true;
            obj.Layer.hideBtn.style.opacity = 1;
            obj.hide();
            deSelect();
        }
    });


    lockBtn.addEventListener("click", function(e){
        console.log("lock");
        if(obj.Layer.lock){
            obj.Layer.lock = false;
            obj.Layer.lockBtn.style.opacity = 0.2;
            obj.draggable(true);
        }else{
            obj.Layer.lock = true;
            obj.Layer.lockBtn.style.opacity = 1;
            obj.draggable(false);
            deSelect();
        }
    });


    selectItem({layer: obj});
    CheckOrganizer();
}

function CheckOrganizer(){
    if(IDE.selectedLayers[0].Layer.type === "check"){
        IDE.workSpace.rightAnswer.innerHTML = "";
        Layers.map(function(e){
            IDE.workSpace.rightAnswer.innerHTML += `<option value="${e.Layer.name}">${e.Layer.name}</option>`;
        });
    }
}

function addOrganizedLayer(List, id){
    for(var x=List.length-1; x>-1; x--){
        Layers[List[x]].moveToTop();
    }

    selectItem({layer: Layers[id]})
}

function delOrganizedLayer(){
    Layers.map(function(o,i){
        o.Layer.id = i;
    });
}

var LayerSR = addSR({
    Main: document.querySelector("#LayerMain"),
    Container: document.querySelector(".SR_container2"),
    dropHTML: `<div class="X2_Box"></div>`,
    Before: true,
    AddFNC: addOrganizedLayer,
    DelFNC: delOrganizedLayer
});

var SceneSR = addSR({
    Main: document.querySelector("#SR_Scene_Main"),
    Container: document.querySelector(".SR_Scene_Container"),
    dropHTML: `<div class="SR_Scene_Drop"></div>`,
    Before: false,
    AddFNC: sceneChangeSort,
    DelFNC: sceneDelete
});

function getProp(){
    if(IDE.selectedLayers.length){
        IDE.workSpace.leftInput.value = SELECT.x()-IDE.layer.x;
        IDE.workSpace.topInput.value = SELECT.y()-IDE.layer.y;
        IDE.workSpace.widthInput.value = SELECT.width();
        IDE.workSpace.heightInput.value = SELECT.height();
    }else{
        IDE.workSpace.leftInput.value = "";
        IDE.workSpace.topInput.value = "";
        IDE.workSpace.widthInput.value = "";
        IDE.workSpace.heightInput.value = "";
    }
}

/* Object Delete */
document.addEventListener("keyup", function(e){
    if((e.keyCode === 8 || e.keyCode === 46)){
        if(IDE.scope === "Stage" && Layers.length){
            IDE.selectedLayers.forEach(function(SL){
                for(var i=0; i<Layers.length; i++){
                    if(SL.Layer.id === Layers[i].Layer.id){
                        Layers[i].destroy();
                        Layers.splice(i, 1);
                        LayerSR.deleted(i);
                        break;
                    }
                }
            });

            CheckOrganizer();
            deSelect();
        }else if(IDE.scope === "Scene"){
            SceneSR.deleted(jsonV2.slides[sceneIndex].sceneID);
        }
    }

});


/* Objects Position Change */
document.addEventListener("keydown", function(e){
    var key = [37, 38, 39, 40];
    if(IDE.scope === "Stage" && key.includes(e.keyCode)){
        IDE.selectedLayers.forEach(function (Layer){
            var LayerX = Layer.x();
            var LayerY = Layer.y();

            if(e.keyCode === 37){
                Layer.x( LayerX-1 );
            } else if(e.keyCode === 39){
                Layer.x( LayerX+1 );
            } else if(e.keyCode === 38){
                Layer.y( LayerY-1 );
            } else if(e.keyCode === 40){
                Layer.y( LayerY+1 );
            }
        });
        getProp();
    }
});

function changeAllXPosition(newX){
    if(IDE.selectedLayers.length){
        var oldX = SELECT.x() - IDE.layer.x;
        if(oldX > newX){
            IDE.selectedLayers.forEach(function (Layer){
                var result = Layer.x() - (oldX-newX)
                Layer.x(result);
            });
        }else if(oldX < newX){
            IDE.selectedLayers.forEach(function (Layer){
                var result = Layer.x() + (newX-oldX);
                Layer.x(result);
            });
        }
    }
}

function changeAllYPosition(newY){
    if(IDE.selectedLayers.length){
        var oldY = SELECT.y() - IDE.layer.y;
        if(oldY > newY){
            IDE.selectedLayers.forEach(function (Layer){
                var result = Layer.y() - (oldY-newY)
                Layer.y(result);
            });
        }else if(oldY < newY){
            IDE.selectedLayers.forEach(function (Layer){
                var result = Layer.y() + (newY-oldY);
                Layer.y(result);
            });
        }
    }
}

/* add Create Events */
$("#CreateSelect").on("click", function(){
    CREATE.CheckFNC({
        properties:{
            x: Layers.length*50,
            y: Layers.length*50,
            width: 50,
            height: 50,
            draggable: true,
        },
        container: KonvaLayer,
        layer: {
            name: "select",
            type: "objectMovieClip"
        }
    });
});

$("#CreateText").on("click", function(){
    CREATE.textFNC({
        properties:{
            text: "text",
            x: Layers.length*50,
            y: Layers.length*50,
            width: 33,
            fontSize: 20,
            fontFamily: "Arial",
            fill: "black",
            draggable: true
        },
        container: KonvaLayer,
        layer:{
            name: "text",
            type: "objectText"
        },
        addLayer: true
    });


});


IDE.workSpace.uploadImageForm.addEventListener("change", function(e){
    uploadImageAjax( new FormData(this) );
});


function OpenMovieClip(mc){
    console.log(mc);
    //EXPORT.convertMovieClip(mc);
    deSelect();
    IDE.konvaEditLayer = new Konva.Layer(IDE.layer);
    stage.add(IDE.konvaEditLayer);

    var deleteObject = [];

    var currentScale = mc.scale();
    var addBG = new Konva.Rect({
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        fill: "rgba(255, 255, 255, 0.2)",
        draggable: false
    });

    var tr;
    addBG.on("dblclick", function () {
        addBG.destroy();
        tr.destroy();
        CloseMovieClip(mc, currentScale);
    });

    IDE.konvaEditLayer.add(addBG);

    mc.getChildren().map(function(Object){
        var copyObject = Object.clone();
        copyObject.Layer = Object.Layer;
        copyObject.x( Object.getAbsolutePosition().x-50 ).y( Object.getAbsolutePosition().y-50 ).scale(currentScale);
        IDE.konvaEditLayer.add(copyObject);
        console.log(copyObject.Layer);
        if(copyObject.Layer.type === "objectRect"){
            copyObject.draggable(true);
            tr = new Konva.Transformer({
                flipEnabled: false,
                rotateEnabled: false,
                nodes: [copyObject]
            })
            IDE.konvaEditLayer.add(tr);
            tr.moveToTop();
        }
        deleteObject.push(Object);
    });

    for(var x=0; x<deleteObject.length; x++){
        deleteObject[x].destroy();
    }
}

function CloseMovieClip(mc, currentScale){
    IDE.konvaEditLayer.getChildren().map(function(Object){
        var convertX = (Object.x()-mc.x()) /currentScale.x;
        var convertY = (Object.y()-mc.y()) /currentScale.y;
        var convertWidth = ((Object.scale().x/currentScale.x)*Object.width());
        var convertHeight = ((Object.scale().y/currentScale.y)*Object.height());
        Object.x(convertX).y(convertY).width(convertWidth).height(convertHeight).draggable(false).scale({x:1, y:1});
        var clone = Object.clone();
        clone.Layer = Object.Layer;
        console.log("Object.Layer", clone, clone.Layer);
        mc.add(clone);
    });
    IDE.konvaEditLayer.destroy();
}

/* IDE Scopes */
IDE.workSpace.scope_Canvas.addEventListener("mousedown", function(e) {
    if(IDE.scope === "EditText"){
        IDE.text.currentCanvas.text(IDE.text.editBox.innerText).width(IDE.text.editBox.offsetWidth+2);
        IDE.text.editBox.style.display = "none";
        IDE.text.currentCanvas.show();
        selectItem({layer: IDE.text.currentCanvas});
        IDE.text.editBox.remove();
    }

    IDE.scope = "Stage";
    if(!e.shiftKey && !IDE.selectedLayers.length){
        IDE.selectedLayers = [];
    }

    IDE.selected = false;
}, true);

IDE.workSpace.scope_Canvas.addEventListener("mousedown", function(e) {
    if(!IDE.selected && !IDE.tranforming){
        deSelect();
    }
}, false);


IDE.workSpace.scope_Scene.addEventListener("mousedown", function(){
    IDE.scope = "Scene";
});

IDE.workSpace.scope_RightWorkSpace.addEventListener("mousedown", function(){
    IDE.scope = "WorkSpace";
});



document.querySelector("#export").addEventListener("click", function(){
    var json = EXPORT.convertJson();
    Player = new PLAYER();
    Player.CreateScene(json, sceneIndex);
    IDE.workSpace.previewMain.style.display = "block";
});

document.querySelector("#save").addEventListener("click", function(){
    var json = EXPORT.convertJson();
    //StorageSave(json);
    saveDataAjax(json);
    console.log( json );
    console.log("bitti");
});

IDE.workSpace.previewClose.addEventListener("click", function(){
    console.log("close preview");
    document.querySelector("#PlayerScene").remove();
    Player = null;
    IDE.workSpace.previewMain.style.display = "none";
});

/* Workspace-Properties */
IDE.workSpace.leftInput.addEventListener("keypress", function(e) {
    if (event.key === "Enter") {
        changeAllXPosition(Number(e.target.value));
    }
});
IDE.workSpace.leftInput.addEventListener("focus", function(e) {
    IDE.scope = "WorkSpace";
});

IDE.workSpace.leftInput.addEventListener("change", function(e) {
    changeAllXPosition(Number(e.target.value));
});

IDE.workSpace.topInput.addEventListener("keypress", function(e) {
    if (event.key === "Enter") {
        changeAllYPosition(Number(e.target.value));
    }
});

IDE.workSpace.topInput.addEventListener("focus", function(e) {
    IDE.scope = "WorkSpace";
});

IDE.workSpace.topInput.addEventListener("change", function(e) {
    changeAllYPosition(Number(e.target.value));
});

/*
IDE.workSpace.topInput.addEventListener("blur", function(e) {
    console.log("Top blur", Number(e.target.value));
    changeAllYPosition(Number(e.target.value));
    IDE.scope = "Stage";
});

IDE.workSpace.leftInput.addEventListener("blur", function(e) {
    console.log("Left blur", Number(e.target.value));
    changeAllXPosition(Number(e.target.value));
    IDE.scope = "Stage";
});
*/



/* Workspace-Align*/
IDE.workSpace.align_Left.addEventListener("click", function(){
    ALIGN.Left(IDE.selectedLayers);
});
IDE.workSpace.align_HorizontalCenter.addEventListener("click", function(){
    ALIGN.HorizontalCenter(IDE.selectedLayers);
});
IDE.workSpace.align_Right.addEventListener("click", function(){
    ALIGN.Right(IDE.selectedLayers);
});
IDE.workSpace.align_Top.addEventListener("click", function(){
    ALIGN.Top(IDE.selectedLayers);
});
IDE.workSpace.align_VerticalCenter.addEventListener("click", function(){
    ALIGN.VerticalCenter(IDE.selectedLayers);
});
IDE.workSpace.align_Bottom.addEventListener("click", function(){
    ALIGN.Bottom(IDE.selectedLayers);
});
IDE.workSpace.align_SpaceHorizontal.addEventListener("click", function(){
    ALIGN.SpaceHorizontal(IDE.selectedLayers);
});
IDE.workSpace.align_SpaceVertical.addEventListener("click", function(){
    ALIGN.SpaceVertical(IDE.selectedLayers);
});
IDE.workSpace.align_CenterStage.addEventListener("click", function(){
    ALIGN.CenterStage(IDE.selectedLayers);
});

/* Welcome Menü */
IDE.welcome.newFileBtn.addEventListener("click", function(){
    if(IDE.welcome.addFileInput.value.length){
        jsonV2.fileName = IDE.welcome.addFileInput.value; console.log(IDE.welcome.addFileInput.value, "yazılmış");
    }else{
        jsonV2.fileName = "untitled_"+ utils.addTimeStamp("standart");
    }

    jsonV2.createTime = utils.addTimeStamp("server");
    newFileAjax(jsonV2);
});

/* WorkSpace RightAnswer */
IDE.workSpace.rightAnswer.addEventListener("change", function (){
    jsonV2.slides[sceneIndex].rightAnswer = IDE.workSpace.rightAnswer.value;
});

function WorkspaceShow(){
    var WorkView = document.querySelectorAll(".WorkView");
    WorkView.forEach(function(WorkView){
        WorkView.style.visibility = "visible";
    });
}


