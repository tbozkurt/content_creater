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
    }

    //Create Img
    this.imgFNC = function(O){
        var imageObj = new Image();
        var theImg = new Konva.Image(O.properties);
        theImg.Layer = O.layer;

        imageObj.onload = function(){
            theImg.image(imageObj);
            Arayuz_addLayer(theImg);
        };

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

        function focusText() {
            var range = document.createRange();
            var select = window.getSelection();
            var lastNodes = IDE.text.editBox.childNodes[IDE.text.editBox.childNodes.length-1];
            range.setStart(lastNodes, lastNodes.length);
            range.collapse(true);
            select.removeAllRanges();
            select.addRange(range);
        }


        text.on('dblclick dbltap', function(){
            if(this.getParent().nodeType !== "Group"){
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

                focusText();
                text.hide();
                deSelect();
            }
        });


        text.on('transform', function (){
            text.setAttrs({
                width: text.width() * text.scaleX(),
                scaleX: 1
            });
        });


        if(O.addLayer){
            Arayuz_addLayer(text);
        }
    }

    this.movieClipFNC = function(O){
        var mc = new Konva.Group(O.properties);
        mc.Layer = O.layer;
        O.container.add(mc);

        mc.on('dblclick', function(){
            OpenMovieClip(mc);
        });

        return mc;
    }



    //Create Select
    this.CheckFNC = function(O){
        var selectNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
        var count = 0;
        var temp = [];

        Layers.forEach(function(obj){
            if(obj.Layer.name.includes("btn")){
                var id = parseInt(obj.Layer.name.split("_")[1]);
                temp[id] = id;
            }
        });

        for(var i=0; i<temp.length; i++){
            if(isNaN(temp[i])){
                count=i;
                break;
            }else{
                count++;
            }
        }

        O.properties.x = (count * O.properties.width);
        O.properties.y = (count * O.properties.height);
        O.layer.name = "btn_"+count;
        O.layer.elementID = "btn_"+count;
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
            text: selectNames[count],
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
            Layer:{type:"objectCircle", name: "clicked"}
        },{
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fill: "rgba(0,0,0,0)",
            Layer:{type:"objectRect", name: "mask"}
        }];

        addObjects(kids, container, false);
        Arayuz_addLayer(container);
    }

//12311710608462
}