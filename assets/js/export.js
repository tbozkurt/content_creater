function EXPORT(){
    this.getStandart = function(o){
        var left = o.x();
        var top = o.y();

        if(String(left).includes("e-")){
            left = 0;
        }

        if(String(top).includes("e-")){
            top = 0;
        }

        var properties = {
            x: left,
            y: top,
            offsetX: o.offsetX(),
            offsetY: o.offsetY(),
            width: o.width(),
            height: o.height(),
            scale: o.scale(),
            name: o.name(),
            draggable: o.draggable()
        }

        if(o.opacity() !== 1){
            properties.opacity = o.opacity();
        }

        if(o.Layer.type === "objectRect"){
            properties.borderPosition = o.attrs.borderPosition;
        }

        if(o.Layer.type === "objectMovieClip"){
            if(!o.Layer.overflow){
                var rect = o.getClientRect();
                properties.width = rect.width;
                properties.height = rect.height;
            }
        }

        return properties;
    }

    this.convertRect = function(e){
        return Object.assign({
            fill: e.fill(),
            strokeWidth: e.strokeWidth(),
            stroke: e.stroke(),
            cornerRadius: e.cornerRadius(),
            Layer: e.Layer,
        }, this.getStandart(e));
    }

    this.convertCircle = function(e){
        return Object.assign({
            fill: e.fill(),
            strokeWidth: e.strokeWidth(),
            stroke: e.stroke(),
            borderRadius: e.radius(),
            Layer: e.Layer,
        }, this.getStandart(e));
    }

    this.convertText = function(e){
        return Object.assign({
            text: e.text(),
            fontSize: e.fontSize(),
            fontFamily: e.fontFamily(),
            lineHeight: e.lineHeight(),
            fontStyle: e.fontStyle(),
            fill: e.fill(),
            align: e.align(),
            verticalAlign: e.verticalAlign(),
            Layer: e.Layer
        }, this.getStandart(e));
    }

    this.convertImg = function(e){
        return Object.assign({
            src: e.attrs.src,
            Layer: e.Layer
        }, this.getStandart(e));
    }

    this.convertMC = function(e){
        return Object.assign({
            Layer: e.Layer,
            Kids: this.addKids(e),
        }, this.getStandart(e));
    }

    this.addKids = function(container){
        var This=this;
        var tempFinal=[];
        var final=[];

        container.children.map(function(e){
            if(e.Layer){
                var temp = This.convertElement(e);
                tempFinal[e.zIndex()] = temp;
            }
        });

        tempFinal.map(function(e){
            final.push(e);
        });

        return final;
    }

    this.convertElement = function(e){
        var temp;
        if(e.Layer.type === "objectRect"){
            temp = this.convertRect(e);
        }else if(e.Layer.type === "objectCircle"){
            temp = this.convertCircle(e);
        }else if(e.Layer.type === "objectImg"){
            temp = this.convertImg(e);
        }else if(e.Layer.type === "objectText"){
            temp = this.convertText(e);
        }else if(e.Layer.type === "objectMovieClip"){
            temp = this.convertMC(e);
        }

        return temp;
    }

    this.activityDetection = function(allObject){
        var content = [];
        var activity = [{
            name: "selectButon",
            type: "multipleChoice"
        },{
            name: "matchDrop",
            type: "matching"
        },{
            name: "inputArea",
            type: "fillBlank"
        },{
            name: "boxDrop",
            type: "dragAndDrop"
        },{
            name: "colorBox",
            type: "paint"
        }];

        allObject.map(function(e){
            for(var x=0; x<activity.length; x++){
                if(e.Layer.name.includes(activity[x].name)){
                    if(!content.includes(activity[x].type)){
                        content.push( activity[x].type );
                    }
                }
            }
        });

        return content;
    }

    this.exportTypeSettings = function(json){
        if(json.rightAnswer){
            console.log("Right:", parseInt(IDE.workSpace.rightAnswer.value));
            json.rightAnswer = parseInt(IDE.workSpace.rightAnswer.value);
        }
    }


    this.convertJson = function(){
        this.exportTypeSettings(jsonV2.slides[sceneIndex]);
        var allObject = this.addKids(IDE.sceneLayer);
        jsonV2.slides[sceneIndex].all = allObject;
        jsonV2.slides[sceneIndex].type = this.activityDetection(allObject);
        console.log("UYARI: Sahne", sceneIndex,"JSON Güncellendi.", jsonV2);
        return jsonV2;
    }

}