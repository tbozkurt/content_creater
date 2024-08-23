function PLAYER(){

        this.allScene = [];
        this.sceneIndex = 0;
        var player = {}
        var This = this;
        var KT={}

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
                            backgroundImage: `url(${e.src})`,
                            backgroundSize: `${e.width}px ${e.height}px`
                        }, This.getStandart(e));
                    }else if(e.Layer.type === "objectText"){
                        obj = Object.assign({
                            text: e.text,
                            fontSize: e.fontSize+"px",
                            fontFamily: e.fontFamily,
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

        this.startBuild = function(json, currentSceneID, stageBG, container, KTMode){
            if(KTMode){
                KT.Mode = true;
                container = addKT_HTML(container);
            }

            player.containerDOM = container;
            //player.containerDOM.style.overflow = "hidden";
            player.mainDOM = utils.addDOM({id: "PlayerMain"});
            container.appendChild(player.mainDOM);

            var sceneCSS = [];
            json.slides.map(function(slide) {
                var convertObjectsCSS = This.convertObject(slide.all);
                sceneCSS.push(convertObjectsCSS);
            });

            sceneCSS.map(function(allObject, i){
                var sceneDiv = document.createElement('div');
                sceneDiv.id = "sceneMain"+i;
                This.addMovieClip(allObject, sceneDiv);

                player.mainDOM.appendChild(sceneDiv);
                This.AddCS(sceneDiv);
                This.Popup(sceneDiv);
                This.allScene.push(sceneDiv);
            })

            this.addEvents();

            if(KTMode){
                This.build_KT(json);
            }else{
                Preview_HTML(container);
            }
        }

        this.AddCS = function(Scene){
            var allButons = [];
            Scene.childNodes.forEach(function(btn){
                if(btn.id.includes("selectButon")){
                    var id = parseInt(btn.id.split("_")[1]);
                    var clicked = btn.querySelector(".clicked");
                    btn.addEventListener("click", function(){
                        selected(id);
                    });
                    allButons[id] = {btn, clicked};
                    clicked.style.display = "none";
                    btn.style.cursor = "pointer";
                }
            });

            function selected(id){
                allButons.map(function(o){
                    o.clicked.style.display = "none";
                });

                allButons[id].clicked.style.display = "block";
                if(KT.Mode){
                    KT.singleSelectFNC(This.sceneIndex, id);
                }
            }
        }

        this.Popup = function(Scene){
            console.log("this.Popup");
            var popupWindow;
            Scene.childNodes.forEach(function(obj) {
                if(obj.id.includes("popup_buton")){
                    obj.addEventListener("click", function(){
                        console.log("Deneme",popupWindow.style.visibility);
                        if(popupWindow.style.visibility === "hidden"){
                            popupWindow.style.visibility = "visible";
                        }else{
                            popupWindow.style.visibility = "hidden";
                        }
                    });

                    obj.style.cursor = "pointer";
                }else if(obj.id.includes("popup_window")){
                    popupWindow = obj;
                    popupWindow.style.visibility = "hidden";
                    popupWindow.querySelector('.popup_close').addEventListener("click",function(){
                        popupWindow.style.visibility = "hidden";
                    });
                    obj.style.cursor = "pointer";
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
            }
        }


        this.addEvents = function(){
            window.addEventListener("resize", function() {
                This.screenRatio();
            }, true);

            This.screenRatio();
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
                                bg: btn.querySelector('.bg')
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
                    e.clicked.style.display = "none";
                })

                if(KT.Scene[rid].click === null || KT.Scene[rid].click !== sid){
                    KT.Scene[rid].opticSelect[sid].style.backgroundColor = "#8b8b8b";
                    KT.Scene[rid].sceneSelect[sid].clicked.style.display = "block";
                    KT.Scene[rid].click = sid;

                    var next = This.sceneIndex+1;
                    if(next >= jsonV2.slides.length){
                        next = 0;
                    }

                    clearInterval(KT.time);
                    KT.time = setTimeout(rowSelectFNC, 1000, next);
                }else{
                    KT.Scene[rid].opticSelect[sid].style.backgroundColor = "white";
                    KT.Scene[rid].sceneSelect[sid].clicked.style.display = "none";
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
                        e.sceneSelect[e.click].bg.style.backgroundColor = "green";
                        e.sceneSelect[e.click].clicked.style.display = "none";
                        score.right++;
                    }else{
                        e.opticSelect[e.click].style.backgroundColor = "red";
                        e.sceneSelect[e.click].bg.style.backgroundColor = "red";
                        e.sceneSelect[e.click].clicked.style.display = "none";
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
                        e.bg.style.backgroundColor = "lightblue";
                        e.clicked.style.display = "none";
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
}


