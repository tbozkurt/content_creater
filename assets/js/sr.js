function addSR(Data){
    //Reset
    var resetData = function (){
        return {drag: [], drop: [], activeButonID: -1, list:[], XX:[], container: Data.Container};
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
    var start = function(Mode,unique) {
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


        if(Mode === "Add"){
            if(Data.Before) {
                Old.unshift([SR.drag.length-1, unique  ]);
            }else{
                Old.push([SR.drag.length-1, unique ]);
            }
        }

        Old.map(function(order, index){
            var tempDrag = SR.drag[order[0]];
            tempDrag.Box.style.position = "absolute";
            gsap.to(tempDrag.Box, 0, {x: SR.drag[index].xPos, y: SR.drag[index].yPos});

            tempDrag.Drag = Draggable.create(tempDrag.Box, {
                type: "x,y",
                bounds: SR.container,
                allowEventDefault: true,
                onDragParams:[order[0], false],
                onDragEndParams:[order[0], true],
                onDrag:function(id, dragEnd){
                    dragControlFNC(this, id, dragEnd);
                },
                onDragEnd:function(id, dragEnd){
                    dragControlFNC(this, id, dragEnd);
                }
            });

            SR.XX[index] = [order[0], order[1]]; /*------*/
        });

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
                if (_dragID !== SR.XX[_dropID][0]){
                    var dragGetArrayID = utils.searchIndex(_dragID, SR.XX);
                    var dragGetArrayValue = SR.XX[dragGetArrayID].slice();
                    var dropGetArrayValue = SR.XX[_dropID].slice();
                    SR.XX[_dropID] = dragGetArrayValue;
                    SR.XX[dragGetArrayID] = dropGetArrayValue;

                    for(var i=0; i<SR.drop.length;i++){
                        var id = utils.searchIndex(_dragID, SR.XX);
                        if(id!==i){
                            gsap.to(SR.drag[ SR.XX[i][0] ].Box, 0.2, { x: SR.drop[i].xPos, y: SR.drop[i].yPos });
                        }
                    }
                }

                if(_dragEnd){
                    var loc = utils.searchIndex(_dragID, SR.XX);
                    gsap.to(SR.drag[_dragID].Box, 0.2, {x: SR.drop[loc].xPos, y: SR.drop[loc].yPos, boxShadow:"rgba(0,0,0,0.2) 0px 0px 0px 0px", scale: 1.0});
                    SR.activeButonID = -1;

                    var final=[];

                    SR.XX.map(function(e, i){
                        final[i] = e[0];
                    });

                    Data.AddFNC(final, _dragID, SR.XX);
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
    var clicked = function(html, unique){
        resetDom();
        SR.drag.map(function(tempDrag){
            SR.container.append(tempDrag.Box);
        });

        Old = SR.XX.slice();
        var Elem = addBox("drag"+ SR.drag.length, html);
        start("Add", unique);
        return Elem;
    }

    //Delete
    var deleted = function(unique){
        resetDom();

        var index;
        if(typeof unique === "number"){
            index = unique;
        }else{
            SR.XX.map(function(sr, i){
                if(sr[1] === unique){
                    index = sr[0];
                }
            });
        }

        SR.drag.splice(index, 1);
        var id = utils.searchIndex(index, SR.XX);
        SR.XX.splice(id, 1);


        SR.drag.map(function(tempDrag){
            SR.container.append(tempDrag.Box);
        });

        var temp = [];
        SR.XX.map(function(order, i){
            if(order[0] > index){
                order[0]--;
            }

            temp[i] = order;
            SR.drag[order[0]].Box.id = "drag"+order[0];
        });

        Old = temp.slice();
        start("Delete");

        var final=[];
        SR.XX.map(function(e, i){
            final[i] = e[0];
        });

        Data.DelFNC(final);
    }

    var resetSystem = function(){
        resetDom();
        SR = resetData();
    }

    return {start, clicked, deleted, resetSystem}

}