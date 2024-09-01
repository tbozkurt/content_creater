function Arayuz_addLayer(obj, container){
    if(utils.editLayerControl(container)){
        var id = Layers.length;
        var hide = false;
        var lock = false;
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

        var main = TempHTML.querySelector(".layer");
        var hideBtn = main.querySelector(".layerView");
        var textInput = main.querySelector(".layerName");
        var lockBtn = main.querySelector(".layerLock");

        Object.assign(obj.Layer, {main, hideBtn, lockBtn, textInput});

        main.addEventListener("mousedown", function(e){
            Permission(e.shiftKey, obj);
        })

        hideBtn.addEventListener("click", function(){
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

        CREATE.checkKontrol();
        bune(obj, null);
    }else{
        bune(obj, true);
    }



    /*
    obj.on("mousedown", function(e){
        Permission(e.evt.shiftKey, obj);
        getProp(true);
    }).on("mouseup", function(){
        getProp(false);
        currentHistoryStep = 0;
        addHistory();
    }).on("dragmove", function(){
        getProp(false);
    }).on("transform", function(){
        getProp(false);
    }).on("transformend", function(){
        console.log("transformend");
        addHistory();
    });

    if(obj.Layer.type === "objectText"){
        obj.off("transform");
        obj.on("dblclick", function(){
            openTextEditor(this);
        }).on("transform", function(){
            getProp(false);
            textResize(this);
        });
    }

    if(obj.Layer.type === "objectMovieClip"){
        obj.on('dblclick', function(){
            OpenMovieClip(obj);
        });
    }

    deSelect();
    */
}


function bune(obj, konvaEditLayer){
    if(konvaEditLayer){
        obj.Layer.id = utils.getRandomNumber(5000);
    }

    obj.on("mousedown", function(e){
        Permission(e.evt.shiftKey, obj);
        getProp(true);
    }).on("mouseup", function(){
        getProp(false);
        currentHistoryStep = 0;
        addHistory();
    }).on("dragmove", function(){
        getProp(false);
    }).on("transform", function(){
        getProp(false);
    }).on("transformend", function(){
        addHistory();
    });

    if(obj.Layer.type === "objectText"){
        obj.off("transform");
        obj.on("dblclick", function(){
            openTextEditor(this);
        }).on("transform", function(){
            getProp(false);
            textResize(this);
        });
    }

    if(obj.Layer.type === "objectMovieClip"){
        obj.on('dblclick', function(){
            OpenMovieClip(obj);
            CloseMovieClip(obj);
            OpenMovieClip(obj);
        });
    }

    deSelect();
}

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


function addOrganizedLayer(List, id){
    for(var x=List.length-1; x>-1; x--){
        Layers[List[x]].moveToTop();
    }

    selectItem({layer: Layers[id]})
}


function closeTextEditor(){
    if(IDE.scope === "EditText"){
        IDE.text.currentCanvas.text(IDE.text.editBox.innerText).width(IDE.text.editBox.offsetWidth+2);
        IDE.text.editBox.style.display = "none";
        IDE.text.currentCanvas.show();
        selectItem({layer: IDE.text.currentCanvas});
        IDE.text.editBox.remove();
    }
}

function focusTextEditor() {
    var range = document.createRange();
    var select = window.getSelection();
    var lastNodes = IDE.text.editBox.childNodes[IDE.text.editBox.childNodes.length-1];
    range.setStart(lastNodes, lastNodes.length);
    range.collapse(true);
    select.removeAllRanges();
    select.addRange(range);
}

function textResize(text){
    text.setAttrs({
        width: text.width() * text.scaleX(),
        scaleX: 1
    });
}

function openTextEditor(text){
    if(text.getParent().nodeType !== "Group"){
        var textPosition = text.getAbsolutePosition();
        IDE.text.write = true;
        IDE.scope = "EditText";

        var currentCSS = {
            left: textPosition.x + IDE.text.leftSpace +"px",
            top: textPosition.y + IDE.text.topSpace +"px",
            width: text.width(),
            height: text.height(),
            fontSize: 20+"px",
            fontFamily: "Arial",
            color: text.fill(),
            lineHeight: text.lineHeight(),
            position: "absolute",
            border: "none",
            resize: "none",
            overflow: "hidden",
            padding: 0,
            outline: "none",
            backgroundColor: "white",
            display: "inline-block"
        }

        let div = document.createElement('div');
        div.contentEditable = "true";
        div.id = "textEditBox";
        document.body.appendChild(div);
        IDE.text.editBox = document.querySelector("#textEditBox");
        IDE.text.currentCanvas = text;

        IDE.text.editBox.innerText = text.text();
        Object.assign(IDE.text.editBox.style, currentCSS);

        focusTextEditor();
        text.hide();
        deSelect();
    }
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

function getProp(sameValueSearch){
    if(sameValueSearch){
        IDE.propValues={};
        IDE.selectedLayers.map(function(e){
            var props = {width: e.width(), height: e.height(), scaleW: e.scaleX(), scaleH: e.scaleY()}
            for(var p in props){
                if(IDE.propValues[p] === undefined){
                    IDE.propValues[p] = props[p];
                }else{
                    if(IDE.propValues[p] !== props[p]){
                        IDE.propValues[p] = "";
                    }
                }
            }
        });
    }

    if(IDE.selectedLayers.length === 1){
        //IDE.workSpace.leftInput.value = IDE.selectedLayers[0].x();
        //IDE.workSpace.leftInput.value = IDE.selectedLayers[0].y();
        //IDE.workSpace.widthInput.value = IDE.selectedLayers[0].width();
        //IDE.workSpace.heightInput.value = IDE.selectedLayers[0].height();
        IDE.workSpace.leftInput.value = SELECT.x()-IDE.layer.x;
        IDE.workSpace.topInput.value = SELECT.y()-IDE.layer.y;
        IDE.workSpace.widthInput.value = SELECT.width();
        IDE.workSpace.heightInput.value = SELECT.height();
        IDE.workSpace.scaleWInput.value = IDE.selectedLayers[0].scaleX()*100;
        IDE.workSpace.scaleHInput.value = IDE.selectedLayers[0].scaleY()*100;
    }else if(IDE.selectedLayers.length){
        IDE.workSpace.leftInput.value = SELECT.x()-IDE.layer.x;
        IDE.workSpace.topInput.value = SELECT.y()-IDE.layer.y;
        IDE.workSpace.widthInput.value = IDE.propValues.width;
        IDE.workSpace.heightInput.value = IDE.propValues.height;
        if(IDE.propValues.scaleW===""){
            IDE.workSpace.scaleWInput.value = "";
        }else{
            IDE.workSpace.scaleWInput.value = IDE.propValues.scaleW*100;
        }

        if(IDE.propValues.scaleH===""){
            IDE.workSpace.scaleHInput.value = "";
        }else{
            IDE.workSpace.scaleHInput.value = IDE.propValues.scaleH*100;
        }
    } else{
        IDE.workSpace.leftInput.value = "";
        IDE.workSpace.topInput.value = "";
        IDE.workSpace.widthInput.value = "";
        IDE.workSpace.heightInput.value = "";
        IDE.workSpace.scaleWInput.value = "";
        IDE.workSpace.scaleHInput.value = "";
    }
}

/* Object Delete */
document.addEventListener("keyup", function(e){
    if((e.keyCode === 8 || e.keyCode === 46)){
        //if(IDE.scope === "Stage" && Layers.length){
        if(IDE.scope === "Stage"){
            deleteObject();
        }else if(IDE.scope === "Scene"){
            SceneSR.deleted(jsonV2.slides[sceneIndex].sceneID);
        }
    }
});

function deleteObject(){
    var allObj = IDE.activeLayer.getChildren();
    var relatedObject = false;
    IDE.selectedLayers.forEach(function(SL){
        if(utils.editLayerControl(IDE.activeLayer)){
            for(var i=0; i<Layers.length; i++){
                if(SL.Layer.id === Layers[i].Layer.id){
                    Layers[i].destroy();
                    Layers.splice(i, 1);
                    LayerSR.deleted(i);

                    if(SL.Layer.name.includes("popup")){
                        relatedObject = true;
                    }

                    break;
                }
            }
        }else{
            allObj.map(function(e){
                if(e.Layer){
                    if(SL.Layer.id === e.Layer.id){
                        e.destroy();
                    }
                }
            })
        }
    });

    CREATE.checkKontrol();
    deSelect();
    searchRelatedObject(relatedObject);
}

function searchRelatedObject(relatedObject){
    if(relatedObject){
        var allObj = IDE.activeLayer.getChildren();
        allObj.forEach(function(e){
            if(e.Layer){
                if(e.Layer.name.includes("popup")){
                    IDE.selectedLayers.push(e);
                }
            }
        });

        deleteObject();
        IDE.workSpace.createPopup.style.pointerEvents = "auto";
        IDE.workSpace.createPopup.style.opacity=1;
    }
}

function searchSingleUseObject(){
    var found = false;
    var allObj = IDE.activeLayer.getChildren();
    allObj.map(function(e){
        if(e.Layer){
            if(e.Layer.name.includes("popup")){
                found = true;
            }
        }
    });

    if(found){
        IDE.workSpace.createPopup.style.pointerEvents = "none";
        IDE.workSpace.createPopup.style.opacity=0.5;
    }else{
        IDE.workSpace.createPopup.style.pointerEvents = "auto";
        IDE.workSpace.createPopup.style.opacity=1;
    }
}

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
        getProp(false);
    }
});

