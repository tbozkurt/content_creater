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
                if(p === "layername" || p === "ccid"){
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
        var str = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","p","r","s","t","u","v","y","z","w","x","q"];
        var random="";

        for(var i=0; i<15; i++){
            random += str[this.getRandomNumber(str.length)];
        }

        return random;
    }

    this.getLayers = function(){
        var all=[];
        IDE.activeLayer.children.map(function(obj){
            if(obj.Layer){
                all.push(obj);
            }
        });

        return all;
    }

    this.searchByName = function(mc, name){
        var children = mc.getChildren();
        for(var i=0; i<children.length; i++){
            if(children[i].Layer.name === name){
                return children[i];
            }
        }
    }

    this.searchIndex = function(search, arr){
        var found = -1;
        for(var i=0; i<arr.length; i++){
            if(search === arr[i][0]){
                found = i;
                break;
            }
        }

        return found;
    }

    this.addBlur = function(obj){
        obj.addEventListener("keydown", function(e){
            if(e.which===13 || e.keyCode===13){
                this.blur();
            }
        });

        obj.addEventListener("focus", function(){
            IDE.scope = "input";
        });
    }

    this.hexConvert = function(data){
        var alphaList = [
            "00", "03", "05", "08", "0A", "0D", "0F", "12", "14", "17",
            "1A", "1C", "1F", "21", "24", "26", "29", "2B", "2E", "30",
            "33", "36", "38", "3B", "3D", "40", "42", "45", "47", "4A",
            "4D", "4F", "52", "54", "57", "59", "5C", "5E", "61", "63",
            "66", "69", "6B", "6E", "70", "73", "75", "78", "7A", "7D",
            "80", "82", "85", "87", "8A", "8C", "8F", "91", "94", "96",
            "99", "9C", "9E", "A1", "A3", "A6", "A8", "AB", "AD", "B0",
            "B3", "B5", "B8", "BA", "BD", "BF", "C2", "C4", "C7", "C9",
            "CC", "CF", "D1", "D4", "D6", "D9", "DB", "DE", "E0", "E3",
            "E6", "E8", "EB", "ED", "F0", "F2", "F5", "F7", "FA", "FC", "FF"
        ];

        var color, alpha, alphaHex;
        if(typeof data === "string"){
            color = data;
            alpha = 100;
            if(data.length === 9){
                color = data.substring(0, 7);
                alphaHex = data.substring(7, 9);
                alphaHex = alphaHex.toUpperCase();
                alpha = alphaList.indexOf(alphaHex);
            }else if(color.includes("rgb")){
                var final=[0,0,0,100];
                var part1 = color.split("(")[1];
                var part2 = part1.split(")")[0];
                var part3 = part2.split(",");
                part3.map(function(code, index){
                    final[index] = parseFloat(code);
                });

                var hex = this.rgbaToHex(final[0], final[1], final[2], final[3]);
                color = hex.substring(0, 7);
                alphaHex = hex.substring(7, 9);
                alpha = alphaList.indexOf(alphaHex);
            }

            return {color, alpha}
        }else{
            color = data.color;
            alphaHex = alphaList[data.alpha];
            return {hex:(color+alphaHex), color: color, alpha: data.alpha};
        }
    }


    this.isHexCode = function(str) {
        const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
        return hexRegex.test(str);
    }

    this.rgbaToHex = function (r, g, b, a) {
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
            throw new Error("R, G, B değerleri 0-255, A değeri 0-1 aralığında olmalıdır.");
        }

        const redHex = r.toString(16).padStart(2, '0').toUpperCase();
        const greenHex = g.toString(16).padStart(2, '0').toUpperCase();
        const blueHex = b.toString(16).padStart(2, '0').toUpperCase();
        const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
        return `#${redHex}${greenHex}${blueHex}${alphaHex}`;
    }

    /*
    console.log(this.rgbaToHex(255, 99, 71, 0.5));
    console.log(this.rgbaToHex(0, 0, 0, 1));
    console.log(this.rgbaToHex(255, 255, 255, 0));

    console.log(this.hexConvert("#1010eeff"));
    console.log(this.hexConvert("#1010ee"));
    console.log(this.hexConvert({color:"#1010ee", alpha:10}));
    */

}