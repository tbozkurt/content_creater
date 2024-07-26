function addSR(Data){
    //Reset
    var resetData = function (){
        return {drag: [], drop: [], activeButonID: -1, list:[], container: Data.Container};
    }

    var resetDom = function(){
        SR.container.removeAttribute("style");
        SR.drag.map(function(tempDrag, i){
            if(tempDrag.Drag){
                tempDrag.Drag[0].kill();
            }

            tempDrag.Box.removeAttribute("style");
            SR.drag[i].Box.remove();
            SR.drop[i].Box.remove();
        });
    }

    var SR = resetData();
    var Old=[];

    // Start
    var start = function(Mode) {
        SR = resetData();

        SR.container.style.width = SR.container.offsetWidth +"px";
        SR.container.style.height = SR.container.offsetHeight +"px";

        for(var i=0; i<SR.container.childElementCount; i++){
            var tempDrag = SR.container.querySelector("#drag"+i);

            if(tempDrag){
                SR.drag[i] = {Box:tempDrag, Id:i, xPos: tempDrag.offsetLeft, yPos: tempDrag.offsetTop};
            }else{
                break;
            }
        }

        SR.drag.map(function(tempDrag, i){
            var dropHTML = addBox("drop"+i, "");
            dropHTML.style.position = "absolute";

            gsap.to(dropHTML, 0, {x: tempDrag.xPos, y: tempDrag.yPos});
            SR.drop[i] = {Box:dropHTML, Id:i, xPos: tempDrag.xPos, yPos: tempDrag.yPos};
        });

        //console.log(SR.drag);

        if(Mode  === "Add"){
            if(Data.Before) {
                Old.unshift(SR.drag.length-1);
            }else{
                Old.push(SR.drag.length-1);
            }
        }


        //console.log(Old);
        Old.map(function(order, index){
            var tempDrag = SR.drag[order];
            tempDrag.Box.style.position = "absolute";
            gsap.to(tempDrag.Box, 0, {x: SR.drag[index].xPos, y: SR.drag[index].yPos});

            tempDrag.Drag = Draggable.create(tempDrag.Box, {
                type: "x,y",
                bounds: SR.container,
                allowEventDefault: true,
                onDragParams:[order, false],
                onDragEndParams:[order, true],
                onDrag:function(id, dragEnd){
                    dragControlFNC(this, id, dragEnd);
                },
                onDragEnd:function(id, dragEnd){
                    dragControlFNC(this, id, dragEnd);
                }
            });

            SR.list[index] = order;
        });

       // console.log("SR:", SR.list);

        function dragControlFNC(mc, id, dragEnd){
            var dropID = -1;
            for(var i=0; i<SR.drop.length; i++){
                if (mc.hitTest(SR.drop[i].Box, "20%")){
                    dropID = i;
                    break;
                }
            }

            if(dropID>-1){
                KontrolEtFNC(true, id, dropID, dragEnd);
            }else{
                KontrolEtFNC(false, id, dropID, dragEnd);
            }
        }

        function selectedButonEfectAni(dragID){
            gsap.to(SR.drag[dragID].Box, 0.2, {boxShadow: "rgba(0,0,0,0.2) 0px 16px 32px 0px", scale: 1.1});
        }

        function KontrolEtFNC(_hitTest, _dragID, _dropID, _dragEnd){
            if(SR.activeButonID !== _dragID){
                selectedButonEfectAni(_dragID);
                SR.activeButonID = _dragID;
            }

            if(_hitTest){
                if (_dragID !== SR.list[_dropID]){
                    var dragGetArrayID = SR.list.indexOf(_dragID);
                    var dragGetArrayValue = SR.list[dragGetArrayID];
                    var dropGetArrayValue = SR.list[_dropID];
                    SR.list[_dropID] = dragGetArrayValue;
                    SR.list[dragGetArrayID] = dropGetArrayValue;
                    for(var i=0; i<SR.drop.length;i++){
                        var id = SR.list.indexOf(_dragID);
                        if(id!==i){
                            gsap.to(SR.drag[ SR.list[i] ].Box, 0.2, { x: SR.drop[i].xPos, y: SR.drop[i].yPos });
                        }
                    }
                }

                if(_dragEnd){
                    var loc = SR.list.indexOf(_dragID);
                    gsap.to(SR.drag[_dragID].Box, 0.2, {x: SR.drop[loc].xPos, y: SR.drop[loc].yPos, boxShadow:"rgba(0,0,0,0.2) 0px 0px 0px 0px", scale: 1.0});
                    SR.activeButonID = -1;

                    Data.AddFNC(SR.list, _dragID);
                }
            }
        }
    }

    // addBox
    var addBox = function(id, html){
        let div = document.createElement("div");
        div.id = id;
        if(html === ""){
            div.innerHTML = Data.dropHTML;
            SR.container.prepend(div);
        }else{
            div.innerHTML = html;
            SR.container.append(div);
        }

        return div;
    }

    //Clicked
    var clicked = function(html){
        resetDom();
        SR.drag.map(function(tempDrag){
            SR.container.append(tempDrag.Box);
        });

        Old = SR.list.slice();
        var Elem = addBox("drag"+ SR.drag.length, html);
        start("Add");
        return Elem;
    }

    //Delete
    var deleted = function(index, unique){
        resetDom();
        SR.drag.splice(index, 1);
        SR.list.splice(SR.list.indexOf(index), 1);

        SR.drag.map(function(tempDrag){
            SR.container.append(tempDrag.Box);
        });

        var temp = [];
        SR.list.map(function(order, i){
            if(order > index){
                order--;
            }

            temp[i] = order;
            SR.drag[order].Box.id = "drag"+order;
        });

        Old = temp.slice();
        start("Delete");
        Data.DelFNC(SR.list);
    }

    var resetSystem = function(){
        resetDom();
        SR = resetData();
    }

    return {start, clicked, deleted, resetSystem}

}