function changeLeft(newX){
    if(IDE.selectedLayers.length){
        var current = SELECT.x() - IDE.layer.x;
        var fark = newX - current;

        IDE.selectedLayers.forEach(function (Layer){
            var current = Layer.x()+fark;
            Layer.x(current);
        });

        getProp(true);
    }
}

function changeTop(newY){
    if(IDE.selectedLayers.length){
        if(IDE.selectedLayers.length){
            var current = SELECT.y() - IDE.layer.y;
            var fark = newY - current;

            IDE.selectedLayers.forEach(function (Layer){
                var current = Layer.y()+fark;
                Layer.y(current);
            });

            getProp(true);
        }


/*        var oldY = SELECT.y() - IDE.layer.y;
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

        getProp(true);*/
    }
}

function changeWidth(newWidth){
    IDE.selectedLayers.map(function(obj){
        if(obj.Layer.type==="objectRect" || obj.Layer.type==="objectImg"){
            obj.width(newWidth);
        }
    });

    getProp(true);
}

function changeHeight(newHeight){
    IDE.selectedLayers.map(function(obj){
        if(obj.Layer.type==="objectRect" || obj.Layer.type==="objectImg"){
            obj.height(newHeight);
        }
    });

    getProp(true);
}

function changeScale(e, mode){
    var current = Number(e.target.value);
    var newScale = current/100;
    var checked = IDE.workSpace.ratioCheck.checked;

    IDE.selectedLayers.map(function(obj){
        if(checked){
            obj.scale({x:newScale, y:newScale});
        }else{
            if(mode==="width"){
                obj.scaleX(newScale);
            }else{
                obj.scaleY(newScale);
            }
        }
    });

    getProp(true);
}

