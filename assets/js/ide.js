function Arayuz_addLayer(obj){
    addWindow(obj);
    bune(obj, true);
}

function addWindow(obj){
    var unique;
    if(!obj.Layer.unique){
        unique = utils.getRandomName();
        obj.Layer.unique = unique;
    }else{
        unique = obj.Layer.unique;
    }

    var layerHtml = `<div class="layer">
            <div class="layerIcon"><img src="assets/img/${obj.Layer.type}_icon.png"></div>
            <div class="layerName">
                <div class="layerNameNormal">${obj.Layer.name}</div>
                <input class="layerNameEdit" type="text" value="${obj.Layer.name}">
            </div>
            <div class="layerZButon layerView"><img src="assets/img/layer_view.png"></div>
            <div class="layerZButon layerLock"><img src="assets/img/layer_locked.png"></div>
        </div>`;

    var TempHTML = LayerSR.clicked(layerHtml, unique);

    var main = TempHTML.querySelector(".layer");
    var hideBtn = main.querySelector(".layerView");
    var textInput = main.querySelector(".layerName");
    var lockBtn = main.querySelector(".layerLock");

    var layerNameNormal = main.querySelector(".layerNameNormal");
    var layerNameEdit = main.querySelector(".layerNameEdit");

    Object.assign(obj.Layer, {main, hideBtn, lockBtn, textInput, layerNameNormal});

    if(obj.Layer.hide === "undefined"){
        obj.Layer.hide = false;
    }else{
        if(obj.Layer.hide){
            obj.Layer.hideBtn.style.opacity = 1;
            obj.hide();
        }
    }

    if(obj.Layer.lock === "undefined"){
        obj.Layer.lock = false;
    }else{
        if(obj.Layer.lock){
            obj.Layer.lockBtn.style.opacity = 1;
            obj.listening(false);
        }
    }

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
            obj.listening(true);
        }else{
            obj.Layer.lock = true;
            obj.Layer.lockBtn.style.opacity = 1;
            obj.listening(false);
            deSelect();
        }
    });

    textInput.addEventListener("dblclick", function(){
        obj.tempName = obj.Layer.name;
        layerNameNormal.style.display = "none";
        layerNameEdit.style.display = "block";
        layerNameEdit.value = obj.Layer.name;
        layerNameEdit.focus();
        layerNameEdit.select();

        /*Draggable.get("#drag0").disable();*/
    });

    layerNameEdit.addEventListener("input", function(e){
        obj.tempName = this.value;
    });

    utils.addBlur(layerNameEdit);

    layerNameEdit.addEventListener("blur", function(e){
        if(obj.tempName.length){
            obj.Layer.name = obj.tempName;
            if(obj.Layer.type === "objectMovieClip"){
                obj.Layer.elementID = obj.tempName;
            }

            layerNameNormal.innerText = obj.tempName;
        }else{
            layerNameNormal.innerText = obj.Layer.name;
        }

        layerNameNormal.style.display = "block";
        layerNameEdit.style.display = "none";
        checkIdentity();
    });

    //CREATE.checkKontrol();
}

function bune(obj, autoSelect){
    obj.on("mousedown", function(e){
        Permission(e.evt.shiftKey, obj);
    }).on("mouseup", function(){
        getProp(false);
        currentHistoryStep = 0;
    }).on("dragmove", function(){
        getProp(false);
    }).on("transform", function(){
        getProp(false, "transform");
    }).on("transformend", function(){
        addHistory();
        rectSetSize();
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
            openMovieClip(obj);
            closeMovieClip(obj);
            openMovieClip(obj);
            XX();
        });
    }

    if(autoSelect){
        deSelect();
    }
}

