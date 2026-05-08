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
            Arayuz_addLayer(rect);
        }

        if(O.layer){
            if(O.layer.hide !== undefined){
                if(O.layer.hide){
                    rect.hide();
                }
            }
        }

        return rect;
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
            Arayuz_addLayer(theImg);
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
            Arayuz_addLayer(text);
        }

        return text;
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
            lineHeight: 2.3,
            padding: 0,
            align: "center",
            Layer:{type:"objectText", name: "csText"}
        }, {
            x: 0,
            y: 0,
            width: 52,
            height: 52,
            fill: "rgba(240, 130, 180, 0.4)",
            strokeWidth: 2,
            borderPosition:"center",
            stroke:"rgba(240, 40, 130, 0.4)",
            cornerRadius:58,
            Layer:{type:"objectRect", name: "csClick", class: "csClick hide"}
        }, {
            x: 0,
            y: 0,
            width: 52,
            height: 52,
            fill: "rgba(210, 50, 50, 0.4)",
            strokeWidth: 2,
            borderPosition:"center",
            stroke:"rgba(150, 30, 30, 0.6)",
            cornerRadius: 58,
            Layer:{type:"objectRect", name: "csWrong", class: "csWrong hide", hide: true}
        }, {
            x: 0,
            y: 0,
            width: 52,
            height: 52,
            fill: "rgba(155, 205, 100, 0.4)",
            strokeWidth: 2,
            borderPosition:"center",
            stroke:"rgba(50, 105, 30, 0.6)",
            cornerRadius: 58,
            Layer:{type:"objectRect", name: "csRight", class: "csRight hide", hide: true}
        }, {
            x: 0,
            y: 0,
            width: 52,
            height: 52,
            fill: "#ffffff",
            opacity: 0,
            strokeWidth: 0,
            borderPosition:"center",
            Layer:{type:"objectRect", name: "csMask"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);
        return container;
    }

    this.getMC = function(localEX, name){
        var temp = [];
        var temp2 = [];

        localEX.map(function(e){
            if(e.Layer.name.includes(name)){
                var split = e.Layer.name.split("_");
                if(split.length>1){
                    var id = parseInt(split[1]);
                    if(!temp[id]){
                        temp[id] = e;
                    }else{
                        temp[60] = e;
                    }
                }else{
                    temp[60] = e;
                }
            }
        });

        temp.map(function(e){
            if(e){
                temp2.push(e);
            }
        });

        return temp2;
    }

    var list = [
        {obj: "selectButon", answer:true},
        {obj: "inputArea", answer:true},
        {obj: "matchDrag", answer:false},
        {obj: "matchDrop", answer:true},
        {obj: "boxDrag", answer:false},
        {obj: "boxDrop", answer:true},
        {obj: "paintBox", answer:true},
        {obj: "sortDrag", answer:false},
        {obj: "drawCanvas", answer:true},
        {obj: "pointButon", answer:false},
        {obj: "pointCanvas", answer:true},
        {obj: "popupWindow", answer:false},
        {obj: "popupButon", answer:false},
        {obj: "soundPlayer", answer:false},
        {obj: "soundRecord", answer:true},
        {obj: "feedback", answer:false},
        {obj: "freeDrawCanvas", answer:true},
        {obj: "wordBox", answer:true}
    ];

    this.checkKontrol = function(){
        var selectNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
        var localEX = utils.getLayers();
        var globalCount = -1;
        var This = this;

        list.map(function(e){
            var currentList = This.getMC(localEX, e.obj);
            var currentCount = -1;

            if(e.answer){
                currentCount = globalCount;
            }

            for(var x=0; x<currentList.length; x++){
                currentCount++;
                currentList[x].Layer.name = e.obj +"_"+ currentCount;
                currentList[x].Layer.elementID = e.obj +"_"+ currentCount;
                currentList[x].Layer.layerNameNormal.innerText = e.obj +"_"+ currentCount;
                if(e.obj === "selectButon"){
                    var obj = utils.searchByName(currentList[x], "csText");
                    if(obj){
                        obj.text(selectNames[currentCount]);
                    }
                }
            }

            if(e.answer){
                globalCount = currentCount;
            }
        });
    }

    this.getSceneName = function(){
        var list = [];
        jsonV2.slides.map(function(e){
            if(e.name){
                var id = e.name.slice(1, e.name.length);
                list[parseInt(id)] = id;
            }
        });

        for(var x=0; x<(list.length+1); x++){
            if(!list[x]){
                return "e"+x;
            }
        }
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
            strokeWidth: 0,
            borderPosition:"center",
            fill: "#f6f0f7",
            Layer:{type:"objectRect", name: "bg"}
        },
        {
            x: 0,
            y: 0,
            width: 803,
            height: 60,
            fill: "#6c4d94",
            strokeWidth: 0,
            borderPosition:"center",
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
            lineHeight: 1.5,
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
        Arayuz_addLayer(container);
    }

    this.addFeedback = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            cornerRadius: [10, 10, 10, 10],
            strokeWidth: 0,
            borderPosition:"center",
            fill: "#c5c5c5",
            Layer:{type:"objectRect", name: "bg"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);
    }


    this.addSolutionButon = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 3,
            y: 3,
            width: 176,
            height: 46,
            fill: "rgba(0,0,0,0.12)",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fill: "#e64e39",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 40,
            fill: "#f15e47",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            text: "ÇÖZÜM",
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fontSize: 26,
            fontFamily: "Nunito",
            align: "center",
            fill: "#ffffff",
            lineHeight: 1.9,
            padding: 0,
            Layer:{type:"objectText", name: "text"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);
    }

    this.addUrlButon = function(O){
        var container = this.movieClipFNC(O);
        var kids = [
            {
                x: 0,
                y: 0,
                width: 640,
                height: 480,
                fill: "#ffffff",
                opacity: 0,
                strokeWidth: 0,
                borderPosition:"center",
                Layer:{type:"objectRect", name: "bg"}
            }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.addInputArea = function(O){
        var container = this.movieClipFNC(O);
        var kids = [
            {
                x: 0,
                y: 0,
                width: 200,
                height: 50,
                fill: "#ffffff",
                strokeWidth: 0,
                borderPosition:"center",
                Layer:{type:"objectRect", name: "bdBg", class: "bdBg"}
            },
            {
                text: "area",
                x: 0,
                y: 0,
                width: 200,
                height: 50,
                fontSize: 20,
                fontFamily: "Nunito",
                align: "center",
                //verticalAlign: "middle",
                //lineHeight: 2.5,
                fill: "#000000",
                padding: 0,
                Layer:{type:"objectText", name: "bdText", class: "bdText"}
            },
        ];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.addMatchDrag = function(O){
        var container = this.movieClipFNC(O);
        var kids = [
            {
                x: 0,
                y: 0,
                width: 100,
                height: 50,
                fill: "#ffffff",
                strokeWidth: 0,
                borderPosition:"center",
                opacity:0,
                Layer:{type:"objectRect", name: "bdBg", class: "bdBg"}
            }
        ];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.addMatchDrop = function(O){
        var container = this.movieClipFNC(O);
        var kids = [
            {
                x: 0,
                y: 0,
                width: 100,
                height: 50,
                strokeWidth: 0,
                borderPosition:"center",
                fill: "#c0c0c0",
                opacity:0,
                Layer:{type:"objectRect", name: "bdBg", class: "bdBg"}
            }
        ];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }


    this.addCanvas = function(O){
        var container = this.movieClipFNC(O);
        var kids = [
            {
                x: 0,
                y: 0,
                width: 640,
                height: 480,
                fill: "#ffffff",
                strokeWidth: 0,
                borderPosition: "center",
                opacity: 0,
                Layer:{type:"objectRect", name: "bg"}
            }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.addDirection = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
                x: 455,
                y: 55,
                width: 90,
                height: 90,
                src: "img/directiveplay.png",
                Layer: {name:"popupWindowClose.jpg", type:"objectImg", class:"directivePlay"}
            }, {
                x: 0,
                y: 0,
                width: 1000,
                height: 100,
                cornerRadius: 10,
                strokeWidth: 0,
                borderPosition:"center",
                fill: "#ffffff",
                Layer:{type:"objectRect", name: "bg"}
            }, {
                text: "Verilen yönergelere göre etkinlikleri yapın.",
                x: 110,
                y: 30,
                width: 870,
                fontSize: 28,
                fontFamily: "Nunito",
                fill: "#5085C4",
                lineHeight: 1.6,
                padding: 0,
                Layer:{type:"objectText", name: "text"}
            }, {
                x: 5,
                y: 5,
                width: 90,
                height: 90,
                src: "img/directivestop.png",
                Layer: {name:"popupWindowClose.jpg", type:"objectImg", class:"directiveStop"}
            }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }


    this.boxDrop = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: -5,
            y: -5,
            width: 210,
            height: 60,
            fill: "#ffffff",
            borderPosition:"center",
            cornerRadius:10,
            Layer:{type:"objectRect", name: "boxbg", class: "boxbg hide"}
        }, {
            x: 0,
            y: 0,
            width: 200,
            height: 50,
            fill: "#bdbdbd",
            borderPosition:"center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "drop", class: "drop"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.boxDrag = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 200,
            height: 50,
            fill: "#ffffff",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.newControlFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
                x: 3,
                y: 3,
                width: 176,
                height: 46,
                fill: "rgba(0,0,0,0.12)",
                borderPosition: "center",
                cornerRadius: 8,
                Layer:{type:"objectRect", name: "boxbg"}
            },{
                x: 0,
                y: 0,
                width: 176,
                height: 46,
                fill: "#84be43",
                borderPosition: "center",
                cornerRadius: 8,
                Layer:{type:"objectRect", name: "boxbg"}
            },{
                x: 0,
                y: 0,
                width: 176,
                height: 40,
                fill: "#96cc5b",
                borderPosition: "center",
                cornerRadius: 8,
                Layer:{type:"objectRect", name: "boxbg"}
            },{
                text: "KONTROL ET",
                x: 0,
                y: 0,
                width: 176,
                height: 46,
                fontSize: 25,
                fontFamily: "Nunito",
                align: "center",
                fill: "#ffffff",
                lineHeight: 1.9,
                padding: 0,
                Layer:{type:"objectText", name: "text"}
            }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.newAnswerFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 3,
            y: 3,
            width: 176,
            height: 46,
            fill: "rgba(0,0,0,0.12)",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fill: "#de2b2b",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 40,
            fill: "#e74446",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            text: "CEVABI GÖR",
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fontSize: 25,
            fontFamily: "Nunito",
            align: "center",
            fill: "#ffffff",
            lineHeight: 1.9,
            padding: 0,
            Layer:{type:"objectText", name: "text"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }


    this.newCompleteFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 3,
            y: 3,
            width: 176,
            height: 46,
            fill: "rgba(0,0,0,0.12)",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fill: "#3692b5",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 40,
            fill: "#489ecf",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            text: "KAYDET",
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fontSize: 26,
            fontFamily: "Nunito",
            align: "center",
            fill: "#ffffff",
            lineHeight: 1.9,
            padding: 0,
            Layer:{type:"objectText", name: "text"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.newSolutionFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 3,
            y: 3,
            width: 176,
            height: 46,
            fill: "rgba(0,0,0,0.12)",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fill: "#e64e39",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 40,
            fill: "#f15e47",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            text: "ÇÖZÜM",
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fontSize: 26,
            fontFamily: "Nunito",
            align: "center",
            fill: "#ffffff",
            lineHeight: 1.9,
            padding: 0,
            Layer:{type:"objectText", name: "text"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.newRefreshFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 3,
            y: 3,
            width: 176,
            height: 46,
            fill: "rgba(0,0,0,0.12)",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fill: "#8c65a2",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 40,
            fill: "#986dab",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            text: "YENİLE",
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fontSize: 26,
            fontFamily: "Nunito",
            align: "center",
            fill: "#ffffff",
            lineHeight: 1.8,
            padding: 0,
            Layer:{type:"objectText", name: "text"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.newFinishFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 3,
            y: 3,
            width: 176,
            height: 46,
            fill: "rgba(0,0,0,0.12)",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fill: "#c43c4a",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            x: 0,
            y: 0,
            width: 176,
            height: 40,
            fill: "#e14b5b",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "boxbg"}
        },{
            text: "TESTİ BİTİR",
            x: 0,
            y: 0,
            width: 176,
            height: 46,
            fontSize: 26,
            fontFamily: "Nunito",
            align: "center",
            fill: "#ffffff",
            lineHeight: 1.8,
            padding: 0,
            Layer:{type:"objectText", name: "text"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.newSoundPlayerFNC = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 280,
            height: 60,
            fill: "#ffffff",
            borderPosition: "center",
            cornerRadius: 60,
            strokeWidth: 0,
            Layer:{type:"objectRect", name: "soundbg"}
        }, {
            x: 5,
            y: 5,
            width: 50,
            height: 50,
            src: "img/sp_return.png",
            Layer: {name:"sp_return.png", type:"objectImg", class:"restart"}
        }, {
            x: 5,
            y: 5,
            width: 50,
            height: 50,
            src: "img/sp_pause.png",
            Layer: {name:"sp_pause.png", type:"objectImg", class:"pause"}
        }, {
            x: 5,
            y: 5,
            width: 50,
            height: 50,
            src: "img/sp_play.png",
            Layer: {name:"sp_play.png", type:"objectImg", class:"play"}
        }, {
            x: 60,
            y: 21,
            width: 210,
            height: 18,
            fill: "#FF8C00",
            borderPosition: "center",
            cornerRadius: 20,
            strokeWidth: 0,
            Layer:{type:"objectRect", name: "progress", class: "progress"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }


    this.createBox = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 5,
            width: 140,
            height: 50,
            fill: "#ffffff",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "bg"}
        },{
            x: 150,
            y: 0,
            width: 60,
            height: 60,
            src: "img/paint_easer.png",
            Layer: {name:"easer.png", type:"objectImg", class:"easer"}
        },{
            x: 5,
            y: 10,
            width: 40,
            height: 40,
            fill: "#ff0000",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "color_red", class:"color_red"}
        },{
            x: 50,
            y: 10,
            width: 40,
            height: 40,
            fill: "#0040ff",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "color_blue", class:"color_blue"}
        },{
            x: 95,
            y: 10,
            width: 40,
            height: 40,
            fill: "#558b2f",
            borderPosition: "center",
            cornerRadius: 8,
            Layer:{type:"objectRect", name: "color_green", class:"color_green"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.paintBox = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 80,
            height: 80,
            fill: "#fff",
            borderPosition: "center",
            cornerRadius: 80,
            Layer:{type:"objectRect", name: "bg", class:"paintBox"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);
        return container;
    }

    this.videoBox = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 1280,
            height: 720,
            fill: "#303f46",
            borderPosition: "center",
            cornerRadius: 0,
            Layer:{type:"objectRect", name:"bg"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);
        return container;
    }

    this.sortDrag = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 80,
            height: 80,
            fill: "#fff",
            borderPosition: "center",
            cornerRadius: 20,
            Layer:{type:"objectRect", name: "bg", class:"paintBox"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.sortDrop = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 80,
            height: 80,
            fill: "silver",
            borderPosition: "center",
            cornerRadius: 20,
            Layer:{type:"objectRect", name: "bg", class:"paintBox"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.createSortArea = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 300,
            height: 80,
            fill: "silver",
            borderPosition: "center",
            cornerRadius: 20,
            Layer:{type:"objectRect", name: "bg", class:"paintBox"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.lineCorrect = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 400,
            height: 400,
            fill: "gray",
            opacity: 1,
            borderPosition: "center",
            Layer:{type:"objectRect", name: "bg", class:"lineBg"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.lineNav = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 155,
            height: 80,
            fill: "silver",
            borderPosition: "center",
            cornerRadius: 10,
            Layer:{type:"objectRect", name: "bg"}
        },
        {
            x: 20,
            y: 15,
            width: 50,
            height: 50,
            src: "img/draw_icon.png",
            cornerRadius: 8,
            Layer: {type:"objectImg", name:"draw_icon", class:"drawBox"}
        },
        {
            x: 85,
            y: 15,
            width: 50,
            height: 50,
            src: "img/draw_easer.png",
            cornerRadius: 8,
            Layer: {type:"objectImg", name:"draw_easer", class:"eraserBox"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.Point = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 2,
            y: 2,
            width: 80,
            height: 80,
            fill: "rgba(255, 255, 255, 0)",
            strokeWidth: 4,
            stroke: "#c0c0c0",
            borderPosition: "center",
            cornerRadius: 40,
            Layer:{type:"objectRect", name: "bg", class:"bg"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.soundRecorder = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 240,
            height: 340,
            fill: "#c0c0c0",
            strokeWidth: 0,
            borderPosition: "center",
            cornerRadius: 10,
            Layer:{type:"objectRect", name: "bg"}
        },
        {
            text: "warningText",
            x: 10,
            y: 285,
            width: 220,
            height: 54,
            fontFamily: "Nunito",
            fontSize:16,
            align: "center",
            fill: "#363636",
            lineHeight: 1,
            padding: 0,
            Layer:{type:"objectText", name: "warningText", class:"warningText"}
        },
        {
            x: 20,
            y: 235,
            width: 200,
            height: 40,
            fill: "#ef5350",
            strokeWidth: 0,
            borderPosition: "center",
            cornerRadius: 50,
            Layer:{type:"objectRect", name: "recordRestart", class:"recordRestart"}
        },
        {
            x: 20,
            y: 235,
            width: 200,
            height: 40,
            fill: "#ef5350",
            strokeWidth: 0,
            borderPosition: "center",
            cornerRadius: 50,
            Layer:{type:"objectRect", name: "recordStop", class:"recordStop"}
        },
        {
            x: 20,
            y: 185,
            width: 200,
            height: 40,
            fill: "#78909c",
            strokeWidth: 0,
            borderPosition: "center",
            cornerRadius: 50,
            Layer:{type:"objectRect", name: "recordPlayMain", class:"recordPlayMain"}
        },
        {
            x: 20,
            y: 185,
            width: 200,
            height: 40,
            fill: "#c0c0c0",
            strokeWidth: 2,
            stroke: "#999999",
            borderPosition: "center",
            cornerRadius: 50,
            Layer:{type:"objectRect", name: "recordStatusMain", class:"recordStatusMain"}
        },
        {
            x: 45,
            y: 20,
            width: 150,
            height: 150,
            src: "img/record_on.png",
            Layer: {type:"objectImg", name:"record_on", class:"record_on"}
        },
        {
            x: 45,
            y: 20,
            width: 150,
            height: 150,
            src: "img/record_off.png",
            Layer: {type:"objectImg", name:"record_off", class:"record_off"}
        },
        {
            text: "prepareText",
            x: 20,
            y: 85,
            width: 200,
            height: 20,
            fontSize:16,
            fontFamily: "Nunito",
            align: "center",
            fill: "#363636",
            lineHeight: 1,
            padding: 0,
            Layer:{type:"objectText", name: "prepareText", class: "prepareText"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.wordBox = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            text: "Sample",
            x: 0,
            y: 0,
            width: 125,
            height: 36,
            fontSize:36,
            fontFamily: "Arial",
            fill: "#ffffff",
            padding: 0,
            Layer:{type:"objectText", name: "Sample", class: "wordTxt"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }


    this.freeDrawCanvas = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 640,
            height: 360,
            fill: "#303030",
            opacity: 1,
            borderPosition: "center",
            Layer:{type:"objectRect", name: "canvas", class:"canvas"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
    }

    this.freeDrawNav = function(O){
        var container = this.movieClipFNC(O);
        var kids = [{
            x: 0,
            y: 0,
            width: 275,
            height: 80,
            fill: "silver",
            borderPosition: "center",
            cornerRadius: 10,
            Layer:{type:"objectRect", name: "bg"}
        },
        {
            x: 15,
            y: 15,
            width: 50,
            height: 50,
            src: "img/draw_icon.png",
            cornerRadius: 8,
            Layer: {type:"objectImg", name:"draw_icon", class:"drawBox"}
        },
        {
            x: 80,
            y: 15,
            width: 50,
            height: 50,
            src: "img/draw_easer.png",
            cornerRadius: 8,
            Layer: {type:"objectImg", name:"draw_easer", class:"eraserBox"}
        },
        {
            x: 145,
            y: 15,
            width: 50,
            height: 50,
            src: "img/clean.png",
            cornerRadius: 8,
            Layer: {type:"objectImg", name:"clean", class:"clean"}
        },
        {
            x: 212,
            y: 17,
            width: 46,
            height: 46,
            fill: "#ff0000",
            borderPosition: "center",
            cornerRadius: 40,
            strokeWidth: 0,
            Layer:{type:"objectRect", name: "color", class:"color"}
        },
        {
            x: 210,
            y: 15,
            width: 50,
            height: 50,
            src: "img/color.png",
            Layer: {type:"objectImg", name:"color.png", class:"disableEvents"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);

        return container;
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
        Arayuz_addLayer(container);
    }


        this.addControlButon = function(O){
        var container = this.movieClipFNC(O);
        var kids = [
            {
                x: 0,
                y: 0,
                width: 194,
                height: 50,
                cornerRadius: 50,
                fill: "#ffab91",
                stroke: "#ff7043",
                strokeWidth: 2,
                borderPosition:"center",
                Layer:{type:"objectRect", name: "bg_orange"}
            },
            {
                x: 2,
                y: 2,
                width: 190,
                height: 43,
                cornerRadius: 50,
                strokeWidth: 0,
                borderPosition:"center",
                fill: "#ffffff",
                Layer:{type:"objectRect", name: "bg_white"}
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
                lineHeight: 2.5,
                padding: 0,
                Layer:{type:"objectText", name: "text"}
            }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);
    }


        this.addAnswerButon = function(O){
        var container = this.movieClipFNC(O);
        var kids = [
            {
                x: 0,
                y: 0,
                width: 194,
                height: 50,
                cornerRadius: 50,
                fill: "#b3e5fc",
                stroke: "#0277bd",
                strokeWidth: 2,
                borderPosition:"center",
                Layer:{type:"objectRect", name: "bg_blue"}
            },
            {
                x: 2,
                y: 2,
                width: 190,
                height: 43,
                cornerRadius: 50,
                fill: "#ffffff",
                strokeWidth: 0,
                borderPosition:"center",
                Layer:{type:"objectRect", name: "bg_white"}
            },
            {
                text: "Yanıtla",
                x: 0,
                y: 0,
                width: 194,
                height: 50,
                fontSize: 20,
                fontFamily: "Nunito",
                align: "center",
                fill: "#000000",
                lineHeight: 2.5,
                padding: 0,
                Layer:{type:"objectText", name: "text"}
            }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);
    }

*/