/* add Create Events */
IDE.workSpace.createSelect.addEventListener("click", function(){
    var position = utils.getRandomPosition(640, 360, 150);
    CREATE.CheckFNC({
        properties:{
            x: position.x,
            y: position.y,
            width: 50,
            height: 50,
            draggable: true,
        },
        container: IDE.activeLayer,
        layer: {
            name: "selectButon",
            type: "objectMovieClip"
        }
    });
});

IDE.workSpace.createText.addEventListener("click", function(){
    var position = utils.getRandomPosition(640, 360, 150);
    CREATE.textFNC({
        properties:{
            text: "text",
            x: position.x,
            y: position.y,
            width: 33,
            fontSize: 20,
            fontFamily: "Arial",
            fill: "#000000",
            draggable: true
        },
        container: IDE.activeLayer,
        layer:{
            name: "text",
            type: "objectText"
        },
        addLayer: true
    });
});

IDE.workSpace.createRect.addEventListener("click", function(){
    var position = utils.getRandomPosition(640, 360, 150);
    CREATE.rectFNC({
        properties:{
            text: "text",
            x: position.x,
            y: position.y,
            width: 150,
            height: 150,
            fill: "#bdbdbd",
            draggable: true
        },
        container: IDE.activeLayer,
        layer:{
            name: "rect",
            type: "objectRect"
        },
        addLayer: true
    });
});

