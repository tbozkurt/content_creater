function PLAYER(){

        this.allScene = [];
        this.sceneIndex = 0;
        var This = this;
        var KT={}
        var player={
            sound: new Howl({
                src: ['https://cdn.okulistik.com/mobileplayer/edge_includes/yesno.mp3'],
                sprite: {
                    right: [1000, 1000],
                    wrong: [2000, 1000]
                }
            })
        };


/*    var sound = new Howl({
        src: ['sound.mp3']
    });

    //sound.play();*/

        var SP = [];
        var SD = [];

        this.getStandart = function(e){
            var className = e.Layer.type

            if(e.Layer.class){
                className += (" "+e.Layer.class);
            }

            return {
                left: e.x +"px",
                top: e.y +"px",
                width: e.width +"px",
                height: e.height +"px",
                transform: `scale(${e.scale.x}, ${e.scale.y})`,
                transformOrigin: "0% 0%",
                position: "absolute",
                type: e.Layer.type,
                className: className,
                name: e.Layer.name,
                id: e.Layer.elementID
            }
        }

        this.getRadius = function(data){
            return `${data[0]}px ${data[1]}px ${data[2]}px ${data[3]}px`;
        }

        this.convertObject = function(container){
            var This = this;
            var Kids = [];
            container.map(function(e){
                if(e.Layer){
                    var obj;
                    if(e.Layer.type === "objectRect"){
                        obj = Object.assign({
                            backgroundColor: e.fill,
                            border: `${e.strokeWidth}px solid ${e.stroke}`,
                            borderRadius: This.getRadius(e.cornerRadius),
                            boxSizing:"border-box"
                        }, This.getStandart(e));
                    }else if(e.Layer.type === "objectCircle"){
                        obj = Object.assign({
                            backgroundColor: e.fill,
                            borderRadius: e.borderRadius+"px",
                        }, This.getStandart(e));
                    }else if (e.Layer.type === "objectImg") {
                        obj = Object.assign({
                            backgroundImage: `url(${player.root+e.src})`,
                            backgroundSize: `${e.width}px ${e.height}px`
                        }, This.getStandart(e));
                    }else if(e.Layer.type === "objectText"){
                        obj = Object.assign({
                            text: e.text,
                            fontSize: e.fontSize+"px",
                            fontFamily: e.fontFamily,
                            fontWeight: e.fontStyle,
                            lineHeight: e.lineHeight,
                            textAlign: e.align,
                            color: e.fill,
                        }, This.getStandart(e));

                        if(e.verticalAlign === "middle"){
                            obj.lineHeight = obj.height;
                        }
                    }else if (e.Layer.type === "objectMovieClip") {
                        obj = Object.assign({
                            Kids: This.convertObject(e.Kids)
                        }, This.getStandart(e));
                    }

                    Kids.push(obj);
                }
            });

            return Kids;
        }

        this.addMovieClip = function(kids, container){
            var This = this;
            kids.map(function(e){
                if(e.type === "objectRect"){
                    var rect = utils.addDOM({className:e.className, id:e.id, layername: e.name});
                    Object.assign(rect.style, e);
                    container.appendChild(rect);
                }if(e.type === "objectCircle"){
                    var circle = utils.addDOM({className:e.className, id:e.id, layername: e.name});
                    Object.assign(circle.style, e);
                    container.appendChild(circle);
                }else if(e.type === "objectImg"){
                    var img = utils.addDOM({className:e.className, id:e.id, layername: e.name});
                    Object.assign(img.style, e);
                    container.appendChild(img);
                }else if(e.type === "objectText"){
                    var text = utils.addDOM({className:e.className, id:e.id, layername: e.name, innerText: e.text});
                    Object.assign(text.style, e);
                    container.appendChild(text);
                }else if(e.type === "objectMovieClip"){
                    var mc = utils.addDOM({className:e.className, id:e.id, layername: e.name});
                    container.appendChild(mc);
                    This.addMovieClip(e.Kids, mc);
                    Object.assign(mc.style, e);
                }
            });
        }

        this.startBuild = function(json, currentSceneID, stageBG, container, Mode, root, scoreUpdate){
            console.log("Start", json);
            player.root = root;
            player.scoreUpdate = scoreUpdate;
            jsonV2 = json;
            if(Mode === "optic"){
                KT.Mode = true;
                container = addKT_HTML(container);
            }

            player.containerDOM = container;
            //player.containerDOM.style.overflow = "hidden";
            player.mainDOM = utils.addDOM({id: "PlayerMain"});
            container.appendChild(player.mainDOM);

            var sceneCSS = [];
            json.slides.map(function(slide, index){
                var convertObjectsCSS = This.convertObject(slide.all);
                sceneCSS.push(convertObjectsCSS);
                SD[index] = {
                    id: index,
                    type:"CS",
                    duration:0,
                    wrong:0,
                    right:0,
                    empty:1,
                    complete: false,
                    attempt:0,
                }

                SP[index] = {
                    id: index,
                    popupWindow: {}
                }
            });

            sceneCSS.map(function(allObject, i){
                var sceneDiv = document.createElement('div');
                sceneDiv.id = "sceneMain"+i;
                This.addMovieClip(allObject, sceneDiv);

                player.mainDOM.appendChild(sceneDiv);
                This.searchTool(sceneDiv, i);
                This.AddCS(sceneDiv, i);
                This.allScene.push(sceneDiv);
            })

            this.addEvents();
            this.addScreenClose();

            if(Mode === "optic"){
                This.build_KT(json);
            }else if(Mode === "preview"){
                Preview_HTML(container);
            }else  if(Mode === "normal"){
                this.addNormal_HTML();
                This.scoreCalc();
            }
        }

        this.scoreCalc = function(){
            var score = {right:0, wrong:0, empty:0};

            var complete = true;
            SD.map(function(e){
                score.right += e.right;
                score.wrong += e.wrong;
                score.empty += e.empty;

                if(!e.complete){
                    complete = false;
                }
            });

            if(player.scoreUpdate){
                player.scoreUpdate({
                    Access:10,
                    Success:10,
                    Right:score.right,
                    Wrong:score.wrong,
                    Empty:score.empty,
                    TotalRight: SD.length,
                    CurrentSceneType: "E",
                    Complete: complete
                });
            }
        }

        /** Add CS **/
        this.AddCS = function(Scene, index){
            var CS = {
                rightAnswer: jsonV2.slides[index].rightAnswer,
                wrongCount: 0,
                selectedID: null,
                Buton:[]
            }

            Scene.childNodes.forEach(function(main){
                if(main.id.includes("selectButon")){
                    var id = parseInt(main.id.split("_")[1]);
                    main.addEventListener("click", function(){
                        selected(id);
                    });

                    CS.Buton[id] = {
                        main:main,
                        csClick: main.querySelector(".csClick"),
                        csWrong: main.querySelector(".csWrong"),
                        csRight: main.querySelector(".csRight"),
                    };

                    main.style.cursor = "pointer";
                }
            });

            if(SP[index].controlBtn){
                SP[index].controlBtn.addEventListener("click", function(){
                    controlFNC(CS.selectedID);
                });
            }

            if(SP[index].popupWindow.btn){
                SP[index].popupWindow.btn.addEventListener("click", function(){
                    if(!SD[index].right === 0){
                        reset();
                    }

                    disableAllSelectBtn();
                });

                SP[index].popupWindow.btn.style.pointerEvents = "none";
            }

            function disableControlBtn(){
                if(SP[index].controlBtn){
                    SP[index].controlBtn.style.opacity = 0.5;
                    SP[index].controlBtn.style.pointerEvents = "none";
                }
            }

            function enablePopupBtnStatus(){
                if(SP[index].popupWindow.btn){
                    SP[index].popupWindow.btn.style.opacity = 1;
                    SP[index].popupWindow.btn.style.pointerEvents = "auto";
                }
            }

            function selected(id){
                reset();
                CS.Buton[id].csClick.style.visibility = "visible";
                CS.selectedID = id;

                if(KT.Mode){
                    KT.singleSelectFNC(index, id);
                }else if(SP[index].controlBtn){
                    SP[index].controlBtn.style.opacity = 1;
                    SP[index].controlBtn.style.pointerEvents = "auto";
                }else{
                    controlFNC(id);
                }
            }

            function reset(){
                CS.Buton.map(function(Buton){
                    Buton.csClick.style.visibility = "hidden";
                    Buton.csWrong.style.visibility = "hidden";
                    Buton.csRight.style.visibility = "hidden";
                });
            }

            function controlFNC(id){
                if(id === null){
                    return false;
                }

                CS.Buton[id].csClick.style.visibility = "hidden";
                disableControlBtn();

                if(CS.rightAnswer === id){
                    This.playRightAudio();
                    SD[index].right++;
                    SD[index].empty=0;
                    CS.Buton[id].csRight.style.visibility = "visible";
                    enablePopupBtnStatus();
                    disableAllSelectBtn();
                    SD[index].complete = true;
                }else{
                    This.playWrongAudio();
                    SD[index].wrong++;
                    CS.Buton[id].csWrong.style.visibility = "visible";
                    player.screenCloseDOM.style.display = "block";

                    if(SD[index].wrong >= 3){
                        if(SP[index].popupWindow.btn){
                            SP[index].popupWindow.clicked = true;
                            SP[index].popupWindow.window.style.visibility = "visible";
                            SD[index].complete = true;
                            SP[index].controlBtn.style.visibility = "hidden";
                            disableAllSelectBtn();
                        }
                    }else{
                        enablePopupBtnStatus();
                    }

                    player.screenCloseTimer = setTimeout(function (){
                        player.screenCloseDOM.style.display="none";
                        CS.selectedID=null;
                        reset();
                    }, 1000);

                }

                console.log(SD);
                This.scoreCalc();
            }

            function disableAllSelectBtn(){
                CS.Buton.map(function(btn){
                    btn.main.style.pointerEvents = "none";
                });
            }
        }

        This.searchTool = function(Scene, index){
            var popupWindow;
            Scene.childNodes.forEach(function(obj) {
                if(obj.id.includes("popupButon")){
                    SP[index].popupWindow.clicked = false;
                    SP[index].popupWindow.btn = obj;
                    SP[index].popupWindow.btn.addEventListener("click", function(){
                        if(SP[index].popupWindow.clicked){
                            popupWindow.style.visibility = "hidden";
                            SP[index].popupWindow.clicked = false;
                        }else{
                            popupWindow.style.visibility = "visible";
                            SP[index].popupWindow.clicked = true;
                            if(SP[index].controlBtn){
                                SP[index].controlBtn.style.opacity = 0.5;
                                SP[index].controlBtn.style.pointerEvents = "none";
                            }
                        }
                    });

                    SP[index].popupWindow.btn.style.cursor = "pointer";
                } else if(obj.id.includes("popupWindow")){
                    SP[index].popupWindow.window = obj;
                    popupWindow = obj;
                    popupWindow.querySelector(".popupWindowClose").addEventListener("click",function(){
                        popupWindow.style.visibility = "hidden";
                        SP[index].popupWindow.clicked = false;
                    });
                    popupWindow.querySelector(".popupWindowClose").style.cursor = "pointer";
                }else if(obj.id.includes("control")){
                    SP[index].controlBtn = obj;
                    SP[index].controlBtn.style.cursor = "pointer";
                    SP[index].controlBtn.style.pointerEvents = "none";
                }else if(obj.id.includes("answer")){
                    SP[index].answerBtn = obj;
                    SP[index].answerBtn.style.cursor = "pointer";
                    SP[index].answerBtn.style.pointerEvents = "none";
                }
            });
        }

        this.changeScene = function(index, navText){
            if(this.allScene[index]){
                this.sceneIndex = index;

                this.allScene.forEach(function(Scene){
                    Scene.style.display = "none";
                });

                this.allScene[this.sceneIndex].style.display = "block";
                if(navText){
                    navText.innerHTML = (index+1) +" / "+ this.allScene.length;
                }

                this.sceneCompleteControl();
            }
        }


        this.addEvents = function(){
            window.addEventListener("resize", function() {
                This.screenRatio();
            }, true);

            This.screenRatio();
        }

        this.addScreenClose = function(){
            player.screenCloseDOM = utils.addDOM({className: "screenClose"});
            player.mainDOM.appendChild(player.screenCloseDOM);
        }

        this.sceneCompleteControl = function(){
            clearInterval(player.screenCloseTimer);
            if(SD[This.sceneIndex].complete){
                player.screenCloseDOM.style.display = "block";
            }else{
                player.screenCloseDOM.style.display = "none";
            }
        }

        this.screenRatio = function(){
            var mainWidth = player.containerDOM.clientWidth;
            var mainHeight = player.containerDOM.clientHeight;

            var ratio = mainWidth / 1280;
            var sonucH = (ratio*720);

            if (sonucH > mainHeight) {
                ratio = (mainHeight / 720);
            }

            player.mainDOM.style.scale = ratio;
        }



    this.addNormal_HTML = function(){
        var NavMain = utils.addDOM({className:"Normal_NavMain"});
        player.mainDOM.appendChild(NavMain);
        var backBtn = utils.addDOM({className:"Normal_NavBtn", id:"Normal_BackBtn", innerHTML:"&#9664;"});
        var infoDiv = utils.addDOM({className:"Normal_NavInfo", textContent: "0 / 0"});
        var nextBtn = utils.addDOM({className:"Normal_NavBtn", id:"Normal_NextBtn", innerHTML:"&#9654;"});
        NavMain.appendChild(backBtn);
        NavMain.appendChild(infoDiv);
        NavMain.appendChild(nextBtn);

        backBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex-1, infoDiv);
        });

        nextBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex+1, infoDiv);
        });

        This.changeScene(0, infoDiv);
    }

    function Preview_HTML(container){
        var backBtn = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_BackBtn", innerHTML:"&#9664;"});
        var nextBtn = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_NextBtn", innerHTML:"&#9654;"});
        var infoDiv = utils.addDOM({id:"Nav_Preview_NavInfo", textContent: "0 / 0"});
        container.appendChild(backBtn);
        container.appendChild(nextBtn);
        container.appendChild(infoDiv);

        backBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex-1, infoDiv);
        });

        nextBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex+1, infoDiv);
        });

        This.changeScene(0, infoDiv);
    }

    this.playWrongAudio = function(){
        player.sound.play("wrong");
    }

    this.playRightAudio = function(){
        player.sound.play("right");
    }

    this.build_KT = function(jsonV2){
        KT.Optic_MainDiv = document.querySelector("#Optic_MainDiv");
        KT.Nav_MainDiv = document.querySelector("#Nav_MainDiv");
        KT.Top_MainDiv = document.querySelector("#Top_MainDiv");
        KT.Optic_ShowBtn = document.querySelector("#Optic_Btn");
        KT.Nav_BackBtn = document.querySelector("#Nav_BackBtn");
        KT.Nav_NextBtn = document.querySelector("#Nav_NextBtn");
        KT.Nav_Text = document.querySelector("#Nav_Text");
        KT.FormShow = false;
        KT.Scene=[];
        KT.currentSlide=[];
        KT.allSelect=[]

        //Create And Description
        function createOptikForm(){
            var html = "";
            for(var i=0; i<jsonV2.slides.length; i++){
                html +=
                    `<div class="Optic_Row" id="opticRow${i}">
                            <div class="Optic_Row_No">${i+1}</div>
                            <div class="Optic_Row_Select select0">A</div>
                            <div class="Optic_Row_Select select1">B</div>
                            <div class="Optic_Row_Select select2">C</div>
                            <div class="Optic_Row_Select select3">D</div>
                            <div class="Optic_Row_Close"></div>
                        </div>`;
            }

            KT.Optic_MainDiv.innerHTML = html;

            jsonV2.slides.map(function(i, rid){
                var main = document.querySelector("#opticRow"+ rid);
                KT.Scene[rid] = {
                    main: main,
                    rightAnswer: i.rightAnswer,
                    close: main.querySelector(".Optic_Row_Close"),
                    opticSelect:[
                        main.querySelector(".select0"),
                        main.querySelector(".select1"),
                        main.querySelector(".select2"),
                        main.querySelector(".select3"),
                    ],
                    sceneSelect: [],
                    click: null
                };

                KT.Scene[rid].main.addEventListener("click", function(){
                    rowSelectFNC(rid);
                });

                KT.Scene[rid].opticSelect.map(function(e, sid){
                    e.addEventListener("click", function(){
                        KT.singleSelectFNC(rid, sid);
                    });
                });

                This.allScene[rid].childNodes.forEach(function(btn) {
                    if (btn.id.includes("selectButon")) {
                        var id = parseInt(btn.id.split("_")[1]);
                        KT.Scene[rid].sceneSelect[id] = {
                            main: btn,
                            clicked: btn.querySelector('.clicked'),
                            csClick: btn.querySelector(".csClick"),
                            csWrong: btn.querySelector(".csWrong"),
                            csRight: btn.querySelector(".csRight")
                        };
                    }
                });
            });
        }

        //Scene Select
        function rowSelectFNC(rid){
            KT.Scene.map(function(e){
                e.main.style.backgroundColor = "#e9f8fa";
                e.close.style.display = "block";
            });

            KT.Scene[rid].main.style.backgroundColor = "#4eaee1";
            KT.Scene[rid].close.style.display = "none";
            This.changeScene(rid);
        }

        //Select Option
        KT.singleSelectFNC = function(rid, sid){
            KT.Scene[rid].opticSelect.map(function(e, index){
                e.style.backgroundColor = "white";
            });

            KT.Scene[rid].sceneSelect.map(function(e){
                e.csClick.style.visibility = "hidden";
            })

            if(KT.Scene[rid].click === null || KT.Scene[rid].click !== sid){
                KT.Scene[rid].opticSelect[sid].style.backgroundColor = "#8b8b8b";
                KT.Scene[rid].sceneSelect[sid].csClick.style.visibility = "visible";
                KT.Scene[rid].click = sid;

                var next = This.sceneIndex+1;
                if(next >= jsonV2.slides.length){
                    next = 0;
                }

                clearInterval(KT.time);
                KT.time = setTimeout(rowSelectFNC, 1000, next);
            }else{
                KT.Scene[rid].opticSelect[sid].style.backgroundColor = "white";
                KT.Scene[rid].sceneSelect[sid].csClick.style.visibility = "hidden";
                KT.Scene[rid].click = null;
            }
        }


        createOptikForm();


        function openOpticWindow(){
            var OpticWidth = KT.Optic_MainDiv.offsetWidth;

            if(KT.FormShow){
                player.containerDOM.style.width = "100%";
                KT.Top_MainDiv.style.width= "100%";
                KT.Nav_MainDiv.style.width = "100%";
                KT.Optic_MainDiv.style.visibility = "hidden";
                KT.FormShow = false;
            }else{
                player.containerDOM.style.width = `calc(100% - ${OpticWidth}px)`;
                KT.Top_MainDiv.style.width = `calc(100% - ${OpticWidth}px)`;
                KT.Nav_MainDiv.style.width = `calc(100% - ${OpticWidth}px)`;
                KT.Optic_MainDiv.style.visibility = "visible";
                KT.FormShow = true;
            }

            This.screenRatio();
        }


        KT.Nav_BackBtn.addEventListener("click", function (){
            This.changeScene(This.sceneIndex-1, KT.Nav_Text);
        });

        KT.Nav_NextBtn .addEventListener("click", function (){
            This.changeScene(This.sceneIndex+1, KT.Nav_Text);
        });

        KT.Optic_ShowBtn.addEventListener("click", function(){
            openOpticWindow();
        });

        player.containerDOM.style.top = "5em";
        player.containerDOM.style.height = "calc(100% - 10em)";
        KT.finishBtn = utils.addDOM({id:"OpticRow_FinishBtn", className:"Optic_Row_Btn ", textContent:"SINAVI BİTİR"});
        KT.restartBtn = utils.addDOM({id:"OpticRow_RestartBtn", className:"Optic_Row_Btn", textContent:"YENİDEN BAŞLAT"});
        KT.Optic_MainDiv.appendChild(KT.finishBtn);
        KT.Optic_MainDiv.appendChild(KT.restartBtn);

        KT.finishBtn.addEventListener("click", function(){
            evalute();
        });

        KT.restartBtn.addEventListener("click", function(){
            restart();
        });

        function evalute(){
            clearInterval(KT.time);
            var score = {right:0, wrong:0, empty:0};
            KT.Scene.map(function(e){
                if(e.click === null){
                    score.empty++;
                }else if(e.rightAnswer === e.click){
                    e.opticSelect[e.click].style.backgroundColor = "green";
                    e.sceneSelect[e.click].csRight.style.visibility = "visible";
                    e.sceneSelect[e.click].csClick.style.visibility = "hidden";
                    score.right++;
                }else{
                    e.opticSelect[e.click].style.backgroundColor = "red";
                    e.sceneSelect[e.click].csWrong.style.visibility = "visible";
                    e.sceneSelect[e.click].csClick.style.visibility = "hidden";
                    score.wrong++;
                }

                e.opticSelect.map(function(e){
                    e.style.pointerEvents = "none";
                });

                e.sceneSelect.map(function(e){
                    e.main.style.pointerEvents = "none";
                });
            });

            KT.finishBtn.style.display = "none";
            KT.restartBtn.style.display = "block";
        }

        function restart(){
            KT.Scene.map(function(e){
                e.click = null;
                e.opticSelect.map(function(e){
                    e.style.pointerEvents = "auto";
                    e.style.backgroundColor = "white";
                });

                e.sceneSelect.map(function(e){
                    e.main.style.pointerEvents = "auto";
                    e.csClick.style.visibility = "hidden";
                    e.csWrong.style.visibility = "hidden";
                    e.csRight.style.visibility = "hidden";
                });
            });



            KT.finishBtn.style.display = "block";
            KT.restartBtn.style.display = "none";
            rowSelectFNC(0);
        }



        openOpticWindow();
        rowSelectFNC(0);
        this.changeScene(0,KT.Nav_Text);
        return player.containerDOM;
    }

    function addKT_HTML(container){
        var html =
            `<div id="Player_Container"></div>
        <div id="Optic_MainDiv"></div>
        <div id="Nav_MainDiv">
                <div class="Nav_Container">
                    <div class="Nav_Btn" id="Nav_BackBtn">&#9664;</div>
                    <div class="Nav_Btn" id="Nav_Text">0 / 0</div>
                    <div class="Nav_Btn" id="Nav_NextBtn">&#9654;</div>
                </div>
        </div>
        <div id="Top_MainDiv">
            <div id="Optic_Btn">Optik Form</div>
        </div>`;


        container.innerHTML = html;
        return document.querySelector("#Player_Container");
    }
}