function Permission(shiftKey, object){
    var selectFound = false;
    for(var i=0; i<IDE.selectedLayers.length; i++){
        if(object.Layer.unique === IDE.selectedLayers[i].Layer.unique){
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

    getProp(true);
}


function addOrganizedLayer(List, id, newList){
    var localEX = utils.getLayers();

    for(var x=(newList.length-1); x>-1; x--){
        var unique = newList[x][1];
        localEX.map(function(obj){
            if(obj.Layer.unique === unique){
                obj.moveToTop();
            }
        });
    }

    selectItem({layer: localEX[id]})
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

        var fontStyle = text.fontStyle();

        var currentCSS = {
            left: textPosition.x + IDE.text.leftSpace +"px",
            top: textPosition.y + IDE.text.topSpace +"px",
            width: Math.ceil(text.width()).toFixed(0)+"px",
            //width: "auto",
            height: Math.ceil(text.height()).toFixed(0)+"px",
            fontSize: text.fontSize().toFixed(0)+"px",
            fontFamily: text.fontFamily(),
            color: text.fill(),
            lineHeight: text.lineHeight(),
            position: "absolute",
            border: "none",
            resize: "none",
            overflow: "hidden",
            padding: 0,
            outline: "none",
            backgroundColor: "rgba(200,200,200,0.2)",
            display: "inline-block",
            textAlign: text.align(),
            fontWeight: fontStyle
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



function delOrganizedLayer(){}

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


function rectSetSize(){
    if(IDE.selectedLayers.length === 1){
        if(IDE.selectedLayers[0].Layer.type === "objectRect"){
            var modifiedWidth = SELECT.width().toFixed(0);
            var modifiedHeight = SELECT.height().toFixed(0);
            IDE.selectedLayers[0].width(parseInt(modifiedWidth)).height(parseInt(modifiedHeight)).scale({x:1, y:1});
        }
    }
}

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
        var modifiedX = SELECT.x()-(IDE.layer.x + IDE.editPosGap.x);
        var modifiedY = SELECT.y()-(IDE.layer.y + IDE.editPosGap.y);
        var modifiedWidth = SELECT.width();
        var modifiedHeight = SELECT.height();

        IDE.workSpace.leftInput.value = modifiedX.toFixed(0);
        IDE.workSpace.topInput.value = modifiedY.toFixed(0);
        IDE.workSpace.widthInput.value = modifiedWidth.toFixed(0);
        IDE.workSpace.heightInput.value = modifiedHeight.toFixed(0);

        IDE.workSpace.scaleWInput.value = (IDE.selectedLayers[0].scaleX()*100).toFixed(0);
        IDE.workSpace.scaleHInput.value = (IDE.selectedLayers[0].scaleY()*100).toFixed(0);
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
    if(e.keyCode === 46){
        if(IDE.scope === "Stage"){
            deleteObject();
        }else if(IDE.scope === "Scene"){
            SceneSR.deleted(IDE.sceneUnique);
        }
    }
});

function deleteObject(){
    var relatedObject = false;

    IDE.selectedLayers.forEach(function(SL){
        var localEX = utils.getLayers();
        for(var i=0; i<localEX.length; i++){
            if(SL.Layer.unique === localEX[i].Layer.unique){
                localEX[i].destroy();
                LayerSR.deleted( localEX[i].Layer.unique );
                if(SL.Layer.name.includes("popup")){
                    relatedObject = true;
                }

                break;
            }
        }
    });

    CREATE.checkKontrol();
    deSelect();
    searchRelatedObject(relatedObject);
    addHistory();
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

    }
}

function changeWidth(newWidth){
    IDE.selectedLayers.map(function(obj){
        if(obj.Layer.type==="objectRect" || obj.Layer.type==="objectImg" || obj.Layer.type==="objectText"){
            obj.width(newWidth);
        }
    });

    getProp(true);
}

function changeHeight(newHeight){
    IDE.selectedLayers.map(function(obj){
        if(obj.Layer.type==="objectRect" || obj.Layer.type==="objectImg" || obj.Layer.type==="objectText"){
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

function overflowCheck(check){
    if(check){
        IDE.workSpace.areaCheck.checked = true;
        IDE.workSpace.areaWInput.disabled = false;
        IDE.workSpace.areaHInput.disabled = false;
        document.querySelector(".Properties_areaW").style.opacity = 1;
        document.querySelector(".Properties_areaH").style.opacity = 1;
        if(IDE.editMC){
            IDE.editMC.Layer.overflow = true;
            IDE.workSpace.areaWInput.value = IDE.editMC.width();
            IDE.workSpace.areaHInput.value = IDE.editMC.height();
            overflowChange({width: IDE.editMC.width(), height: IDE.editMC.height() });
        }
    }else{
        IDE.workSpace.areaCheck.checked = false;
        IDE.workSpace.areaWInput.disabled = true;
        IDE.workSpace.areaHInput.disabled = true;
        document.querySelector(".Properties_areaW").style.opacity = 0.3;
        document.querySelector(".Properties_areaH").style.opacity = 0.3;
        if(IDE.editMC){
            IDE.editMC.Layer.overflow = false;
            IDE.workSpace.areaWInput.value = IDE.editPosGap.width;
            IDE.workSpace.areaHInput.value = IDE.editPosGap.height;
            overflowChange({width: IDE.editPosGap.width, height: IDE.editPosGap.height });
        }
    }
}

function overflowChange(o){
    if(o.width){
        IDE.editRect.width(o.width);
    }
    if(o.height){
        IDE.editRect.height(o.height);
    }

    if(o.changeOverFlow){
        if(o.width){
            IDE.editMC.width(o.width);
        }

        if(o.height){
            IDE.editMC.height(o.height);
        }
    }

}

IDE.workSpace.uploadImageForm.addEventListener("change", function(e){
    uploadImageAjax( new FormData(this) );
});

function showWorkSpaces(){
    IDE.workSpace.WorkSpace_Layer.style.display = "block";
    IDE.workSpace.WorkSpace_Scene.style.display = "flex";
    IDE.workSpace.topBanner_addObject.style.display = "flex";
    IDE.workSpace.WorkSpace_OverFlow.style.display = "none";
    document.querySelector("#export").style.display = "block";
    saveBtnViewStatus("block");
}

function hideWorkSpaces(){
    IDE.workSpace.WorkSpace_Layer.style.display = "block";
    IDE.workSpace.WorkSpace_Scene.style.display = "none";
    IDE.workSpace.topBanner_addObject.style.display = "none";
    IDE.workSpace.WorkSpace_OverFlow.style.display = "block";
    document.querySelector("#export").style.display = "none";
    saveBtnViewStatus("none");
}

function saveBtnViewStatus(status){
    if(IDE.fileUser === IDE.faceUser){
        document.querySelector("#topMenuSaveBtn").style.display = status;
    }else{
        document.querySelector("#topMenuSaveBtn").style.display = "none";
    }
}

function openMovieClip(mc){
    IDE.editMC = mc;
    deSelect();
    hideWorkSpaces();
    SELECT = IDE.editSelect;
    IDE.activeLayer = IDE.editLayer;
    IDE.editLayer.x(IDE.layer.x);
    var deleteObject = [];
    var movieClipScale = mc.scale();

    IDE.editBG.off("dblclick");
    IDE.editBG.on("dblclick", function(){
        closeMovieClip(mc);
        XX();
    });

    /* MC poziyonlama ve Alan çizgisi */
    var mcRect = mc.getClientRect();
    IDE.editRect.x(mcRect.x - IDE.layer.x).y(mcRect.y - IDE.layer.y)
        .width(mcRect.width)
        .height(mcRect.height);

    IDE.editPosGap = {
        x:(mcRect.x - IDE.layer.x),
        y:(mcRect.y - IDE.layer.y),
        width: mcRect.width,
        height: mcRect.height
    };

    overflowCheck(mc.Layer.overflow);
    /* ------------------ */

    mc.getChildren().map(function(Object){
        if(Object.Layer){
            var copyObject = Object.clone();
            copyObject.Layer = Object.Layer;
            var scaleX = (Object.scale().x * movieClipScale.x);
            var scaleY = (Object.scale().y * movieClipScale.y);

            copyObject.x( Object.getAbsolutePosition().x-IDE.layer.x );
            copyObject.y( Object.getAbsolutePosition().y-IDE.layer.y );

            copyObject.scale({x:scaleX, y:scaleY});
            IDE.editLayer.add(copyObject);

            bune(copyObject, false);
            copyObject.draggable(true);

            deleteObject.push(Object);
        }
    });

    for(var x=0; x<deleteObject.length; x++){
        deleteObject[x].destroy();
    }

    /*Edit History Start*/
    IDE.historyList = [];
    addHistory();
    /*------------------*/
}


function closeMovieClip(mc){
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
    IDE.editLayer.x(1500);
    showWorkSpaces();

    /*Edit History Start*/
    IDE.historyList = [];
    addHistory();
    /*------------------*/
    IDE.editPosGap = {x:0, y:0};
}

function XX(){
    LayerSR.resetSystem();
    var localEX = utils.getLayers();
    localEX.map(function(e){
        addWindow(e);
    });
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
    for(var x=0; x<json.slides.length; x++){
        if(!Object.keys(json.slides[x].answer).length){
            IDE.showTip({txt:"Bazı etkinliklerin cevap anahtarları yok, bu nedenle etkinlikler doğru çalışmayabilir.", color: "#b71c1c", time:10000, x: 257, y: 867});
            break;
        }
    }

    Player = new PLAYER();
    IDE.workSpace.previewMain.style.display = "block";
    Player.startBuild(json, sceneIndex, IDE.stage.bg, IDE.workSpace.playerContainer, "preview", {Url:("files/"+ IDE.files.activeFile +"/")} );
    hideWorkSpaces();

});

document.querySelector("#topMenuSaveBtn").addEventListener("click", function(){
    var json = EXPORT.convertJson();
    //StorageSave(json);
    saveDataAjax(json);
    console.log( json );
    console.log("kaydedildi");
    IDE.showTip({txt:"saved", color: "#1b5e20", time:1000, x: 1480, y: 862});
});

IDE.workSpace.previewClose.addEventListener("click", function(){
    document.querySelector("#PlayerMain").remove();
    Player = null;
    IDE.workSpace.previewMain.style.display = "none";
    showWorkSpaces();
});


//Left Input
utils.addBlur(IDE.workSpace.leftInput);
IDE.workSpace.leftInput.addEventListener("change", function(e) {
    var left = Number(e.target.value)+(IDE.editPosGap.x);
    changeLeft(left);
});

//Top Input
utils.addBlur(IDE.workSpace.topInput);
IDE.workSpace.topInput.addEventListener("change", function(e){
    var top = Number(e.target.value)+(IDE.editPosGap.y);
    changeTop(top);
});

//Width Input
utils.addBlur(IDE.workSpace.widthInput);
IDE.workSpace.widthInput.addEventListener("change", function(e) {
    changeWidth(Number(e.target.value));
});

//Height Input
utils.addBlur(IDE.workSpace.heightInput);
IDE.workSpace.heightInput.addEventListener("change", function(e){
    changeHeight(Number(e.target.value));
});

//Scale WInput
utils.addBlur(IDE.workSpace.scaleWInput);
IDE.workSpace.scaleWInput.addEventListener("change", function(e) {
    changeScale(e, "width");
});

//Scale HInput
utils.addBlur(IDE.workSpace.scaleHInput);
IDE.workSpace.scaleHInput.addEventListener("change", function(e) {
    changeScale(e, "height");
});


//Area Check
IDE.workSpace.areaCheck.addEventListener("change", function(e) {
    console.log("omg", this.checked);
    overflowCheck(this.checked);
});

//Area WInput
utils.addBlur(IDE.workSpace.areaWInput);
IDE.workSpace.areaWInput.addEventListener("change", function(e) {
    overflowChange({width: parseInt(e.target.value), changeOverFlow: true});
});

//Area HInput
utils.addBlur(IDE.workSpace.areaHInput);
IDE.workSpace.areaHInput.addEventListener("change", function(e) {
    overflowChange({height: parseInt(e.target.value), changeOverFlow: true});
});


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
IDE.welcome.newFileBtn.addEventListener("click", function(e){

    if(IDE.welcome.addFileInput.value.length){
        jsonV2.fileName = IDE.welcome.addFileInput.value;
    }else{
        jsonV2.fileName = "untitled_"+ utils.addTimeStamp("standart");
    }

    if(searchFile(jsonV2.fileName)){
        if (confirm(jsonV2.fileName+" isimli bir dosya mevcuttur.")) {
            IDE.welcome.addFileInput.focus();
        }
    }else{
        IDE.fileUser = IDE.faceUser;
        saveBtnViewStatus("block");
        IDE.welcome.main.style.alignItems = "center";
        IDE.welcome.step1.style.display = "none";
        IDE.welcome.step2.style.display = "block";
        IDE.welcome.step2.style.marginBottom = "50px";
        IDE.welcome.closeInput.style.display = "none";


        jsonV2.createTime = utils.addTimeStamp("server");
        document.querySelector("#Slide_fileName").innerHTML = jsonV2.fileName;
        newFileAjax(jsonV2);
    }

    e.stopPropagation();
});


/* WorkSpace Font */
IDE.workSpace.font_fontFamily.addEventListener("change", function (){
    setFontSize(null, null, this.value);
});

IDE.workSpace.font_sizeInput.addEventListener("change", function (){
    setFontSize(parseInt(this.value));
});
utils.addBlur(IDE.workSpace.font_sizeInput);

IDE.workSpace.font_colorPicker.addEventListener("change", function(){
    setFontSize(null, this.value);
});

IDE.workSpace.font_hexInput.addEventListener("change", function (){
    setFontSize(null, this.value, null);
});

utils.addBlur(IDE.workSpace.font_hexInput);


/* Color Picker */
IDE.workSpace.colorPicker.addEventListener("change",function(){
    colorPicker({color: this.value});
});

IDE.workSpace.colorInput.addEventListener("change", function(){
    colorPicker({color: this.value});
});

document.querySelector("#font_opacity").addEventListener("input", function(){
    colorPicker({opacity: this.value});
});

utils.addBlur(IDE.workSpace.colorInput);



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

IDE.showTip = function(prop){
    var tip = document.querySelector("#scope_saved");
    tip.style.left = prop.x+"px";
    tip.style.top = prop.y+"px";
    tip.style.display = "block";
    tip.style.backgroundColor = prop.color;
    tip.innerHTML = prop.txt;
    clearInterval(IDE.saveInterval);
    IDE.saveInterval = setTimeout(function(){
        document.querySelector("#scope_saved").style.display = "none";
    }, prop.time);
}


document.addEventListener("keydown", function(e){
    if (ctrlDown && (e.keyCode === cKey)) {
        console.log("Document catch Ctrl+C", IDE.scope);
        if(IDE.scope === "Stage"){
            if(IDE.selectedLayers.length){
                IDE.showTip({txt:"copied Object", color: "#e65100", time:700, x: 1424, y: 863});
                IDE.copy = EXPORT.convertElement( IDE.selectedLayers[0] );
            }
        }else if(IDE.scope === "Scene"){
            IDE.showTip({txt:"copied Scene", color: "#01579b", time:700, x: 1427, y: 863});
        }
    }

    if(ctrlDown && (e.keyCode === vKey)){
        console.log("Sonuç nedir:", IDE.scope);
        if(IDE.scope === "Scene"){
            var json = EXPORT.convertJson();
            var stringData = JSON.stringify(json.slides[sceneIndex].all);
            var jsonData = JSON.parse(stringData);
            var template = sceneTemplate();
            template.all = jsonData;
            sceneAddNewScene(template);
        }else if(IDE.scope === "Stage"){
            if(IDE.copy){
                console.log("Document catch Ctrl+V");
                var tempCopy = JSON.parse(JSON.stringify(IDE.copy));
                var copyUnique = utils.getRandomName();
                tempCopy.Layer.unique = copyUnique;
                if(tempCopy.Kids){
                    tempCopy.Kids.map(function(e){
                        e.Layer.unique = utils.getRandomName();
                    });
                }

                addObjects([tempCopy], IDE.activeLayer, true);

                var localEX = utils.getLayers();
                localEX.map(function(e){
                    if(copyUnique === e.Layer.unique){
                        selectItem({layer: e});
                    }
                });

                CREATE.checkKontrol();
            }
        }
    }else if(ctrlDown && (e.key === "z")){
        backHistory();
    }else if(ctrlDown && (e.key === "b")){
        nextHistory();
    }
});


/* History */
function addHistory(){
    if(IDE.addHistory){
        var select = [];
        IDE.historyList.splice(IDE.historyStep+1);

        var localEX = utils.getLayers();
        localEX.map(function(e){
            select.push(EXPORT.convertElement(e));
        });

        if(select.length){
            IDE.historyList.push(select);
            if(IDE.historyList.length>10){
                IDE.historyList.shift();
            }

            IDE.historyStep = (IDE.historyList.length-1);
        }
    }
}


function backHistory(){
    IDE.addHistory = false;

    IDE.historyStep--;
    if(IDE.historyStep <= -1){
        IDE.historyStep = 0;
    }else{
        historyProgress();
    }

    IDE.addHistory = true;
}

function nextHistory(){
    IDE.addHistory = false;

    IDE.historyStep++;
    if(IDE.historyStep >= IDE.historyList.length){
        IDE.historyStep = IDE.historyList.length-1;
    }else{
        historyProgress();
    }

    IDE.addHistory = true;
}

function historyProgress(){
    var localEX = utils.getLayers();
    var json = IDE.historyList[IDE.historyStep];
    var obj = localEX;
    var objLength = obj.length;
    var jsonLength = json.length;
    var deleteList = [];

    if(jsonLength > objLength){
        json.map(function(json){
            var found = false;

            for(var x=0; x<obj.length; x++){
                found = transferProp(obj[x], json);
                if(found){
                    break;
                }
            }

            if(!found){
                var copyJson = JSON.parse(JSON.stringify(json));
                addObjects([copyJson], IDE.activeLayer, true);
            }
        });
    }else{
        obj.map(function(obj){
            var found = false;
            for(var i=0; i<json.length; i++){
                found = transferProp(obj, json[i]);
                if(found){
                    break;
                }
            }

            if(!found){
                IDE.selectedLayers.push(obj);
                deleteList.push(obj.Layer.unique);
            }
        });
    }

    if(deleteList.length){
        deleteObject();
    }
}


function transferProp(obj, json){
    if(json.Layer.unique === obj.Layer.unique){
        obj.x(json.x).y(json.y).width(json.width).height(json.height).scaleX(json.scaleX).scaleY(json.scaleY);
        obj.offsetX(json.offsetX).offsetY(json.offsetY).opacity(json.opacity);
        if(json.fill){
            obj.fill(json.fill);
        }
        return true;
    }

    return false;
}


/* create Rect */
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

    addHistory();
});

/* create Text */
IDE.workSpace.createText.addEventListener("click", function(){
    var position = utils.getRandomPosition(640, 360, 150);
    CREATE.textFNC({
        properties:{
            text: "text",
            x: position.x,
            y: position.y,
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

    addHistory();
});


/* create Select buton*/
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
            type: "objectMovieClip",
            params:{
                group: 0
            }
        },
    });

    CREATE.checkKontrol();
    addHistory();
});