IDE.workSpace.createPopup.addEventListener("click", function(){
    CREATE.addSolutionWindow({
        properties:{
            x: 400,
            y: 50,
            width: 600,
            height: 600,
            draggable: true,
        },
        container: IDE.activeLayer,
        layer: {
            name: "popupWindow_0",
            elementID: "popupWindow_0",
            type: "objectMovieClip",
            class: "hide"
        }
    });

    CREATE.addSolutionButon({
        properties:{
            x: 690,
            y: 650,
            width: 200,
            height: 50,
            draggable: true,
        },
        container: IDE.activeLayer,
        layer: {
            name: "popupButon_0",
            elementID: "popupButon_0",
            type: "objectMovieClip",
            class: "semiopacity"
        }
    });

    this.style.pointerEvents = "none";
    this.style.opacity = 0.5;
});

IDE.workSpace.uploadImageForm.addEventListener("change", function(e){
    uploadImageAjax( new FormData(this) );
});


IDE.workSpace.colorPicker.addEventListener("change",function(){
    colorPicker(true);
});

function showWorkSpaces(){
    IDE.workSpace.WorkSpace_Layer.style.display = "block";
    IDE.workSpace.WorkSpace_SpecialObjects.style.display = "block";
    IDE.workSpace.WorkSpace_Preview.style.display = "block";
    IDE.workSpace.WorkSpace_RightAnswer.style.display = "block";
    IDE.workSpace.WorkSpace_Scene.style.display = "flex";
}

function hideWorkSpaces(){
    IDE.workSpace.WorkSpace_Layer.style.display = "none";
    IDE.workSpace.WorkSpace_SpecialObjects.style.display = "none";
    IDE.workSpace.WorkSpace_Preview.style.display = "none";
    IDE.workSpace.WorkSpace_RightAnswer.style.display = "none";
    IDE.workSpace.WorkSpace_Scene.style.display = "none";
}

function OpenMovieClip(mc){
    deSelect();
    hideWorkSpaces();
    SELECT = IDE.editSelect;
    IDE.activeLayer = IDE.editLayer;
    IDE.editLayer.x(50);
    var deleteObject = [];
    var movieClipScale = mc.scale();
    var selectMode = false;

    IDE.editBG.off("dblclick");
    IDE.editBG.on("dblclick", function(){
        CloseMovieClip(mc, movieClipScale);
    });

    if(mc.Layer.elementID){
        if(mc.Layer.elementID.indexOf("selectButon") > -1){
            selectMode = true;
        }
    }

    mc.getChildren().map(function(Object){
        if(Object.Layer){
            var copyObject = Object.clone();
            copyObject.Layer = Object.Layer;
            var scaleX = (Object.scale().x * movieClipScale.x);
            var scaleY = (Object.scale().y * movieClipScale.y);

            copyObject.x( Object.getAbsolutePosition().x-50 );
            copyObject.y( Object.getAbsolutePosition().y-50 );

            copyObject.scale({x:scaleX, y:scaleY});
            IDE.editLayer.add(copyObject);
            if(!selectMode){
                bune(copyObject, true);
                copyObject.draggable(true);
            }else{
                if(copyObject.Layer.class === "csMask"){
                    bune(copyObject, true);
                    copyObject.draggable(true);
                }
            }
            deleteObject.push(Object);
        }
    });

    for(var x=0; x<deleteObject.length; x++){
        deleteObject[x].destroy();
    }
}


