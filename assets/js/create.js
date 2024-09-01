function CREATE(){

    //Create Circle
    this.circlesFNC = function(O){
        var circle = new Konva.Circle(O.properties);
        circle.Layer = O.layer;
        O.container.add(circle);
    }

    //Create Rect
    this.rectFNC = function(O){
        var rect = new Konva.Rect(O.properties);
        rect.Layer = O.layer;
        O.container.add(rect);

        if(O.addLayer){
            Arayuz_addLayer(rect, O.container);
        }

        if(O.layer){
            if(O.layer.hide !== undefined){
                if(O.layer.hide){
                    rect.hide();
                }
            }
        }

    }

    //Create Img
    this.imgFNC = function(O){
        var imageObj = new Image();
        var theImg = new Konva.Image(O.properties);
        theImg.Layer = O.layer;

        imageObj.onload = function(){
            theImg.image(imageObj);
            //selectItem({layer: theImg});
        };

        if(O.addLayer) {
            Arayuz_addLayer(theImg, O.container);
        }

        O.container.add(theImg);
        imageObj.src = "files/"+ IDE.files.activeFile +"/"+ O.properties.src;
    }

    //Create Text
    this.textFNC = function(O){
        var text = new Konva.Text(O.properties);
        text.Layer = O.layer;
        O.container.add( text );

        if(O.addLayer){
            Arayuz_addLayer(text, O.container);
        }
    }

    this.movieClipFNC = function(O){
        var mc = new Konva.Group(O.properties);
        mc.Layer = O.layer;
        O.container.add(mc);

        return mc;
    }

    //Create Select
    this.CheckFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 4,
            y: 4,
            width: 44,
            height: 44,
            src: "img/butonback.png",
            Layer: {name:"butonback.png", type:"objectImg"}
        },{
            text: "btn",
            x: 4,
            y: 4,
            width: 44,
            height: 44,
            fontSize: 20,
            fontFamily: "Nunito",
            fontStyle: "bold",
            fill: "white",
            verticalAlign: "middle",
            padding: 0,
            align: "center",
            Layer:{type:"objectText", name: "text"}
        },
        {
            x: 0,
            y: 0,
            width: 52,
            height: 52,
            fill: "rgba(240, 130, 180, 0.4)",
            strokeWidth: 2,
            stroke:"rgba(240, 40, 130, 0.4)",
            cornerRadius:[58, 58, 58, 58],
            Layer:{type:"objectRect", name: "csClick", class: "csClick hide"}
        },
        {
            x: 0,
            y: 0,
            width: 52,
            height: 52,
            fill: "rgba(210, 50, 50, 0.4)",
            strokeWidth: 2,
            stroke:"rgba(150, 30, 30, 0.6)",
            cornerRadius:[58, 58, 58, 58],
            Layer:{type:"objectRect", name: "csWrong", class: "csWrong hide", hide: true}
        },
        {
            x: 0,
            y: 0,
            width: 52,
            height: 52,
            fill: "rgba(155, 205, 100, 0.4)",
            strokeWidth: 2,
            stroke:"rgba(50, 105, 30, 0.6)",
            cornerRadius:[58, 58, 58, 58],
            Layer:{type:"objectRect", name: "csRight", class: "csRight hide", hide: true}
        },
        {
            x: 0,
            y: 0,
            width: 52,
            height: 52,
            fill: "rgba(0,0,0,0)",
            Layer:{type:"objectRect", name: "csMask", class: "csMask"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container, O.container);
    }

    this.checkKontrol = function(){
        var selectNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
        IDE.workSpace.rightAnswer.innerHTML = "";
        var count = -1;
        IDE.activeLayer.getChildren().map(function(e){
            if(e.Layer){
                if(e.Layer.name.includes("selectButon")){
                    count++;
                    e.Layer.name = "selectButon_"+count;
                    e.Layer.elementID = "selectButon_"+count;
                    e.Layer.textInput.innerHTML = "selectButon_"+count;
                    e.children.map(function(e){
                        if(e.attrs.text){
                            e.text(selectNames[count]);
                        }
                    });

                    IDE.workSpace.rightAnswer.innerHTML += `<option value="${count}">${selectNames[count]}</option>`;
                }
            }
        });
    }


    this.addSolutionWindow = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 803,
            height: 461,
            cornerRadius: [10, 10, 0, 0],
            stroke:"#6c4d94",
            fill: "#ffffff",
            Layer:{type:"objectRect", name: "bg"}
        },
        {
            x: 0,
            y: 0,
            width: 803,
            height: 60,
            fill: "#6c4d94",
            cornerRadius: [10, 10, 0, 0],
            Layer:{type:"objectRect", name: "bar"}
        },
        {
            text: "Çözüm",
            x: 10,
            y: 15,
            width: 100,
            height: 30,
            fontSize: 20,
            fontFamily: "Nunito",
            fontStyle: "bold",
            fill: "#ffffff",
            verticalAlign: "middle",
            padding: 0,
            Layer:{type:"objectText", name: "text"}
        },
        {
            x: 746,
            y: 5,
            width: 50,
            height: 50,
            src: "img/closebtn.png",
            scale:{x:1, y:1},
            Layer: {name:"popupWindowClose.jpg", type:"objectImg", class:"popupWindowClose"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container, O.container);
    }


    this.addSolutionButon = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
                x: 0,
                y: 0,
                width: 194,
                height: 50,
                cornerRadius: [50, 50, 50, 50],
                fill: "#bcb2cf",
                stroke:"#9683b8",
                strokeWidth: 2,
                Layer:{type:"objectRect", name: "bg"}
            },
            {
                x: 2,
                y: 2,
                width: 190,
                height: 43,
                cornerRadius: [50, 50, 50, 50],
                fill: "#ffffff",
                Layer:{type:"objectRect", name: "bg"}
            },
            {
                text: "Çözümü Göster",
                x: 0,
                y: 0,
                width: 194,
                height: 50,
                fontSize: 20,
                fontFamily: "Nunito",
                align: "center",
                fill: "#000000",
                verticalAlign: "middle",
                padding: 0,
                Layer:{type:"objectText", name: "text"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container, O.container);
    }


    this.addControlButon = function(O){
        var container = this.movieClipFNC(O);
        var kids = [
            {
                x: 0,
                y: 0,
                width: 194,
                height: 50,
                cornerRadius: [50, 50, 50, 50],
                fill: "#ffab91",
                stroke: "#ff7043",
                strokeWidth: 2,
                Layer:{type:"objectRect", name: "bg"}
            },
            {
                x: 2,
                y: 2,
                width: 190,
                height: 43,
                cornerRadius: [50, 50, 50, 50],
                fill: "#ffffff",
                Layer:{type:"objectRect", name: "bg"}
            },
            {
                text: "Kontrol",
                x: 0,
                y: 0,
                width: 194,
                height: 50,
                fontSize: 20,
                fontFamily: "Nunito",
                align: "center",
                fill: "#000000",
                verticalAlign: "middle",
                padding: 0,
                Layer:{type:"objectText", name: "text"}
            }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container, O.container);
    }

}



//Create Select
/*    this.CheckFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fill: "lightblue",
            offsetX: -25,
            offsetY: -25,
            Layer:{type:"objectCircle", name: "bg"}
        },{
            text: "btn",
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fontSize: 16,
            fontFamily: "Arial",
            fill: "black",
            verticalAlign: "middle",
            padding: 0,
            align: "center",
            Layer:{type:"objectText", name: "text"}
        },{
            x: 4,
            y: 4,
            width: 42,
            height: 42,
            fill: "rgba(0,0,0,0.5)",
            offsetX: -21,
            offsetY: -21,
            Layer:{type:"objectCircle", name: "clicked", class: "clicked"}
        },{
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fill: "rgba(0,0,0,0)",
            Layer:{type:"objectRect", name: "mask", class: "mask"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container, O.container);
    }*/
