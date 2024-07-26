function EXPORT(){
    this.getStandart = function(o){
        return {
            x: o.x(),
            y: o.y(),
            offsetX: o.offsetX(),
            offsetY: o.offsetY(),
            width: o.width(),
            height: o.height(),
            scale: o.scale(),
            name: o.name(),
            draggable: o.draggable()
        }
    }

    this.convertRect = function(e){
        return Object.assign({
            fill: e.fill(),
            Layer: e.Layer,
        }, this.getStandart(e));
    }

    this.convertCircle = function(e){
        return Object.assign({
            fill: e.fill(),
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
            color: e.fill(),
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
                var temp;
                if(e.Layer.type === "objectRect"){
                    temp = This.convertRect(e);
                }else if(e.Layer.type === "objectCircle"){
                    temp = This.convertCircle(e);
                }else if(e.Layer.type === "objectImg"){
                    temp = This.convertImg(e);
                }else if(e.Layer.type === "objectText"){
                    temp = This.convertText(e);
                }else if(e.Layer.type === "objectMovieClip"){
                    temp = This.convertMC(e);
                }

                tempFinal[e.zIndex()] = temp;
            }
        });

        tempFinal.map(function(e){
            final.push(e);
        });

        return final;
    }


    this.convertJson = function(){
        jsonV2.slides[sceneIndex].all = this.addKids(KonvaLayer);
        console.log("UYARI: Sahne", sceneIndex,"JSON Güncellendi.", jsonV2);
        return jsonV2;
    }
}