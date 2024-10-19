function utils(){
    this.addTimeStamp = function(type){
        function addZero(time){
            if(time < 10){
                return  "0"+time;
            }

            return time;
        }

        var date = new Date();
        var mounth = date.getMonth()+1;
        var today = date.getDate();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        if(type === "server"){
            return date.getFullYear() +"-"+ addZero(mounth) +"-"+ addZero(today) +" "+ addZero(hour) +":"+ addZero(minutes) +":"+ addZero(seconds);
        }

        return  date.getFullYear() + addZero(mounth) + addZero(today) + addZero(hour) + addZero(minutes) + addZero(seconds);
    }

    this.addDOM = function(prop){
        let div = document.createElement('div');
        for(let p in prop){
            if(prop[p]){
                if(p === "layername"){
                    div.setAttribute(p, prop[p]);
                } else{
                    div[p] = prop[p];
                }
            }
        }
        return div;
    }

    this.getRandomNumber = function(max){
        return Math.floor(Math.random() * max);
    }

    this.getRandomPosition = function(left, top, dia){
        var status = [1, -1];
        var xPos = left + (this.getRandomNumber(dia) * status[this.getRandomNumber(2)]);
        var yPos = top + (this.getRandomNumber(dia) * status[this.getRandomNumber(2)]);

        return {x:xPos, y: yPos}
    }

    this.getRandomName = function(){
        var str = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","p","r","s","t","u","v","y","z","w","x","q","0","1","2","3","4","5","6","7","8","9"];
        var random="";

        for(var i=0; i<15; i++){
            random += str[this.getRandomNumber(str.length)];
        }

        return random;
    }

    this.editLayerControl = function(layer){
        var add = (layer.attrs.layer === "main");
        return add;
    }

    this.getLayers = function(){
        var all=[];
        IDE.sceneLayer.children.map(function(obj, index){
            if(obj.Layer){
                all[index] = obj;
            }
        });

        return all;
    }

}