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

        Arayuz_addLayer(theImg, O.container);
        O.container.add(theImg);

        if(O.uploadImg){
            imageObj.src = O.uploadImg;
        }else{
            imageObj.src = O.properties.src;
        }
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
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            src: "/files/"+ IDE.files.imgFolder.split("/files/")[1] +"/butonback.png",
            Layer: {name:"popup_close.jpg", type:"objectImg", class:"popup_close"}
        },{
            text: "btn",
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fontSize: 18,
            fontFamily: "Nunito",
            fontStyle: "bold",
            fill: "white",
            verticalAlign: "middle",
            padding: 0,
            align: "center",
            Layer:{type:"objectText", name: "text"}
        },{
            x: -4,
            y: -4,
            width: 58,
            height: 58,
            fill: "rgba(240, 130, 180, 0.4)",
            strokeWidth: 2,
            stroke:"rgba(240, 40, 130, 0.4)",
            cornerRadius:[58, 58, 58, 58],
            Layer:{type:"objectRect", name: "clicked", class: "clicked"}
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
            width: 600,
            height: 600,
            cornerRadius: [10, 10, 10, 10],
            fill: "#ffffff",
            Layer:{type:"objectRect", name: "bg"}
        },
        {
            x: 0,
            y: 0,
            width: 600,
            height: 60,
            fill: "#C0C0C0",
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
            fill: "#000000",
            verticalAlign: "middle",
            padding: 0,
            Layer:{type:"objectText", name: "text"}
        },
        {
            x: 545,
            y: 5,
            width: 50,
            height: 50,
            src: "/files/"+ IDE.files.imgFolder.split("/files/")[1] +"/closebtn.png",
            scale:{x:1, y:1},
            Layer: {name:"popup_close.jpg", type:"objectImg", class:"popup_close"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container, O.container);

        console.log("/files/"+IDE.files.imgFolder.split("/files/")[1]+"/closebtn.png");
    }


    this.addSolutionButon = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
                x: 0,
                y: 0,
                width: 200,
                height: 50,
                cornerRadius: [10, 10, 10, 10],
                fill: "#ffffff",
                Layer:{type:"objectRect", name: "bg"}
            },
            {
                text: "Çözüm Göster",
                x: 0,
                y: 0,
                width: 200,
                height: 50,
                fontSize: 20,
                fontFamily: "Nunito",
                align: "center",
                fill: "#000000",
                verticalAlign: "middle",
                padding: 0,
                Layer:{type:"objectText", name: "text"}
        }];

        console.log(O);

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
