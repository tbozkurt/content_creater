function PLAYER(){

    this.allScene = [];
    this.sceneIndex = 0;
    var unique = {};
    var PLX = {};
    var This = this;
    var KT={};
    var SP = [];
    var SD = [];
    var AC;
    var player = {
        sound: new Howl({
            src: ['https://cdn.okulistik.com/mobileplayer/edge_includes/yesno.mp3'],
            sprite: {
                right: [1000, 1000],
                wrong: [2000, 1000]
            }
        }),
        autoNext:null,
        screenCloseTimer: null,
        screenDuration: null,
        backBtn: null,
        nextBtn: null
    };

    this.getStandart = function(e){
        var className = e.Layer.type;
        if(e.Layer.class){
            className += (" "+e.Layer.class);
        }

        if(e.Layer.unique){
            unique[e.Layer.unique] = e.Layer.params;
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
            id: e.Layer.elementID,
            unique: e.Layer.unique
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
                        Kids: This.convertObject(e.Kids),
                        params: e.Layer.params
                    }, This.getStandart(e));
                }

                Kids.push(obj);
            }
        });

        return Kids;
    }

    this.addMovieClip = function(kids, container, index){
        var This = this;
        kids.map(function(e){
            if(e.type === "objectRect"){
                var rect = utils.addDOM({className:e.className, id:e.id, layername: e.name, ccid:e.unique});
                Object.assign(rect.style, e);
                container.appendChild(rect);
            }if(e.type === "objectCircle"){
                var circle = utils.addDOM({className:e.className, id:e.id, layername: e.name, ccid:e.unique});
                Object.assign(circle.style, e);
                container.appendChild(circle);
            }else if(e.type === "objectImg"){
                var img = utils.addDOM({className:e.className, id:e.id, layername: e.name, ccid:e.unique});
                Object.assign(img.style, e);
                container.appendChild(img);
            }else if(e.type === "objectText"){
                var text = utils.addDOM({className:e.className, id:e.id, layername: e.name, innerText: e.text, ccid:e.unique});
                Object.assign(text.style, e);
                container.appendChild(text);
            }else if(e.type === "objectMovieClip"){
                var mc = utils.addDOM({className:e.className, id:e.id, layername: e.name, ccid:e.unique});
                container.appendChild(mc);
                SP[index].elementList.push({id:e.id, main:mc, data:e.params});
                This.addMovieClip(e.Kids, mc);
                Object.assign(mc.style, e);
            }
        });
    }

    this.startBuild = function(json, currentSceneID, stageBG, container, Mode, ActiveContent, scoreUpdate){
        AC=ActiveContent;
        player.root = AC.Url;
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
                empty:0,
                inputs:{},
                complete: false,
                attempt:0,
            }

            SP[index] = {
                id: index,
                fnc:[],
                popupWindow: {},
                screenCloseDOM:null
            }
        });

        sceneCSS.map(function(allObject, i){
            var sceneDiv = document.createElement('div');
            sceneDiv.id = "sceneMain"+i;
            SP[i].elementList=[];
            This.addMovieClip(allObject, sceneDiv, i);

            player.mainDOM.appendChild(sceneDiv);
            This.searchTool(sceneDiv, i);
            This.actType(SP[i], SD[i], i);
            This.allScene.push(sceneDiv);
            This.addScreenClose(sceneDiv, i);
        });

        this.addEvents();

        if(Mode === "optic"){
            This.build_KT(json);
        }else if(Mode === "preview"){
            Preview_HTML(container);
            initKACountDown();
        }
    }

    this.scoreCalc = function(){
        var score = {right:0, wrong:0, empty:0, access:0, success:0, duration:0};

        var averageScore = 100/SD.length;

        function accessControl(e){
            if(e.right || e.wrong){
                return 1;
            }

            return 0;
        }

        var complete = true;
        SD.map(function(e){
            score.right += e.right;
            score.wrong += e.wrong;
            score.empty += e.empty;
            score.duration += e.duration;
            score.access += accessControl(e);
            score.success += (e.right / (e.right + e.wrong + e.empty)) * averageScore;

            if(!e.complete){
                complete = false;
            }
        });


        if(score.access){
            score.access = (score.access  / SD.length)*100;
        }else{
            score.access = 0;
        }

        if(player.scoreUpdate){
            player.scoreUpdate({
                Access: score.access,
                Success: parseInt(score.success),
                Duration: score.duration,
                Right:score.right,
                Wrong:score.wrong,
                Empty:score.empty,
                TotalRight: SD.length,
                CurrentSceneType: "E",
                Complete: complete
            });
        }
    }

    This.convertRubrik = function(slideID){
        var btnID = jsonV2.slides[slideID].rightAnswer;
        if(btnID !== null && btnID !== undefined){
            jsonV2.slides[slideID].answer = {};
            jsonV2.slides[slideID].answer[btnID] = true;
        }
    }


    function CommonFNC(i){
        var userAnswer = iDATA[SP.id].input[i].convertText();
        var curAnswer = iDATA[SP.id].input[i].answer;
        var sensitive = iDATA[SP.id].input[i].sensitive;
        var correctAnswer = "wrong";
        userAnswer = userAnswer.trim();

        if(userAnswer !== ""){
            if(!sensitive){
                userAnswer = userAnswer.toLocaleLowerCase("tr-TR");
            }

            userAnswer = userAnswer.split("");
            var finalUserAnswer="";
            for(var x=0; x<userAnswer.length; x++){
                if(userAnswer[x].charCodeAt(0) === 160){
                    userAnswer[x] = " ";
                }
                finalUserAnswer += userAnswer[x];
            }

            for(var w=0; w<curAnswer.length; w++){
                var tempCurAnswer = curAnswer[w];
                if(!sensitive){
                    tempCurAnswer = curAnswer[w].toLocaleLowerCase("tr-TR");
                }

                if(tempCurAnswer === finalUserAnswer && tempCurAnswer !== ""){
                    correctAnswer = "right";
                    break;
                }
            }

            return correctAnswer;
        }else{
            return "empty";
        }
    }


    /** Add CS **/
    this.initCS = function(SP, SD, index){
        console.log("initCS");
        This.convertRubrik(index);
        var answer, rubrik = {};

        var CS = {
            rightAnswer: jsonV2.slides[index].rightAnswer,
            wrongCount: 0,
            selectedID: null,
            Buton:{},
            group:[],
            selectMode: "limited",
            evaluationMode: "select",
            controlMode: false
        }

        function settings(){
            answer = jsonV2.slides[index].answer;
            for(var p in answer){
                if(p.indexOf("count") > -1){
                    CS.evaluationMode = "count";
                    CS.selectMode = "all";
                }
            }
        }

        settings();

        if(jsonV2.slides[index].scene.selectMode){
           CS.selectMode = jsonV2.slides[index].scene.selectMode;
        }

        SD.empty = Object.keys(answer).length;

        SP.elementList.forEach(function(element){
            if(element.id.includes("selectButon")){
                var id = parseInt(element.id.split("_")[1]);
                element.main.addEventListener("click", function(){
                    selectHqFNC(id);
                });

                var group = 0;

                if(element.data && element.data.group){
                    group = parseInt(element.data.group);
                }

                CS.Buton[id] = {
                    main: element.main,
                    group: group,
                    approved: false,
                    ignore: false,
                    csClick: element.main.querySelector(".csClick"),
                    csWrong: element.main.querySelector(".csWrong"),
                    csRight: element.main.querySelector(".csRight"),
                };

                SD.inputs["box"+ id] = {value: null, type: "cs"};
                rubrik[id] = null;
                element.main.style.cursor = "pointer";
                if(!CS.group[group]){
                    CS.group[group] = {approved:0, maxSelect:0, currentList:[], rightTotalCount:0}
                }

                if(answer[id]){
                    CS.group[group].maxSelect++;
                    CS.group[group].rightTotalCount++;
                }

                if(CS.selectMode === "all"){
                    CS.group[group].maxSelect = 1000;
                }

            }else if(element.id.includes("control")){
                CS.controlMode = true;
            }
        });

        function getRightAnswers(){
            for(var p in answer){
                if(p.indexOf("count") > -1){
                    var groupID = p.split("_")[1];
                    CS.group[groupID].rightTotalCount = parseInt(answer[p]);
                    CS.evaluationMode = "count";
                }
            }

            for(var id in rubrik){
                if(answer[id]){
                    rubrik[id] = Boolean(answer[id]);
                }
            }
        }

        getRightAnswers();


        function selectHqFNC(id){
            if(CS.controlMode){
                selected(id);
            }else{
                singleControl(id);
            }
        }

        console.log(rubrik);
        console.log(CS);
        console.log(jsonV2);
        console.log("//////////////"+index);

        if(SP.popupWindow.btn){
            SP.popupWindow.btn.addEventListener("click", function(){
                btnEvents("none");
            });

            SP.popupWindow.btn.style.pointerEvents = "none";
        }

        function enablePopupBtnStatus(){
            if(SP.popupWindow.btn){
                SP.popupWindow.btn.style.opacity = 1;
                SP.popupWindow.btn.style.pointerEvents = "auto";
            }
        }

        function maxSelect(id){
            var group = CS.Buton[id].group;
            var list = CS.group[group].currentList;
            if(list.length > CS.group[group].maxSelect){
                for(var i = (list.length-1); i > -1; i--){
                    var currentID = list[i];
                    if(!CS.Buton[currentID].approved){
                        var deleteID = list.splice(i, 1);
                        defaultBtn( deleteID );
                        break;
                    }
                }
            }
        }

        function selected(id){
            var clickStatus = SD.inputs["box"+ id].value;

            if(clickStatus){
                defaultBtn(id);
            }else{
                selectBtn(id);
                maxSelect(id);
            }

            if(KT.Mode){
                KT.singleSelectFNC(index, id);
            }else if(SP.controlBtn){
                controlBtnView(SP, "enable");
            }
        }

        function allDefaultBtn(){
            for(var id in rubrik){
                if(!CS.Buton[id].ignore){
                    defaultBtn(id);
                }
            }
        }

        function groupCloseControl(){
            var finish = true;

            CS.group.map(function(group){
                group.approved=0;
            });

            for(var id in CS.Buton){
                var Buton = CS.Buton[id];
                if(Buton.approved){
                    CS.group[Buton.group].approved++;
                }
            }

            CS.group.map(function(group, id){
                if(group.approved === group.rightTotalCount){
                    for(var i in CS.Buton){
                        var Buton = CS.Buton[i];
                        if(Buton.group === id){
                            Buton.ignore = true;
                            Buton.main.style.opacity = 0.8;
                            Buton.main.style.pointerEvents = "none";
                        }
                    }
                }else{
                    finish = false;
                }
            });

            return finish;
        }

        function singleControl(id){
            var right = false;

            if(rubrik[id]){
                right = true;
            }

            if(right){
                This.playRightAudio();
                SD.right++;
                rightBtn(id);
                var finish = groupCloseControl();
                if(finish){
                    SD.empty=0;
                    This.sceneComplete();
                    enablePopupBtnStatus();
                    This.nextScene();
                }
            }else{
                This.playWrongAudio();
                SD.wrong++;
                btnEvents("none");
                CS.Buton[id].csWrong.style.visibility = "visible";

                if(SD.wrong >= 3){
                    if(SP.popupWindow.btn){
                        SP.popupWindow.clicked = true;
                        SP.popupWindow.window.style.visibility = "visible";
                    }

                    SD.empty=0;
                    This.sceneComplete();
                }else{
                    enablePopupBtnStatus();
                    player.screenCloseTimer = setTimeout(function(){
                        btnEvents("auto");
                        defaultBtn(id);
                    }, 1000);
                }
            }
        }

        function rightBtn(id){
            CS.Buton[id].main.style.pointerEvents = "none";
            CS.Buton[id].csRight.style.visibility = "visible";
            CS.Buton[id].csWrong.style.visibility = "hidden";
            CS.Buton[id].csClick.style.visibility = "hidden";
            CS.Buton[id].approved = true;
            CS.Buton[id].ignore = true;
            SD.inputs["box"+ id].value = true;
        }

        function selectBtn(btnID){
            CS.Buton[btnID].csRight.style.visibility = "hidden";
            CS.Buton[btnID].csWrong.style.visibility = "hidden";
            CS.Buton[btnID].csClick.style.visibility = "visible";
            SD.inputs["box"+ btnID].value = true;

            var group = CS.Buton[btnID].group;
            var delIndex = CS.group[group].currentList.indexOf(btnID);
            if(delIndex === -1){
                CS.group[group].currentList.unshift(btnID);
            }
        }

        function defaultBtn(btnID){
            CS.Buton[btnID].csRight.style.visibility = "hidden";
            CS.Buton[btnID].csWrong.style.visibility = "hidden";
            CS.Buton[btnID].csClick.style.visibility = "hidden";
            SD.inputs["box"+ btnID].value = null;

            btnID = parseInt(btnID);
            var group = CS.Buton[btnID].group;
            var delIndex = CS.group[group].currentList.indexOf(btnID);
            if(delIndex > -1){
                CS.group[group].currentList.splice(delIndex, 1);
            }
        }

        function wrongBtn(btnID){
            CS.Buton[btnID].csRight.style.visibility = "hidden";
            CS.Buton[btnID].csWrong.style.visibility = "visible";
            CS.Buton[btnID].csClick.style.visibility = "hidden";
        }

        function showAllWrong(){
            for(var id in rubrik){
                if(SD.inputs["box"+id].value && !CS.Buton[id].approved){
                    wrongBtn(id);
                }
            }
        }

        function checkRightAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"BD"};

            if(CS.evaluationMode === "count"){
                for(var p in CS.group){
                    var listLength = CS.group[p].currentList.length;
                    var totalRight = CS.group[p].rightTotalCount;

                    if(listLength <= totalRight){
                        if(listLength === totalRight){
                            score.totalRight++;
                        } else if(listLength < totalRight){
                            score.totalWrong++;
                        }

                        CS.group[p].currentList.map(function(id){
                            rightBtn(id);
                        });

                    }else if(!CS.group[p].currentList.length){
                        score.totalEmpty++;
                    }else{
                        score.totalWrong++;
                    }
                }
            }else{
                for(var id in rubrik){
                    if(rubrik[id]){
                        if(SD.inputs["box"+id].value){
                            score.totalRight++;
                        }else{
                            score.totalEmpty++;
                        }
                    }else{
                        if(SD.inputs["box"+id].value){
                            score.totalWrong++;
                        }
                    }
                }

                if(!score.totalWrong){
                    for(var p in rubrik){
                        if(rubrik[p]){
                            if(SD.inputs["box"+p].value){
                                rightBtn(p);
                            }
                        }
                    }
                }

            }

            groupCloseControl();
            return score;
        }


        function btnEvents(status){
            for(var id in CS.Buton){
                var Buton = CS.Buton[id];
                if(!Buton.ignore){
                    Buton.main.style.pointerEvents = status;
                }
            }

            SP.screenCloseDOM.style.display="block";
            setTimeout(function (){
                SP.screenCloseDOM.style.display="none";
            }, 10);
        }

        function rightActionFNC(){
            enablePopupBtnStatus();
        }

        function wrongActionFNC(){
            btnEvents("none");
            showAllWrong();
            enablePopupBtnStatus();

            if(SD.wrong >= 3){
                if(SP.popupWindow.btn){
                    SP.popupWindow.clicked = true;
                    SP.popupWindow.window.style.visibility = "visible";
                    SD.empty=0;
                    This.sceneComplete();
                    controlBtnView(SP, "disabled");
                }
            }else{
                SP.screenCloseTimer = setTimeout(function(){
                    btnEvents("auto");
                    allDefaultBtn();
                }, 1000);
            }
        }

        SP.fnc.push({control: checkRightAnswer, wrong: wrongActionFNC, right: rightActionFNC});
    }


    this.initBD = function(SP, SD, index){
        console.log("initBD");
        var allowedLetters = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
        var answer = jsonV2.slides[index].answer;
        var rubrik = {};

        var BD = {
            input:{}
        }

        SP.elementList.forEach(function(element){
            if(element.id.includes("inputArea")){
                var id = parseInt(element.id.split("_")[1]);

                BD.input[id] = {
                    main: element.main,
                    txt: element.main.querySelector(".bdText"),
                    bg: element.main.querySelector(".bdBg"),
                    count: element.data.count,
                    mode: element.data.mode,
                    answer: element.data.answer,
                    sensitive: element.data.sensitive,
                    events: true
                };

                convertInput(id);
                rubrik[id] = null;
            }
        });

        for(var p in answer){
            rubrik[p] = answer[p];
        }

        function convertInput(id){
            var textAreaCSS = {
                width: BD.input[id].txt.style.width,
                height: BD.input[id].txt.style.height,
                fontSize: BD.input[id].txt.style.fontSize,
                fontFamily: BD.input[id].txt.style.fontFamily,
                textAlign: BD.input[id].txt.style.textAlign,
                backgroundColor: "rgba(0,0,0,0)",
                color: BD.input[id].txt.style.color,
                lineHeight: BD.input[id].txt.style.lineHeight,
                position: "absolute",
                padding: 0,
                border: 0
            };

            BD.input[id].txt.remove();

            var input = document.createElement("input");
            input.id = "ggs";
            input.autocomplete = "off";

            if(BD.input[id].count){
                input.maxLength = BD.input[id].count;
            }

            if(BD.input[id].mode === "number"){
                input.type = "tel";
            }

            BD.input[id].main.appendChild(input);
            Object.assign(input.style, textAreaCSS);
            addEvent(input, id);
            BD.input[id].txt = input;
            SD.inputs["box"+ id] = {value: null, type: "bd"};
        }

        function addEvent(input, id){
            input.addEventListener("input", function(e){
                if(BD.input[id].mode === "number"){
                    this.value = numberLayout(input);
                }

                SD.inputs["box"+ id].value = this.value;
                controlBtnViewCheck();
            });
        }

        function numberLayout(input){
            var str = input.value;
            var current = str.slice(0, str.length-1);
            var last = str.slice(-1);
            var allow = false;
            if(last){
                allowedLetters.map(function(code){
                    if(code === last.charCodeAt(0)){
                        allow = true;
                    }
                });
            }

            if(allow){
                return str;
            }else{
                return current;
            }
        }

        function controlBtnViewCheck(){
            var found = false;

            for(var i in BD.input){
                if(SD.inputs["box"+ i].value && BD.input[i].events){
                    found = true;
                }
            }

            if(found){
                controlBtnView(SP, "enable");
            }else{
                controlBtnView(SP, "disable");
            }
        }

        function showRightView(id){
            BD.input[id].bg.style.backgroundColor = "green";
            BD.input[id].events = false;
        }

        function showWrongView(id){
            BD.input[id].bg.style.backgroundColor = "red";
        }

        function showDefaultView(id){
            BD.input[id].bg.style.backgroundColor = "white";
            BD.input[id].txt.value = "";
            SD.inputs["box"+ id].value = "";
        }

        function showAllDefaultView(){
            for(var i in BD.input){
                if(BD.input[i].events){
                    showDefaultView(i);
                }
            }
        }

        function btnEvents(status){
            for(var i in BD.input){
                if(BD.input[i].events){
                    BD.input[i].txt.style.pointerEvents = status;
                }
            }
        }

        function checkRightAnswer(){
            btnEvents("none");
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"BD"};

            function commonFNC(i){
                var rightAnswer = rubrik[i];
                var userAnswer =  SD.inputs["box"+ i].value;
                var sensitive = BD.input[i].sensitive;
                var status = "wrong";

                if(userAnswer && userAnswer.length){
                    if(!sensitive){
                        userAnswer = userAnswer.toLocaleLowerCase("tr-TR");
                        rightAnswer = rightAnswer.toLocaleLowerCase("tr-TR");
                    }

                    if(userAnswer === rightAnswer){
                        status = "right";
                    }

                }else{
                    status = "empty";
                }

                return status;
            }

            for(var i in BD.input){
                var answer = commonFNC(i);
                if(answer === "right"){
                    score.totalRight++;
                    showRightView(i);
                }else if(answer === "wrong"){
                    score.totalWrong++;
                    showWrongView(i);

                }else if(answer === "empty"){
                    score.totalEmpty++;
                }
            }

            return score;
        }

        function wrongActionFNC(){
            SP.screenCloseTimer = setTimeout(function (){
                btnEvents("auto");
                showAllDefaultView();
                controlBtnViewCheck();
            }, 1000);
        }


        SP.fnc.push({control: checkRightAnswer, wrong: wrongActionFNC, right: function(){} });
    }


    this.scoreEvalution = function(score){
        if(score.totalRight && !score.totalWrong && !score.totalEmpty){
            return "right";
        }else if(!score.totalWrong && !score.totalRight){
            return "empty";
        } else{
            return "wrong";
        }
    }

    this.controlHQ = function(SP, SD){
        controlBtnView(SP, "disable");
        var totalScore = {totalRight:0, totalWrong:0, totalEmpty:0};
        var finalStatus;

        SP.fnc.map(function(fnc){
            var currentScore = fnc.control();
            totalScore.totalRight += currentScore.totalRight;
            totalScore.totalWrong += currentScore.totalWrong;
            totalScore.totalEmpty += currentScore.totalEmpty;
            fnc.currentStatus = This.scoreEvalution(currentScore);
            finalStatus = This.scoreEvalution(totalScore);
        });

        if(finalStatus === "right"){
            This.playRightAudio();
            SD.right++;
            SD.empty=0;
            This.sceneComplete();
            This.nextScene();
            SP.fnc.map(function(fnc){
                fnc.right();
            });
        }else{
            This.playWrongAudio();
            SD.wrong++;

            SP.fnc.map(function(fnc){
                fnc.wrong();
            });
        }

        This.scoreCalc();
    }

    this.actType = function(SP, SD, index){
        var init = {};
        SP.elementList.map(function(obj){
            if(obj.id.includes("selectButon")){
                init["initCS"] = This.initCS;
            }else if(obj.id.includes("inputArea")){
                init["initBD"] = This.initBD;
            }
        });

        for(var p in init){
            init[p](SP, SD, index);
        }
    }

    function controlBtnView(SP, status){
        if(SP.controlBtn){
            if(status === "enable"){
                SP.controlBtn.style.opacity = 1;
                SP.controlBtn.style.pointerEvents = "auto";
            }else{
                SP.controlBtn.style.opacity = 0.5;
                SP.controlBtn.style.pointerEvents = "none";
            }
        }
    }


    /////////////////////////////////////////////////////////
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
                        PLX.autoSceneChange_stopQuickly();
                        if(SP[index].controlBtn){
                            controlBtnView(SP[index], "disable");
                            if(!SD[This.sceneIndex].complete){
                                This.sceneComplete();
                                This.scoreCalc();
                            }
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
                SP[index].controlBtn.addEventListener("click", function(){
                    This.controlHQ(SP[index], SD[index]);
                });
            }else if(obj.id.includes("answer")){
                SP[index].answerBtn = obj;
                SP[index].answerBtn.style.cursor = "pointer";
                SP[index].answerBtn.style.pointerEvents = "none";
            }else if(obj.id.includes("goUrl")){
                var url = "";
                if(AC.player){
                    url = AC.player.RUrl;
                }
                /* unique[obj.getAttribute("ccid")].goUrl */

                obj.addEventListener("click", function(){
                    var newwindow = window.open(url, "versiyon", "width=1280,height=720");
                    if (window.focus) {newwindow.focus()}
                    return false;
                });
                obj.style.cursor = "pointer";
            }
        });
    }

    /* ChangeScene */
    this.changeScene = function(index){
        if(this.allScene[index]){
            this.sceneIndex = index;
            this.allScene.forEach(function(Scene){
                Scene.style.display = "none";
            });

            this.allScene[this.sceneIndex].style.display = "block";
            if(player.infoDiv){
                player.infoDiv.innerHTML = (index+1) +" / "+ this.allScene.length;
            }

            this.addSceneInterval();
            SP[index].screenCloseDOM.style.display = "none";
            PLX.autoSceneChange_stopQuickly();


            if(index === 0){
                player.backBtn.style.opacity = 0.5;
                player.backBtn.style.cursor = "default";
                player.backBtn.style.pointerEvents = "none";
            }else{
                player.backBtn.style.opacity = 1;
                player.backBtn.style.cursor = "pointer";
                player.backBtn.style.pointerEvents = "auto";
            }

            if(index === this.allScene.length-1){
                player.nextBtn.style.opacity = 0.5;
                player.nextBtn.style.cursor = "default";
                player.nextBtn.style.pointerEvents = "none";
            }else{
                player.nextBtn.style.opacity = 1;
                player.nextBtn.style.cursor = "pointer";
                player.nextBtn.style.pointerEvents = "auto";
            }
        }
    }

    /* Score Evalution */
    this.scoreEvalution = function(score){
        if (score.totalRight && !score.totalWrong && !score.totalEmpty) {
            return "right";
        } else if (!score.totalWrong && !score.totalRight) {
            return "empty";
        } else {
            return "wrong";
        }
    }

    this.addSceneInterval = function(){
        clearInterval(player.screenDuration);
        if(!SD[This.sceneIndex].complete){
            player.screenDuration = setInterval(This.addSecond, 1000);
        }
    }

    this.addSecond = function(){
        SD[This.sceneIndex].duration++;
    }

    this.sceneComplete = function (){
        clearInterval(player.screenDuration);
        SD[This.sceneIndex].complete = true;
    }

    /* NextScene */
    this.nextScene = function(){
        var start = This.sceneIndex+1;
        var next;
        for(var i=start; i<SD.length; i++){
            if(!SD[i].complete){
                next = i;
                break;
            }
        }

        if(!next){
            for(var x=0; x<SD.length; x++){
                if(!SD[x].complete){
                    PLX.autoSceneChange.ShowFNC();
                    next = x;
                    break;
                }
            }
        }

        if(next !== undefined){
            player.autoNext = next;
            PLX.autoSceneChange.ShowFNC();
        }
    }

    this.addEvents = function(){
        window.addEventListener("resize", function() {
            This.screenRatio();
        }, true);

        This.screenRatio();
    }

    this.addScreenClose = function(Scene, index){
        SP[index].screenCloseDOM = utils.addDOM({className: "screenClose"});
        Scene.appendChild(SP[index].screenCloseDOM);
    }

    this.screenRatio = function(){
        var mainWidth = player.containerDOM.clientWidth;
        var mainHeight = player.containerDOM.clientHeight;

        var ratio = mainWidth / 1280;
        var sonucH = (ratio*720);

        if (sonucH > mainHeight) {
            ratio = (mainHeight / 720);
        }

        var width = parseInt(1280*ratio);
        var height = parseInt(720*ratio);
        var centerX = (mainWidth - width)/2;
        var centerY = (mainHeight - height)/2;

        player.mainDOM.style.scale = ratio;
        player.mainDOM.style.left = centerX+"px";
        player.mainDOM.style.top = centerY+"px";
    }

    this.startPlayer = function(element){
        This.scoreCalc();
        initKACountDown();

        Object.assign(player, element);
        player.backBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex-1);
        });

        player.nextBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex+1);
        });

        This.changeScene(0);
    }

    function Preview_HTML(container){
        player.backBtn = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_BackBtn", innerHTML:"&#9664;"});
        player.nextBtn = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_NextBtn", innerHTML:"&#9654;"});
        player.infoDiv = utils.addDOM({id:"Nav_Preview_NavInfo", textContent: "0 / 0"});
        container.appendChild(player.backBtn);
        container.appendChild(player.nextBtn);
        container.appendChild(player.infoDiv);

        player.backBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex-1);
        });

        player.nextBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex+1);
        });

        This.changeScene(0);
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
        player.infoDiv = document.querySelector("#Nav_Text");
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
            This.changeScene(This.sceneIndex-1);
        });

        KT.Nav_NextBtn .addEventListener("click", function (){
            This.changeScene(This.sceneIndex+1);
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
        this.changeScene(0);
        return player.containerDOM;
    }

    function addKT_HTML(container){
        var html = `<div id="Player_Container"></div>
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

    function countDown(obj, animationFinish, duration){
        obj.append(`<svg><path id="CountdownCircle"/></svg>`);
        var This = this;
        this.Svg = $("#CountdownCircle")[0];
        this.Const =  {x:15, y:15, radius: 15, start:1, end:1};
        this.Time=0;
        this.startAnimationFNC = function(){
            if(this.Gsap){
                this.Gsap.kill();
            }
            this.Current = Object.assign({}, this.Const);
            this.Gsap = gsap.to(this.Current, {start:1, end:360, duration:duration, ease:'none', onUpdate:this.onTimerFNC, onComplete:this.finishFNC});
        };

        this.onTimerFNC = function(){
            This.Time++;
            if(This.Time === 4){
                This.updateFNC();
                This.Time=0;
            }
        };

        this.animationStop = function(){
            if(this.Gsap){
                this.Gsap.kill();
            }
        }

        this.polarToCartesianFNC = function(centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        };

        this.describeArcFNC = function (x, y, radius, startAngle, endAngle) {
            var start = this.polarToCartesianFNC(x, y, radius, endAngle);
            var end = this.polarToCartesianFNC(x, y, radius, startAngle);
            var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
            return [
                "M", start.x, start.y,
                "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
                "L", x, y,
                "L", start.x, start.y
            ].join(" ");
        };

        this.updateFNC =  function () {
            this.Svg.setAttribute("d", this.describeArcFNC(this.Const.x, this.Const.y, this.Const.radius, this.Current.start, this.Current.end));
        };

        this.finishFNC = function(){
            This.animationStop();
            animationFinish();
        };
    }

    PLX.autoSceneChange_PieResize = function(){
        /*
        if(PLX.autoSceneChange.Pie){
            PLX.autoSceneChange.Pie.css("transform", `scale(${ratioWidth}, ${ratioWidth})`);
        }
        */
    }

    PLX.autoSceneChange_stopQuickly = function(){
        if(PLX.autoSceneChange.Pie){
            PLX.autoSceneChange.HideFNC();
        }
    }

    PLX.autoSceneChange = {
        AddHtmlFNC: function(animationFinish, text, duration){
            var html =
                `<div id="autoSceneChange_Main">
				<div class="autoSceneChange_Container">
					<div id="autoSceneChange_Pie"></div>
				</div>
				<div id="autoSceneChange_Txt" class="STxt">${text}</div>
				<div id="autoSceneChange_WindowClose">
					<img class="autoMessageCloseImg" src="https://cdn.okulistik.com/mobileplayer/contentplayer/assets/image/bup/close.png" alt=""/>
				</div>
			</div>`;

            PLX.SceneNavigationMain.append(html);
            STxt = $(".STxt");

            PLX.autoSceneChange.Main = $("#autoSceneChange_Main");
            PLX.autoSceneChange.Pie = $("#autoSceneChange_Pie");
            PLX.autoSceneChange.Txt = $("#autoSceneChange_Txt");
            PLX.autoSceneChange.WindowClose = $("#autoSceneChange_WindowClose");

            PLX.autoSceneChange.CountDown = new countDown(PLX.autoSceneChange.Pie, animationFinish, duration);
            PLX.autoSceneChange_PieResize();
        },

        ShowFNC: function(){
            PLX.autoSceneChange.Main.css({right:"-20%", display:"flex"});
            gsap.to(PLX.autoSceneChange.Main, 0.3, {right:"0.5%"});
            PLX.autoSceneChange.CountDown.startAnimationFNC();
        },

        HideFNC: function(){
            PLX.autoSceneChange.CountDown.animationStop();
            PLX.autoSceneChange.Main.hide();
        }
    }

    function initKACountDown(){
        PLX.SceneNavigationMain = $("#PlayerMain");
        PLX.autoSceneChange.AddHtmlFNC(function(){ This.changeScene(player.autoNext) }, "sonraki soru", 4);
        PLX.autoSceneChange.WindowClose.on("click", function(e){
            PLX.autoSceneChange.HideFNC();
            e.stopPropagation();
        });

        PLX.autoSceneChange.Main.on("click", function(){
            PLX.autoSceneChange.HideFNC();
            This.changeScene(This.sceneIndex+1);
        });
    }


}