function CloseMovieClip(mc){
    var deleteObject = [];
    var movieClipScale = mc.scale();

    IDE.editLayer.getChildren().map(function(Object){
        if(Object.Layer){
            var convertX = (Object.x()-mc.x()) /movieClipScale.x;
            var convertY = (Object.y()-mc.y()) /movieClipScale.y;
            var scaleX = (Object.scale().x / movieClipScale.x);
            var scaleY = (Object.scale().y / movieClipScale.y);
            Object.x(convertX).y(convertY);
            Object.scale({x:scaleX, y:scaleY});
            Object.draggable(false);
            Object.off("click mousedown mouseup dragmove transform transformstart transformend dblclick dbltap");
            var clone = Object.clone();
            clone.Layer = Object.Layer;
            mc.add(clone);
            deleteObject.push(Object);
        }
    });

    for(var x=0; x<deleteObject.length; x++){
        deleteObject[x].destroy();
    }

    SELECT = IDE.sceneSelect;
    IDE.activeLayer = IDE.sceneLayer;
    IDE.editLayer.x(1400);
    showWorkSpaces();
}

/* IDE Scopes */
IDE.workSpace.scope_Canvas.addEventListener("mousedown", function(e) {
    closeTextEditor();

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
    closeTextEditor();
    IDE.scope = "Scene";
});

IDE.workSpace.scope_RightWorkSpace.addEventListener("mousedown", function(){
    closeTextEditor();
    IDE.scope = "WorkSpace";
});



document.querySelector("#export").addEventListener("click", function(){
    var json = EXPORT.convertJson();
    Player = new PLAYER();
    IDE.workSpace.previewMain.style.display = "block";
    Player.startBuild(json, sceneIndex, IDE.stage.bg, IDE.workSpace.playerContainer, "preview", ("files/"+ IDE.files.activeFile +"/"));
    hideWorkSpaces();
});

document.querySelector("#save").addEventListener("click", function(){
    var json = EXPORT.convertJson();
    //StorageSave(json);
    saveDataAjax(json);
    console.log( json );
    console.log("kaydedildi");
});

IDE.workSpace.previewClose.addEventListener("click", function(){
    document.querySelector("#PlayerMain").remove();
    Player = null;
    IDE.workSpace.previewMain.style.display = "none";
    showWorkSpaces();
});

/* Workspace-Properties */
function focusWorkSpaces(){
    IDE.scope = "WorkSpace";
}

//Left Input
IDE.workSpace.leftInput.addEventListener("focus", focusWorkSpaces);
IDE.workSpace.leftInput.addEventListener("change", function(e) {
    changeLeft(Number(e.target.value));
});

/*
IDE.workSpace.leftInput.addEventListener("keypress", function(e) {
    console.log("BB");
    if (event.key === "Enter") {
        IDE.workSpace.leftInput.pointerEvents = "none";
        changeLeft(Number(e.target.value));
        IDE.workSpace.leftInput.pointerEvents = "auto";

    }
});
*/

//Top Input
IDE.workSpace.topInput.addEventListener("focus", focusWorkSpaces);
IDE.workSpace.topInput.addEventListener("change", function(e) {
    changeTop(Number(e.target.value));
});
/*
IDE.workSpace.topInput.addEventListener("keypress", function(e) {
    if (event.key === "Enter") {
        changeTop(Number(e.target.value));
    }
});
*/


//Width Input
IDE.workSpace.widthInput.addEventListener("focus", focusWorkSpaces);
IDE.workSpace.widthInput.addEventListener("change", function(e) {
    changeWidth(Number(e.target.value));
});