/* create Popup Set*/
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

    addHistory();
});


/* Create Control Buton */
IDE.workSpace.createControl.addEventListener("click", function(e){
    CREATE.addControlButon({
        properties:{
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            draggable: true
        },
        container: IDE.activeLayer,
        layer: {
            name: "control",
            elementID: "control",
            type: "objectMovieClip",
            class: "semiopacity"
        }
    });

    addHistory();
});


/* Create Answer Buton */
IDE.workSpace.createAnswer.addEventListener("click", function(e){
    CREATE.addAnswerButon({
        properties:{
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            draggable: true
        },
        container: IDE.activeLayer,
        layer: {
            name: "answer",
            elementID: "answer",
            type: "objectMovieClip",
            class: "hide"
        }
    });

    addHistory();
});

/* Create URL Area */
IDE.workSpace.createURL.addEventListener("click", function(e){
    CREATE.addUrlButon({
        properties:{
            x: 50,
            y: 50,
            width: 640,
            height: 480,
            draggable: true
        },
        container: IDE.activeLayer,
        layer: {
            name: "goUrl",
            elementID: "goUrl",
            type: "objectMovieClip",
            params:{
                goUrl:"https://www.okulistik.com"
            }
        }
    });
    addHistory();
});

/* Create Input Area */
IDE.workSpace.createInput.addEventListener("click", function(e){
    var position = utils.getRandomPosition(640, 360, 200);
    CREATE.addInputArea({
        properties:{
            x: position.x,
            y: position.y,
            width: 200,
            height: 50,
            draggable: true
        },
        container: IDE.activeLayer,
        layer: {
            name: "inputArea",
            elementID: "inputArea",
            type: "objectMovieClip",
            params:{

            }
        }
    });

    CREATE.checkKontrol();
    addHistory();
});


