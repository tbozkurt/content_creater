function PLAYER(){

        this.allScene = [];
        this.sceneIndex = 0;

        this.getStandart = function(e){
            return {
                left: e.x +"px",
                top: e.y +"px",
                width: e.width +"px",
                height: e.height +"px",
                transform: "scale("+ e.scale.x +')',
                transformOrigin: "0% 0%",
                position: "absolute",
                type: e.Layer.type,
                name: e.Layer.name,
                id: e.Layer.elementID
            }
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
                        }, This.getStandart(e));
                    }else if(e.Layer.type === "objectCircle"){
                        obj = Object.assign({
                            backgroundColor: e.fill,
                            borderRadius: e.borderRadius+"px",
                        }, This.getStandart(e));
                    }else if (e.Layer.type === "objectImg") {
                        obj = Object.assign({
                            backgroundImage: `url(${e.src})`,
                        }, This.getStandart(e));
                    }else if(e.Layer.type === "objectText"){
                        obj = Object.assign({
                            text: e.text,
                            fontSize: e.fontSize+"px",
                            fontFamily: e.fontFamily,
                            lineHeight: e.lineHeight,
                            textAlign: e.align,
                            color: e.color,
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
                    var rect = utils.addDOM({className:e.type, id:e.id, layername: e.name});
                    Object.assign(rect.style, e);
                    container.appendChild(rect);
                }if(e.type === "objectCircle"){
                    var circle = utils.addDOM({className:e.type, id:e.id, layername: e.name});
                    Object.assign(circle.style, e);
                    container.appendChild(circle);
                }else if(e.type === "objectImg"){
                    var img = utils.addDOM({className:e.type, id:e.id, layername: e.name});
                    Object.assign(img.style, e);
                    container.appendChild(img);
                }else if(e.type === "objectText"){
                    var text = utils.addDOM({className:e.type, id:e.id, layername: e.name, innerText: e.text});
                    Object.assign(text.style, e);
                    container.appendChild(text);
                }else if(e.type === "objectMovieClip"){
                    var mc = utils.addDOM({className:e.type, id:e.id, layername: e.name});
                    container.appendChild(mc);
                    This.addMovieClip(e.Kids, mc);
                    Object.assign(mc.style, e);
                }
            });
        }

        this.CreateScene = function(json, currentSceneID){
            var This = this;
            var previewContent = document.querySelector("#previewContent");
            var PlayerScene = document.createElement('div');
            PlayerScene.id = "PlayerScene";
            previewContent.appendChild(PlayerScene);

            var sceneCSS = [];
            json.slides.map(function(slide) {
                var convertObjectsCSS = This.convertObject(slide.all);
                sceneCSS.push(convertObjectsCSS);
            });

            sceneCSS.map(function(allObject, i){
                var sceneDiv = document.createElement('div');
                sceneDiv.id = "sceneMain"+i;
                This.addMovieClip(allObject, sceneDiv);

                PlayerScene.appendChild(sceneDiv);
                This.AddCS(sceneDiv);
                This.allScene.push(sceneDiv);
            })

            this.createPlayerNavigation();
            this.changeScene(currentSceneID);
        }

        this.AddCS = function(Scene){
            var allButons = [];
            Scene.childNodes.forEach(function(btn){
                if(btn.id.includes("btn")){
                    var id = parseInt(btn.id.split("_")[1]);
                    var clicked = btn.querySelector('[layername="clicked"]');
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
            }
        }

        this.changeScene = function(index){
            if(this.allScene[index]){
                this.sceneIndex = index;

                this.allScene.forEach(function(Scene){
                    Scene.style.display = "none";
                });

                document.querySelector("#SceneInfo").innerHTML = (index+1) +" of "+ this.allScene.length;
                this.allScene[this.sceneIndex].style.display = "block";
            }
        }

        this.createPlayerNavigation = function(){
            var This = this;
            var PlayerScene = document.querySelector("#PlayerScene");

            var html = `<div id="BackScene" class="SceneBtn"></div>
                        <div id="SceneInfo">0 of 0</div>
                        <div id="NextScene" class="SceneBtn"></div>`;

            var Navigation = document.createElement('div');
            Navigation.className = "Navigation";
            PlayerScene.appendChild(Navigation);
            Navigation.innerHTML = html;

            document.querySelector("#BackScene").addEventListener("click", function (){
                This.changeScene(This.sceneIndex-1);
            });

            document.querySelector("#NextScene").addEventListener("click", function (){
                This.changeScene(This.sceneIndex+1);
            });
        }
}