/*
IDE.workSpace.widthInput.addEventListener("keypress", function(e) {
    if (event.key === "Enter") {
        changeWidth(Number(e.target.value));
    }
});
*/

//Height Input
IDE.workSpace.heightInput.addEventListener("focus", focusWorkSpaces);
IDE.workSpace.heightInput.addEventListener("change", function(e) {
    changeHeight(Number(e.target.value));
});

/*
IDE.workSpace.heightInput.addEventListener("keypress", function(e) {
    if (event.key === "Enter") {
        changeHeight(Number(e.target.value));
    }
});
*/


//Scale Input
IDE.workSpace.scaleWInput.addEventListener("focus",focusWorkSpaces);
IDE.workSpace.scaleWInput.addEventListener("change", function(e) {
    changeScale(e, "width");
});

/*
IDE.workSpace.scaleWInput.addEventListener("keypress", function(e) {
    if (event.key === "Enter") {
        changeScale(e, "width");
    }
});
*/

//Scale Input
IDE.workSpace.scaleHInput.addEventListener("focus",focusWorkSpaces);
IDE.workSpace.scaleHInput.addEventListener("change", function(e) {
    changeScale(e, "height");
});

/*
IDE.workSpace.scaleHInput.addEventListener("keypress", function(e) {
    if (event.key === "Enter") {
        changeScale(e, "height");
    }
});
*/

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

IDE.workSpace.align_ScaleAuto.addEventListener("click", function(){
    ALIGN.ScaleAuto(IDE.selectedLayers);
    getProp(true);
});