/* Create Match Buton */
IDE.workSpace.createMatchDrag.addEventListener("click", function(){
    var positionA = utils.getRandomPosition(640, 360, 200);
    CREATE.addMatchDrag({
        properties:{
            x: positionA.x,
            y: positionA.y,
            width: 100,
            height: 50,
            draggable: true
        },
        container: IDE.activeLayer,
        layer: {
            name: "matchDrag",
            elementID: "matchDrag",
            type: "objectMovieClip",
            params:{

            }
        }
    });

    CREATE.checkKontrol();
    addHistory();
});


/* Create Match Drag Buton */
IDE.workSpace.createMatchDrop.addEventListener("click", function(){
    var positionB = utils.getRandomPosition(640, 360, 200);
    CREATE.addMatchDrop({
        properties:{
            x: positionB.x,
            y: positionB.y,
            width: 100,
            height: 50,
            draggable: true
        },
        container: IDE.activeLayer,
        layer: {
            name: "matchDrop",
            elementID: "matchDrop",
            type: "objectMovieClip",
            params:{

            }
        }
    });

    CREATE.checkKontrol();
    addHistory();
});


/* Create Match Drop Buton */
IDE.workSpace.createCanvas.addEventListener("click", function(){
    CREATE.addCanvas({
        properties:{
            x: 50,
            y: 50,
            width: 640,
            height: 480,
            draggable: true
        },
        container: IDE.activeLayer,
        layer: {
            name: "canvas",
            elementID: "canvas",
            type: "objectMovieClip",
            params:{}
        }
    });

    addHistory();
});

/* Create Match Drop Buton */
IDE.workSpace.createDirective.addEventListener("click", function(){
    CREATE.addDirection({
        properties:{
            x: 140,
            y: -100,
            width: 1000,
            height: 100,
            draggable: true
        },
        container: IDE.activeLayer,
        layer: {
            name: "directive",
            elementID: "directive",
            type: "objectMovieClip",
            overflow: true,
            params:{}
        }
    });

    addHistory();
});