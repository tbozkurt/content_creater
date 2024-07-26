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
                }else{
                    div[p] = prop[p];
                }
            }
        }
        return div;
    }

}