/* Welcome Menü */
IDE.welcome.newFileBtn.addEventListener("click", function(){
    if(IDE.welcome.addFileInput.value.length){
        jsonV2.fileName = IDE.welcome.addFileInput.value;
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


var ctrlDown=false, ctrlKey=17, cmdKey=91, vKey=86, cKey=67;
document.addEventListener("keydown", function(e){
    if (e.keyCode === ctrlKey || e.keyCode === cmdKey){
        ctrlDown = true;
    }
});

document.addEventListener("keyup", function(e){
    if (e.keyCode === ctrlKey || e.keyCode === cmdKey){
        ctrlDown = false;
    }
});

document.addEventListener("keydown", function(e){
    if (ctrlDown && (e.keyCode === cKey)) {
        console.log("Document catch Ctrl+C");
        if(IDE.selectedLayers.length){
            IDE.copy = IDE.selectedLayers[0];
        }
    }

    if(ctrlDown && (e.keyCode === vKey)){

        if(IDE.scope === "Scene"){
            var json = EXPORT.convertJson();
            var stringData = JSON.stringify(json.slides[sceneIndex].all);
            var jsonData = JSON.parse(stringData);
            var template = sceneTemplate();
            template.all = jsonData;
            sceneAddNewScene(true, template);
        }else{
            if(IDE.copy){
                console.log("Document catch Ctrl+V");
                if(IDE.copy.children){
                    IDE.copy.children.map(function(e){
                        e.attrs.Layer = e.Layer;
                    });
                }

                var orjLayer = IDE.copy.Layer;
                var clone = IDE.copy.clone( utils.getRandomPosition(IDE.copy.x(), IDE.copy.y(), 60) );

                clone.off("click mousedown mouseup dragmove transform transformstart transformend dblclick dbltap");
                clone.Layer = {name: orjLayer.name, type: orjLayer.type};
                IDE.sceneLayer.add(clone);

                if(clone.children){
                    clone.children.map(function(e){
                        e.Layer = e.attrs.Layer;
                        delete e.attrs.Layer;
                    });
                }

                Arayuz_addLayer(clone, IDE.sceneLayer);
            }
        }
    }else if(ctrlDown && (e.key === "z")){
        backHistory();
    }else if(ctrlDown && (e.key === "b")){
        nextHistory();
    }
});


var temp = [];
var historyStep=0;

function addHistory(){
    var temp2 = [];
    temp.splice(historyStep);

    Layers.map(function(e){
        var randomName = utils.getRandomName();
        if(!e.attrs.unique){
            e.attrs.unique = randomName;
        }

        var klon = {
            x: e.x(),
            y: e.y(),
            width: e.width(),
            height: e.height(),
            scaleX: e.scaleX(),
            scaleY: e.scaleY(),
            offsetX: e.offsetX(),
            offsetY: e.offsetY(),
            unique: e.attrs.unique
        }

        if(e.Layer.type === "objectRect" || e.Layer.type === "objectText"){
            klon.fill = e.fill();
        }

        temp2.push(klon);
    });

    temp.push(temp2);
    if(temp.length>10){
        temp.shift();
    }

    historyStep = temp.length;
}


function nextHistory(){
    console.log("backHistory",historyStep);
    historyStep++;
    if(historyStep > temp.length){
        historyStep = temp.length;
    }
    historyProgress();
}

function backHistory(){
    console.log("nextHistory");
    historyStep--;
    if(historyStep < 1){
        historyStep=1;
    }
    historyProgress();
}

function historyProgress(){
    var history = temp[historyStep-1];
    console.log(history, historyStep);

    //History silinmiş öğenin geri getirilmesi kalsın. geri almanın değişkenlerini optimize yap.

    if(history){
        history.map(function(e){
            var found = false;
            for(var i=0; i<Layers.length; i++){
                if(Layers[i].attrs.unique){
                    if(e.unique === Layers[i].attrs.unique){
                        Layers[i].x(e.x).y(e.y).width(e.width).height(e.height).scaleX(e.scaleX).scaleY(e.scaleY);
                        Layers[i].offsetX(e.offsetX).offsetY(e.offsetY);
                        if(e.fill){
                            Layers[i].fill(e.fill);
                        }
                        found = true;
                        break;
                    }
                }
            }
        });
    }
}


IDE.workSpace.createControl.addEventListener("click", function(e){
    CREATE.addControlButon({
        properties:{
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            draggable: true,
        },
        container: IDE.activeLayer,
        layer: {
            name: "control",
            elementID: "control",
            type: "objectMovieClip",
            class: "semiopacity"
        }
    });

});


/*
document.querySelector("#omg").addEventListener("click", function(e){
    console.log("anonim click");
    //deleteFileAjax("aa");
});

document.querySelector("#omg2").addEventListener("click", function(e){
    var activeMC;
    IDE.sceneLayer.getChildren().map(function(e){
        if(e.Layer){
            activeMC = e;
        }
    });

    IDE.activeLayer = activeMC;
    console.log("değiştirildi",activeMC);
});

*/


/*
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
*/


/*
function CloseMovieClip(mc, currentScale){
    IDE.konvaEditLayer.getChildren().map(function(Object){
        if(Object.Layer){
            var convertX = (Object.x()-mc.x()) /currentScale.x;
            var convertY = (Object.y()-mc.y()) /currentScale.y;
            var convertWidth = ((Object.scale().x/currentScale.x)*Object.width());
            var convertHeight = ((Object.scale().y/currentScale.y)*Object.height());
            var convertWidth = Object.width();
            var convertHeight = Object.height();
            console.log("currentScale:",currentScale, convertWidth, convertHeight);

            Object.x(convertX);
            Object.y(convertY);
            Object.width(convertWidth);
            Object.height(convertHeight);
            Object.draggable(false);
            Object.scale({x:1, y:1});

            Object.off("click mousedown mouseup dragmove transform transformstart transformend dblclick dbltap");
            Object.draggable(false);
            var clone = Object.clone();
            clone.Layer = Object.Layer;
            console.log("Object.Layer", clone, clone.Layer);
            mc.add(clone);
        }
    });
    IDE.konvaEditLayer.destroy();
    SELECT = getSELECT();
    KonvaLayer.add(SELECT);
    IDE.activeLayer = KonvaLayer;
}
*/


