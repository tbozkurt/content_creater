function PLAYER(){
    this.allScene = [];
    this.sceneIndex = 0;
    var unique = {};
    var PLX = {
        soundConfirm: false,
        sendDuration: false,
        HDE_autoSoundPlay:true,
        HDE_access:0,
        maxWrongMove:5,
        isEKT: false,
        isBSD: false
    };
    var This = this;
    var KT={};
    var SP = [];
    var SD = [];
    var stateLog = {};
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
        dataSendTimer: null,
        screenDuration: null,
        backBtn: null,
        nextBtn: null,
        warningList: [
            "Tekrar dene, 2. hakkında başarabilirsin.",
            "Yanıtını bir daha kontrol et.",
            "Biraz daha dikkat et, doğruya yaklaştın.",
            "Az kaldı, pes etme.",
            "Dikkatini topla bir daha dene."
        ]
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
            opacity:e.opacity,
            name: e.Layer.name,
            id: e.Layer.elementID,
            unique: e.Layer.unique
        }
    }

    this.getRadius = function(data){
        if(data){
            if(typeof data === "number"){
                return data+"px";
            }else{
                return `${data[0]}px ${data[1]}px ${data[2]}px ${data[3]}px`;
            }
        }
    }

    this.convertObject = function(container){
        var This = this;
        var Kids = [];
        container.map(function(e){
            if(e.Layer && e.Layer.name !== "origin"){
                var obj;
                if(e.Layer.type === "objectRect"){

                    var borderOffset=0;
                    if(e.strokeWidth){
                        borderOffset = Math.floor(e.strokeWidth/2)*-1;
                    }

                    obj = Object.assign({
                        backgroundColor: e.fill,
                        //border: `${e.strokeWidth}px solid ${e.stroke}`,
                        borderRadius: This.getRadius(e.cornerRadius),
                        //boxSizing:"border-box"
                        outline: `${e.strokeWidth}px solid ${e.stroke}`,
                        outlineOffset: `${borderOffset}px`,
                        params: e.Layer.params
                    }, This.getStandart(e));
                }else if(e.Layer.type === "objectCircle"){
                    obj = Object.assign({
                        backgroundColor: e.fill,
                        borderRadius: e.borderRadius+"px",
                        params: e.Layer.params
                    }, This.getStandart(e));
                }else if (e.Layer.type === "objectImg") {
                    obj = Object.assign({
                        backgroundImage: `url(${player.root+e.src})`,
                        backgroundSize: `${e.width}px ${e.height}px`,
                        borderRadius: This.getRadius(e.cornerRadius),
                        params: e.Layer.params
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
                        params: e.Layer.params
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

    this.addMovieClip = function(kids, container, index, addData){
        var This = this;

        function addKidsData(e, type){
            var param = {};
            if(addData){
                if(e.params){
                    param = e.params;
                }

                addData.kids.push({
                    id: e.id,
                    main: type,
                    data: param,
                    className: e.className,
                });
            }
        }

        kids.map(function(e){
            if(e.id){
                e.id = "s"+index+"-"+e.id;
            }

            if(e.type === "objectRect"){
                var rect = utils.addDOM({className:e.className, id:e.id, layername: e.name, ccid:e.unique});
                Object.assign(rect.style, e);
                container.appendChild(rect);
                addKidsData(e, rect);
            }if(e.type === "objectCircle"){
                var circle = utils.addDOM({className:e.className, id:e.id, layername: e.name, ccid:e.unique});
                Object.assign(circle.style, e);
                container.appendChild(circle);
                addKidsData(e, circle);
            }else if(e.type === "objectImg"){
                var img = utils.addDOM({className:e.className, id:e.id, layername: e.name, ccid:e.unique});
                Object.assign(img.style, e);
                container.appendChild(img);
                addKidsData(e, img);
            }else if(e.type === "objectText"){
                var text = utils.addDOM({className:e.className, id:e.id, layername: e.name, innerText: e.text, ccid:e.unique});
                Object.assign(text.style, e);
                container.appendChild(text);
                addKidsData(e, text);
            }else if(e.type === "objectMovieClip"){
                var mc = utils.addDOM({className:e.className, id:e.id, layername: e.name, ccid:e.unique});
                container.appendChild(mc);
                var tempObj = {
                    id: e.id,
                    main: mc,
                    data: e.params,
                    className: e.className,
                    kids: []
                }
                SP[index].elementList.push(tempObj);
                This.addMovieClip(e.Kids, mc, index, tempObj);
                Object.assign(mc.style, e);
            }
        });
    }

    this.startBuild = function(BUILD){
        console.log("################ PLAYER ################");
        console.log(BUILD);
        AC=BUILD.activeContent;
        player.root = AC.Url;
        PLX.sendDurationFNC = BUILD.sendDuration;
        PLX.scoreUpdate = BUILD.scoreUpdate;
        PLX.HDX = BUILD.HDX;
        PLX.endScreen = BUILD.endScreen;
        PLX.mode = BUILD.mode;
        jsonV2 = BUILD.json;
        if(BUILD.mode === "optic"){
            KT.Mode = true;
            BUILD.container = addKT_HTML(BUILD.container);
        }

        player.containerDOM = BUILD.container;
        player.mainDOM = utils.addDOM({id: "PlayerMain"});
        BUILD.container.appendChild(player.mainDOM);
        PLX.isEKT = jsonV2.fileName.includes("EKT");
        PLX.isBSD = jsonV2.fileName.includes("BSD");

        var sceneCSS = [];
        jsonV2.slides.map(function(slide, index){
            var convertObjectsCSS = This.convertObject(slide.all);
            sceneCSS.push(convertObjectsCSS);
            SD[index] = {
                name: slide.name,
                id: index,
                type: "e",
                duration:0,
                wrong:0,
                wrongCount:0,
                right:0,
                empty:0,
                totalRight:0,
                inputs:{},
                complete: false,
                attempt: -1,
                historyRight:[],
                success: 0,
                answerShow: false,
                rubrik:{
                    boxes:{},
                    groups:[],
                    rubrikAI: {
                        instructions: {type: "string", instructions: ""},
                        question: {type: "string", question: ""},
                        alias: {}
                    }
                }
            }

            SP[index] = {
                name: slide.name,
                id: index,
                fnc:[],
                popupWindow: {},
                popEx: [],
                video:[],
                screenCloseDOM:null,
                directive:{},
                soundPlayer:[],
                feedBack:[],
                soundRecord:{},
                history:[],
                pageChangeDuration:4,
                consDuration: null
            }

            if(slide.rubrik){
                SD[index].rubrik = slide.rubrik;
            }
        });

        HDE_virtualControlBtn();

        sceneCSS.map(function(allObject, i){
            var sceneDiv = document.createElement('div');
            sceneDiv.id = "sceneMain"+i;
            Object.assign(sceneDiv.style, {
                left: 0,
                top: 0,
                width: "1280px",
                height: "720px",
                position: "absolute"
            });
            console.log("");
            console.log("<<----- Start:", i ,"----->>");

            SP[i].elementList=[];
            SP[i].sceneDiv = sceneDiv;
            var get = {
                kids: []
            }
            This.addMovieClip(allObject, sceneDiv, i, get);
            SP[i].elementMainScene = {id: sceneDiv.id, main: sceneDiv, data:{}, kids: get.kids};

            player.mainDOM.appendChild(sceneDiv);
            This.searchTool(sceneDiv, i, SP[i]);
            This.addScreenClose(sceneDiv, i);
            This.actType(SP[i], SD[i], i);
            This.allScene.push(sceneDiv);

            console.log("<<----- Finish:", i ,"----->>");
            console.log("");
        });

        addStartScreen(BUILD.mode);
        this.addEvents();
        addWarning();
        addCheckIcon();
        addReadOnlyDOM();
        addOpenEndedDOM();
        infoSystemFNC();
        scenePropSearch();

        if(BUILD.mode === "optic"){
            This.build_KT(jsonV2);
        }else if(BUILD.mode === "preview"){
            Preview_HTML(BUILD.container, BUILD.startScene);
            initKACountDown();
        }

        this.scoreCalc(false);
        PLX.Mode = BUILD.mode;
        HDE_Status(BUILD);
        sendDuration();
    }

    this.scoreCalc = function(saveData){
        var complete = true;
        var score = {
            cmd: "update",
            right:0,
            wrong:0,
            empty:0,
            access:0,
            success:0,
            duration:0
        };

        function accessControl(scene){
            if(scene.right || scene.wrong || scene.complete){
                return 1;
            }

            return 0;
        }

        var accessTotalRight=0;
        var accessTotalScene=0;
        var accessRight=0;

        SD.map(function(scene){
            if(scene.totalRight){
                if(scene.historyRight){
                    if(scene.historyRight.length){
                        accessTotalRight += scene.totalRight;
                        accessRight += scene.right;
                        score.wrong += scene.historyRight.length;
                    }
                }
            }

            if(scene.type === "e"){
                if(scene.complete){
                    score.right++;
                }else{
                    score.empty++;
                }
            }

            if(!scene.complete){
                complete = false;
            }

            accessTotalScene += accessControl(scene);
            score.duration += scene.duration;
        });

        var calc = accessRight / accessTotalRight;
        if(calc){
            score.success = calc * 100;
        }

        /* Calc Access */
        if(accessTotalScene){
            score.access = (accessTotalScene / SD.length) * 100;
        }else{
            score.access = accessTotalScene;
        }

        if(complete){
            score.cmd = "finish";
        }

        var state = JSON.stringify(setState());
        if(PLX.scoreUpdate){
            PLX.scoreUpdate({
                Access: parseInt(score.access),
                Success: parseInt(score.success),
                Duration: score.duration,
                Right: score.right,
                Wrong: score.wrong,
                Empty: score.empty,
                Attempt: score.wrong,
                State: state,
                TotalRight: score.empty,
                CurrentSceneType: "E",
                Complete: complete,
                Cmd: score.cmd
            }, saveData);
        }

        if(PLX.scoreTable){
            var html =
                `<div>
                    <div class="scoreTableRow"><div class="scoreTableColumn1">access:</div> <div class="scoreTableColumn2">${parseInt(score.access)}</div></div>
                    <div class="scoreTableRow"><div class="scoreTableColumn1">success:</div> <div class="scoreTableColumn2">${parseInt(score.success)}</div></div>
                    <div class="scoreTableRow"><div class="scoreTableColumn1">complete:</div> <div class="scoreTableColumn2">${score.right}</div></div>
                    <div class="scoreTableRow"><div class="scoreTableColumn1">attempt:</div> <div class="scoreTableColumn2">${score.wrong}</div></div>
                </div>`;

            PLX.scoreTable.innerHTML = html;
        }
    }

    function HDE_ScoreCalc(complete){
        var accessCount=0;
        var rightCount=0;
        var emptyCount=0;
        var totalAccessScene = SP.length;
        var totalSuccessScene = 0;
        var totalDuration = 0;
        var accessPercent = 0;
        var successPercent = 0;


        if(complete){
            SP.map(function(sp){
                if(sp.hdeStatus === 'empty'){
                    emptyCount++;
                }else{
                    accessCount++;
                }

                if(!sp.completeBtn){
                    if(sp.hdeStatus === 'right'){
                        rightCount++;
                    }

                    if(sp.hdeStatus.length){
                        totalSuccessScene++;
                    }
                }
            });

            accessPercent = parseInt((accessCount/totalAccessScene)*100);
            successPercent = parseInt((rightCount/totalSuccessScene)*100);
        }

        SD.map(function(sd){
            totalDuration += sd.duration;
        });

        var state = setState();
        if(complete){
            state.status = 'finish';
        }else{
            state.status = 'update';
        }

        if (PLX.HDX) {
            PLX.HDX({
                Access: accessPercent,
                Success: successPercent,
                Duration: totalDuration,
                Right: accessCount,
                Wrong: PLX.HDE_access,
                Empty: emptyCount,
                Attempt: 0,
                State: JSON.stringify(state),
                TotalRight: 0,
                CurrentSceneType: "E",
                Complete: complete,
                Cmd: state.status
            });
        }
    }

    function setState(){
        var state = {version: AC.VersionFile, status:"update", questions:{}};
        if(AC.user){state.uid = AC.user.uid};

        SD.map(function(slide){
            state.questions[slide.name] = [slide.inputs];
        });

        return state;
    }

    This.convertRubrik = function(slideID){
        var btnID = jsonV2.slides[slideID].rightAnswer;
        if(btnID !== null && btnID !== undefined){
            jsonV2.slides[slideID].answer = {};
            jsonV2.slides[slideID].answer[btnID] = true;
        }
    }


    /* HDE Zone */
    function inputsChange(SD, id, param, data){
        if(!PLX.showReadOnly){
            if(id !== undefined && id !== null){
                SD.inputs["box"+ id][param] = data;
            }

            if(jsonV2.fileName.includes("HDE")){
                clearInterval(player.dataSendTimer);
                player.dataSendTimer = setTimeout(function(){
                    HDE_ScoreCalc(false);
                }, 1000);
            }
        }
    }

    function HDE_virtualControlBtn(){
        if(jsonV2.fileName.includes("HDE")){
            player.virtualControlBtn = utils.addDOM({id: "virtualControlBtn"});
            player.mainDOM.appendChild(player.virtualControlBtn);

            SP.map(function(scene){
                scene.controlBtn = player.virtualControlBtn;
            });
        }
    }

    // HDE file, version control and history load
    function HDE_Status(BUILD){
        console.log('<<HDE STATUS>>');
        if(jsonV2.fileName.includes("HDE")){
            if(BUILD){
                if(BUILD.accessData){
                    var contentJsonVersion = AC.VersionFile;
                    var dataJsonVersion = BUILD.accessData.state.version;
                    console.log("contentJsonVersion", contentJsonVersion);
                    console.log("dataJsonVersion", dataJsonVersion);
                    PLX.HDE_access = parseInt(BUILD.accessData.stats.access);

                    if(contentJsonVersion === dataJsonVersion){
                        var status = BUILD.accessData.state.status;
                        var allHistory = BUILD.accessData.state.questions;
                        console.log('allHistory:', allHistory);
                        if(status === 'update'){
                            for(var sceneName in allHistory){
                                SP.map(function(scene, index) {
                                    if(sceneName === scene.name){
                                        scene.history = allHistory[sceneName];
                                        SD[index].inputs = allHistory[sceneName][0];
                                        console.log('sahne', sceneName, scene.name, index, 'eklendi');
                                    }
                                });
                            }
                            addHistoryControl();
                        }
                    }
                }
            }

            addHDEStatus();
        }
    }

    // HDE history execute
    function addHistoryControl(){
        for(var scene in SP){
            SP[scene].fnc.map(function(fnc, index){
                try{
                    if(fnc.history){
                        fnc.history();
                    }
                }catch(err){
                    console.log("<< History Load Fail:", index);
                    console.log("Err", err, ">>");
                }
            });
        }
    }

    // HDE show and hide user answer
    this.showAndHideAnswerFNC = function(view){
        var sp = SP[This.sceneIndex];
        var sd = SD[This.sceneIndex];

        if(view === 'rightAnswer'){
            sp.history[0] = JSON.parse(JSON.stringify(sd.inputs));
            sp.fnc.map(function(fnc){
                fnc.answer();
            });
        }else{
            if(sp.history.length){
                sd.inputs = JSON.parse(JSON.stringify(sp.history[0]));
                sp.fnc.map(function(fnc){
                    try{
                        if(fnc.reset){
                            fnc.reset();
                        }

                        if(fnc.history){
                            fnc.history();
                        }

                    }catch(err){}
                });
            }
        }
    }

    // HDE Button Events
    function HDE_addEvent(){
        if(player.userAnswer){
            player.userAnswer.addEventListener("click", function(){
                this.style.display = 'none';
                player.rightAnswer.style.display = 'block';
                This.showAndHideAnswerFNC('userAnswer');
            });

            player.userAnswer.style.display = 'none';
        }

        if(player.rightAnswer){
            player.rightAnswer.addEventListener("click", function(){
                this.style.display = 'none';
                player.userAnswer.style.display = 'block';
                This.showAndHideAnswerFNC('rightAnswer');
            });

            player.rightAnswer.style.display = 'none';
        }

        if(player.videoSolution){
            player.videoSolution.addEventListener("click", function(){
                /* video popup sb btnlar popup ustune cikmasin */
                var sp = SP[This.sceneIndex];
                var zindex;
                sp.fnc.map(function(fnc){
                    if(fnc.zindex){
                        zindex = fnc.zindex();
                    }
                });

                if(zindex){
                    sp.popEx[0].window.style.zIndex = zindex;
                }

                popupWindowStatus(0);
            });

            player.videoSolution.style.display = 'none';
        }
    }

    function HDE_endExam(){
        PLX.showReadOnly = true;
        HDE_ControlFNC();
        if(player.watcher_main){
            player.watcher_main.style.visibility = "hidden";
        }
        player.readOnlyDOM.style.visibility = "visible";
        clearInterval(player.dataSendTimer);
        HDE_ScoreCalc(true);
        HDE_StatusFNC();

        SP.map(function(sp){
            sp.fnc.map(function(fnc){
                fnc.close();
            });
        });

        if(SP[This.sceneIndex].allControl){
            SP[This.sceneIndex].allControl.style.display = 'none';
        }
    }

    // HDE answer control
    function HDE_ControlFNC(){
        console.log("HDEControl FNC");

        SP.map(function(sp){
            var totalScore = {totalRight:0, totalWrong:0, totalEmpty:0};

            sp.fnc.map(function(fnc){
                var currentScore = fnc.control();
                totalScore.totalRight += currentScore.totalRight;
                totalScore.totalWrong += currentScore.totalWrong;
                totalScore.totalEmpty += currentScore.totalEmpty;
                fnc.currentStatus = scoreEvalution(currentScore);
            });
            sp.hdeStatus = scoreEvalution(totalScore);
        });

        watcherHDE();
    }

    function watcherHDE(){
        console.log('watcherHDE FNC');

        if(PLX.Mode === "normal"){
            var emptyFound = false;
            SP.map(function(sp){
                if(sp.hdeStatus === "empty"){
                    emptyFound = true;
                    player.watcherListAllBox[sp.id].style.display = "block";
                }else{
                    player.watcherListAllBox[sp.id].style.display = "none";
                }
            });

            /* Burada Kaldın */
            if(emptyFound){
                player.watcher_head.innerHTML = 'Tamamlanmayan ekranlar var!';
                player.watcher_footer.style.display = 'none';
            }else{
                player.watcher_head.innerHTML = 'Sonlandırmak istediğinizden emin misiniz!';
                player.watcher_footer.style.display = 'none';
            }

            player.watcher_main.style.visibility = "visible";
        }
    }

    function HDE_StatusFNC(){
        if(jsonV2.fileName.includes("HDE") && PLX.showReadOnly){
            var sp = SP[This.sceneIndex];

            var hdeStatus = sp.hdeStatus;
            var completeBtn = sp.completeBtn;
            var iconDOM;
            if(completeBtn){
                iconDOM = null;
            }else{
                iconDOM = player.statusIcon[hdeStatus];
            }

            if(iconDOM){
                player.statusIconMain.style.display = "block";
                for(var name in player.statusIcon){
                    player.statusIcon[name].style.visibility = "hidden";
                }

                iconDOM.style.visibility = "visible";
            }else{
                player.statusIconMain.style.display = "none";
            }

            var userAnswerView;
            var rightAnswerView;
            var videoSolutionView = 'block';

            if(hdeStatus === 'right' || completeBtn){
                userAnswerView = 'none';
                rightAnswerView = 'none';
            }else{
                userAnswerView = 'none';
                rightAnswerView = 'block';
            }

            if(sp.popEx.length){
                if(sp.popEx[0].clicked){
                    popupWindowStatus(0);
                }
            }else{
                videoSolutionView = 'none';
            }

            if(player.userAnswer){
                player.userAnswer.style.display = userAnswerView;
            }

            if(player.rightAnswer){
                player.rightAnswer.style.display = rightAnswerView;
            }

            if(player.videoSolution){
                player.videoSolution.style.display = videoSolutionView;
            }

            This.showAndHideAnswerFNC('userAnswer');
        }
    }

    /* Score Evalution */
    function scoreEvalution(score){
        if(score.totalRight && !score.totalWrong && !score.totalEmpty){
            return "right";
        }else if(!score.totalWrong && !score.totalRight){
            return "empty";
        }else{
            return "wrong";
        }
    }

    this.answerHQ = function (SP, SD){
        console.log("answerHQ");
        SP.fnc.map(function(fnc){
            fnc.answer();
        });

        controlBtnView(SP, "disable");
        answerBtnView(SP, "disable");

        This.sceneComplete();
        This.scoreCalc(true);
        This.nextScene();
    }

    this.controlHQ = function(SP, SD){
        controlBtnView(SP, "disable");
        var totalScore = {totalRight:0, totalWrong:0, totalEmpty:0};
        var finalStatus;

        if(SP.directive.sound){
            SP.directive.sound.stop();
        }

        SP.fnc.map(function(fnc){
            var currentScore = fnc.control();
            totalScore.totalRight += currentScore.totalRight;
            totalScore.totalWrong += currentScore.totalWrong;
            totalScore.totalEmpty += currentScore.totalEmpty;
            fnc.currentStatus = scoreEvalution(currentScore);
            fnc.score = currentScore;
            finalStatus = scoreEvalution(totalScore);
        });

        SD.right = totalScore.totalRight;
        SD.wrong = totalScore.totalWrong;
        SD.empty = totalScore.totalEmpty;
        SD.historyRight.push({
            right: totalScore.totalRight,
            wrong: totalScore.totalWrong,
            success: 0
        });

        if(finalStatus === "right"){
            This.playRightAudio();
            This.sceneComplete();
            This.nextScene();
            SP.fnc.map(function(fnc){
                fnc.right(finalStatus);
            });

            controlBtnView(SP, "disable");
            answerBtnView(SP, "disable");
            checkViewFNC(SD);
            showFeedBack("right", "auto", 0);
        }else{
            SD.wrongCount++;
            This.playWrongAudio();
            showWarning(SP, SD);

            SP.fnc.map(function(fnc){
                if(fnc.currentStatus === "right"){
                    fnc.right(fnc.currentStatus);
                }else{
                    fnc.wrong(finalStatus);
                }
            });

            if(SD.wrongCount >= PLX.maxWrongMove){
                answerBtnView(SP, "enable");
                showFeedBack("answer", "auto", 0);
            }

            showFeedBack("wrong", "auto", SD.historyRight.length);
        }

        console.log("History:", SD.historyRight);

        This.scoreCalc(true);
        showToolTip(SP, SD);
        specialFNC(SP, SD);
        console.log(SD);
    }

    /*
    this.rubrikEvalutorControlHQ = function(SP, SD){
        console.log("--- rubrikEvalutorControlHQ ---");
        var finalBox={};
        for(var boxName in SD.inputs){
            if(SD.inputs[boxName].base64){
                SP.fnc.map(function(fnc){
                    fnc.control();
                });
            }

            finalBox[boxName] = String(SD.inputs[boxName].value);
        }

        console.log(SD.rubrik);
        var result = EvaluatorEngine.evaluate(SD.rubrik, finalBox);
        showFeedBack(result.result, "auto", SD.historyRight.length);
        console.log("finalBox:", finalBox);
        console.log("resultEvalutor:", result.result);
        if(result.result === "T1"){
            This.sceneComplete();
            This.nextScene();
            SP.fnc.map(function(fnc){
                fnc.close(true);
            });

            controlBtnView(SP, "disable");
            answerBtnView(SP, "disable");
            checkViewFNC(SD);
        }

        var currentHistory = JSON.parse(JSON.stringify(SD.inputs));
        var xx = ({
            rubrik: result,
            duration: SD.duration,
            inputs: currentHistory
        });

        console.log(xx);
        console.log(SD);
    }
    */

    this.rubrikEvalutorControlHQ = function (SP, SD) {
        console.log("--- rubrikEvalutorControlHQ ---");
        var finalBox = {};

        function getRubrikTeacherAnswer(boxes) {
            var keys = Object.keys(boxes);
            var alias = SD.rubrikAI && SD.rubrikAI.alias ? SD.rubrikAI.alias : {};

            function formatAnswer(key) {
                var aliasValue = typeof alias[key] === "string" ? alias[key].trim() : "";
                var answerValue = String(boxes[key]);
                return aliasValue ? aliasValue + "=" + answerValue : answerValue;
            }

            if (keys.length === 1) {
                return formatAnswer(keys[0]);
            }

            return keys.map(function (key) {
                return formatAnswer(key);
            }).join("\n");
        }

        console.log(SD);

        function createRubrikTeacherJson() {
            var rubriks = [];
            var rubrikAI = SD.rubrik.rubrikAI || {
                instructions: {type: "string", instructions: ""},
                question: {type: "string", question: ""},
                alias: {}
            };

            if (SD.rubrik && SD.rubrik.groups) {
                SD.rubrik.groups.map(function (group) {
                    if (group.boxes && group.boxes.length) {
                        group.boxes.map(function (box) {
                            if (box.operator === "review") {
                                rubriks.push({
                                    value: group.name,
                                    "btd-teacher-condition": box.value,
                                    weight: group.score
                                });
                            }
                        });
                    }
                });
            }

            return {
                id: typeof SD.id === "number" ? SD.id + 1 : 1,
                type: "BTD-TEACHER",
                instructions: rubrikAI.instructions,
                question: rubrikAI.question,
                rubriks: rubriks,
                answer: {
                    type: "string",
                    answer: getRubrikTeacherAnswer(finalBox)
                }
            };
        }

        for (var boxName in SD.inputs) {
            if (SD.inputs[boxName].base64) {
                SP.fnc.map(function (fnc) {
                    fnc.control();
                });
            }

            finalBox[boxName] = String(SD.inputs[boxName].value);
        }

        console.log("SD.rubrik:", SD.rubrik);
        console.log("finalBox:", finalBox);

        if (SD.rubrik.rubrikAI.question && SD.rubrik.rubrikAI.question.question.length > 0) {
            console.log(SD.rubrik.rubrikAI);
            var formatData = createRubrikTeacherJson();
            console.log("formatData", formatData);
            rubrikLoaderAnimation("show");
            sendDataAI(formatData);
        } else {
            var result = EvaluatorEngine.evaluate(SD.rubrik, finalBox);
            showFeedBack(result.result, "auto", SD.historyRight.length);
            console.log("resultEvalutor:", result.result);
        }

        console.log(SP);
        /*
        if(result.result === "T1"){
            This.sceneComplete();
            This.nextScene();
            SP.fnc.map(function(fnc){
                fnc.close(true);
            });

            controlBtnView(SP, "disable");
            answerBtnView(SP, "disable");
            checkViewFNC(SD);
        }

        var currentHistory = JSON.parse(JSON.stringify(SD.inputs));
        var xx = ({
            rubrik: result,
            duration: SD.duration,
            inputs: currentHistory
        });

        console.log(xx);
        console.log(SD);
        */

        /*
        SP.feedBack.map(function (feedback) {
            if (feedback.status === "AI") {
                feedback.main.style.visibility = "visible";
                console.log(feedback.main.querySelector(".feedbackAI"));
                feedback.main.querySelector(".feedbackAI").innerHTML = "Sample";
            }
        });
        */
    }

    function feedbackAI(response) {
        console.log('Başarılı Yanıt:', response);
        if (response.success) {
            var result = response.data.evaluation.rubric_code;
            var feedbackStr = response.data.feedback;
            SP[This.sceneIndex].feedBack.map(function (feedback) {
                if (feedback.status === "AI") {
                    feedback.main.style.visibility = "visible";
                    feedback.main.querySelector(".feedbackAI").innerHTML = feedbackStr;
                    gsap.to(feedback.main, 0, {transformOrigin: "50% 50%", scale: 0});
                    gsap.to(feedback.main, 0.5, {transformOrigin: "50% 50%", scale: 1});
                    if(result.includes("T1")){
                        This.sceneComplete();
                        This.nextScene();
                        This.playRightAudio();
                    }else{
                        This.playWrongAudio();
                    }
                }
            });
            console.log(result);
        }
    }

    function rubrikLoaderAnimation(view){
        var sp = SP[This.sceneIndex];
        if(view === "show"){
            controlBtnView(sp, "disable");
            sp.screenCloseDOM.style.display = "block";
            sp.screenCloseDOM.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            sp.screenCloseDOM.querySelector(".ai-main").style.visibility="visible";
            sp.screenCloseDOM.querySelector("#ai_circle1").classList.add("addAnimation");
            sp.screenCloseDOM.querySelector("#ai_circle2").classList.add("addAnimation");
            sp.screenCloseDOM.querySelector("#ai_circle3").classList.add("addAnimation");
        }else{
            controlBtnView(sp, "enable");
            sp.screenCloseDOM.style.display = "none";
            sp.screenCloseDOM.style.backgroundColor = "rgba(0, 0, 0, 0)";
            sp.screenCloseDOM.querySelector(".ai-main").style.visibility="hidden";
            sp.screenCloseDOM.querySelector("#ai_circle1").classList.remove("addAnimation");
            sp.screenCloseDOM.querySelector("#ai_circle2").classList.remove("addAnimation");
            sp.screenCloseDOM.querySelector("#ai_circle3").classList.remove("addAnimation");
        }
    }

    function getCookie(jwt){
        var cookie = document.cookie.split('; ').find(function(row){
            return row.indexOf(jwt + '=') === 0;
        });

        return cookie ? decodeURIComponent(cookie.substring(jwt.length + 1)) : '';
    }



    function sendDataAI(formatData) {

/*
    userJWT = "eyJhbGciOiJSUzI1NiIsImp0aSI6IjdjYWRkNzY1MTA0ZTYzNzdmYjg1ZmZiMDhmMjkxOWI1IiwidHlwIjoiSldUIn0.eyJpYXQiOjE3ODUzOTkxOTAsImZ1bGxOYW1lIjoiQWxpIMOWbWVyIFnEsWxhbmPEsSIsInVUeXBlIjoiU1RVREVOVCIsInRhcmdldCI6Ii9zdHUvaGlnaHNjaG9vbC9pbmRleC5waHAiLCJleHAiOjE3ODU0ODU1OTAsImRhdGEiOnsicmVsYXRlZFVJRCI6IjEyMjkxMzUzIiwic3RSZWFsU3RhdHVzIjoiMyIsImdyYWRlIjo5LCJzdFN0YXR1cyI6IjMifSwianRpIjoiN2NhZGQ3NjUxMDRlNjM3N2ZiODVmZmIwOGYyOTE5YjUiLCJuYmYiOjE3ODUzOTkxOTAsIm1haWwiOiJkZmdkZmdkZkBnc2RzZ2YuY29tIiwibmFtZSI6IkFsaSDDlm1lciIsInN1YiI6IjEyMjkxMzUzIiwiYXVkIjoiYW5hc2F5ZmFfY29kZSIsImxhc3RuYW1lIjoiWcSxbGFuY8SxIiwic2NvcGVzIjpbImF1dGguYmFzaWMiLCJtYXJrZXQuYmFzaWMiLCJhdXRoLnN0dWRlbnQiLCJhdXRoLnN0dWRlbnRBY3RpdmUiXX0.B9IZfym4btb4x_qjDSS7jz8ainmCb22Pfoe_gQlXLZ2QStMngIJ82kpU-nLlwfS0NTt1modAyug7WpiCFHpRZq-ioDxt5v-yF7oK-FcZkt4Dtk2gyhatmZ3DXyQ-9ol-DyAmsYb3fdY66mqqES6Fv4MbCqBNtKoE1ADXjJsmdjrBl58Q0jLba71lNa1fPoEmNSf_nRqNefxD8vTOD48oyBjj0sL8CWFc400nV0lvnzcQAf16wCeCLimbZUPDa1TODbE-B6TeJ-D4IVMpwlxrbgkBpaSqvxPhWUADcbXJC_PWFupDSF54_hnB6ZlkSXCNgt_DEu29pORviKbmhZ_jVw";
*/

        var jwt = getCookie("okulistik-jwt");
        console.log(jwt);

        $.ajax({
            url: "https://oktest.okulistik.com/api/evaluation/ai-evaluate",
            headers: {
                "Authorization": jwt,
                "Accept-Language": 'tr-TR'
            },
            dataType: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8', // Raw verinin türü (JSON)
            processData: false,
            data: JSON.stringify(formatData),
            success: function (response) {
                feedbackAI(response);
                rubrikLoaderAnimation("hide");
            },
            error: function (xhr, status, error) {
                console.error('Hata Oluştu:', status, error);
                console.log('Hata Detayı:', xhr.responseText);
                rubrikLoaderAnimation("hide");
            }
        });
    }

    function specialStartFNC(SP, SD){
        if(PLX.isEKT) {
            if(SP.popEx.length){
                SP.popEx[0].btn.addEventListener("click", function(){
                    if(!SD.complete){
                        SD.answerShow=true;
                        SP.fnc.map(function(fnc){
                            fnc.reset();
                            fnc.close(true);
                            clearInterval(fnc.timer);
                        });

                        This.sceneComplete();
                        This.scoreCalc(false);
                        controlBtnView(SP, "disabled");
                    }
                });

                SP.popEx[0].btn.style.pointerEvents = "none";
                SP.popEx[0].btn.style.opacity = 0.5;
            }
        }else if(PLX.isBSD) {
            if(SP.popEx.length){
                SP.popEx[0].btn.style.pointerEvents = "none";
                SP.popEx[0].btn.style.opacity = 0.5;
            }
        }
    }

    function specialFNC(SP, SD){
        if(PLX.isEKT){
            if(SD.wrongCount >= 3){
                SD.answerShow=true;
                This.sceneComplete();
                This.scoreCalc(false);
                controlBtnView(SP, "disabled");
                SP.fnc.map(function(fnc){
                    clearInterval( fnc.timer );
                });

                if(SP.popEx.length){
                    SP.popEx[0].clicked = true;
                    SP.popEx[0].window.style.visibility = "visible";
                }
            }else if(SP.popEx.length){
                SP.popEx[0].btn.style.opacity = 1;
                SP.popEx[0].btn.style.pointerEvents = "auto";
            }
        }else if(PLX.isBSD){
            if(SD.wrongCount >= 3){
                controlBtnView(SP, "disabled");

                SP.fnc.map(function(fnc){
                    clearInterval( fnc.timer );
                    fnc.close();
                });

                if(SP.popEx.length){
                    SP.popEx[0].clicked = true;
                    SP.popEx[0].window.style.visibility = "visible";
                    SP.popEx[0].btn.style.opacity = 1;
                    SP.popEx[0].btn.style.pointerEvents = "auto";
                }
            }
        }
    }

     function scenePropSearch(){
        jsonV2.slides.map(function(page, index){
            for(var prop in page.scene){
                if(prop === "pageChangeDuration"){
                    SP[index].pageChangeDuration = parseInt(page.scene[prop]);
                }
            }
        });
    }

    this.actType = function(SP, SD, index){
        var init = {};
        SP.initFNC = {};
        console.log(SP);
        console.log(SD);
        This.convertRubrik(index);
        SP.tempAnswer = JSON.parse(JSON.stringify(jsonV2.slides[index].answer));
        SP.elementList.map(function(obj){
            var initFound = false;
            if(obj.id.includes("selectButon")){
                init["initCS"] = {name:"çoktan seçmeli", fnc: This.initCS};
                initFound=true;
            }else if(obj.id.includes("inputArea")){
                init["initBD"] = {name:"boşluk doldurma", fnc: This.initBD};
                initFound=true;
            }else if(obj.id.includes("matchDrag")){
                init["initMATCH"] = {name:"eşleştirme", fnc: This.initMATCH};
                initFound=true;
            }else if(obj.id.includes("boxDrop")){
                init["initSB"] = {name:"sürükle bırak", fnc: This.initSB};
                initFound=true;
            }else if(obj.id.includes("colorBox")){
                init["initPAINT"] = {name:"boyama", fnc: This.initPAINT};
                initFound=true;
            }else if(obj.id.includes("sortDrag")){
                init["initSORT"] = {name:"sıralama", fnc: This.initSORT};
                initFound=true;
            }else if(obj.id.includes("drawCanvas")){
                init["initLINECORRECT"] = {name:"çizgi doğrulama", fnc: This.initLINECORRECT};
                initFound=true;
            }else if(obj.id.includes("pointButon")){
                init["initPOINT"] = {name:"nokta birleştirme", fnc: This.initPOINT};
                initFound=true;
            }else if(obj.id.includes("popupWindow")){
                init["initVIDEO"] = {name:"video", fnc: This.initVIDEO};
                initFound=true;
            }else if(obj.id.includes("feedback")){
                init["initVIDEO"] = {name:"video", fnc: This.initVIDEO};
                initFound=true;
            }else if(obj.id.includes("videoBox")){
                init["initVIDEO"] = {name:"video", fnc: This.initVIDEO};
                initFound=true;
                SD.type = "a";
            }else if(obj.id.includes("soundRecord")){
                init["initRECORD"] = {name:"ses kayıt", fnc: This.initRECORD};
                initFound=true;
            }else if(obj.id.includes("wordBox")){
                init["initWORD"] = {name:"kelime", fnc: This.initWORD};
                initFound=true;
            }else if(obj.id.includes("puzzleBox")){
                init["initPUZZLE"] = {name:"bulmaca", fnc: This.initPUZZLE};
                initFound=true;
            }else if(obj.id.includes("freeDrawCanvas")){
                init["initFREEDRAW"] = {name:"serbest çizim", fnc: This.initFREEDRAW};
                initFound=true;
            }else if(obj.id.includes("dropdown")){
                init["initDROPDOWN"] = {name:"dropdown boşluk doldurma", fnc: This.initDROPDOWN};
                initFound=true;
            }

            if(initFound){
                SP.initFNC["initVIDEO"] = {fnc:This.initVIDEO, build: false};
            }
        });

        for(var p in init){
            if(!p.includes("initVIDEO")){
                try{
                    init[p].fnc(SP, SD, index);
                }catch(e){
                    if(PLX.mode === "preview"){
                        alert(index +". sahnede > "+ init[p].name + " etkinliğinde sorun var.");
                    }else{
                        console.error(index +". sahnede > "+ init[p].name + " etkinliğinde sorun var.");
                    }
                }
            }
        }
        SD.totalRight = SD.empty = Object.keys(SP.tempAnswer).length;
        specialStartFNC(SP, SD);

        if(SD.type === "a"){
            SP.consDuration = null;
        }else{
            SP.consDuration = 90;
        }
    }

    function initVideoFNC(index){
        var sp = SP[index];
        var sd = SD[index];
        for(var name in sp.initFNC){
            if(!sp.initFNC[name].build){
                sp.initFNC[name].build = true;
                sp.initFNC[name].fnc(sp, sd, index);
            }
        }
    }

    function sendDuration(){
        if(!PLX.sendDuration){
            var sendData = true;
            var totalDuration=0;
            SP.map(function(sp){
                if(sp.consDuration){
                    totalDuration += sp.consDuration;
                }else{
                    sendData = false;
                }
            });

            if(sendData){
                PLX.sendDuration = true;
                if(PLX.sendDurationFNC){
                    PLX.sendDurationFNC(totalDuration);
                }
            }
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

    function answerBtnView(SP, status){
        if(SP.answerBtn){
            if(status === "enable"){
                SP.answerBtn.style.opacity = 1;
                SP.answerBtn.style.pointerEvents = "auto";
            }else{
                SP.answerBtn.style.opacity = 0.5;
                SP.answerBtn.style.pointerEvents = "none";
            }
        }
    }


    function infoSystemFNC(){
        var wrongCount = 5;
        if(PLX.isEKT || PLX.isBSD){
            wrongCount = 3;
        }

        player.infoBtnDOM = utils.addDOM({className: "infoBtnDOM"});
        player.infoPopupDOM = utils.addDOM({className: "infoPop-container"});
        player.mainDOM.appendChild(player.infoBtnDOM);
        player.mainDOM.appendChild(player.infoPopupDOM);

        player.infoPopupDOM.innerHTML = `<div class="infoPop-header">
                <span class="infoPop-title">Bilgi</span>
                <button class="infoPop-close-btn">✕</button>
            </div>
            <div class="infoPop-body">
                <div class="infoPop-content-title">İçerik Katılım/Başarım Bilgisi:</div>
                <p>Katılım, kaç ekranda işlem yaptığını gösterir.</p>
                <p>Başarım ise katıldığın ekranlardaki etkileşimleri doğru yapıp yapmadığını gösterir.</p>
                <p>Örneğin açtığın içerik 4 ekrandan oluşuyorsa;</p>
                <ul class="infoPop-list">
                    <li>Sadece 2 ekranda işlem yaptığında Katılım %50.</li>
                    <li>Bu 2 ekrandaki tüm etkileşimleri doğru yaptığında Başarım %100 olur.</li>
                </ul>
                <p>Doğruya ulaşmak için dilediğin kadar deneme yapabilirsin. Amacın en az denemeyle doğruya ulaşmak olsun.</p>
                <p>Ekranlarda ${wrongCount} denemeden sonra <span class="infoPop-bold-text">Cevabı Gör</span> butonu aktif olur. Dilersen doğru cevaplara bu butona tıklayarak erişebilirsin.</p>
                <p>Cevabını gördüğünüz sorular ile açık uçlu soruların cevapları başarım hesabına eklenmez.</p>
                <div class="infoPop-footer">
                    <div class="infoPop-icon-container">
                        <div class="infoPop-grid-icon">
                            <div class="infoPop-grid-box"></div>
                            <div class="infoPop-grid-box"></div>
                            <div class="infoPop-grid-box"></div>
                            <div class="infoPop-grid-box"></div>
                            <div class="infoPop-grid-box"></div>
                            <div class="infoPop-grid-box"></div>
                        </div>
                    </div>
                    <div class="infoPop-hand-pointer">👈</div>
        
                    <div class="infoPop-speech-bubble">
                        Bu ikona tıklayarak katılım/başarım bilgilerinizin detaylarına ulaşabilirsiniz.
                    </div>
                </div>
            </div>`;


        player.infoBtnDOM.addEventListener("click", function(e){
            player.infoPopupDOM.style.display = "block";
        });

        player.infoPopupDOM.querySelector(".infoPop-close-btn").addEventListener("click", function(e){
            player.infoPopupDOM.style.display = "none";
        });

        player.infoBtnDOM.innerHTML = '<img src="assets/img/player/info_btn.png">';
    }


    //add read-only mode
    function addNavigationDOM(){
        player.Normal_NavListMain = utils.addDOM({className: "Normal_NavListMain"});
        player.mainDOM.appendChild(player.Normal_NavListMain);
        player.Normal_NavListMain.style.visibility = "hidden";

        player.Normal_NavList = utils.addDOM({className: "Normal_NavList"});
        player.Normal_NavListMain.appendChild(player.Normal_NavList);

        /* End Main */
        player.watcher_main = utils.addDOM({className: "watcher_main"});
        player.mainDOM.appendChild(player.watcher_main);

        player.watcher_main.innerHTML = '<div class="watcher_container">' +
            '<div class="watcher_head">Tamamlanmayan ekranlar var!</div>' +
            '<div class="watcher_footer">Tamamlanmayan ekranlara dönmek için butonlara tıklayın.</div>' +
            '<div class="watcher_list"></div>' +
            '<div class="watcher_mainBtn">' +
                '<div class="watcher_standart watcher_returnBtn">Geri Dön</div>' +
                '<div class="watcher_standart watcher_endBtn">Sonlandır</div>' +
            '</div>' +
        '</div>';

        var watcherList = player.watcher_main.querySelector(".watcher_list");
        player.watcher_head = player.watcher_main.querySelector(".watcher_head");
        player.watcher_footer = player.watcher_main.querySelector(".watcher_footer");
        player.watcher_mainBtn = player.watcher_main.querySelector(".watcher_mainBtn");
        player.watcher_returnBtn = player.watcher_main.querySelector(".watcher_returnBtn");
        player.watcher_endBtn = player.watcher_main.querySelector(".watcher_endBtn");


        SD.map(function(e, i){
            var navBox = utils.addDOM({className: "Normal_NavList_Box", textContent:(i+1)});
            player.Normal_NavList.appendChild(navBox);

            navBox.addEventListener("mouseenter", function(){
                this.style.backgroundColor = "#4db6ac";
            });

            navBox.addEventListener("mouseleave", function() {
                if(This.sceneIndex !== i){
                    this.style.backgroundColor = "silver";
                }
            });

            navBox.addEventListener("click", function(e){
                This.changeScene(i);
            });

            var watcherBox = utils.addDOM({className: "watcher_box", textContent:(i+1)});
            watcherList.appendChild(watcherBox);

            watcherBox.addEventListener("mouseenter", function(){
                this.style.backgroundColor = "#4db6ac";
            });

            watcherBox.addEventListener("mouseleave", function() {
                this.style.backgroundColor = "silver";
            });

            watcherBox.addEventListener("click", function(){
                player.watcher_main.style.visibility = "hidden";
                This.changeScene(i);
            });
        });

        player.Normal_NavListMain.addEventListener("click", function(){
            player.Normal_NavListMain.style.visibility = "hidden";
        });

        player.watcher_mainBtn.style.display = 'flex';
        player.watcher_returnBtn.addEventListener("click", function(){
            player.watcher_main.style.visibility = "hidden";
        });

        if(jsonV2.fileName.includes("HDE")){
            player.watcher_endBtn.addEventListener("click", function(){
                HDE_endExam();
            });

            player.endBtn.addEventListener("click", function(){
                PLX.endScreen();
            });

            HDE_addEvent();
        }else{
            player.endBtn.style.display = "block";
            player.watcher_endBtn.style.display = "none";
            player.endBtn.addEventListener("click", function(){
                endScreenBoxStatus();
            });
        }

        player.navListAllBox = player.Normal_NavListMain.querySelectorAll(".Normal_NavList_Box");
        player.watcherListAllBox = player.watcher_main.querySelectorAll(".watcher_box");
    }


    function endScreenBoxStatus(){
        if(PLX.Mode === "normal"){
            var unComplete = 0;
            for(var x=0; x<SD.length; x++){
                if(SD[x].complete){
                    player.watcherListAllBox[x].style.display = "none";
                }else{
                    unComplete++;
                }
            }

            if(unComplete){
                player.watcher_main.style.visibility = "visible";
            }else{
                PLX.endScreen();
            }
        }
    }

    function navListReset(){
        player.navListAllBox.forEach(function(box) {
            box.style.backgroundColor = "silver";
            box.style.pointerEvents = "auto";
        });
    }

    function navListSelect(pageID){
        if(player.navListAllBox){
            navListReset();
            player.navListAllBox[pageID].style.backgroundColor = "orange";
            player.navListAllBox[pageID].style.pointerEvents = "none";
        }
    }

    //add read-only mode
    function addOpenEndedDOM(SP, index){
        player.openEndedDOM = utils.addDOM({className: "openEndedDOM"});
        player.mainDOM.appendChild(player.openEndedDOM);
        player.openEndedDOM.innerHTML = '<div class="openEndedWindow"><img class="openEndedWindow_icon" src="assets/img/player/check.png"><div>Kaydedildi</div> </div>';
    }

    function hideOpenEndedDOM(){
        player.openEndedDOM.style.visibility = "hidden";
    }

    //add read-only mode
    function addReadOnlyDOM(SP, index){
        player.readOnlyDOM = utils.addDOM({className: "readOnlyDOM"});
        player.mainDOM.appendChild(player.readOnlyDOM);
        player.readOnlyDOM.innerHTML = '<img src="assets/img/player/readonly.png">';
    }

    this.showReadOnly = function(){
        if(!jsonV2.fileName.includes("HDE")){
            player.readOnlyDOM.style.visibility = "visible";
            PLX.showReadOnly = true;
            SP.map(function(sp){
                if(sp.completeBtn){
                    sp.completeBtn.style.opacity=0.5;
                    sp.completeBtn.style.cursor="default";
                    sp.completeBtn.style.pointerEvents="none";
                }

                sp.screenCloseDOM.style.display = "block";
            });
        }
    }

    //add tooltip
    function addToolTip(SP, index){
        SP.toolTipDOM = utils.addDOM({className: "toolTipDOM"});
        SP.controlBtn.appendChild(SP.toolTipDOM);
    }

    function showToolTip(SP,SD){
        var currentWarning = SD.historyRight.length;
        SP.toolTipDOM.style.visibility = "visible";
        SP.toolTipDOM.innerHTML = currentWarning;
    }

    //add check
    function addCheckIcon(){
        player.checkIconDOM = utils.addDOM({id: "checkIconDOM", className: "checkIconDOM"});
        player.mainDOM.appendChild(player.checkIconDOM);
        player.checkIconDOM.innerHTML = '<div id="pageCheckIcon" class="pageStatusIcon"><img src="assets/img/player/check.png"></div><div id="pageAnswerIcon" class="pageStatusIcon"><img src="assets/img/player/answer.png"></div><div class="notice"></div>';
        player.notice = player.checkIconDOM.querySelector(".notice");
        player.pageStatusIcon = {
            check: player.checkIconDOM.querySelector("#pageCheckIcon"),
            answer: player.checkIconDOM.querySelector("#pageAnswerIcon")
        }
    }

    //add check
    function addHDEStatus(){
        player.statusIconMain = utils.addDOM({id: "statusIconMain", className: "statusIconMain"});
        player.mainDOM.appendChild(player.statusIconMain);
        player.statusIconMain.innerHTML = '<img id="statusRightIcon" src="assets/img/player/status_right.png"><img id="statusWrongIcon" src="assets/img/player/status_wrong.png"><img id="statusEmptyIcon" src="assets/img/player/status_empty.png">';
        player.statusIcon = {
            right: player.statusIconMain.querySelector("#statusRightIcon"),
            wrong: player.statusIconMain.querySelector("#statusWrongIcon"),
            empty: player.statusIconMain.querySelector("#statusEmptyIcon")
        };
    }

    function checkViewFNC(SD){
        if(SD.complete){
            player.checkIconDOM.style.visibility = "visible";
            var currentWarning = SD.historyRight.length;
            var bgColor = "#548b2e";
            var noticeTxt = currentWarning +". denemede tamamlandı.";

            if(SD.answerShow){
                bgColor = "#F57F17";
                noticeTxt = "Yanıt desteği ile tamamlandı.";
                player.pageStatusIcon.check.style.display = "none";
                player.pageStatusIcon.answer.style.display = "block";
            }else{
                player.pageStatusIcon.check.style.display = "block";
                player.pageStatusIcon.answer.style.display = "none";
            }

            if(currentWarning){
                player.notice.style.backgroundColor = bgColor;
                player.notice.style.visibility = "visible";
                player.notice.innerHTML = noticeTxt;
            }else{
                player.notice.style.visibility = "hidden";
            }
        }else{
            player.checkIconDOM.style.visibility = "hidden";
            player.notice.style.visibility = "hidden";
        }

        if(!jsonV2.fileName.includes("HDE")){
            if(SD.type === "e"){
                player.infoBtnDOM.style.display = "block";
            }else{
                player.infoBtnDOM.style.display = "none";
            }
        }
        hideWarning();
    }

    //add Warning settings
    function addWarning(){
        player.warningDOM = utils.addDOM({id: "warningDOM", className:"warningDOM"});
        player.mainDOM.appendChild(player.warningDOM);
        player.warningDOM.addEventListener("click", function(e){
            hideWarning();
        });
    }

    function showWarning(SP, SD){
        var currentWarning = SD.historyRight.length-1;

        if(!player.warningList[currentWarning]){
            currentWarning = player.warningList.length-1;
        }

        player.warningDOM.innerHTML = player.warningList[currentWarning];

        if(player.warningAnimation){
            player.warningAnimation.kill();
            clearInterval(player.warningTimer);
        }

        player.warningDOM.style.right = "-380px";
        player.warningAnimation = gsap.to(player.warningDOM, 0.3, {right:5, onComplete: startWarningTime});
    }

    function startWarningTime(){
        player.warningTimer = setTimeout(hideWarning, 3000);
    }

    function hideWarning(){
        if(player.warningAnimation){
            player.warningAnimation.kill();
        }

        player.warningInterval = gsap.to(player.warningDOM, 0, {right:-380});
    }

    /////////////////////////////////////////////////////////
    This.searchTool = function(Scene, index, SP){
        var popupWindow;
        Scene.childNodes.forEach(function(obj) {
            if(obj.id.includes("popupButon")){
                var id = parseInt( obj.id.split("_")[1] );
                if(!SP.popEx[id]){
                    SP.popEx[id] = {};
                }
                SP.popEx[id].clicked = false;
                SP.popEx[id].btn = obj;

                obj.addEventListener("click", function(){
                    popupWindowStatus(id);
                    SP.popEx[id].window.style.visibility = "visible";
                });

                obj.style.cursor = "pointer";
                obj.style.opacity = 1;
            }else if(obj.id.includes("popupWindow")){
                var id = parseInt( obj.id.split("_")[1] );
                if(!SP.popEx[id]){
                    SP.popEx[id] = {};
                }

                SP.popEx[id].window = obj;
                obj.querySelector(".popupWindowClose").addEventListener("click", function(){
                    popupWindowStatus(id);
                });

                var nextPageBtn = obj.querySelector(".nextPageBtn");
                if(nextPageBtn){
                    obj.querySelector(".nextPageBtn").addEventListener("click", function(){
                        This.changeScene(This.sceneIndex+1);
                    });

                    nextPageBtn.style.cursor = "pointer";
                }

                obj.querySelector(".popupWindowClose").style.cursor = "pointer";
            }else if(obj.id.includes("control")){
                SP.controlBtn = obj;
                SP.controlBtn.style.cursor = "pointer";
                SP.controlBtn.style.pointerEvents = "none";
                SP.controlBtn.addEventListener("click", function(){
                    var rubrik = SD[index].rubrik;
                    
                    if(rubrik && rubrik.groups && rubrik.groups.length){
                        if(SD[index].rubrik.groups.length){
                            This.rubrikEvalutorControlHQ(SP, SD[index]);
                        }
                    }else{
                        This.controlHQ(SP, SD[index]);
                    }
                });

                addToolTip(SP, index);
            }else if(obj.id.includes("answer")){
                SP.answerBtn = obj;
                SP.answerBtn.style.cursor = "pointer";
                SP.answerBtn.style.pointerEvents = "none";
                SP.answerBtn.addEventListener("click", function(){
                    SD[index].answerShow=true;
                    This.answerHQ(SP, SD[index]);
                    showFeedBack("answer", "btn", 0);
                });
            }else if(obj.id.includes("saveBtn")){
                SP.completeBtn = obj;
                SP.completeBtn.addEventListener("click", function(){
                    This.stopAllMedia();
                    SD[index].totalRight=0;
                    SD[index].complete=true;
                    player.openEndedDOM.style.visibility = "visible";
                    This.scoreCalc(true);
                    checkViewFNC(SD[index]);
                    This.nextScene();
                });

                SP.completeBtn.style.opacity = 1;
                SP.completeBtn.style.cursor = "pointer";
            }else if(obj.id.includes("directive")){
                var soundID = SP.name.slice(1, SP.name.length);

                SP.directive.sound = new Howl({
                    src: [player.root +"img/sound_"+ soundID +".mp3"],
                    onplay: function(){
                        obj.style.top = "0px";
                        directivePlay.style.visibility = "hidden";
                    },
                    onend: function(){
                        obj.style.top = "-100px";
                        directivePlay.style.visibility = "visible";
                    },
                    onstop: function () {
                        obj.style.top = "-100px";
                        directivePlay.style.visibility = "visible";
                    }
                });

                var directivePlay = obj.querySelector(".directivePlay");
                var directiveStop = obj.querySelector(".directiveStop");

                obj.style.cursor = "pointer";

                directivePlay.addEventListener("click", function(e){
                    SP.directive.sound.play();
                    e.stopPropagation();
                });

                obj.addEventListener("click", function(){
                    SP.directive.sound.stop();
                });

            }else if(obj.id.includes("soundPlayer")){
                var sceneID = parseInt(SP.name.slice(1, SP.name.length));
                var id = parseInt( obj.id.split("_")[1] );
                SP.soundPlayer[id] = {sceneID:sceneID, id:id};
                var soundPlayer = SP.soundPlayer[id];

                soundPlayer.playBtn = obj.querySelector(".play");
                soundPlayer.pauseBtn = obj.querySelector(".pause");
                soundPlayer.restartBtn = obj.querySelector(".restart");
                soundPlayer.progressBarMain = obj.querySelector(".progress");

                if(soundPlayer.progressBarMain){
                    soundPlayer.progressBarBg = utils.addDOM({className: "soundBarBg"});
                    soundPlayer.progressBarMain.appendChild(soundPlayer.progressBarBg);
                    soundPlayer.progressBarFront = utils.addDOM({className: "soundBarFront"});
                    soundPlayer.progressBarMain.appendChild(soundPlayer.progressBarFront);

                    soundPlayer.progressBarBg.style.width = "100%";
                    soundPlayer.progressBarBg.style.height = "100%";
                    soundPlayer.progressBarBg.style.left = 0;
                    soundPlayer.progressBarBg.style.top = 0;

                    soundPlayer.progressBarFront.style.width = "100%";
                    soundPlayer.progressBarFront.style.height = "100%";
                    soundPlayer.progressBarFront.style.left = 0;
                    soundPlayer.progressBarFront.style.top = 0;
                    soundPlayer.progressBarFront.style.backgroundColor = soundPlayer.progressBarMain.style.backgroundColor;

                    soundPlayer.progressBarMain.style.cursor = "pointer";
                    soundPlayer.progressBarMain.addEventListener("click", function(e){
                        SoundPlayerAction(soundPlayer, "seek", getSoundPlayerSeekPercent(e, soundPlayer.progressBarMain));
                    });
                }

                This.SoundPlayerHowler(soundPlayer);
                soundPlayer.playBtn.addEventListener("click", function(){
                    SoundPlayerAction(soundPlayer, "play");
                });

                soundPlayer.pauseBtn.addEventListener("click", function(){
                    SoundPlayerAction(soundPlayer, "pause");
                });

                soundPlayer.restartBtn.addEventListener("click", function(){
                    SoundPlayerAction(soundPlayer, "play");
                });
            }else if(obj.id.includes("finish")){
                obj.addEventListener("click", function(){
                    if(PLX.mode === 'preview'){
                        HDE_endExam();
                    }else{
                        HDE_ControlFNC();
                    }
                });

                obj.style.cursor = "pointer";
                SP.allControl = obj;
            }
        });

        SP.elementList.map(function(el){
            if(el.id.includes("feedback")){
                var sceneID = parseInt(SP.name.slice(1, SP.name.length));
                var id = parseInt( el.id.split("_")[1] );
                if(!SP.feedBack[id]){
                    SP.feedBack[id] = {
                        type:"img",
                        videoSkin:true,
                        sceneID:sceneID,
                        id:id,
                        status:"right",
                        view:"auto",
                        sound:false,
                        step:0,
                        statusSound: null
                    };
                }

                var feedbackObj = SP.feedBack[id];
                for(var prop in el.data){
                    var valueData = el.data[prop];
                    if(valueData === "true"){
                        valueData = true;
                    }else if(valueData === "false"){
                        valueData = false;
                    }

                    feedbackObj[prop] = valueData;
                }


                if(feedbackObj.status){
                    if(feedbackObj.status.includes("wrong")){
                        var tempStatus = feedbackObj.status.split("_");
                        if(tempStatus.length){
                            feedbackObj.status = tempStatus[0];
                            feedbackObj.step = parseInt(tempStatus[1]);
                        }
                    }
                }

                feedbackObj.main = el.main;

                var feedbackWindowClose = el.main.querySelector(".feedbackWindowClose");
                var videoPlayer = el.main.querySelector(".videoPlayer");

                if(feedbackWindowClose){
                    feedbackWindowClose.addEventListener("click", function(){
                        el.main.style.visibility = "hidden";
                        This.stopAllMedia();
                    });

                    feedbackWindowClose.style.cursor = "pointer";
                }

                if(videoPlayer){
                    feedbackObj.type = "video";
                }

                if(feedbackObj.sound){
                    feedbackSound(SP, index, id);
                }
            }else if(el.id.includes("refresh")){
                el.main.addEventListener('click', function(){
                    SP.fnc.map(function(fnc){
                        if(fnc.reset){
                            fnc.reset();
                        }
                    });
                });
            }else if(el.id.includes("goUrl")){
                var url = "";
                if(AC.player){
                    url = AC.player.RUrl;
                }

                if(el.data.goUrl && el.data.goUrl === "insidePDF"){
                    var cid="0000";
                    if(AC.ID){
                        cid = AC.ID.split("-")[1];
                    }

                    url = "/viewer/pdf-viewer?cmd=yem&content_id="+ cid +"&type=bsd";
                }

                el.main.addEventListener("click", function(){
                    var newwindow = window.open(url, "versiyon", "width=1280,height=720");
                    if (window.focus) {newwindow.focus()}
                    return false;
                });

                el.main.style.cursor = "pointer";
            }

            /* manual zindex */
            if(el.data){
                if(el.data.zindex){
                    el.main.style.zIndex = el.data.zindex;
                }
            }

            el.kids.map(function(kid){
                if(kid.data.fnc){
                    var fncData = kid.data.fnc.split(",");
                    var fncName = fncData[0];
                    fncData.shift();
                    try{
                        elementActions[fncName](kid, fncData);
                    }catch(e){}
                }
            });

        });
    }

    var elementActions = {
        addScroll: function(kid, fncData) {
            var parent = document.createElement("div");
            kid.main.parentNode.insertBefore(parent, kid.main);
            parent.appendChild(kid.main);

            var overflowX = "scroll";
            var overflowY = "scroll";

            if(fncData[2] === 'H'){
                overflowY = 'hidden';
            }else if(fncData[2] === 'V'){
                overflowX = 'hidden';
            }

            Object.assign(parent.style, {
                left: kid.main.style.left,
                top: kid.main.style.top,
                width: fncData[0]+"px",
                height: fncData[1]+"px",
                overflowX: overflowX,
                overflowY: overflowY,
                position: "absolute"
            });

            kid.main.style.left=0;
            kid.main.style.top=0;
        }
    };

    function popupWindowStatus(popID){
        var sp = SP[This.sceneIndex];
        if(sp.popEx[popID].clicked){
            sp.popEx[popID].window.style.visibility = "hidden";
            sp.popEx[popID].clicked = false;
            if(player.statusIconMain){
                player.statusIconMain.style.display = 'block';
            }

            if(PLX.showReadOnly){
                player.readOnlyDOM.style.visibility = "visible";
            }
        }else{
            sp.popEx[popID].window.style.visibility = "visible";
            sp.popEx[popID].clicked = true;
            if(player.statusIconMain){
                player.statusIconMain.style.display = 'none';
            }

            if(PLX.showReadOnly){
                player.readOnlyDOM.style.visibility = "hidden";
            }
            PLX.autoSceneChange_stopQuickly();
        }

        This.popupVideoPlayStatus(sp, false);
    }

    function feedbackSound(SP, sceneID, id){
        var feedBack = SP.feedBack[id];
        feedBack.howl = new Howl({
            src: [player.root +"img/feedback_"+ feedBack.sceneID +"_"+ feedBack.id +".mp3"],
            onload: function(){
                feedBack.load = true;
            },
            onloaderror: function(){},
            onplay: function(){},
            onpause: function(){},
            onend: function(){}
        })
    }


    function feedbackReset(){
        SP[This.sceneIndex].feedBack.map(function(feedback){
            feedback.main.style.visibility = "hidden";
        });
    }

    function showFeedBack(type, view, step){
        SP[This.sceneIndex].feedBack.map(function(feedback){
            if(feedback.status === type && feedback.view === view && feedback.step === step){
                PLX.autoSceneChange.HideFNC();
                This.stopAllMedia();
                feedbackReset();
                feedback.main.style.visibility = "visible";
                gsap.to(feedback.main, 0, {transformOrigin: "50% 50%",scale:0});
                gsap.to(feedback.main, 0.5, {transformOrigin: "50% 50%", scale:1});
                if(feedback.howl){
                    feedbackSoundAction(feedback, "play");
                }else if(feedback.type === "video"){
                    SP[This.sceneIndex].video.map(function(video){
                        if(video.type === "feedback" && video.feedbackID === feedback.id){
                            if(!feedback.videoSkin){
                                video.videoSkinHide();
                            }
                            video.PlayVideo();
                        }
                    });
                }

                if(feedback.statusSound === "right"){
                    This.playRightAudio();
                }else if(feedback.statusSound === "wrong"){
                    This.playWrongAudio();
                }
            }
        });
    }

    function feedbackSoundAction(feedback, status){
        if(feedback.load){
            if(status==="play" && !feedback.howl.playing()){
                This.stopAllMedia();
                feedback.howl.play();
            }else if(status==="pause"){
                feedback.howl.pause();
            }else if(status==="seek"){}
        }
    }

    function playBtnShow(soundPlayer){
        soundPlayer.playBtn.style.display = "none";
        soundPlayer.pauseBtn.style.display = "block";
        soundPlayer.restartBtn.style.display = "none";
    }

    function pauseBtnShow(soundPlayer){
        soundPlayer.playBtn.style.display = "block";
        soundPlayer.pauseBtn.style.display = "none";
        soundPlayer.restartBtn.style.display = "none";
    }

    function RestartBtnShow(soundPlayer){
        soundPlayer.playBtn.style.display = "none";
        soundPlayer.pauseBtn.style.display = "none";
        soundPlayer.restartBtn.style.display = "block";
    }

    this.SoundPlayerHowler = function(soundPlayer){
        if(!soundPlayer.Confirm){
            soundPlayer.Confirm = true;
            soundPlayer.howl = new Howl({
                src: [player.root +"img/dialog_"+ soundPlayer.sceneID +"_"+soundPlayer.id +".mp3"],
                onload: function(){
                    soundPlayer.load = true;
                },
                onloaderror: function() {},
                onplay: function(){
                    playBtnShow(soundPlayer);
                    addSPsetInterval(soundPlayer);
                },
                onpause: function(){
                    pauseBtnShow(soundPlayer);
                    delSPInterval();
                },
                onend: function(){
                    RestartBtnShow(soundPlayer);
                    progressSP(soundPlayer, true);
                    delSPInterval();
                }
            })
        }
    }

    function addSPsetInterval(soundPlayer){
        clearInterval(PLX.spInterval);
        PLX.spInterval = setInterval(progressSP, 400, soundPlayer, false);
    }

    function delSPInterval(){
        clearInterval(PLX.spInterval);
    }

    function progressSP(soundPlayer, showFullBar){
        var pos = Number(soundPlayer.howl.seek().toFixed(1));
        var dur = Number(soundPlayer.howl.duration().toFixed(1));
        var percent = ((pos / dur) * 100);
        if(soundPlayer.progressBarMain){
            if(showFullBar){
                soundPlayer.progressBarFront.style.width = "100%";
            }else{
                soundPlayer.progressBarFront.style.width = percent+"%";
            }
        }
    }

    function getSoundPlayerSeekPercent(e, progressBar){
        var clientX;

        if(e.touches && e.touches.length){
            clientX = e.touches[0].clientX;
        }else if(e.changedTouches && e.changedTouches.length){
            clientX = e.changedTouches[0].clientX;
        }else{
            clientX = e.clientX;
        }

        var rect = progressBar.getBoundingClientRect();
        var localX = clientX - rect.left;
        var percent = localX / rect.width;

        if(percent < 0){
            percent = 0;
        }else if(percent > 1){
            percent = 1;
        }

        return percent;
    }

    function SoundPlayerAction(soundPlayer, status, seekPercent){
        if(soundPlayer.load){
            if(status==="play" && !soundPlayer.howl.playing()){
                This.stopAllMedia();
                soundPlayer.howl.play();
            }else if(status==="pause"){
                soundPlayer.howl.pause();
            }else if(status==="seek"){
                var duration = soundPlayer.howl.duration();
                if(duration){
                    var seekTime = Number((duration * seekPercent).toFixed(2));
                    soundPlayer.howl.seek(seekTime);
                    progressSP(soundPlayer, false);

                    if(soundPlayer.howl.playing()){
                        addSPsetInterval(soundPlayer);
                    }
                }

            }
        }
    }


    This.soundAllSound = function(){
        SP.map(function(e){
            if(e.directive.sound){
                e.directive.sound.stop();
            }
        });
    }

    This.playAutoSound = function(){
        if(jsonV2.fileName.includes("HDE")){
            if(PLX.HDE_autoSoundPlay){
                if(SP[This.sceneIndex].directive.sound){
                    if(PLX.soundConfirm){
                        SP[This.sceneIndex].directive.sound.play();
                        PLX.HDE_autoSoundPlay = false;
                    }else{
                        PLX.playScreen.style.display = "block";
                    }
                }else{
                    PLX.playScreen.style.display = "none";
                }
            }
        }else{
            if(!SD[This.sceneIndex].complete){
                if(SP[This.sceneIndex].directive.sound){
                    if(PLX.soundConfirm){
                        SP[This.sceneIndex].directive.sound.play();
                    }else{
                        PLX.playScreen.style.display = "block";
                    }
                }else{
                    PLX.playScreen.style.display = "none";
                }
            }
        }
    }

    this.stopAllMedia = function(){
        /* Video */
        SP.map(function(slide){
            slide.video.map(function(video){
                video.StopVideo();
            });
        });

        /* Sound Record */
        for(var id in SP[This.sceneIndex].soundRecord){
            SP[This.sceneIndex].soundRecord[id].stopPlayedRecord();
            SP[This.sceneIndex].soundRecord[id].stopAudioRecordingFNC();
        }
        
        /* soundPlayer */
        SP[This.sceneIndex].soundPlayer.map(function(sound){
            if(sound.load){
                if(sound.howl.playing()){
                    sound.howl.pause();
                }
            }
        });

        /* feedback */
        SP[This.sceneIndex].feedBack.map(function(feedback){
            if(feedback.howl){
                feedback.howl.pause();
            }
        });
    }

    /* ChangeScene */
    this.changeScene = function(index){
        if(this.allScene[index]){
            this.stopAllMedia();
            this.sceneIndex = index;
            this.allScene.forEach(function(Scene){
                Scene.style.display = "none";
            });

            this.allScene[this.sceneIndex].style.display = "block";
            if(player.infoDiv){
                player.infoDiv.innerHTML = (index+1) +" / "+ this.allScene.length;
            }

            this.addSceneInterval();
            PLX.autoSceneChange_stopQuickly();
            This.soundAllSound();
            This.playAutoSound();

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

            initVideoFNC(This.sceneIndex);
            checkViewFNC(SD[index]);
            navListSelect(index);
            hideOpenEndedDOM();
            HDE_StatusFNC();

            /*Screen tazeleme video icin gerekli*/
            This.screenRatio();
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

    this.sceneComplete = function(){
        clearInterval(player.screenDuration);
        SD[This.sceneIndex].complete = true;
    }

    this.popupVideoPlayStatus = function(SP, playVideo){
        if(playVideo){
            /*
            if(SP.video.firstPlay){
                SP.video.PlayVideo();
            }else{
                SP.video.FullScreenPlay();
            }
            */
        }else{
            SP.video.map(function(video){
                video.StopVideo();
            });
        }
    }

    /* NextScene */
    this.nextScene = function(){
        var start = This.sceneIndex+1;
        var next=null;
        for(var i=start; i<SD.length; i++){
            if(!SD[i].complete){
                next = i;
                break;
            }
        }

        if(!next){
            for(var x=0; x<SD.length; x++){
                if(!SD[x].complete){
                    next = x;
                    break;
                }
            }
        }

        if(next === null){
            setTimeout(endScreenBoxStatus, 2000);
        }else{
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

    this.addScreenClose = function (Scene, index) {
        SP[index].screenCloseDOM = utils.addDOM({
            className: "screenClose",
            innerHTML: `<div class="ai-main">
                            <div class="ai-textbox">Yanıtınız analiz ediliyor. Lütfen bekleyin</div>
                            <div class="ai-loader"><div class="ai-circle" id="ai_circle1"></div><div class="ai-circle" id="ai_circle2"></div><div class="ai-circle" id="ai_circle3"></div></div>
                        </div>`
        });
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
        /* player.mainDOM.style.top = centerY+"px"; */
        var sp = SP[This.sceneIndex];
        if(sp.video.length){
            sp.video.map(function(video){
                video.resizePosition();
            });
        }
    }

    this.startPlayer = function(element){
        This.scoreCalc(false);
        initKACountDown();

        Object.assign(player, element);
        player.backBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex-1);
        });

        player.nextBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex+1);
        });

        player.infoDiv.addEventListener("click", function(){
            var visibility = player.Normal_NavListMain.style.visibility;
            if(visibility === "visible"){
                player.Normal_NavListMain.style.visibility = "hidden";
            }else{
                player.Normal_NavListMain.style.visibility = "visible";
            }
        });

        addNavigationDOM();
        This.changeScene(0);
    }

    function Preview_HTML(container, startScene){
        var removeBtnBack = document.getElementById("Nav_Preview_BackBtn");
        if(removeBtnBack){
            removeBtnBack.remove();
            document.getElementById("Nav_Preview_NextBtn").remove();
            document.getElementById("Nav_Preview_NavInfo").remove();
            document.getElementById("Nav_Preview_SolutionBtn").remove();
            document.getElementById("Nav_Preview_RightAnswerBtn").remove();
            document.getElementById("Nav_Preview_UserAnswerBtn").remove();
        }

        player.backBtn = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_BackBtn", innerHTML:"&#9664;"});
        player.nextBtn = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_NextBtn", innerHTML:"&#9654;"});
        player.infoDiv = utils.addDOM({id:"Nav_Preview_NavInfo", textContent: "0 / 0"});

        player.videoSolution = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_SolutionBtn", innerHTML:"Çözüm"});
        player.userAnswer = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_UserAnswerBtn", innerHTML:"Verdiğim Yanıt"});
        player.rightAnswer = utils.addDOM({className:"Nav_Preview_Btn", id:"Nav_Preview_RightAnswerBtn", innerHTML:"Doğru Yanıt"});

        container.appendChild(player.backBtn);
        container.appendChild(player.nextBtn);
        container.appendChild(player.infoDiv);
        container.appendChild(player.videoSolution);
        container.appendChild(player.userAnswer);
        container.appendChild(player.rightAnswer);

        player.backBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex-1);
        });

        player.nextBtn.addEventListener("click", function(){
            This.changeScene(This.sceneIndex+1);
        });

        This.changeScene(startScene);
        HDE_addEvent();
    }

    this.playWrongAudio = function(){
        player.sound.play("wrong");
    }

    this.playRightAudio = function(){
        player.sound.play("right");
    }

    /* Build Konu Testi */
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

    function countDown(obj, animationFinish){
        obj.append(`<svg><path id="CountdownCircle"/></svg>`);
        var This = this;
        this.Svg = $("#CountdownCircle")[0];
        this.Const =  {x:15, y:15, radius: 15, start:1, end:1};
        this.Time=0;
        this.Duration;
        this.startAnimationFNC = function(duration){
            This.Duration = duration;
            if(this.Gsap){
                this.Gsap.kill();
            }
            this.Current = Object.assign({}, this.Const);
            this.Gsap = gsap.to(this.Current, {start:1, end:360, duration:This.Duration, ease:'none', onUpdate:this.onTimerFNC, onComplete:this.finishFNC});
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
        AddHtmlFNC: function(animationFinish, text){
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

            PLX.autoSceneChange.CountDown = new countDown(PLX.autoSceneChange.Pie, animationFinish);
            PLX.autoSceneChange_PieResize();
        },

        ShowFNC: function(){
            PLX.autoSceneChange.Main.css({right:"-20%", display:"flex"});
            gsap.to(PLX.autoSceneChange.Main, 0.3, {right:"0.5%"});
            PLX.autoSceneChange.CountDown.startAnimationFNC(SP[This.sceneIndex].pageChangeDuration);
        },

        HideFNC: function(){
            PLX.autoSceneChange.CountDown.animationStop();
            PLX.autoSceneChange.Main.hide();
        }
    }

    function initKACountDown(){
        PLX.SceneNavigationMain = $("#PlayerMain");
        PLX.autoSceneChange.AddHtmlFNC(function(){ This.changeScene(player.autoNext) }, "Sonraki Ekran");
        PLX.autoSceneChange.WindowClose.on("click", function(e){
            PLX.autoSceneChange.HideFNC();
            e.stopPropagation();
        });

        PLX.autoSceneChange.Main.on("click", function(){
            PLX.autoSceneChange.HideFNC();
            This.changeScene(player.autoNext);
        });
    }

    function addStartScreen(Mode){
        PLX.playScreen = utils.addDOM({id: "startScreen" });
        var PlayerMain = document.querySelector("#PlayerMain");
        PlayerMain.appendChild(PLX.playScreen);

        PLX.playScreen.innerHTML = `<div class="startScreen_main">
                <img src="assets/img/player/hypestart.svg" alt="">
            </div>`;

        PLX.playScreen.addEventListener("click", function(){
            PLX.playScreen.style.display = "none";
            PLX.soundConfirm = true;
            This.playAutoSound();
        });

        var viewStart = "none";
        SP.map(function(e){
            if(e.directive.sound){
                viewStart = "block";
            }
        });

        PLX.playScreen.style.display = viewStart;

        if(Mode === "preview"){
            PLX.scoreTable = utils.addDOM({id: "scoreTable" });
            PlayerMain.appendChild(PLX.scoreTable);
        }
    }

    /** Utils **/
    function getPosition(obj){
        return {left: parseInt(obj.style.left), top: parseInt(obj.style.top)}
    }

    function setPosition(obj, left, top){
        obj.style.left = left+"px";
        obj.style.top = top+"px";
    }

    function stringSpaceDelete(str){
        return str.replace(/\s+/g, "");
    }

    function valueControl(data){
        return !(data === undefined || data === null);
    }

    //dizi icindeki rakamlari siralar.
    function sortArray(arr) {
        return arr.sort(function(a,b){return a-b});
    }

    function sortDeepArray(dizi){
        return dizi.sort(function(a,b){ return a[0]-b[0] });
    }

    //dizi icindeki objeleri siralar
    function sortObject(arr, key) {
        return arr.sort(function(a,b){return a[key]-b[key]});
    }

    function historyExtract(SP, type){
        var history = SP.history;

        var tempBox = {};
        if(history){
            var lastMove = history[history.length-1];
            for(var box in lastMove){
                if(lastMove[box].type === type){
                    var currentData = lastMove[box].value;
                    if(currentData !== null && currentData !== undefined && currentData !== "" && currentData.length !== 0){
                        var id = parseInt(box.split("box")[1]);
                        tempBox[box] = lastMove[box];
                        tempBox[box].id = id;
                    }
                }
            }
        }

        return tempBox;
    }

    /** Add CS **/
    this.initCS = function(SP, SD, index){
        console.log("init CS");
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
                    ignore: false,
                    status: "empty",
                    csClick: element.main.querySelector(".csClick"),
                    csWrong: element.main.querySelector(".csWrong"),
                    csRight: element.main.querySelector(".csRight"),
                };

                SD.inputs["box"+ id] = {value: null, type: "cs"};
                rubrik[id] = null;
                element.main.style.cursor = "pointer";
                if(!CS.group[group]){
                    CS.group[group] = {
                        maxSelect:0,
                        rightTotalCount:0,
                        currentList:[],
                        memberList:[],
                        currentRightList:[],
                        currentWrongList:[],
                        currentEmptyList:[]
                    }
                }

                CS.group[group].memberList.push(id);

                if(answer[id]){
                    CS.group[group].maxSelect++;
                    CS.group[group].rightTotalCount++;
                }

                if(CS.selectMode === "all"){
                    CS.group[group].maxSelect = 1000;
                }

            }
        });

        if(SP.controlBtn || SP.completeBtn){
            CS.controlMode = true;
        }

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

        function maxSelect(id){
            var group = CS.Buton[id].group;
            var list = CS.group[group].currentList;
            if(list.length > CS.group[group].maxSelect){
                for(var i = (list.length-1); i > -1; i--){
                    var currentID = list[i];
                    if(CS.Buton[currentID].status !== "right"){
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
            for(var id in CS.Buton){
                var Buton = CS.Buton[id];
                if(Buton.status !== "right"){
                    defaultBtn(id);
                }
            }
        }

        function groupCloseControl(){
            var finish = true;
            CS.group.map(function(group){
                group.currentRightList=[];
                group.currentWrongList=[];
                group.currentEmptyList=[];
            });

            for(var id in CS.Buton){
                var Buton = CS.Buton[id];
                if(Buton.status === "right"){
                    CS.group[Buton.group].currentRightList.push(parseInt(id));
                }else if(Buton.status === "wrong"){
                    CS.group[Buton.group].currentWrongList.push(parseInt(id));
                }else if(Buton.status === "empty"){
                    CS.group[Buton.group].currentEmptyList.push(parseInt(id));
                }
            }

            CS.group.map(function(group, id){
                var currentRight = group.currentRightList.length;
                var currentWrong = group.currentWrongList.length;

                if(currentRight === group.rightTotalCount && !currentWrong){
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
                    This.sceneComplete();
                    This.scoreCalc(false);
                    This.nextScene();
                }
            }else{
                This.playWrongAudio();
                SD.wrong++;
                btnEvents("none");
                CS.Buton[id].csWrong.style.visibility = "visible";

                if(SD.wrong >= 3){
                    This.sceneComplete();
                    This.scoreCalc(false);
                }else{
                    evaluation.timer = setTimeout(function(){
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
            CS.Buton[id].ignore = true;
            inputsChange(SD, id, "value", true);
        }

        function selectBtn(btnID){
            CS.Buton[btnID].csRight.style.visibility = "hidden";
            CS.Buton[btnID].csWrong.style.visibility = "hidden";
            CS.Buton[btnID].csClick.style.visibility = "visible";
            inputsChange(SD, btnID, "value", true);

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
            inputsChange(SD, btnID, "value", null);

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
                if(SD.inputs["box"+id].value && CS.Buton[id].status === "wrong"){
                    wrongBtn(id);
                }
            }
        }

        function checkRightAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"cs"};

            for(var btnID in CS.Buton){
                if(CS.Buton[btnID].status !== "right"){
                    CS.Buton[btnID].status = "empty";
                }
            }

            if(CS.evaluationMode === "count"){
                for(var p in CS.group){
                    var listLength = CS.group[p].currentList.length;
                    var totalRight = CS.group[p].rightTotalCount;

                    if(!CS.group[p].currentList.length){
                        score.totalEmpty++;
                    }else if(listLength <= totalRight){
                        if(listLength === totalRight){
                            score.totalRight++;
                        } else if(listLength < totalRight){
                            score.totalWrong++;
                        }

                        CS.group[p].currentList.map(function(id){
                            rightBtn(id);
                            CS.Buton[id].status = "right";
                        });
                    }else{
                        score.totalWrong++;
                        CS.group[p].currentList.map(function(id){
                            if(CS.Buton[id].status !== "right"){
                                CS.Buton[id].status = "wrong";
                            }
                        });
                    }
                }
            }else{
                for(var id in rubrik){
                    if(rubrik[id]){
                        if(SD.inputs["box"+id].value){
                            score.totalRight++;
                            CS.Buton[id].status = "right";
                        }else{
                            score.totalEmpty++;
                            CS.Buton[id].status = "empty";
                        }
                    }else{
                        if(SD.inputs["box"+id].value){
                            score.totalWrong++;
                            CS.Buton[id].status = "wrong";
                        }else{
                            CS.Buton[id].status = "empty";
                        }
                    }
                }

                for(var gid in CS.group) {
                    var currentListCount = CS.group[gid].currentList.length;
                    var memberListCount = CS.group[gid].memberList.length;
                    var rightTotalCount = CS.group[gid].rightTotalCount;
                    if(currentListCount ===  memberListCount && rightTotalCount < memberListCount){
                        CS.group[gid].memberList.map(function(id){
                            if(!CS.group[gid].currentRightList.includes(id)){
                                CS.Buton[id].status = "wrong";
                            }
                        });
                    }
                }

            }

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
            groupCloseControl();
            partialRight();
        }

        function partialRight(){
            if(CS.evaluationMode !== "count"){
                for(var id in CS.Buton){
                    var Buton = CS.Buton[id];
                    if(Buton.status === "right"){
                        rightBtn(id);
                    }
                }
            }
        }

        function wrongActionFNC(){
            btnEvents("none");
            showAllWrong();

            returnDefault();
            groupCloseControl();
            partialRight();
        }

        function returnDefault(){
            evaluation.timer = setTimeout(function(){
                btnEvents("auto");
                allDefaultBtn();
                if(!PLX.isEKT) {
                    controlBtnView(SP, "enable");
                }
            }, 1000);
        }


        function answerActionFNC(){
            if(CS.evaluationMode === "count"){
                for(var groupID in CS.group){
                    groupID = parseInt(groupID);
                    var currentCount = CS.group[groupID].currentList.length;
                    var totalCount = CS.group[groupID].rightTotalCount;

                    for(var bid in CS.Buton){
                        bid = parseInt(bid);
                        var btnGroup = CS.Buton[bid].group;
                        if(groupID === btnGroup && !CS.group[groupID].currentList.includes(bid)){
                            if(currentCount < totalCount){
                                selectBtn(bid);
                                currentCount++;
                            }
                        }
                    }
                }
            }else{
                for(var id in rubrik){
                    var answer = rubrik[id];
                    var currentAnswer = SD.inputs["box"+ id].value;

                    if(answer && currentAnswer){
                        rightBtn(parseInt(id));
                    }else if(answer){
                        selectBtn(parseInt(id));
                    }else{
                        defaultBtn(parseInt(id));
                    }
                }
            }

            btnEvents("none");
            clearInterval(evaluation.timer);
        }

        function addHistory(){
            var lastMove = historyExtract(SP, 'cs');
            for(var box in lastMove){
                var id = lastMove[box].id;
                selectBtn(id);
            }
        }

        function reset(){
            for(var id in CS.Buton){
                defaultBtn(parseInt(id));
            }
        }

        function close(opacity){
            for(var id in CS.Buton){
                CS.Buton[id].main.style.pointerEvents = "none";
                if(opacity){
                    CS.Buton[id].main.style.opacity = 0.8;
                }
            }
        }

        var evaluation = {
            control: checkRightAnswer,
            wrong: wrongActionFNC,
            right: rightActionFNC,
            answer: answerActionFNC,
            history: addHistory,
            reset: reset,
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** init bd **/
    this.initBD = function(SP, SD, index){
        console.log("init BD");
        var allowedLetters = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
        var answer = jsonV2.slides[index].answer;
        var BD = {input:{}};
        var regexList = [];

        for(var param in jsonV2.slides[index].scene){
            if(param.includes('regex')){
                var id = parseInt(param.split('_')[1]);
                regexList[id] = jsonV2.slides[index].scene[param];
            }
        }

        function regexKontrol(regex, text){
            return regex.test(text);
        }

        function stringToRegex(str) {
            var match = str.match(/^\/(.+)\/([gimuy]*)$/);
            return match ? new RegExp(match[1], match[2]) : null;
        }

        function isRegexFNC(id){
            return regexList[id];
        }

        SP.elementList.forEach(function(element){
            if(element.id.includes("inputArea")){
                var id = parseInt(element.id.split("_")[1]);
                var regex = isRegexFNC(id);
                var finalRight;

                if(regex){
                    finalRight = [answer[id]];
                }else{
                    var bracket = ",";
                    if(answer[id].includes("|")){
                        bracket = "|";
                    }

                    var inputAnswer = answer[id].split(bracket);
                    finalRight = inputAnswer.map(function(answer) {
                        return answer.trim();
                    });

                    if(!element.data.sensitive){
                        finalRight = finalRight.map(function(answer){
                            return answer.toLocaleLowerCase("tr-TR");
                        });
                    }
                }

                BD.input[id] = {
                    main: element.main,
                    txt: element.main.querySelector(".bdText"),
                    bg: element.main.querySelector(".bdBg"),
                    count: element.data.count,
                    mode: element.data.mode,
                    rightAnswer: finalRight,
                    sensitive: element.data.sensitive,
                    format: element.data.format,
                    multiline: element.data.multiline,
                    events: true,
                    regex: regex
                };

                BD.input[id].bgColor = BD.input[id].bg.style.backgroundColor;
                convertInput(id);
            }
        });

        BD.inputLength = Object.keys(BD.input).length;

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
                border: 0,
                resize: "none"
            };

            if(BD.input[id].format){
                textAreaCSS.textTransform = BD.input[id].format;
            }

            BD.input[id].txt.remove();

            var input;
            if(BD.input[id].multiline){
                input = document.createElement("textarea");
                textAreaCSS.textAlign = "left";
                textAreaCSS.width = (parseInt(textAreaCSS.width)-10)+"px";
                textAreaCSS.height = (parseInt(textAreaCSS.height)-10)+"px";
                textAreaCSS.padding = "5px";
            }else{
                input = document.createElement("input");
            }

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

                inputsChange(SD, id, "value", this.value);
                controlBtnViewCheck();
                countCharacter(this, id);
            });
        }

        function countCharacter(input, currentID){
            var count = parseInt(BD.input[currentID].count);
            if(input.value.length === count){
                var nextID;
                for(var id in BD.input){
                    id = parseInt(id);
                    if(id  > currentID && !nextID){
                        nextID = id;
                    }
                }

                if(nextID){
                    BD.input[nextID].txt.focus();
                }
            }
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
            BD.input[id].bg.style.backgroundColor = BD.input[id].bgColor;
            BD.input[id].txt.value = "";
            inputsChange(SD, id, "value", "");
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
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"bd"};

            function commonFNC(i){
                var rightAnswer = BD.input[i].rightAnswer;
                var userAnswer =  SD.inputs["box"+ i].value;
                var sensitive = BD.input[i].sensitive;
                var status = "wrong";

                if(userAnswer && userAnswer.length){
                    if(BD.input[i].regex){
                        userAnswer = userAnswer.trim();
                        var regexConvert = new RegExp(BD.input[i].regex);

                        if(BD.input[i].regex.includes('/')){
                            regexConvert = stringToRegex(BD.input[i].regex);
                        }

                        var rightRegex = regexKontrol(regexConvert, userAnswer);
                        if(rightRegex){
                            status = "right";
                        }
                    }else{
                        var foundRight = false;
                        userAnswer = userAnswer.trim();
                        if(!sensitive){
                            userAnswer = userAnswer.toLocaleLowerCase("tr-TR");
                        }

                        rightAnswer.map(function(answer){
                            if(userAnswer === answer){
                                foundRight = true;
                            }
                        });

                        if(foundRight){
                            status = "right";
                        }
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
                    BD.input[i].status = "right";
                }else if(answer === "wrong"){
                    score.totalWrong++;
                    BD.input[i].status = "wrong";
                }else if(answer === "empty"){
                    score.totalEmpty++;
                    BD.input[i].status = "empty";
                }
            }

            return score;
        }

        function wrongActionFNC(){
            btnEvents("none");
            for(var i in BD.input){
                var status = BD.input[i].status;
                if(status === "right"){
                    showRightView(i);
                }else if(status === "wrong"){
                    showWrongView(i);
                }
            }

            evaluation.timer = setTimeout(function(){
                btnEvents("auto");
                showAllDefaultView();
                controlBtnViewCheck();
            }, 1000);
        }

        function answerActionFNC(){
            clearInterval(evaluation.timer);
            for(var i in BD.input){
                if(BD.input[i].events){
                    BD.input[i].txt.value = BD.input[i].rightAnswer[0];
                    BD.input[i].bg.style.backgroundColor = BD.input[i].bgColor;
                    btnEvents("none");
                }
            }
        }

        function addHistory(){
            var lastMove = historyExtract(SP, 'bd');
            for(var box in lastMove){
                var id = lastMove[box].id;
                BD.input[id].txt.value = lastMove[box].value;
            }
        }

        function reset(){
            for(var id in BD.input){
                showDefaultView(id);
            }
        }

        function close(){
            for(var i in BD.input){
                BD.input[i].txt.style.pointerEvents = 'none';
            }
        }

        var evaluation = {
            control: checkRightAnswer,
            wrong: wrongActionFNC,
            right: wrongActionFNC,
            answer: answerActionFNC,
            history: addHistory,
            reset: reset,
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** Add match **/
    this.initMATCH = function(SP, SD, index){
        console.log("init MATCH");
        var answer = jsonV2.slides[index].answer;
        var currentID, startPos, endPos, canvasOrigin;
        var rubrik = {};
        var BOX = {};
        var LA = [];
        var currentLine;
        var canvas;
        var globalColor;
        var statusArr;
        var returnColor = [];
        var borderColors = [
            "#e57373",
            "#aed581",
            "#ffb74d",
            "#ba68c8",
            "#7986cb",
            "#616161",
            "#4dd0e1",
            "#f06292",
            "#4fc3f7",
            "#fff176",
            "#9575cd",
            "#ffd54f",
            "#01a6ff",
            "#ff8a65",
            "#a1887f",
            "#4db6ac",
            "#e0e0e0",
            "#90a4ae"
        ];

        function getCSS(id, element, type){
            BOX[id] = {main: element.main, currentPairing: [], maxPairing: 0, type:0}
            BOX[id].type = type;
            BOX[id].left = parseInt(element.main.style.left);
            BOX[id].top = parseInt(element.main.style.top);
            BOX[id].width = element.main.offsetWidth;
            BOX[id].height = element.main.offsetHeight;
            BOX[id].widthEnd = BOX[id].left + BOX.width;
            BOX[id].heightEnd = BOX[id].top + BOX.height;
        }

        SP.elementList.forEach(function(element){
            var id;
            if(element.id.includes("matchDrop")){
                id = parseInt(element.id.split("_")[1]);
                getCSS(id, element, "drop");
                SD.inputs["box"+ id] = {value: [], type: "match"};
                rubrik[id] = answer[id].split(",");
            }else if(element.id.includes("matchDrag")){
                id = "d"+parseInt(element.id.split("_")[1]);
                getCSS(id, element, "drag");
            }else if(element.id.includes("canvas")){
                canvas = element;
                canvasOrigin = {
                    left: parseInt(canvas.main.style.left),
                    top: parseInt(canvas.main.style.top)
                }
            }
        });

        var stage = new Konva.Stage({
            container: canvas.id,
            width: canvas.main.offsetWidth,
            height: canvas.main.offsetHeight
        });

        var layer = new Konva.Layer();
        stage.add(layer);

        function addCanvasObject(id, BOX){
            BOX.canvas = new Konva.Rect({
                x: BOX.left-canvasOrigin.left,
                y: BOX.top-canvasOrigin.top,
                width: BOX.width,
                height: BOX.height,
                fill: "green",
                opacity: 0
            });

            BOX.x = BOX.canvas.x();
            BOX.y = BOX.canvas.y();
            BOX.width = BOX.canvas.width();
            BOX.height = BOX.canvas.height();
            BOX.widthEnd = (BOX.x + BOX.width);
            BOX.heightEnd = (BOX.y + BOX.height);
            BOX.status = true;

            BOX.canvas.on("mouseenter", function() {
                stage.container().style.cursor = 'url(https://cdn.okulistik.com/mobileplayer/edge_includes/examObject/visual/pencilcursor.png) -22 22, auto';
            });

            BOX.canvas.on("mouseleave", function() {
                if(!currentID){
                    stage.container().style.cursor = "default";
                }
            });

            BOX.canvas.on("mousedown touchstart", function() {
                currentID = id;
            });

            layer.add(BOX.canvas);
        }

        for(var id in BOX){
            addCanvasObject(id, BOX[id]);
        }

        stage.on("mousedown touchstart", function(){
            startPos = stage.getPointerPosition();
            globalColor = borderColors[utils.getRandomNumber(borderColors.length)];
        });

        stage.on("mouseup touchend", function(){
            if(currentID){
                pairingFNC();
            }
        });

        stage.on("mousemove touchmove", function (e) {
            if(currentID){
                currentLine.canvas.destroy();
            }else{
                return;
            }

            endPos = stage.getPointerPosition();
            currentCanvasLine(startPos, endPos);
            e.evt.preventDefault();
        });

        function pairingFNC(){
            var found = false;
            if(currentID && endPos !== undefined){
                for(var i in BOX){
                    if(currentID !== i){
                        if(endPos.x >= BOX[i].x && endPos.x <= BOX[i].widthEnd && endPos.y >= BOX[i].canvas.y() && endPos.y <= BOX[i].heightEnd){
                            if(BOX[currentID].type !== BOX[i].type && BOX[i].status){
                                var temp = [];
                                if(currentID.includes("d")){
                                    temp[0] = i;
                                    temp[1] = currentID;
                                }else{
                                    temp[0] = currentID;
                                    temp[1] = i;
                                }

                                found = pairControl(temp);
                                break;
                            }
                        }
                    }
                }
            }

            if(found){
                addNewLine();
                controlBtnViewCheck();
            }else{
                currentLine.canvas.destroy();
                stage.container().style.cursor = "default";
            }

            currentID = undefined;
            endPos = undefined;
        }


        function deleteBorder(deleteDragID){
            for(var x=0; x<LA.length; x++){
                if(LA[x].pair){
                    var dragID = LA[x].pair.split("-")[0];
                    var dropID = LA[x].pair.split("-")[1];

                    if(deleteDragID === dragID){
                        LA[x].canvas.destroy();
                        LA.splice(x, 1);
                        var drop = SD.inputs["box"+ dropID].value;
                        var deleteID = drop.indexOf(deleteDragID);
                        if(deleteID > -1){
                            drop.splice(deleteID, 1);
                            inputsChange(SD);
                        }
                        break;
                    }
                }
            }
        }

        function pairControl(pair){
            var dropID = pair[0];
            var currentDragID = pair[1].split("d")[1];
            var currentPair = currentDragID+"-"+dropID;
            var user = SD.inputs["box"+ dropID].value;
            var answer = rubrik[dropID];
            deleteBorder(currentDragID);

            if(user.length >= answer.length){
                var del = user.shift();
                deleteBorder(del);
            }

            user.push(currentDragID);
            currentLine.pair = currentPair;
            inputsChange(SD);
            return true;
        }

        function currentCanvasLine(startPos, endPos, extra){
            var border = {
                stroke: globalColor,
                opacity: 0.9,
                strokeWidth: 5,
                globalCompositeOperation: "source-over",
                lineCap: "round",
                points: [startPos.x, startPos.y, endPos.x, endPos.y],
                shadowBlur: 6,
                shadowOffset: { x: 3, y: 3 },
                shadowOpacity: 0.4
            }

            if(extra){
                Object.assign(border, extra);
            }

            currentLine.canvas = new Konva.Line(border);
            layer.add(currentLine.canvas);
            layer.draw();
        }

        function addNewLine(){
            LA.push( {canvas: new Konva.Line({}), pair:null} );
            currentLine = LA[LA.length-1];
        }

        addNewLine();

        function controlBtnViewCheck() {
            var found = false;
            for (var i in BOX) {
                if (!i.includes("d")) {
                    if (SD.inputs["box"+ i].value.length) {
                        found = true;
                    }
                }
            }

            if (found) {
                controlBtnView(SP, "enable");
            } else {
                controlBtnView(SP, "disable");
            }
        }

        function checkRightAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"match"};
            returnColor = [];
            statusArr = {};
            for(var i in rubrik){
                var user = SD.inputs["box"+ i].value;
                var right = true;

                if(user.length === 0){
                    score.totalEmpty++;
                }else{
                    rubrik[i].map(function(id){
                        if(!user.includes(id)){
                            right = false;
                        }
                    });

                    if(right){
                        score.totalRight++;
                        statusArr[i] = "right";
                    }else{
                        score.totalWrong++;
                        statusArr[i] = "wrong";
                    }
                }
            }

            return score;
        }

        function returnColorFNC(){
            if(returnColor.length){
                setTimeout(deleteWrongBorders, 1000);
            }
        }

        function deleteWrongBorders(){
            returnColor.map(function(line){
                line.canvas.destroy();
            });

            returnColor.map(function(line){
                for(var x=0; x<LA.length; x++){
                    if(line.pair === LA[x].pair){
                        LA.splice (x, 1);
                        break;
                    }
                }
            });
        }

        function wrongActionFNC(){
            for(var closeDropID in statusArr){
                var status = statusArr[closeDropID];
                LA.map(function(line){
                    if(line.pair){
                        var dragID = "d"+line.pair.split("-")[0];
                        var dropID = line.pair.split("-")[1];
                        if(dropID === closeDropID){
                            if(status === "right"){
                                BOX[dragID].canvas.off("mousedown mouseenter touchstart mouseleave");
                                BOX[dropID].canvas.off("mousedown mouseenter touchstart mouseleave");
                                BOX[dragID].main.style.opacity = 0.5;
                                BOX[dropID].main.style.opacity = 0.5;
                                BOX[dragID].status = false;
                                BOX[dropID].status = false;
                                line.canvas.stroke("#2e7d32").opacity(0.7);
                            }else{
                                returnColor.push(line);
                                var drop = SD.inputs["box"+ dropID].value;
                                dragID = line.pair.split("-")[0];
                                var deleteID = drop.indexOf(dragID);
                                if(deleteID > -1){
                                    drop.splice(deleteID, 1);
                                }

                                line.canvas.stroke("#b71c1c").opacity(0.7);
                                inputsChange(SD);
                            }
                        }
                    }
                });
            }

            returnColorFNC();
        }

        function answerActionFNC(){
            for(var answer in rubrik){
                if(BOX[answer].status){
                    rubrik[answer].map(function(rightDrag){
                        var drag = BOX["d"+rightDrag];
                        var drop = BOX[answer];

                        var dragX = (drag.left - canvasOrigin.left) + (drag.width/2);
                        var dragY = (drag.top - canvasOrigin.top) + (drag.height/2);
                        var dropX = (drop.left - canvasOrigin.left) + (drop.width/2);
                        var dropY = (drop.top - canvasOrigin.top) + (drop.height/2);
                        drag.canvas.off("mousedown mouseenter touchstart mouseleave");
                        drop.canvas.off("mousedown mouseenter touchstart mouseleave");
                        currentID = "d"+rightDrag;
                        startPos = {x:dragX, y:dragY};
                        endPos = {x:dropX, y:dropY};
                        currentCanvasLine(startPos, endPos, {dash: [33, 10], stroke: "#ffd740" });
                        pairingFNC();
                    });
                }
            }
        }

        function addHistory(){
            var lastMove = historyExtract(SP, 'match');

            for(var box in lastMove){
                var id = lastMove[box].id;
                lastMove[box].value.map(function(rightDrag){
                    var drag = BOX["d"+rightDrag];
                    var drop = BOX[id];

                    var dragX = (drag.left - canvasOrigin.left) + (drag.width/2);
                    var dragY = (drag.top - canvasOrigin.top) + (drag.height/2);
                    var dropX = (drop.left - canvasOrigin.left) + (drop.width/2);
                    var dropY = (drop.top - canvasOrigin.top) + (drop.height/2);

                    currentID = "d"+rightDrag;
                    globalColor = borderColors[utils.getRandomNumber(borderColors.length)];
                    startPos = {x:dragX, y:dragY};
                    endPos = {x:dropX, y:dropY};
                    currentCanvasLine(startPos, endPos);
                    pairingFNC();
                });
            }

        }

        function reset(){
            LA.map(function(line){
                line.canvas.destroy();
            });

            LA=[];

            for(var i in rubrik) {
                SD.inputs["box"+i].value = [];
            }

            addNewLine();
        }

        function close(){
            for(var i in BOX){
                BOX[i].canvas.off();
            }
        }

        var evaluation = {
            control: checkRightAnswer,
            wrong: wrongActionFNC,
            right: wrongActionFNC,
            answer: answerActionFNC,
            history: addHistory,
            reset: reset,
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** Add sb **/
    this.initSB = function(SP, SD, index){
        console.log("init SB");
        var bounds = {left:0, top:0, width:1280, height:720};
        var answer = jsonV2.slides[index].answer;
        var createDrag = false;

        if(jsonV2.slides[index].scene.createDrag){
            createDrag = jsonV2.slides[index].scene.createDrag === "true";
        }

        var rightAnswer = {};
        function rightAnswerParse(){
            for(var p in answer){
                rightAnswer[p] = [];
                var dropAnswers = stringSpaceDelete(answer[p]).split(",");
                dropAnswers.map(function(answer){
                    if(answer.includes("-")){
                        var answerOption = [];
                        var id = parseInt( answer.split("-")[0] );
                        var count = parseInt( answer.split("-")[1] );
                        for(var c=0; c<count; c++){
                            answerOption.push(id);
                        }

                        rightAnswer[p].push(answerOption);
                    }else{
                        if(!rightAnswer[p][0]){
                            rightAnswer[p].push([]);
                        }

                        rightAnswer[p][0].push(parseInt(answer));
                    }

                });
            }
        }

        rightAnswerParse();

        var dragCount=0;
        var dragList = {};
        var dropList = {};
        var cloneList = {};
        SP.elementList.map(function(element){
            var id;
            if(element.id.includes("boxDrag") || element.id.includes("gs_Drag")){
                var split = element.id.split("_");
                if(split.length === 2){
                    id = parseInt(split[1]);
                }else{
                    id = parseInt(split[2]);
                }

                if(!dragList[id]){
                    dragList[id] = {
                        drag: element.main,
                        position:[]
                    };
                }

                dragList[id].position.push({x: element.main.style.left, y: element.main.style.top});
                element.main.style.display = "none";
            }else if(element.id.includes("boxDrop")){
                id = parseInt(element.id.split("_")[1]);
                dropList[id] = {
                    drop: element.main,
                    background: element.main.querySelector(".boxbg"),
                    slot:[],
                    online: true
                };

                var childrenDrops =  element.main.children;
                for(var x=0; x<childrenDrops.length; x++){
                    var child = childrenDrops[x];
                    if(child.className.includes("drop")){
                        var mainPos = getPosition(element.main);
                        var childPos = getPosition(child);
                        var childClassList = child.className.split(" ");
                        var childDropID = childClassList[1].split("drop")[1];
                        if(!childDropID.length){
                            for(var s=0; s<childrenDrops.length; s++){
                                if(!dropList[id].slot[s]){
                                    childDropID = s;
                                    break;
                                }
                            }
                        }

                        dropList[id].slot[childDropID] = {
                            x: mainPos.left + childPos.left,
                            y: mainPos.top + childPos.top,
                            cloneID: null
                        }
                    }
                }

                SD.inputs["box"+ id] = {value: [], type: "sb"};
            }

            SP.screenCloseDOM.style.zIndex = 2000;
        });

        function dragControlFNC(drag, dragID, cloneID){
            var hitDrop = -1;
            for(var id in dropList){
                if (drag.hitTest(dropList[id].drop, "2%") && dropList[id].online){
                    hitDrop = id;
                }
            }

            if(hitDrop > -1){
                KontrolFNC(drag, dragID, cloneID, hitDrop, 0.2);
            }else{
                returnDrag(dragID, cloneID);
            }
        }

        function returnDrag(dragID, cloneID, noAnimation){
            var returnTime = 0.2;
            if(noAnimation){
                returnTime = 0;
            }

            clearSlotCloneID(cloneID);
            screeCloseFNC();

            if(dragList[dragID].position.length >= 2){
                for(var x=0; x<dragList[dragID].position.length; x++){
                    if(dragList[dragID].position[x].boxID.includes(cloneID)){
                        gsap.to(cloneList[cloneID], returnTime, {x: dragList[dragID].position[x].x, y: dragList[dragID].position[x].y});
                        break;
                    }
                }
            }else{
                gsap.to(cloneList[cloneID], returnTime, {x: dragList[dragID].position[0].x, y: dragList[dragID].position[0].y});
            }
        }

        function screeCloseFNC(){
            SP.screenCloseDOM.style.display = "block";
            setTimeout(function(){
                SP.screenCloseDOM.style.display = "none";
            }, 200);
        }

        function addCloneDrag(dragID){
            var currentIndex = (dragCount+1);
            var cloneDrag = dragList[dragID].drag.cloneNode(true);
            cloneDrag.style.display = "block";
            var cloneID = dragID +"_"+ dragCount;
            cloneDrag.id = "s"+ index +"-boxDrag_"+ cloneID;

            Draggable.create(cloneDrag, {
                type: "x,y",
                bounds,
                zIndexBoost: false,
                zIndexPress: currentIndex,
                onPress: function() {
                    this.target.style.zIndex = (dragCount+1);
                },
                onDragEndParams:[dragID, cloneID],
                onDragEnd:function(dragID, cloneID){
                    this.target.style.zIndex = currentIndex;
                    dragControlFNC(this, dragID, cloneID);
                }
            });

            setPosition(cloneDrag, 0, 0);
            gsap.to(cloneDrag, 0, {x: dragList[dragID].position[0].x, y: dragList[dragID].position[0].y});
            dragList[dragID].drag.insertAdjacentElement("afterend", cloneDrag);
            cloneList[cloneID] = cloneDrag;
            dragCount++;
            return cloneDrag;
        }

        function KontrolFNC(drag, dragID, cloneID, hitDrop, aniTime){
            clearSlotCloneID(cloneID);
            var found = false;
            var clone = cloneList[cloneID];
            for(var i=0; i<dropList[hitDrop].slot.length; i++){
                if(!dropList[hitDrop].slot[i].cloneID){
                    var position = dropList[hitDrop].slot[i];
                    gsap.to(clone, aniTime, {x: position.x, y: position.y});
                    screeCloseFNC();
                    position.cloneID = cloneID;
                    SD.inputs["box"+ hitDrop].value[i] = parseInt(dragID);
                    inputsChange(SD);
                    found = true;
                    break;
                }
            }

            if(found){
                cloneStatus();
            }else{
                hitDragTests(drag, dragID, cloneID, hitDrop);
            }

            controlBtnViewCheck();
        }


        function hitDragTests(drag, dragID, cloneID, hitDrop){
            var found = false;
            for(var i=0; i<dropList[hitDrop].slot.length; i++){
                var slot = dropList[hitDrop].slot[i];
                var slotCloneID = slot.cloneID;
                var cloneBtn = cloneList[slotCloneID];

                if (drag.hitTest(cloneBtn, "2%") && slot.status){
                    clearSlotCloneID(slotCloneID);
                    var slotMainDrag = slotCloneID.split("_")[0];
                    returnDrag(slotMainDrag, slotCloneID);
                    KontrolFNC(drag, dragID, cloneID, hitDrop, 0.2);
                    found = true;
                    break;
                }
            }

            if(!found){
                returnDrag(dragID, cloneID);
            }
        }


        function clearSlotCloneID(cloneID){
            for(var drop in dropList){
                dropList[drop].slot.map(function(e,i){
                    if(e.cloneID === cloneID){
                        e.cloneID = null;
                        SD.inputs["box"+ drop].value[i] = null;
                        inputsChange(SD);
                    }
                });
            }
        }


        function addQuickClone(){
            for(var id in dragList){
                dragList[id].position.map(function(drag){
                    drag.box = addCloneDrag(id);
                    drag.boxID = drag.box.id;
                    gsap.to(drag.box, 0, {x: drag.x, y: drag.y});
                });
            }
        }

        addQuickClone();

        function cloneStatus(){
            if(createDrag){
                var slotList = [];
                var klonList = [];
                var filter = [];
                for(var x in dropList){
                    dropList[x].slot.map(function(slot){
                        if(slot.cloneID){
                            slotList.push(slot.cloneID);
                        }
                    });
                }

                for(var cid in cloneList){
                    klonList.push(cid);
                }

                Object.keys(dragList).map(function(drag, index){
                    filter[index] = null;
                });

                slotList.map(function(slotCloneID){
                    var deleteIndex = klonList.indexOf(slotCloneID);
                    klonList.splice(deleteIndex, 1);
                });

                klonList.map(function(cloneID){
                    var mainDragID = cloneID.split("_")[0];
                    filter[mainDragID] = true;
                });

                filter.map(function(mainID, index){
                    if(!mainID){
                        addCloneDrag(index);
                    }
                });
            }
        }

        function controlBtnViewCheck() {
            var found = false;
            for(var i in dropList){
                var slot = dropList[i].slot;
                slot.map(function(slot){
                    if(slot.cloneID){
                        found = true;
                    }
                });
            }

            if (found) {
                controlBtnView(SP, "enable");
            } else {
                controlBtnView(SP, "disable");
            }
        }


        function checkAnswer(){
            var userAnswers = {};
            for(var i in dropList){
                var slot = dropList[i].slot;
                userAnswers[i] = [];
                slot.map(function(e){
                    if(e.cloneID){
                        var id = parseInt(e.cloneID.split("_")[0]);
                        userAnswers[i].push(id);
                        e.id = id;
                        e.status = true;
                    }
                });
            }

            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"sb"};

            for(var n in dropList){
                if(rightAnswer[n]){
                    if(!userAnswers[n].length){
                        score.totalEmpty++;
                    }else{
                        var grupControl;
                        for(var option=0; option<rightAnswer[n].length; option++){
                            if(rightAnswer[n].length === 1){
                                partialControlFNC(dropList[n].slot, rightAnswer[n][option]);
                            }

                            grupControl = checkArray(userAnswers[n], rightAnswer[n][option]);

                            if(grupControl){
                                if(rightAnswer[n].length > 1){
                                    partialControlFNC(dropList[n].slot, rightAnswer[n][option]);
                                }
                                break;
                            }
                        }

                        if(grupControl){
                            score.totalRight++;
                            dropList[n].generalStatus = "right";
                        }else{
                            score.totalWrong++;
                        }
                    }
                }else{
                    if(userAnswers[n].length){
                        score.totalWrong++;
                    }
                }
            }

            return score;
        }

        function partialControlFNC(drop, right) {
            var limitler = {};
            var sayaclar = {};
            var i, id;

            for(i=0; i<right.length; i++) {
                id = right[i];
                if (limitler[id]) {
                    limitler[id]++;
                } else {
                    limitler[id] = 1;
                }
            }

            for(i=0; i<drop.length; i++) {
                id = drop[i].id;
                if (limitler[id]) {
                    if (!sayaclar[id]) {
                        sayaclar[id] = 0;
                    }
                    sayaclar[id]++;

                    if(sayaclar[id] <= limitler[id]){
                        drop[i].status = false;
                    } else {
                        drop[i].status = true;
                    }
                }else{
                    drop[i].status = true;
                }
            }

            return drop;
        }

        function checkArray(A, B) {
            var countA = {};
            var countB = {};
            var i, num;

            for (i=0; i<A.length; i++) {
                num = A[i];
                countA[num] = (countA[num] || 0)+1;
            }

            for (i=0; i<B.length; i++) {
                num = B[i];
                countB[num] = (countB[num] || 0)+1;
            }

            for (num in countB) {
                if (!countA[num] || countA[num] < countB[num]) {
                    return false;
                }
            }

            return true;
        }

        function wrongActionFNC(status){
            for(var i in dropList){
                var slot = dropList[i].slot;
                if(dropList[i].generalStatus === "right"){
                    dropList[i].online = false;
                }

                slot.map(function(e){
                    if(e.cloneID){
                        if(!e.status){
                            cloneList[e.cloneID].style.opacity = 0.5;
                            Draggable.get( cloneList[e.cloneID] ).disable();
                            cloneList[e.cloneID].style.userSelect = "none";
                        }else{
                            var mainID = parseInt(e.cloneID.split("_")[0]);
                            returnDrag(mainID, e.cloneID);
                        }
                    }
                });

                if(!dropList[i].online){
                    /*
                    slot.map(function(e){
                        if(e.cloneID){
                            cloneList[e.cloneID].style.opacity = 0.5;
                            Draggable.get( cloneList[e.cloneID] ).disable();
                            cloneList[e.cloneID].style.userSelect = "none";
                        }
                    });
                    */
                    dropList[i].background.style.visibility = "visible";
                    dropList[i].background.style.backgroundColor = "green";
                }
            }

            if(status === "right"){
                for(var id in cloneList){
                    Draggable.get( cloneList[id] ).disable();
                }
            }else{
                evaluation.timer = setTimeout(controlBtnViewCheck, 1000);
            }
        }

        function usedClone(cloneID){
            var slotList=[];
            for(var id in dropList){
                dropList[id].slot.map(function(clone){
                    slotList.push(clone.cloneID);
                });
            }

            return slotList.includes(cloneID);
        }

        function reset(){
            for(var id in dropList){
                dropList[id].slot.map(function(clone){
                    if(clone.cloneID){
                        var dragID = clone.cloneID.split("_")[0];
                        cloneList[clone.cloneID].style.opacity = 1;
                        returnDrag(dragID, clone.cloneID, true);
                    }
                });
            }
        }

        function answerActionFNC(){
            reset();
            var tempAnswerList = convertRightAnswer(rightAnswer, "");
            var usedID=[];

            for(var hitDrop in dropList){
                var allRightAnswer;
                if(createDrag){
                    allRightAnswer = rightAnswer[hitDrop][0];
                }else{
                    for(var id in tempAnswerList[hitDrop]){
                        if(!tempAnswerList[hitDrop][id].used){
                            if(!allRightAnswer){
                                allRightAnswer = tempAnswerList[hitDrop][id].right;
                                usedID.push(allRightAnswer[0]);
                                tempAnswerList = convertRightAnswer(rightAnswer, usedID.toString());
                            }
                        }
                    }
                }

                allRightAnswer.map(function(rightDrag){
                    rightDrag = rightDrag.toString();
                    var foundClone = false;
                    for(var cloneID in cloneList){
                        var dragID = cloneID.split("_")[0];
                        if(rightDrag === dragID && !usedClone(cloneID) && !foundClone){
                            var drag = Draggable.get(cloneList[cloneID]);
                            KontrolFNC(drag, dragID, cloneID, hitDrop, 0);
                            drag.target.style.zIndex = drag.vars.zIndexPress;
                            foundClone = true;
                        }
                    }
                });
                allRightAnswer=null;
            }

            for(var cid in cloneList){
                var clone = Draggable.get(cloneList[cid]);
                clone.disable();
                cloneList[cid].style.userSelect = "none";
            }
        }

        function convertRightAnswer(arr, ids) {
            var result = {};
            var idArr = ids.split(",").map(function (v) {
                return parseInt(v, 10);
            });

            for (var key in arr) {
                if (arr.hasOwnProperty(key)) {
                    result[key] = [];

                    for (var i=0; i<arr[key].length; i++) {
                        var rightArr = arr[key][i];
                        var used = containsAny(rightArr, idArr);

                        result[key].push({
                            right: rightArr,
                            used: used
                        });
                    }
                }
            }

            return result;
        }

        function containsAny(source, target) {
            for (var i=0; i<target.length; i++) {
                if (source.indexOf(target[i]) !== -1) {
                    return true;
                }
            }
            return false;
        }


        function addHistory(){
            var lastMove = historyExtract(SP, 'sb');
            for(var box in lastMove){
                var groupID = lastMove[box].id;
                lastMove[box].value.map(function(userDragID){
                    for(var cloneID in cloneList){
                        var cloneDragID = parseInt(cloneID.split("_")[0]);
                        if(userDragID === cloneDragID){
                            var drag = Draggable.get(cloneList[cloneID]);
                            KontrolFNC(drag, userDragID, cloneID, groupID, 0);
                            drag.target.style.zIndex = drag.vars.zIndexPress;
                        }
                    }
                });
            }
        }

        function close(){
            for(var id in cloneList){
                cloneList[id].style.pointerEvents = 'none';
            }
        }

        function zindex(){
            return (dragCount+2);
        }

        var evaluation = {
            control: checkAnswer,
            wrong: wrongActionFNC,
            right: wrongActionFNC,
            answer: answerActionFNC,
            history: addHistory,
            zindex: zindex,
            reset: reset,
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** Add paint **/
    this.initPAINT = function(SP, SD, index){
        console.log("init PAINT");

        var drop = {};
        var selectedColor = "default";
        var defaultColorHex = "#ffffff";
        var colorPalette = {};
        var svgDOM = SP.sceneDiv.querySelector(".svg");
        var svgDOMLoad = false;
        var svgLink;
        var helpMode = true;
        var countMode = false;
        var groupMode = false;

        if(jsonV2.slides[index].scene.defaultColor){
            defaultColorHex = jsonV2.slides[index].scene.defaultColor;
        }

        function addBG(){
            var bg = document.createElement("div");
            Object.assign(bg.style,{
                left: "0px",
                top: "0px",
                width: "1280px",
                height: "720px",
                position: "absolute",
                backgroundColor: "rgba(0, 0, 0, 0)"
            });
            SP.sceneDiv.insertBefore(bg, SP.sceneDiv.firstChild);
        }

        function parseSVG(){
            if(svgDOM){
                svgLink = svgDOM.style.backgroundImage;
                var start = svgLink.indexOf("(")+2;
                var end = svgLink.indexOf(")")-1;
                svgLink = svgLink.substring(start, end);
                svgDOM.style.backgroundImage = null;

                $.ajax({
                    url: svgLink,
                    dataType: "html",
                    type: "GET",
                    success: function(data){
                        svgDOM.innerHTML = data;
                        var svgPaths = SP.sceneDiv.querySelector("svg");
                        for(var x=0; x<svgPaths.children.length; x++){
                            if(svgPaths.children[x].id.includes("paintBox")){
                                var id = parseInt(svgPaths.children[x].id.split("_")[1]);
                                var box = svgPaths.children[x];
                                addPaintBox(box, id, "svg");
                            }
                        }

                        if(svgDOMLoad){
                            addHistory();
                        }
                    }
                });
            }
        }

        addBG();
        parseSVG();

        SP.elementList.map(function(element){
            if(element.id.includes("colorBox")){
                var colorBoxMC = element.main;
                colorBoxMC.childNodes.forEach(function(rect){
                    if(rect.className.includes("color")){
                        var colorClass = rect.className.split(" ");
                        colorClass.forEach(function(style){
                            if(style.includes("color")){
                                var colorName = style.split("_")[1];
                                rect.innerHTML = '<img class="paint_check" src="assets/img/player/check.svg">';
                                colorPalette[colorName] = {box: rect, color: rect.style.backgroundColor, check: rect.querySelector(".paint_check"), limit:1000};
                                addcolorBtn(rect, colorName);
                            }
                        });
                    }else if(rect.className.includes("easer")){
                        addEaserBtn(rect);
                    }
                });
            }else if(element.id.includes("paintBox")){
                var id = parseInt(element.id.split("_")[1]);
                var box = element.main.querySelector(".paintBox");
                addPaintBox(box, id, "html");
            }
        });

        function addPaintBox(box, id, type){
            var correctAnswer = jsonV2.slides[index].answer[id];
            var strokeColor, strokeWidth;

            if(type === "svg"){
                strokeColor = window.getComputedStyle(box).stroke;
                strokeWidth = window.getComputedStyle(box).strokeWidth;
            }else{
                strokeColor = box.style.outlineColor;
                strokeWidth = box.style.outlineWidth;
                if(!strokeWidth || strokeWidth===""){
                    strokeWidth = 0;
                }
            }

            drop[id] = {
                box: box,
                correctAnswer: correctAnswer,
                currentStatus: "",
                tempStatus:"",
                strokeColor: strokeColor,
                strokeWidth: strokeWidth
            };


            addDropBoxEvent(box, id);
            SD.inputs["box" + id] = {value: null, type: "paint"};
            gsap.to(box, 0, {fill: selectedColor});
        }

        /* New Code Start*/
        var countGroup={};
        var sameGroup=[];
        function rightAnswerCenterFNC(){
            for(var p in jsonV2.slides[index].scene){
                if(p.includes("count")){
                    var colorGroup = p.split("_")[1];
                    if(!countGroup[colorGroup]){
                        countGroup[colorGroup] = parseInt(jsonV2.slides[index].scene[p]);
                    }
                    countMode = true;
                }else if(p.includes("mode")){
                    groupMode = true;
                    SP.elementList.map(function(obj, id){
                        if(valueControl(obj.data.group)){
                            var group = parseInt(obj.data.group);
                            if(obj.id.includes("paintBox")){
                                var butonID = parseInt( obj.id.split("_")[1] );
                                if(!sameGroup[group]){
                                    sameGroup[group] = {box:[], lockColor: '', id:id};
                                }

                                sameGroup[group].box.push(butonID);
                            }
                        }
                    });
                }
            }

            if(countMode){
                for(var x in drop){
                    if(drop[x].correctAnswer){
                        delete SP.tempAnswer[x];
                    }else{
                        if(!countGroup.ignore){
                            countGroup.ignore = 0;
                        }

                        countGroup.ignore++;
                    }
                }

                for(var type in countGroup){
                    SP.tempAnswer[type] = "auto";
                }
            }else if(groupMode){
                sameGroup.map(function(group, id){
                    SP.tempAnswer["auto"+id] = "auto";
                });
            }
        }

        rightAnswerCenterFNC();


        function colorLimitAdd(){
            for(var p in jsonV2.slides[index].scene){
                if(p.includes("limit")){
                    var color = p.split("_")[1];
                    if(colorPalette[color]){
                        colorPalette[color].limit = parseInt(jsonV2.slides[index].scene[p]);
                    }
                }
            }
        }
        colorLimitAdd();

        function colorLimitCheck(){
            var usedColor = {};
            for(var id in drop){
                var userColor = SD.inputs["box"+id].value;
                if(userColor){
                    if(!usedColor[userColor]){
                        usedColor[userColor] = 0
                    }
                    usedColor[userColor]++;
                }
            }

            for(var color in colorPalette){
                if(usedColor[color] >= colorPalette[color].limit){
                    colorPalette[color].box.style.opacity = 0.3;
                    colorPalette[color].box.style.pointerEvents = "none";
                    if(color === selectedColor){
                        selectedColor = null;
                        selectColor(null);
                        SP.sceneDiv.style.cursor = "default";
                    }
                }else{
                    colorPalette[color].box.style.opacity = 1;
                    colorPalette[color].box.style.pointerEvents = "auto";
                }
            }

            return usedColor;
        }


        function countCheckAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"paint"};
            var userCount={};
            var absoluteRight=[];

            for(var color in colorPalette){
                userCount[color] = [];
            }

            for(var x in drop){
                if(drop[x].correctAnswer && drop[x].correctAnswer !== "all"){
                    absoluteRight.push(drop[x].correctAnswer);
                }
            }

            userCount.all = [];
            userCount.ignore = [];

            for(var id in drop) {
                var userColor = SD.inputs["box"+id].value;
                if(userColor){
                    if(drop[id].correctAnswer === "all"){
                        if(countGroup[userColor] && !absoluteRight.includes(userColor)){
                            userCount[userColor].push(id);
                        }else if(!drop[id].correctAnswer){
                            userCount.ignore.push(id);
                        }else{
                            userCount.all.push(id);
                        }
                    }else if(userColor === drop[id].correctAnswer){
                        userCount[userColor].push(id);
                    }else if(!drop[id].correctAnswer){
                        userCount.ignore.push(id);
                    }else{
                        userCount[userColor].push(id);
                    }
                }else if(!drop[id].correctAnswer){
                    userCount.ignore.push(id);
                }
            }

            for(var group in countGroup) {
                if(userCount[group].length === 0){
                    score.totalEmpty++;
                }else if(userCount[group].length === countGroup[group]){
                    score.totalRight++;
                    if(group !== "ignore"){
                        userCount[group].map(function(id){
                            drop[id].currentStatus = "right";
                        });
                    }
                }else{
                    if(group !== "ignore"){
                        if(userCount[group].length < countGroup[group]){
                            userCount[group].map(function(id){
                                drop[id].currentStatus = "right";
                            });
                        }
                    }
                    score.totalWrong++;
                }
            }

            return score;
        }
        /* New Code Finish*/


        /* Add Events */
        function addDropBoxEvent(dropBox, id){
            dropBox.addEventListener("click", function(){
                setColorFNC(this, id);
            });
        }

        function addcolorBtn(colorBtn, colorName){
            colorBtn.addEventListener("click", function(){
                selectColor(colorName);
                selectedColor = colorName;
                showModeCursor();
                clearPointerIcon(null);
            });
        }

        function addEaserBtn(easer){
            easer.addEventListener("click", function(){
                selectColor(null);
                selectedColor = "default";
                SP.sceneDiv.style.cursor = `url("assets/img/cursors/eraser_cursor.png") -22 22, auto`;
            });
        }

        /* Set */
        function selectColor(color){
            for(var i in colorPalette){
                colorPalette[i].check.style.display = "none";
            }

            if(color){
                colorPalette[color].check.style.display = "block";
            }
        }

        selectColor(null);

        function setColorFNC(dropBox, id){
            if(selectedColor){
                if(drop[id].currentStatus !== "right"){
                    var currentColor = colorPalette[selectedColor];
                    if(currentColor){
                        currentColor = currentColor.color;
                    }else{
                        currentColor = defaultColorHex;
                    }

                    gsap.to(dropBox, 0.4, {fill: currentColor, backgroundColor: currentColor});
                    if(selectedColor === "default"){
                        inputsChange(SD, id, "value", undefined);
                    }else{
                        inputsChange(SD, id, "value", selectedColor);
                    }

                    controlBtnViewCheck();
                    colorLimitCheck();
                }
            }
        }

        function showModeCursor(){
            SP.sceneDiv.style.cursor = `url("assets/img/cursors/${selectedColor}_cursor.png") -22 22, auto`;
        }


        function clearPointerIcon(type){
            for(var id in colorPalette){
                colorPalette[id].box.style.cursor = type;
            }
        }

        clearPointerIcon("pointer");

        function checkAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"PAINT"};
            for(var id in drop){
                if(drop[id].correctAnswer){
                    if(!SD.inputs["box"+id].value){
                        score.totalEmpty++;
                        drop[id].tempStatus = "empty";
                    }else if(SD.inputs["box"+id].value === drop[id].correctAnswer){
                        score.totalRight++;
                        drop[id].tempStatus = "right";
                    }else{
                        score.totalWrong++;
                        drop[id].tempStatus = "wrong";
                    }
                }else{
                    if(SD.inputs["box"+id].value){
                        score.totalWrong++;
                        drop[id].tempStatus = "wrong";
                    }
                }
            }

            return score;
        }

        function controlAfterFNC(status){
            /* HDE icin buton etkilesimi kapatilmasin */
            for(var box in drop){
                if(drop[box].tempStatus.length){
                    drop[box].currentStatus = drop[box].tempStatus;
                    drop[box].tempStatus="";
                }
            }

            if(helpMode){
                for(var id in drop){
                    drop[id].box.style.pointerEvents = "none";
                    var borderRight = {outline: "green solid 4px"};
                    var borderWrong = {outline: "red solid 4px"};

                    if(svgDOM){
                        borderRight = {strokeWidth: 4, stroke: "green"};
                        borderWrong = {strokeWidth: 4, stroke: "red"};
                    }

                    if(drop[id].currentStatus === "right"){
                        gsap.to(drop[id].box, 0, borderRight);
                    }else if(drop[id].currentStatus === "wrong"){
                        gsap.to(drop[id].box, 0, borderWrong);
                        inputsChange(SD, id, "value", null);
                    }
                }

                if(status !== "right"){
                    evaluation.timer = setTimeout(resetStroke, 1000);
                }

            }else{
                if(status === "right"){
                    for(var id in drop){
                        drop[id].box.style.pointerEvents = "none";
                    }
                }else{
                    for(var id in drop){
                        drop[id].currentStatus = "";
                    }

                    controlBtnViewCheck();
                }
            }

            colorLimitCheck();
        }

        function resetStroke(){
            for(var id in drop){
                if(drop[id].currentStatus === "right"){
                    gsap.to(drop[id].box, 0.4, {strokeWidth:4, opacity:0.7});
                }else{
                    drop[id].currentStatus = "";
                    drop[id].box.style.pointerEvents = "auto";
                    gsap.to(drop[id].box, 0, {backgroundColor:defaultColorHex, fill:defaultColorHex, stroke: drop[id].strokeColor, strokeWidth: drop[id].strokeWidth, outlineColor: drop[id].strokeColor, outlineWidth:drop[id].strokeWidth});
                    inputsChange(SD, id, "value", undefined);
                }
            }

            controlBtnViewCheck();
        }

        function answerActionFNC(){
            var usedColor = colorLimitCheck();
            for(var id in drop){
                drop[id].box.style.pointerEvents = "none";
                selectColor(null);

                var answer = drop[id].correctAnswer;
                if(answer === "all"){
                    for(var color in colorPalette){
                        if(!usedColor[color]){
                            usedColor[color]=0;
                        }

                        if(usedColor[color] <= colorPalette[color].limit){
                            answer = color;
                            usedColor[color]++;
                        }
                    }
                }else{
                    if(!answer){
                        answer = defaultColorHex;
                    }
                }

                gsap.to(drop[id].box, 0, {
                    backgroundColor: defaultColorHex,
                    fill: defaultColorHex,
                    stroke: drop[id].strokeColor,
                    strokeWidth: drop[id].strokeWidth,
                    outlineColor: drop[id].strokeColor,
                    outlineWidth:drop[id].strokeWidth,
                    opacity:1
                });


                if(svgDOM){
                    gsap.to(drop[id].box, 0, {fill: answer});
                }else{
                    gsap.to(drop[id].box, 0, {backgroundColor: answer});
                }
            }
        }

        function CountAnswerFNC(){
            selectColor(null);
            for(var id in drop){
                drop[id].box.style.pointerEvents = "none";
                var answer;
                var allColor=[];
                for(var color in colorPalette){
                    allColor.push(color);
                }

                if(drop[id].correctAnswer === "all"){
                    answer = allColor[Math.floor(Math.random() * allColor.length)];
                }else{
                    answer = drop[id].correctAnswer;
                }

                gsap.to(drop[id].box, 0, {
                    backgroundColor: defaultColorHex,
                    fill: defaultColorHex,
                    stroke: drop[id].strokeColor,
                    strokeWidth: drop[id].strokeWidth,
                    outlineColor: drop[id].strokeColor,
                    outlineWidth:drop[id].strokeWidth,
                    opacity:1
                });


                if(svgDOM){
                    gsap.to(drop[id].box, 0, {fill: answer});
                }else{
                    gsap.to(drop[id].box, 0, {backgroundColor: answer});
                }
            }
        }

        function sameColorControl(colorArray, rightGroup){
            var same = 'right';

            for (var i=1; i<colorArray.length; i++) {
                if (colorArray[i] !== colorArray[0]) {
                    same = 'wrong';
                    break;
                }
            }

            if(same && (colorArray.includes(null) || colorArray.includes(undefined)) ){
                same='empty';
            }

            return same;
        }

        function colorSearch(currentList){
            var found=false;
            var color = currentList[0];
            sameGroup.map(function(group){
                if(group.lockColor === color){
                    found=true;
                }
            });

            return found;
        }

        function groupCheckAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"PAINT"};

            sameGroup.map(function(group){
                var currentGroup=[];

                group.box.map(function(id){
                    var currentColor = SD.inputs["box"+id].value;
                    currentGroup.push(currentColor);
                });

                var result = sameColorControl(currentGroup);
                if(result === 'right' && colorSearch(currentGroup) && !group.lockColor){
                    result = 'wrong';
                }


                if(result === 'right'){
                    score.totalRight++;
                    group.box.map(function(id){
                        drop[id].currentStatus = "right";
                    });

                    group.lockColor = currentGroup[0];
                }else if(result === 'wrong'){
                    score.totalWrong++;
                }else{
                    score.totalEmpty++;
                }
            });

            return score;
        }

        function groupAnswerFNC(){
            selectColor(null);
            var allColor=[];
            for(var color in colorPalette){
                allColor.push(color);
            }

            for(var id in drop){
                drop[id].box.style.pointerEvents = "none";
                var answer=defaultColorHex;

                gsap.to(drop[id].box, 0, {
                    backgroundColor: defaultColorHex,
                    fill: defaultColorHex,
                    stroke: drop[id].strokeColor,
                    strokeWidth: drop[id].strokeWidth,
                    outlineColor: drop[id].strokeColor,
                    outlineWidth:drop[id].strokeWidth,
                    opacity:1
                });

                if(svgDOM){
                    gsap.to(drop[id].box, 0, {fill: answer});
                }else{
                    gsap.to(drop[id].box, 0, {backgroundColor: answer});
                }
            }

            var colorID=0;
            sameGroup.map(function(group){
                var answer;
                group.box.map(function(id){
                    answer = allColor[colorID];

                    if(svgDOM){
                        gsap.to(drop[id].box, 0, {fill: answer});
                    }else{
                        gsap.to(drop[id].box, 0, {backgroundColor: answer});
                    }
                });
                colorID++;
            });
        }

        function controlBtnViewCheck() {
            var found = false;
            for(var i in SD.inputs){
                if(SD.inputs[i].value){
                    found = true;
                }
            }

            if (found) {
                controlBtnView(SP, "enable");
            } else {
                controlBtnView(SP, "disable");
            }
        }

        function addHistory(){
            if(svgDOM){
                SD.inputs = JSON.parse(JSON.stringify(SP.history[0]));
                if(!svgDOMLoad){
                    svgDOMLoad = true;
                    return true;
                }
            }

            var lastMove = historyExtract(SP, 'paint');
            for(var box in lastMove){
                var currentColor = lastMove[box].value;
                if(colorPalette[currentColor]){
                    var id = lastMove[box].id;
                    gsap.to(drop[id].box, 0, {fill: currentColor, backgroundColor: currentColor});
                    selectedColor = null;
                }
            }
        }

        function reset(){
            selectColor(null);
            SP.sceneDiv.style.cursor = "default";

            for(var id in drop){
                gsap.to(drop[id].box, 0, {
                    backgroundColor: defaultColorHex,
                    fill: defaultColorHex,
                    stroke: drop[id].strokeColor,
                    strokeWidth: drop[id].strokeWidth,
                    outlineColor: drop[id].strokeColor,
                    outlineWidth:drop[id].strokeWidth,
                    opacity:1
                });

                inputsChange(SD, id, "value", null);
            }
        }

        function close(){
            for(var id in drop){
                drop[id].box.style.pointerEvents = 'none';
            }

            for(var i in colorPalette){
                colorPalette[i].box.style.pointerEvents = 'none';
            }

            SP.sceneDiv.style.cursor = "default";
        }

        var evaluation = {
            history: addHistory,
            right: controlAfterFNC,
            wrong: controlAfterFNC,
            reset: reset,
            close: close
        }

        if(countMode){
            evaluation.control = countCheckAnswer;
            evaluation.answer = CountAnswerFNC;
        } else if(groupMode){
            evaluation.control = groupCheckAnswer;
            evaluation.answer = groupAnswerFNC;
        } else{
            evaluation.control = checkAnswer;
            evaluation.answer = answerActionFNC;
        }

        SP.fnc.push(evaluation);
    }

    /** Add sort **/
    this.initSORT = function(SP, SD, index){
        console.log("init SORT");
        var SR = {};
        var activeButonID = -1;
        var answer = jsonV2.slides[index].answer;
        var helpMode = true;

        function getFirstDrag(){
            var children = SP.sceneDiv.children;
            for(var x=0; x<children.length; x++){
                if (children[x].id.includes("sortDrag")){
                    return children[x];
                }
            }
        }

        var firstChildrenDrag = getFirstDrag();
        var setDrop = {};

        var dragCount=0;
        SP.elementList.map(function(element){
            if(element.id.includes("sortDrag")){
                dragCount++;
                var drag = element.main;
                var bid = parseInt( element.id.split("_")[1] );
                var gid = parseInt( element.data.group );

                if(!SR[gid]){
                    SR[gid] = {drag:{}, drop:{}, start:null, list:{}, reset:{}, allDragID:[], status:"", statusBorder:null}
                    setDrop[gid] = {start:null, drag:[]}
                    SD.inputs["box"+gid] = {value: [], type:"sort"};

                    if(answer[gid]){
                        SR[gid].correctAnswer = answer[gid].split(",");
                    }else{
                        SR[gid].correctAnswer = [];
                    }
                }

                var gsapDraggable = Draggable.create(drag, {
                    type: "x,y",
                    bounds: SR[gid].area,
                    zIndexBoost: false,
                    onPressParams:[bid, gid],
                    onDragParams:[bid, gid, false],
                    onDragEndParams:[bid, gid, true],
                    onPress: function() {
                        this.target.style.zIndex = dragCount;
                    },
                    onDrag:function(bid, gid, dragEnd){
                        dragControlFNC(this, bid, gid, dragEnd);
                    },
                    onDragEnd:function(bid, gid, dragEnd){
                        this.target.style.zIndex = 'unset';
                        dragControlFNC(this, bid, gid, dragEnd);
                    }
                });

                var dragPos = getPosition(drag);
                SR[gid].allDragID.push(bid);

                var props = {
                    left: dragPos.left,
                    top: dragPos.top,
                    dom: drag,
                    gsapDraggable: gsapDraggable,
                    groupID: gid,
                    butonID: bid
                }

                setDrop[gid].drag.push(props);
                SR[gid].drag[bid] = props;
                setPosition(drag, 0, 0);

                gsap.to(drag, 0, {x: dragPos.left, y: dragPos.top});
            }
        });

        function addBorder(bounds){
            var border = document.createElement("div");
            var modifiedLeft = bounds.left-6;
            var modifiedTop = bounds.top-6;
            var modifiedWidth = bounds.width+10;
            var modifiedHeight = bounds.height+10;

            Object.assign(border.style, {
                left: modifiedLeft +"px",
                top: modifiedTop +"px",
                width: modifiedWidth +"px",
                height: modifiedHeight +"px",
                border: "2px solid #ff0000",
                borderRadius: "10px",
                position: "absolute",
                visibility: "hidden"
            });

            SP.sceneDiv.insertBefore(border, firstChildrenDrag);
            return border;
        }

        function addDropArea(){
            for(var section in setDrop){
                sortObject(setDrop[section].drag, "left");
                var bounds = addBound( setDrop[section].drag );
                SR[section].statusBorder = addBorder(bounds);

                if(bounds.width < bounds.height){
                    sortObject(setDrop[section].drag, "top");
                }

                if(jsonV2.slides[index].scene["group"+section] === "horizontal"){
                    sortObject(setDrop[section].drag, "left");
                }else if(jsonV2.slides[index].scene["group"+section] === "vertical"){
                    sortObject(setDrop[section].drag, "top");
                }

                sortArray(SR[section].allDragID);
                setDrop[section].drag.map(function(drag, i){
                    var startID = SR[section].allDragID[i];
                    var area = document.createElement("div");
                    area.id = "s"+ index +"-sortDrop_"+ startID;

                    Object.assign(area.style, {
                        left: drag.left+"px",
                        top: drag.top+"px",
                        width: drag.dom.style.width,
                        height: drag.dom.style.height,
                        position: "absolute"
                    });

                    SP.sceneDiv.insertBefore(area, firstChildrenDrag);
                    SR[ drag.groupID ].drop[startID] = {dom: area, left: drag.left, top: drag.top};
                });

            }

            hitDrag();
        }

        function addBound(drag){
            var allLeft = [];
            var allTop = [];
            var allWidth = [];
            var allHeight = [];

            drag.map(function(e){
                allLeft.push(e.left);
                allTop.push(e.top);
                allWidth.push(e.left + parseInt(e.dom.style.width));
                allHeight.push(e.top + parseInt(e.dom.style.height));
            });

            sortArray(allLeft);
            sortArray(allTop);
            sortArray(allWidth);
            sortArray(allHeight);

            var startX = allLeft[0];
            var startY = allTop[0];
            var last =  drag.length-1;

            var dragWidth = (allWidth[last]);
            var dragHeight = (allHeight[last]);

            var width = (dragWidth - startX);
            var height = (dragHeight - startY);
            return {left: startX, top: startY, width: width, height: height};
        }

        function hitDrag(){
            for(var section in SR){
                SR[section].bounds = addBound(setDrop[section].drag);

                for(var dragID in SR[section].drag){
                    var drag = SR[section].drag[dragID].gsapDraggable;
                    drag[0].applyBounds( SR[section].bounds );

                    for(var dropID in SR[section].drop){
                        var drop = SR[section].drop[dropID].dom;

                        if(drag[0].hitTest(drop, "80%")){
                            SR[section].list[dropID] = parseInt(dragID);
                            SR[section].reset[dropID] = parseInt(dragID);
                        }
                    }
                }
            }
        }

        addDropArea();

        function dragControlFNC(btn, bid, gid, dragEnd){
            var dropID = -1;
            var dropList = SR[gid].drop;
            var drag = SR[gid].drag[bid].dom;
            var list = SR[gid].list;

            for(var p in dropList){
                if(dropID === -1){
                    if(btn.hitTest(dropList[p].dom, "50%")){
                        dropID = p;
                    }
                }
            }

            if(dropID > -1){
                KontrolEtFNC(true, drag, bid, gid, dropID, dragEnd, list, 0.2);
            }else{
                KontrolEtFNC(false, drag, bid, gid, dropID, dragEnd, list, 0.2);
            }
        }

        function KontrolEtFNC(hitTest, drag, bid, gid, dropID, dragEnd, list, aniTime){
            if(activeButonID !== bid){
                selectedButonEfectAni(drag);
                activeButonID = bid;
            }

            if(hitTest){
                var curDrop = parseInt(findValueInObject(list, bid));
                var newDrop = parseInt(dropID);

                if(curDrop !== newDrop){
                    var curValue = list[curDrop];
                    var newValue = list[newDrop];

                    list[curDrop] = newValue;
                    list[newDrop] = curValue;

                    for(var drop in list){
                        if(bid !== list[drop]){
                            gsap.to(SR[gid].drag[ list[drop] ].dom, aniTime, { x: SR[gid].drop[drop].left, y: SR[gid].drop[drop].top });
                        }
                    }
                }
            }

            if(dragEnd){
                var dragIndex = findValueInObject(list, bid);
                returnBtnAni(drag, gid, dragIndex);

                SD.inputs["box"+gid].value=[];
                for(var p in list){
                    SD.inputs["box"+gid].value.push(list[p]);
                }

                controlBtnView(SP, "enable");
                inputsChange(SD);
            }
        }

        function selectedButonEfectAni(drag){
            gsap.to(drag, 0.2, {boxShadow: "rgba(0,0,0,0.2) 0px 16px 32px 0px", scale: 1.1, transformOrigin:"50% 50%"});
        }

        function returnBtnAni(drag, gid, dropID){
            gsap.to(drag, 0.2, {x: SR[gid].drop[dropID].left, y: SR[gid].drop[dropID].top, boxShadow:"rgba(0,0,0,0.2) 0px 0px 0px 0px", scale: 1.0});
            activeButonID = -1;
        }

        function findValueInObject(obj, targetValue){
            for (let key in obj) {
                if (obj[key] === targetValue) {
                    return key;
                }
            }
            return null;
        }

        function checkAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"sort"};

            for(var section in SR){
                var user = SD.inputs["box"+section].value;

                if(user.length){
                    var right = true;
                    SR[section].correctAnswer.map(function(correct, index){
                        if(user[index] !== parseInt(correct)){
                            right = false;
                        }
                    });

                    if(right){
                        score.totalRight++;
                        SR[section].status = "right";
                    }else{
                        score.totalWrong++;
                        SR[section].status = "wrong";
                    }
                }else{
                    score.totalEmpty++;
                    SR[section].status = "empty";
                }
            }

            return score;
        }

        function afterAction(){
            if(helpMode){
                closeGroup();
            }
        }

        function showAnwers(){
            for(var section in SR){
                SR[section].correctAnswer.map(function(dragID, index){
                    var drag = SR[section].drag[dragID].dom;
                    var id = SR[section].allDragID[index];
                    gsap.to(drag, 0, {x: SR[section].drop[id].left, y: SR[section].drop[id].top, boxShadow:"rgba(0,0,0,0.2) 0px 0px 0px 0px", scale: 1.0});
                    drag.style.pointerEvents = "none";
                });

            }
        }

        function closeGroup(){
            for(var section in SR){
                if(SR[section].status === "right"){
                    SR[section].statusBorder.style.visibility = "visible";
                    SR[section].statusBorder.style.borderColor = "green";

                    for(var id in SR[section].drag){
                        SR[section].drag[id].dom.style.pointerEvents = "none";
                        SR[section].drag[id].dom.style.opacity = 0.75;
                    }
                }else if(SR[section].status === "wrong"){
                    SR[section].statusBorder.style.visibility = "visible";
                    SR[section].statusBorder.style.borderColor = "red";
                }
            }

            setTimeout(resetGroup, 1000);
        }

        function resetGroup(){
            for(var section in SR){
                if(SR[section].status === "wrong"){
                    SR[section].statusBorder.style.visibility = "hidden";
                }
            }
        }

        function addHistory(){
            var lastMove = historyExtract(SP, "sort");

            for(var box in lastMove){
                var section = lastMove[box].id;
                if(SR[section]){
                    lastMove[box].value.map(function(dragID, id){
                        id = SR[section].allDragID[id];
                        var dragBtn = SR[section].drag[dragID].dom;
                        var dragXpos =  SR[section].drop[id].left;
                        var dragYpos =  SR[section].drop[id].top;
                        gsap.to(dragBtn, 0, {x: dragXpos, y: dragYpos , boxShadow:"rgba(0,0,0,0.2) 0px 0px 0px 0px", scale: 1.0});
                        SR[section].list[id] = dragID;
                    });
                }
            }
        }

        function reset(){
            for(var section in SR){
                for(var dropID in SR[section].reset){
                    var dragID = SR[section].reset[dropID];
                    var drag = SR[section].drag[dragID].dom;
                    var id = dropID;
                    gsap.to(drag, 0, {x: SR[section].drop[id].left, y: SR[section].drop[id].top, boxShadow:"rgba(0,0,0,0.2) 0px 0px 0px 0px", scale: 1.0});
                    SR[section].list[dropID] = dragID;
                }
            }
        }

        function close(){
            for(var section in SR){
                for(var did in SR[section].drag){
                    var drag = SR[section].drag[did].dom;
                    drag.style.pointerEvents = 'none'
                }
            }
        }

        /*
        function controlBtnViewCheck() {
            var found = false;
            for(var i in dropList){
                var slot = dropList[i].slot;
                slot.map(function(slot){
                    if(slot.cloneID){
                        found = true;
                    }
                });
            }

            if (found) {
                controlBtnView(SP, "enable");
            } else {
                controlBtnView(SP, "disable");
            }
        }
        */

        var evaluation = {
            control: checkAnswer,
            wrong: afterAction,
            right: afterAction,
            answer: showAnwers,
            history: addHistory,
            reset: reset,
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** Add Video **/
    this.initVIDEO = function(SP, SD, index){
        console.log("init VIDEO");
        var endFNC = function(){
            This.scoreCalc(true);
            This.nextScene();
        }

        var watchedFNC = function(){
            SD.complete = true;
            This.scoreCalc(true);
            checkViewFNC(SD);
        }

        var metaDataFNC = function(duration){
            SP.consDuration = duration;
            sendDuration();
        }

        SP.elementList.map(function(element){
            var videoProp;
            if(element.id.includes("videoBox")){
                var videoWidth = element.main.offsetWidth;
                videoProp = {
                    div: $("#"+element.id),
                    divCSS: {},
                    src: getVideoPath(),
                    width: videoWidth,
                    videoCapture: true,
                    fullScreen: false,
                    endFNC: endFNC,
                    watchedFNC: watchedFNC,
                    metaDataFNC: metaDataFNC,
                    occMode: true
                };

                var tempVideo = AddPlayer(videoProp);
                tempVideo.type = "a_video";
                SP.video.push(tempVideo);
            }else if(element.id.includes("popupWindow")){
                videoProp = addVideoElement(element);
                if(videoProp){
                    videoProp.endFNC = function(){};
                    videoProp.watchedFNC = function(){};
                    videoProp.metaDataFNC = function(){};

                    var tempVideo = AddPlayer(videoProp);
                    tempVideo.type = "popup";
                    SP.video.push(tempVideo);
                }
            }else if(element.id.includes("feedback")){
                videoProp = addVideoElement(element);
                if(videoProp){
                    videoProp.endFNC = function(){};
                    videoProp.watchedFNC = function(){};
                    videoProp.metaDataFNC = function(){};
                    videoProp.videoCapture = true;
                    var tempVideo = AddPlayer(videoProp);
                    SP.video.push(tempVideo);
                    tempVideo.type = "feedback";
                    tempVideo.feedbackID = parseInt(element.id.split("_")[1]);
                }
            }
        });

        function searchMainScene(){
            var videoProp = addVideoElement(SP.elementMainScene);
            if(videoProp){
                videoProp.endFNC = function(){};
                videoProp.watchedFNC = function(){};
                videoProp.metaDataFNC = function(){};
                videoProp.videoCapture = true;
                var tempVideo = AddPlayer(videoProp);
                tempVideo.type = "e_video";
                SP.video.push(tempVideo);
            }
        }

        searchMainScene();

        function addVideoElement(element){
            var videoRect;
            var videoLink;
            for(var kid of element.kids){
                if(kid.className.includes("videoPlayer")){
                    videoRect = kid.main;
                    videoLink = kid.data.videoLink;
                    break;
                }
            }

            if(videoRect){
                var videoWidth = videoRect.offsetWidth;
                var videoID = "vp_s"+index+"_0";
                videoRect.id = videoID;
                var pos = getPosition(videoRect);

                if(!videoLink){
                    videoLink = getVideoPath();
                }

                return {
                    div: $("#"+videoID),
                    divCSS: {
                        left: pos.left+"px",
                        top: pos.top+"px",
                        position: "absolute"
                    },
                    src: videoLink,
                    width: videoWidth,
                    videoCapture: false,
                    fullScreen: false,
                    endFNC: null,
                    watchedFNC: null,
                    occMode: true
                };
            }
        }

        function getVideoPath(){
            var videoPath = "undefined.m3u8";
            jsonV2.slides[index].videoPath.map(function(video){
                if(video.active){
                    videoPath = video.videoPath;
                    videoPath = videoPath.replace("www", "cdn");
                }
            });

            return [videoPath];
        }
    }

    /** Add line **/
    this.initLINECORRECT = function(SP, SD, index){
        console.log("init LINECORRECT");

        var answer = jsonV2.slides[index].answer;
        var lineComplete = false;
        var lineContainer;
        var lineNavContainer;
        var interval;
        var isDrawing = false;
        var erasing = false;
        var draw = {};
        var allDraw = [];
        var settings = {
            brushSize: 10,
            brushColor: "#000000"
        }

        for(var prop in jsonV2.slides[index].scene){
            settings[prop] = jsonV2.slides[index].scene[prop];
        }

        SP.elementList.map(function(element){
            if(element.id.includes("drawCanvas")){
                var id = parseInt(element.id.split("_")[1]);
                lineContainer = element.main;
                draw.rightRate = parseInt(answer[id]);
                draw.lineBG = element.main.querySelector(".lineBg");
                draw.lineBgColor = draw.lineBG.style.backgroundColor;
                SD.inputs["box"+id] = {value: null, base64:null, type: "line"};
                allDraw[id] = draw;
                draw.id = id;
            }else if(element.id.includes("drawNav")){
                lineNavContainer = element.main;
                draw.drawBox = element.main.querySelector(".drawBox");
                draw.eraserBox = element.main.querySelector(".eraserBox");

                draw.drawBox.addEventListener("click",function(){
                    activeBtnFNC(this);
                    passiveBtnFNC(draw.eraserBox);
                    erasing = false;
                    mouseCursorStatus();

                });

                draw.eraserBox.addEventListener("click",function(){
                    activeBtnFNC(this);
                    passiveBtnFNC(draw.drawBox);
                    erasing = true;
                    mouseCursorStatus();
                });
            }
        });

        function activeBtnFNC(btn){
            btn.style.border = "2px solid #183153";
        }

        function passiveBtnFNC(btn){
            btn.style.border = "0px";
        }

        function mouseCursorStatus(){
            if(erasing){
                SP.sceneDiv.style.cursor = "url(assets/img/player/easercursor.png) -22 22, auto";
            }else{
                SP.sceneDiv.style.cursor = "url(assets/img/player/pencilcursor.png) -22 22, auto";
            }
        }

        activeBtnFNC(draw.drawBox);
        passiveBtnFNC(draw.eraserBox);
        mouseCursorStatus();

        draw.drawPNG = lineContainer.querySelector(".shapePNG");
        draw.rightPNG = lineContainer.querySelector(".rightPNG");

        function getBackgroundBG(img){
            var drawImgLink = img.style.backgroundImage;
            var start = drawImgLink.indexOf("(")+2;
            var end = drawImgLink.indexOf(")")-1;
            return drawImgLink.substring(start, end);
        }

        draw.drawPngLink = getBackgroundBG(draw.drawPNG);
        draw.rightPngLink = getBackgroundBG(draw.rightPNG);

        var canvasWidth = parseInt(draw.drawPNG.style.width);
        var canvasHeight = parseInt(draw.drawPNG.style.height);
        var position = getPosition(draw.drawPNG);


        function createCanvas(name, obj){
            var canvas = document.createElement("canvas");
            canvas.id = name;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            canvas.style.position = "absolute";
            canvas.style.border = "1px solid";
            canvas.style.left = position.left+"px";
            canvas.style.top = position.top+"px";
            lineContainer.appendChild(canvas);
            var ctx = canvas.getContext('2d');

            obj[name+"Canvas"] = canvas;
            obj[name+"Ctx"] = ctx;
            obj.success = false;
        }

        createCanvas("right", draw);
        createCanvas("front", draw);
        createCanvas("draw", draw);

        draw.frontCanvas.style.pointerEvents = "none";
        draw.rightCanvas.style.opacity = 0;

        function loadImageToCanvas(imgLink, ctx) {
            var img = new Image();
            img.onload = function(){
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            };
            img.src = imgLink;
        }

        loadImageToCanvas(draw.drawPngLink, draw.frontCtx);
        loadImageToCanvas(draw.rightPngLink , draw.rightCtx);

        draw.drawCanvas.addEventListener('mousedown', startDrawing);
        draw.drawCanvas.addEventListener('mousemove', drawCanvasFNC);
        draw.drawCanvas.addEventListener('touchstart', startDrawing);
        draw.drawCanvas.addEventListener('touchmove', drawCanvasFNC);
        SP.sceneDiv.addEventListener('mouseup', stopDrawing);
        SP.sceneDiv.addEventListener('touchend', stopDrawing);

        function startDrawing(e) {
            e.preventDefault();

            if(!lineComplete){
                controlBtnView(SP, "enable");
            }

            isDrawing = true;
            var pos = canvasGetPosition(e);
            draw.drawCtx.beginPath();
            draw.drawCtx.moveTo(pos.x, pos.y);
            drawCanvasFNC(e);
        }

        function stopDrawing(e){
            e.preventDefault();
            e.stopPropagation();

            if(isDrawing && (e.type === 'touchend' || e.type === 'mouseup')){
                inputsChange(SD, draw.id, "base64", draw.drawCanvas.toDataURL("image/png"));
            }

            isDrawing = false;
            draw.drawCtx.beginPath();
        }

        function canvasGetPosition(e) {
            var rect = draw.drawCanvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            if(e.touches) {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            }

            var scaleX = rect.width / draw.drawCanvas.offsetWidth;
            var scaleY = rect.height / draw.drawCanvas.offsetHeight;

            var originalX = x/scaleX;
            var originalY = y/scaleY;

            return {
                x: originalX,
                y: originalY
            }
        }


        function drawCanvasFNC(e) {
            if (!isDrawing) return;
            e.preventDefault();
            var pos = canvasGetPosition(e);
            draw.drawCtx.lineWidth = settings.brushSize;
            draw.drawCtx.lineCap = "round";

            if (erasing) {
                draw.drawCtx.globalCompositeOperation = 'destination-out';
                draw.drawCtx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                draw.drawCtx.globalCompositeOperation = 'source-over';
                draw.drawCtx.strokeStyle = settings.brushColor;
            }

            draw.drawCtx.lineTo(pos.x, pos.y);
            draw.drawCtx.stroke();
            draw.drawCtx.beginPath();
            draw.drawCtx.moveTo(pos.x, pos.y);
        }


        function checkAnswer() {
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"line"};
            var data1 = draw.drawCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;
            var data2 = draw.rightCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;

            var totalPixels=0;
            var overlappingPixels=0;

            for (var i=0; i<data1.length; i+=4) {
                var alpha1 = data1[i+3];
                var alpha2 = data2[i+3];

                if(alpha1>0 || alpha2>0) totalPixels++;
                if(alpha1>0 && alpha2>0) overlappingPixels++;
            }

            var overlapPercent = (overlappingPixels / totalPixels) * 100;
            var correctRate = Math.ceil( Number(overlapPercent.toFixed(2)) );

            console.log("overlappingPixels:", overlappingPixels, "totalPixels:", totalPixels);
            console.log("Çarpışma %:", overlapPercent, "Sonuç:", correctRate );
            SD.inputs["box"+ draw.id].value = correctRate;

            if(SD.inputs["box"+ draw.id].base64 === null){
                score.totalEmpty++;
            }else if(correctRate >= draw.rightRate){
                score.totalRight++;
                draw.success = true;
            }else{
                score.totalWrong++;
            }

            return score;
        }


        function stopDraw(){
            draw.drawCanvas.style.pointerEvents="none";
            lineNavContainer.style.display = "none";
            lineComplete = true;
        }


        function rightFNC(){
            draw.lineBG.style.backgroundColor = "green";
            controlBtnView(SP, "disable");
            stopDraw();
        }

        function wrongFNC(){
            controlBtnView(SP, "disable");
            draw.lineBG.style.backgroundColor = "red";
            interval = setTimeout(returnWarning, 1000);
        }

        function answerFNC(){
            draw.drawCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            draw.drawCtx.beginPath();
            draw.rightCanvas.style.opacity = 100;
        }

        function returnWarning(){
            draw.lineBG.style.backgroundColor = draw.lineBgColor;
        }

        function addHistory(){
            reset();
            var lastMove = historyExtract(SP, 'line');
            for(var box in lastMove){
                var currentID = lastMove[box].id;
                var base64 = lastMove[box].base64;
                var img = new Image();

                img.onload = function(){
                    allDraw[currentID].drawCtx.drawImage(img, 0, 0);
                };

                img.src = base64;
            }
        }

        function reset(){
            draw.rightCanvas.style.opacity = 0;
            draw.drawCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        }

        function close(){
            draw.drawCanvas.style.pointerEvents = 'none';
            SP.sceneDiv.style.cursor = 'default';
            draw.drawBox.style.pointerEvents = 'none';
            draw.eraserBox.style.pointerEvents = 'none';
        }

        var evaluation = {
            control: checkAnswer,
            wrong: wrongFNC,
            right: rightFNC,
            answer: answerFNC,
            history: addHistory,
            reset: reset,
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** Add point **/
    this.initPOINT = function(SP, SD, index){
        console.log("init POINT");
        var answer = jsonV2.slides[index].answer;
        var rightAnswer;
        var fixedPoints=[];
        var userPoints = [];
        var allCircle = [];
        var grid=[];
        var canvas;
        var lines = [];
        var selectedCircle = null;
        var mode = "draw";
        var canvasOrigin;
        var drawBtn;
        var easeBtn;
        var time;
        var pointNav;
        var canvasList = [];
        var set = {
            lineColor: "#0ABBBF",
            strokeWidth: 3
        }

        for(var prop in jsonV2.slides[index].scene){
            set[prop] = jsonV2.slides[index].scene[prop];
        }

        SP.elementList.map(function(element){
            if(element.id.includes("pointButon")){
                var id = parseInt(element.id.split("_")[1]);
                var pos = getPosition(element.main);
                var bg = element.main.querySelector(".bg");
                var strokeWidth = parseInt(bg.style.outlineWidth);
                var strokeGap=0;
                if(strokeWidth){
                    strokeGap = (strokeWidth/2);
                }

                fixedPoints[id] = {
                    x: (pos.left + strokeGap),
                    y: (pos.top + strokeGap),
                    width: bg.offsetWidth,
                    height: bg.offsetHeight,
                    cornerRadius: parseInt(bg.style.borderRadius),
                    fill: bg.style.backgroundColor,
                    stroke: bg.style.outlineColor,
                    strokeWidth: strokeWidth,
                    row: parseInt(element.data.group),
                    butonID: id
                };
            }else if(element.id.includes("pointCanvas")){
                var id = parseInt(element.id.split("_")[1]);
                rightAnswer = answer[id];
                canvas = element;
                canvas.cid = id;
                canvasOrigin = getPosition(element.main);
                SD.inputs['box'+ id] = {value: null, type: "point"};
                canvasList[id] = canvas;
            }else if(element.id.includes("pointNav")){
                pointNav = element.main;
            }
        });

        const stage = new Konva.Stage({
            container: canvas.id,
            width: canvas.main.offsetWidth,
            height: canvas.main.offsetHeight
        });

        const layer = new Konva.Layer();
        stage.add(layer);

        function addBtn(){
            drawBtn = pointNav.querySelector(".drawBox");
            easeBtn = pointNav.querySelector(".eraserBox");

            drawBtn.addEventListener("click",function(){
                activeBtnFNC(this);
                passiveBtnFNC(easeBtn);
                mode = "draw";
                mouseCursorStatus();
            });

            easeBtn.addEventListener("click",function(){
                activeBtnFNC(this);
                passiveBtnFNC(drawBtn);
                mode = "erase";
                mouseCursorStatus();
            });

            activeBtnFNC(drawBtn);
            mouseCursorStatus();
        }

        addBtn();

        if(rightAnswer){
            rightAnswer = rightAnswer.replace(/\s+/g, "");
            rightAnswer = rightAnswer.split(",");
            for(var i=0; i<rightAnswer.length; i++){
                var editAnswer;
                if(rightAnswer[i].includes("-")){
                    editAnswer = rightAnswer[i].split("-");
                }else{
                    editAnswer = rightAnswer[i].split("_");
                }
                rightAnswer[i] = pointIdEdit(editAnswer[0], editAnswer[1]);
            }
        }

        // Sabit noktaları çiz
        function addCircles(){
            fixedPoints.forEach((obj, index) => {
                obj.x = (obj.x-canvasOrigin.left);
                obj.y = (obj.y-canvasOrigin.top);

                const circle = new Konva.Rect(obj);
                circle.strokeWidth(0);

                if(!grid[obj.row]){
                    grid[obj.row] = [];
                }

                grid[obj.row].push(obj.butonID);

                circle.on('mousedown touchstart', function(){
                    if (mode === 'draw') {
                        handleDrawMode(circle);
                    } else if (mode === 'erase') {
                        //handleEraseMode(circle);
                        easeLines(circle);
                    }
                });

                allCircle[obj.butonID] = circle;
                layer.add(circle);
            });
        }

        addCircles();

        function handleDrawMode(nextCircle) {
            var id = nextCircle.attrs.butonID;

            if (!selectedCircle){
                selectedCircle = nextCircle;
                selectedCircle.strokeWidth(fixedPoints[id].strokeWidth);
            }else if(selectedCircle === nextCircle){
                defaultCircle();
            }else{
                createLine(selectedCircle, nextCircle);
                nextCircle.strokeWidth(fixedPoints[id].strokeWidth);
                selectedCircle = nextCircle;
            }
        }

        function permissionControl(oldPoint){
            if(oldPoint){
                var oldPointID = oldPoint.attrs.butonID;

                var rowBack = grid[oldPoint.attrs.row-1];
                var row = grid[oldPoint.attrs.row];
                var rowNext = grid[oldPoint.attrs.row+1];

                var index = row.indexOf(oldPointID);
                var down, back, next, up;
                var crossDownBack, crossDownNext, crossUpBack, crossUpNext;

                if(rowBack){
                    crossDownBack = rowBack[index-1];
                    down = rowBack[index];
                    crossDownNext = rowBack[index+1];
                }

                next = row[(index+1)];
                back = row[(index-1)];

                if(rowNext){
                    crossUpBack = rowNext[index-1];
                    up = rowNext[index];
                    crossUpNext = rowNext[index+1];
                }

                return [crossDownBack, down, crossDownNext, next, back, crossUpBack, up, crossUpNext]
            }
        }


        function addPointControl(oldPoint, newPoint){
            var pin = pointIdEdit(oldPoint.attrs.butonID, newPoint.attrs.butonID);
            var found = false;

            userPoints.map(function(e){
                if(e.point === pin){
                    found = true;
                }
            });

            if(!found){
                return {point: pin};
            }

            return found;
        }

        function pointIdEdit(pointOld, pointNew){
            var min = Math.min(pointOld, pointNew);
            var max = Math.max(pointOld, pointNew);
            return min+"_"+max;
        }


        function easeLines(circle){
            var id = circle.attrs.butonID;
            var clean=[];

            defaultCircle();
            selectedCircle = circle;
            selectedCircle.strokeWidth(fixedPoints[id].strokeWidth);

            for(var i=0; i<userPoints.length; i++){
                if(userPoints[i].point.includes(id)){
                    userPoints[i].line.destroy();
                    userPoints[i] = null;
                }
            }

            userPoints.map(function(line){
                if(line){
                    clean.push(line);
                }
            });

            userPoints = clean;
            if(userPoints.length){
                controlBtnView(SP, "enable");
            }else{
                controlBtnView(SP, "disable");
            }

            SD.inputs["box"+canvas.cid].value = [];
            userPoints.map(function(line){
                SD.inputs["box"+canvas.cid].value.push(line.point);
            });

            inputsChange(SD);
        }

        // Çizgi oluşturma
        function createLine(selectedCircle, nextCircle) {
            var control = addPointControl(selectedCircle, nextCircle);
            var permissionList = permissionControl(selectedCircle);
            var permission = permissionList.indexOf(nextCircle.attrs.butonID);

            if(typeof control === "object" && permission > -1){
                var selectOriginX = (selectedCircle.x() + (selectedCircle.width()/2));
                var selectOriginY = (selectedCircle.y() + (selectedCircle.height()/2));

                var nextOriginX = (nextCircle.x() + (nextCircle.width()/2));
                var nextOriginY = (nextCircle.y() + (nextCircle.height()/2));

                var line = new Konva.Line({
                    points: [selectOriginX, selectOriginY, nextOriginX, nextOriginY],
                    stroke: set.lineColor,
                    strokeWidth: parseInt(set.strokeWidth),
                    lineCap: "round",
                    lineJoin: "round"
                });

                selectedCircle.strokeWidth(0);
                control.line = line;
                line.listening(false);


                layer.add(line);
                userPoints.push(control);
                lines.push({ line, pointsRef: [selectedCircle, nextCircle] });
                controlBtnView(SP, "enable");

                SD.inputs["box"+canvas.cid].value = [];
                userPoints.map(function(line){
                    SD.inputs["box"+canvas.cid].value.push(line.point);
                });

                inputsChange(SD);
            }else{
                defaultCircle();
            }
        }

        function defaultCircle(){
            selectedCircle = null;
            allCircle.map(function(circle){
                circle.strokeWidth(0);
            });
        }


        function activeBtnFNC(btn){
            btn.style.border = "2px solid #183153";
        }

        function passiveBtnFNC(btn){
            btn.style.border = "0px";
        }

        function mouseCursorStatus(){
           if(mode === "draw"){
               SP.sceneDiv.style.cursor = "url(assets/img/player/pencilcursor.png) -22 22, auto";
           }else{
               SP.sceneDiv.style.cursor = "url(assets/img/player/easercursor.png) -22 22, auto";
           }
        }


        function checkAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"point"};

            if(!userPoints.length){
                score.totalEmpty = 1;
            }else if(userPoints.length === rightAnswer.length){
                var result = true;
                rightAnswer.map(function(right){
                    var found = false;
                    for(var i=0; i<userPoints.length; i++){
                        if(right === userPoints[i].point){
                            found = true;
                            break;
                        }
                    }

                    if(!found){
                        result = false;
                    }
                });

                if(result){
                    score.totalRight = 1;
                }else{
                    score.totalWrong = 1;
                }
            }else{
                score.totalWrong = 1;
            }

            return score;
        }

        function wrongFNC(){
            changeLineColor("#ff0000");
            time = setTimeout(function(){
                changeLineColor(set.lineColor);
            }, 1000);
        }



        function rightFNC(){
            changeLineColor("#00c853");
            defaultCircle();
            allButonDisable();
        }

        function answerFNC(){
            allCircle.map(function(btn){
                easeLines(btn);
            });

            rightAnswer.map(function(right){
                var rightPoints = right.split("_");
                var point1 = allCircle[rightPoints[0]];
                var point2 = allCircle[rightPoints[1]];
                createLine(point1, point2);
            });

            allButonDisable();
            defaultCircle();
        }

        function changeLineColor(color){
            lines.map(function(stroke){
                stroke.line.stroke(color);
            });
        }

        function allButonDisable(){
            allCircle.map(function(btn){
                btn.off("mousedown touchstart");
            });
        }

        function addHistory(){
            var lastMove = historyExtract(SP, 'point');
            for(var box in lastMove){
                var currentID = lastMove[box].id;
                if(canvasList[currentID]){
                    lastMove[box].value.map(function(line){
                        var point = line.split('_');
                        var startPoint = parseInt(point[0]);
                        var finishPoint = parseInt(point[1]);
                        createLine( allCircle[startPoint], allCircle[finishPoint] );
                    });
                }
            }
        }

        function reset(){
            var lastCircle;

            allCircle.map(function(btn){
                easeLines(btn);
                lastCircle = btn;
            });

            handleDrawMode(lastCircle);
        }

        function close(){
            allCircle.map(function(circle){
                circle.off();
            });

            drawBtn.style.pointerEvents='none';
            easeBtn.style.pointerEvents='none';
            SP.sceneDiv.style.cursor = 'default';
        }

        var evaluation = {
            control: checkAnswer,
            wrong: wrongFNC,
            right: rightFNC,
            answer: answerFNC,
            history: addHistory,
            reset: reset,
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** Add sr **/
    this.initRECORD = function(SP, SD, index){
        console.log("init RECORD");
        var SR;
        var input;

        var lang = {
            prepare: "Lütfen Bekleyiniz.",
            stopRecordText: "Kaydı Durdur",
            listenRecordText: "Kaydı Dinle",
            restartRecordText: "Tekrar Kayıt Başlat",
            warning: "Tarayıcı bu özelliği desteklemiyor. Lütfen Chrome tarayıcı kullanınız.",
            showProgressBar: "true"
        }

        SP.elementList.forEach(function(e){
            if(e.id.includes("soundRecord")){
                var id = parseInt(e.id.split("_")[1]);
                SD.inputs["box"+ id] = {value: null, type: "sr"};
                input = SD.inputs["box"+ id];
                SP.soundRecord[id] = {
                    elapsedTime: null,
                    recordInterval: null,
                    recordStartTime: null,
                    soundPlaying: false,
                    base64: "",
                    progressAnimation: true,
                    recording: false,
                    pausedSeconds: 0,
                    isPaused: false
                };

                SR = SP.soundRecord[id];

                for(var param in e.data){
                    lang[param] = e.data[param];
                }
            }
        });

        var Scene = SP.sceneDiv;
        var set = {recordTime:15};

        var audioRecorder = {
            audioBlobs: [],
            mediaRecorder: null,
            streamBeingCaptured: null,
            start: function () {
                if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                    return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
                } else {
                    return navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(function(stream){
                            audioRecorder.streamBeingCaptured = stream;
                            audioRecorder.mediaRecorder = new MediaRecorder(stream);
                            audioRecorder.audioBlobs = [];

                            audioRecorder.mediaRecorder.addEventListener("dataavailable", function(e) {
                                audioRecorder.audioBlobs.push(e.data);
                            });

                            audioRecorder.mediaRecorder.addEventListener("start", function(e) {
                                SR.recording = true;
                            });

                            audioRecorder.mediaRecorder.start();
                        });
                }
            },

            pause: function() {
                if (audioRecorder.mediaRecorder && audioRecorder.mediaRecorder.state === "recording") {
                    audioRecorder.mediaRecorder.pause();
                }
            },

            resume: function() {
                if (audioRecorder.mediaRecorder && audioRecorder.mediaRecorder.state === "paused") {
                    audioRecorder.mediaRecorder.resume();
                }
            },

            stop: function () {
                return new Promise(function(resolve) {
                    let mimeType = audioRecorder.mediaRecorder.mimeType;

                    audioRecorder.mediaRecorder.addEventListener("stop", function() {
                        let audioBlob = new Blob(audioRecorder.audioBlobs, { type: mimeType });
                        resolve(audioBlob);
                    });

                    audioRecorder.cancel();
                });
            },

            cancel: function () {
                if(SR.recording){
                    audioRecorder.mediaRecorder.stop();
                    audioRecorder.stopStream();
                    audioRecorder.resetRecordingProperties();
                }
            },

            stopStream: function () {
                audioRecorder.streamBeingCaptured.getTracks().forEach(function(track){
                    track.stop()
                });
            },

            resetRecordingProperties: function () {
                audioRecorder.mediaRecorder = null;
                audioRecorder.streamBeingCaptured = null;
            }
        }


        SR.startAudioRecordingFNC = function(){
            if (SR.Howl && SR.Howl.playing()) {
                SR.Howl.stop();
            }

            audioRecorder.start()
                .then(() => {
                    SR.recordStartTime = new Date();
                    console.log("SR.recordStartTime",SR.recordStartTime);
                    SR.startViewFNC();
                })
                .catch(error => {
                    console.log(error);
                    if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
                        console.log("Ses kaydetmek için Chrome ve Firefox gibi tarayıcıları kullanın.");
                        SR.warning.style.display = "block";
                    }

                    switch (error.name) {
                        case 'AbortError':
                            console.log("Bir AbortError oluştu (navigator.mediaDevices.getUserMedia)");
                            break;
                        case 'NotAllowedError':
                            console.log("NotAllowedError oluştu. Kullanıcı izni reddetmiş olabilir (navigator.mediaDevices.getUserMedia)");
                            break;
                        case 'NotFoundError':
                            console.log("Bulunamadı Hatası oluştu (navigator.mediaDevices.getUserMedia)");
                            break;
                        case 'NotReadableError':
                            console.log("NotReadableError oluştu (navigator.mediaDevices.getUserMedia)");
                            break;
                        case 'SecurityError':
                            console.log("Bir Güvenlik Hatası oluştu (navigator.mediaDevices.getUserMedia yada from the MediaRecorder.start)");
                            break;
                        case 'TypeError':
                            console.log("Bir TypeError oluştu (navigator.mediaDevices.getUserMedia)");
                            break;
                        case 'InvalidStateError':
                            console.log("Bir InvalidStateError oluştu (MediaRecorder.start)");
                            break;
                        case 'UnknownError':
                            console.log("Bilinmeyen bir hata oluştu (MediaRecorder.start)");
                            break;
                        default:
                            console.log("Hata adıyla bir hata oluştu: " + error.name);
                    }
                });
        }

        SR.pauseAudioRecordingFNC = function() {
            if (SR.recording && !SR.isPaused) {
                audioRecorder.pause();
                SR.isPaused = true;

                clearInterval(SR.recordInterval);
                var timeData = SR.recordTimeCalcFNC(SR.recordStartTime);
                SR.pausedSeconds = timeData.totalSeconds;

                SR.recordRedCircle.classList.add('recordCircleAnimateStop');

                extraRecordIconStatus("hidden", "visible");
            }
        }

        SR.resumeAudioRecordingFNC = function() {
            if (SR.recording && SR.isPaused) {
                audioRecorder.resume();
                SR.isPaused = false;

                SR.recordStartTime = new Date();
                SR.recordInterval = setInterval(SR.recordElapsedTimeFNC, 1000);

                SR.recordRedCircle.classList.remove('recordCircleAnimateStop');

                extraRecordIconStatus("visible", "hidden");
            }
        }

        SR.stopAudioRecordingFNC = function() {
            console.log("Stopping Audio Recording...");
            if(SR.recording){
                audioRecorder.stop()
                    .then(audioAsblob => {
                        SR.playAudioFNC(audioAsblob);
                        SR.stopViewFNC();
                    })
                    .catch(error => {
                        console.log(error);
                        switch (error.name) {
                            case 'InvalidStateError':
                                console.log("Bir InvalidStateError oluştu.");
                                break;
                            default:
                                console.log("Hata adıyla bir hata oluştu " + error.name);
                        }
                    });
            }
        }


        SR.cancelAudioRecordingFNC = function() {
            console.log("Canceling audio...");
            audioRecorder.cancel();
            SR.stopViewFNC();
            SR.base64 = null;
            addB64DataFNC(SR.base64);
        }


        SR.playAudioFNC = function(recorderAudioAsBlob){
            var reader = new FileReader();

            function loadEnd(e){
                SR.base64 = e.target.result;
                SR.oldDataLoad(SR.base64, false, true);
            }

            reader.addEventListener("loadend", loadEnd);
            reader.readAsDataURL(recorderAudioAsBlob);
        }

        SR.timeConvertSecondAndMinutes = function(elapsed){
            var seconds = Math.floor(elapsed % 60);
            seconds = seconds < 10 ? "0"+ seconds : seconds;

            elapsed = Math.floor(elapsed / 60);

            var minutes = elapsed % 60;
            minutes = minutes < 10 ? "0"+ minutes : minutes;

            return minutes +":"+ seconds;
        }

        SR.recordTimeCalcFNC = function(startTime) {
            var endTime = new Date();
            var timeDiff = ((endTime - startTime) / 1000) + SR.pausedSeconds;
            return {
                formatted: SR.timeConvertSecondAndMinutes(timeDiff),
                totalSeconds: timeDiff
            };
        }


        SR.recordElapsedTimeFNC = function(){
            if (SR.isPaused) return;

            var timeData = SR.recordTimeCalcFNC(SR.recordStartTime);
            SR.elapsedTime = timeData.formatted;
            SR.recordTime.innerText = SR.elapsedTime;

            if (timeData.totalSeconds >= set.recordTime) {
                SR.stopAudioRecordingFNC();
            }
        }

        SR.startRecordBtn = Scene.querySelector(".record_off");
        SR.stopRecordBtn = Scene.querySelector(".record_on");
        SR.recordPrepare = Scene.querySelector(".prepareText");

        SR.recordStatusMain = Scene.querySelector(".recordStatusMain");
        SR.recordTime = utils.addDOM({className: "recordTime", innerText: "00:00"});
        SR.recordRedCircle = utils.addDOM({className: "recordRedCircle"});
        SR.recordStatusMain.appendChild(SR.recordRedCircle);
        SR.recordStatusMain.appendChild(SR.recordTime);

        SR.recordPlayMain = Scene.querySelector(".recordPlayMain");
        SR.playTxt = utils.addDOM({className: "Record_Text", innerText: (lang.listenRecordText+" (00:00)")});
        SR.playProgress = utils.addDOM({className: "Record_playProgress"});
        SR.recordPlayMain.appendChild(SR.playProgress);
        SR.recordPlayMain.appendChild(SR.playTxt);
        SR.recordPlayMain.style.overflow = "hidden";

        SR.recordStop = Scene.querySelector(".recordStop");
        SR.recordPause = Scene.querySelector(".recordPause");
        SR.recordContinue = Scene.querySelector(".recordContinue");
        SR.recordStopText = utils.addDOM({className: "Record_Text", innerText: lang.stopRecordText});
        SR.recordStop.appendChild(SR.recordStopText);

        SR.recordRestart = Scene.querySelector(".recordRestart");
        SR.recordRestartText = utils.addDOM({className: "Record_Text", innerText: lang.restartRecordText});
        SR.recordRestart.appendChild(SR.recordRestartText);

        SR.warning = Scene.querySelector(".warningText");
        SR.warning.innerText = lang.warning;
        SR.soundPlayBtn = Scene.querySelector(".soundPlayBtn");
        SR.soundStopBtn = Scene.querySelector(".soundStopBtn");

        if(SR.soundPlayBtn){
            SR.soundPlayBtn.addEventListener("click", function(){
                if(SR.soundPause){
                    SR.Howl.play();
                    SR.Animation.play();
                    SR.soundPause = false;
                }else{
                    addAnimation();
                    SR.Howl.play();
                }
            });
        }

        if(SR.soundStopBtn){
            SR.soundStopBtn.addEventListener("click", function(){
                if(SR.Howl.playing()){
                    SR.Animation.pause();
                    SR.Howl.pause();
                }
            });
        }

        if(SR.recordPause){
            SR.recordPause.addEventListener("click", function(){
                SR.pauseAudioRecordingFNC();
            });

            SR.recordPause.style.visibility = "hidden";
            SR.recordPause.style.cursor = "pointer";
        }

        if(SR.recordContinue){
            SR.recordContinue.addEventListener("click", function(){
                SR.resumeAudioRecordingFNC();
            });

            SR.recordContinue.style.visibility = "hidden";
            SR.recordContinue.style.cursor = "pointer";
        }

        function extraSoundIconStatus(play, stop){
            if(SR.soundPlayBtn){
                SR.soundPlayBtn.style.visibility = play;
            }

            if(SR.soundStopBtn){
                SR.soundStopBtn.style.visibility = stop;
            }
        }

        function extraRecordIconStatus(recordPause, recordContinue){
            if(SR.recordPause){
                SR.recordPause.style.visibility = recordPause;
            }

            if(SR.recordContinue){
                SR.recordContinue.style.visibility = recordContinue;
            }
        }

        /* CSS */
        SR.startRecordBtn.style.cursor = "pointer";
        SR.stopRecordBtn.style.cursor = "pointer";
        SR.recordPlayMain.style.cursor = "pointer";
        SR.recordStop.style.cursor = "pointer";
        SR.recordRestart.style.cursor = "pointer";

        if(SR.recordPrepare){
            SR.recordPrepare.style.textAlign = "center";
            SR.recordPrepare.innerText = lang.prepare;
            SR.recordPrepare.style.fontSize = "16px";
            SR.recordPrepare.style.display = "none";
        }

        if(SR.warning){
            SR.warning.style.fontSize = "16px";
            Object.assign(SR.warning.style, {
                fontFamily: "Nunito",
                textAlign: "center",
                display: "none",
                fontSize:"16px",
                color:"#363636"
            });
        }

        SR.recordRedCircle.classList.add('recordCircleAnimate');
        SR.recordRedCircle.classList.add('recordCircleAnimateStop');

        SR.stopRecordBtn.style.display = "none";
        SR.recordStatusMain.style.display = "none";
        SR.recordPlayMain.style.display = "none";
        SR.recordRestart.style.display = "none";
        SR.recordStop.style.display = "none";
        extraSoundIconStatus("hidden", "hidden");

        SR.startRecordBtn.addEventListener("click", function(){
            SR.recordPrepare.style.display="block";
            SR.startAudioRecordingFNC();
        });


        SR.stopRecordBtn.addEventListener("click", function(){
            SR.stopAudioRecordingFNC();
        });

        SR.recordStop.addEventListener("click", function(){
            SR.stopAudioRecordingFNC();
        });

        SR.recordPlayMain.addEventListener("click", function(){
            if(!SR.Howl.playing()){
                addAnimation();
                SR.Howl.seek(0);
                SR.Howl.play();
            }
        });

        SR.recordRestart.addEventListener("click", function(){
            SR.recordPrepare.style.visibility="block";
            SR.startAudioRecordingFNC();
        });

        SR.startViewFNC = function(){
            SR.pausedSeconds = 0;
            SR.isPaused = false;

            SR.recordElapsedTimeFNC();
            SR.recordInterval = setInterval(SR.recordElapsedTimeFNC, 1000);

            SR.startRecordBtn.style.display = "none";
            SR.stopRecordBtn.style.display = "block";
            SR.recordStatusMain.style.display = "flex";
            SR.recordPlayMain.style.display = "none";
            SR.recordStop.style.display = "flex";
            SR.recordRestart.style.display = "none";
            SR.recordPrepare.style.display = "none";
            SR.recordRedCircle.classList.remove('recordCircleAnimateStop');
            extraSoundIconStatus("hidden", "hidden");
            extraRecordIconStatus("visible", "hidden");
        }

        SR.stopViewFNC = function(){
            SR.pausedSeconds = 0;
            SR.isPaused = false;

            SR.startRecordBtn.style.display = "block";
            SR.stopRecordBtn.style.display = "none";
            SR.recordStatusMain.style.display = "none";
            SR.recordPlayMain.style.display = "flex";
            SR.recordStop.style.display = "none";
            SR.recordRestart.style.display = "flex";
            extraRecordIconStatus("hidden", "hidden");

            SR.playProgress.style.width = 0;
            clearInterval(SR.recordInterval);
            SR.recording = false;
            SR.recordRedCircle.classList.add('recordCircleAnimateStop');
        }

        SR.oldDataLoad = function(soundData, autoPlay, showBtn){
            SR.Howl = new Howl({
                src: [soundData]
            });

            SR.Howl.on("load",function(){
                soundLoadAction();
                SR.soundPause = false;
                extraSoundIconStatus("visible", "hidden");
            });

            SR.Howl.on("end",function(){
                extraSoundIconStatus("visible", "hidden");
            });

            SR.Howl.on("pause",function(){
                SR.soundPause = true;
                extraSoundIconStatus("visible", "hidden");
            });

            SR.Howl.on("play",function(){
                extraSoundIconStatus("hidden", "visible");
            });

            function soundLoadAction(){
                SR.elapsedTime = SR.timeConvertSecondAndMinutes(SR.Howl.duration());
                SR.playTxt.innerText = lang.listenRecordText+" ("+ SR.elapsedTime +")";
                if(showBtn){
                    SR.stopViewFNC();
                }

                SR.recordPlayMain.style.display = "flex";

                if(autoPlay){
                    SR.Howl.play();
                    addAnimation();
                }

                addB64DataFNC(soundData);
            }

            if (SR.Howl.state() === 'loaded') {
                soundLoadAction();
            }
        }

        function addAnimation(){
            if(SR.Animation){
                SR.Animation.kill();
            }

            SR.playProgress.style.width = 0;
            SR.Animation = gsap.to(SR.playProgress, SR.Howl.duration(), {width:"100%", ease:"none"});
        }

        SR.stopPlayedRecord = function(){
            if(SR.Howl){
                if(SR.Howl.playing()){
                    SR.Howl.stop();
                }
            }
        }

        function addB64DataFNC(soundData){
            input.value = soundData;
            inputsChange(SD);
        }

        function addHistory(){
            var lastMove = historyExtract(SP, 'sr');
            for(var box in lastMove){
                var currentID = lastMove[box].id;
                if(SP.soundRecord[currentID]){
                    SR.oldDataLoad(lastMove[box].value, false, true);
                }
            }
        }

        function checkRightAnswer(){
            if(input.value === null){
                return {totalRight:0, totalWrong:0, totalEmpty:1, Type:"sr"};
            }else{
                return {totalRight:1, totalWrong:0, totalEmpty:0, Type:"sr"};
            }
        }

        function close(){
            if(input.value){
                SR.stopRecordBtn.style.display = "none";
                SR.recordStop.style.display = "none";
                SR.recordRestart.style.display = "none";
                SR.startRecordBtn.style.pointerEvents = "none";
            }else{
                SR.startRecordBtn.style.pointerEvents = "none";
            }
        }

        var evaluation = {
            history: addHistory,
            control: checkRightAnswer,
            wrong: function(){},
            right: function(){},
            answer: function(){},
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** Add word **/
    this.initWORD = function(SP, SD, index){
        console.log("init WORD");
        var answer = jsonV2.slides[index].answer;

        var wordArray = [];
        var set =  {
            mouseEnter: "rgba(192,192,192,1)",
            mouseLeave: "rgba(255,255,255,0.20)",
            click: "rgba(192, 192, 192, 1)"
        };

        if(jsonV2.slides[index].scene.colorEnter){
            set.mouseEnter = jsonV2.slides[index].scene.colorEnter;
        }

        if(jsonV2.slides[index].scene.colorLeave){
            set.mouseLeave = jsonV2.slides[index].scene.colorLeave;
        }

        if(SP.controlBtn){
            set.controlMode = true;
        }

        SP.elementList.forEach(function(element){
            if(element.id.includes("wordBox")){
                var id = parseInt(element.id.split("_")[1]);
                var bg = element.main.querySelector(".wordTxt");
                wordArray[id] = {id: id, main:element.main, bg:bg, status:null, clicked:false, rightAnswer:false}

                element.main.addEventListener("mouseenter", function(){
                    if(!wordArray[id].clicked){
                        bg.style.backgroundColor = set.mouseEnter;
                    }
                });

                element.main.addEventListener("mouseleave", function(){
                    if(!wordArray[id].clicked){
                        bg.style.backgroundColor = set.mouseLeave;
                    }
                });


                element.main.addEventListener("click", function(){
                    if(set.controlMode){
                        if(wordArray[id].clicked){
                            deActive(id);
                        }else{
                            btnActive(id);
                        }
                    }
                });

                if(bg.classList.contains("wordAddSpace")){
                    bg.style.borderRadius = "8px";
                    bg.style.width = "auto";
                    bg.style.height = "auto";
                    bg.style.padding = "3px";
                    bg.style.left = "-3px";
                    bg.style.top = "-3px";
                }

                bg.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                element.main.style.cursor = "pointer";
                SD.inputs["box" + id] = {value: null, type: "word"};
                if(answer[id]){
                    wordArray[id].rightAnswer = true;
                }
            }
        });

        function btnActive(id){
            wordArray[id].bg.style.backgroundColor = set.mouseEnter;
            wordArray[id].clicked = true;
            inputsChange(SD, id, "value", true);
            controlBtnViewCheck();
        }

        function deActive(id){
            wordArray[id].bg.style.backgroundColor = set.mouseLeave;
            wordArray[id].clicked = false;
            inputsChange(SD, id, "value", null);
        }

        function controlBtnViewCheck() {
            var found = false;
            wordArray.map(function(word){
                if(word.clicked){
                    found = true;
                }
            });

            if (found) {
                controlBtnView(SP, "enable");
            } else {
                controlBtnView(SP, "disable");
            }
        }

        function checkAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"word"};

            wordArray.map(function(work, id){
                if(work.clicked && work.rightAnswer){
                    score.totalRight++;
                    work.status = 'right';
                }else if(work.clicked && !work.rightAnswer){
                    score.totalWrong++;
                    work.status = 'wrong';
                }else if(!work.clicked && work.rightAnswer){
                    score.totalEmpty++;
                }
            });

            return score;
        }

        function controlAfterFNC(){
            wordArray.map(function(work, id){
                if(work.status === 'right'){
                    work.bg.style.backgroundColor = '#008000';
                }else if(work.status === 'wrong'){
                    work.bg.style.backgroundColor = '#c62828';
                }

                work.main.style.pointerEvents='none';
            });

            setTimeout(reset, 1000);
        }

        function reset(){
            wordArray.map(function(work){
                if(work.status !== 'right'){
                    work.bg.style.backgroundColor = set.mouseLeave;
                    work.main.style.pointerEvents = 'auto';
                    work.status = null;
                    work.clicked = false;
                    inputsChange(SD, work.id, "value", null);
                }
            });

            controlBtnViewCheck();
        }

        function answerActionFNC(){
            resetFNC();
            wordArray.map(function(work){
                if(work.rightAnswer){
                    work.bg.style.backgroundColor = '#008000';
                }

                work.main.style.pointerEvents = 'none';
                work.status = null;
                work.clicked = false;
                inputsChange(SD, work.id, "value", null);
            });
        }

        function addHistory(){
            var lastMove = historyExtract(SP, 'word');
            for(var box in lastMove){
                var currentID = lastMove[box].id;
                btnActive(currentID);
            }
        }

        function resetFNC(){
            wordArray.map(function(work){
                deActive(work.id);
            });
        }

        function close(){
            wordArray.map(function(word){
                word.main.style.pointerEvents='none';
            });
        }

        var evaluation = {
            control: checkAnswer,
            wrong: controlAfterFNC,
            right: controlAfterFNC,
            answer: answerActionFNC,
            history: addHistory,
            reset: resetFNC,
            close: close
        }

        SP.fnc.push(evaluation);
        //End
    }

    /** Add puzzle **/
    this.initPUZZLE = function(SP, SD, index){
        console.log("init PUZZLE");

        var answer = jsonV2.slides[index].answer || {};
        var puzzleBoxes = [];
        var groupSelections = {};
        var solvedGroups = {};
        var lockedGroups = {};
        var candidateWordList = [];
        var pendingCandidateSelection = [];
        var lockedCandidateSelections = [];
        var isDragging = false;
        var dragBorderBoxes = {};
        var dragPressColor = jsonV2.slides[index].scene.selectedColor;
        var dragBorderColor = jsonV2.slides[index].scene.selectedBorderColor;
        var puzzleUndoBtn = null;
        var puzzleLockBtn = null;
        var puzzleCandidatePanels = [];
        var cumulativeWrongTotal = SD.wrong || 0;

        for(var answerGroup in answer){
            groupSelections[String(answerGroup)] = [];
        }

        function normalizeText(text){
            return String(text === undefined || text === null ? "" : text).trim().toLocaleUpperCase("tr-TR");
        }

        function getGroupValue(element, id){
            var group = element.data ? element.data.group : null;
            var groups = [];

            if(Array.isArray(group)){
                groups = group;
            }else if(group !== undefined && group !== null && group !== ""){
                groups = String(group).split(",");
            }

            groups = groups.map(function(value){
                return String(value).trim();
            }).filter(function(value){
                return value !== "";
            });

            return {
                groups: groups
            };
        }

        function parsePuzzleBoxID(value){
            var match = String(value).trim().match(/(?:puzzleBox_)?(\d+)$/);
            return match ? parseInt(match[1]) : NaN;
        }

        function normalizeAnswerIDs(value){
            if(Array.isArray(value)){
                return value.map(parsePuzzleBoxID).filter(function(id){
                    return !isNaN(id);
                });
            }

            if(typeof value === "number"){
                return [value];
            }

            return String(value === undefined || value === null ? "" : value).split(",").map(parsePuzzleBoxID).filter(function(id){
                return !isNaN(id);
            });
        }

        function idListContains(list, id){
            id = parseInt(id);

            return (list || []).some(function(value){
                return parseInt(value) === id;
            });
        }

        function idListsMatch(selected, right){
            selected = selected || [];
            right = right || [];

            if(selected.length !== right.length){
                return false;
            }

            var selectedCount = {};
            var rightCount = {};

            selected.map(function(id){
                id = parseInt(id);
                selectedCount[id] = (selectedCount[id] || 0) + 1;
            });

            right.map(function(id){
                id = parseInt(id);
                rightCount[id] = (rightCount[id] || 0) + 1;
            });

            for(var key in rightCount){
                if(selectedCount[key] !== rightCount[key]){
                    return false;
                }
            }

            return true;
        }

        function normalizeIDList(list){
            return (list || []).map(function(id){
                return parseInt(id);
            }).filter(function(id){
                return !isNaN(id);
            }).sort(function(a, b){
                return a - b;
            });
        }

        function isExactAnswerCandidate(groupID, selectedIDs){
            var selected = normalizeIDList(getEffectiveSelectedIDs(groupID, selectedIDs));
            var right = normalizeIDList(normalizeAnswerIDs(answer[groupID]));

            if(selected.length !== right.length){
                return false;
            }

            for(var i=0; i<right.length; i++){
                if(selected[i] !== right[i]){
                    return false;
                }
            }

            return true;
        }

        function idListsEqualOrdered(first, second){
            first = first || [];
            second = second || [];

            if(first.length !== second.length){
                return false;
            }

            for(var i=0; i<first.length; i++){
                if(parseInt(first[i]) !== parseInt(second[i])){
                    return false;
                }
            }

            return true;
        }

        function getEffectiveSelectedIDs(groupID, selectedIDs){
            var effectiveSelectedIDs = (selectedIDs || []).slice();
            var rightAnswerIDs = normalizeAnswerIDs(answer[groupID]);

            for(var i=0; i<rightAnswerIDs.length; i++){
                var rightID = rightAnswerIDs[i];
                if(
                    !idListContains(effectiveSelectedIDs, rightID)
                    && (
                        isAutoReflectedSharedBox(groupID, rightID)
                        || isLockedCandidateBoxForGroup(groupID, rightID)
                    )
                ){
                    effectiveSelectedIDs.push(rightID);
                }
            }

            return effectiveSelectedIDs;
        }

        function getCandidateAnswerGroup(selectedIDs){
            for(var group in answer){
                if(solvedGroups[group] || !isPuzzleGroup(group)){
                    continue;
                }

                if(isExactAnswerCandidate(group, selectedIDs)){
                    return String(group);
                }
            }

            return null;
        }

        function getCandidateDisplayIDs(selectedIDs){
            for(var group in answer){
                if(!isPuzzleGroup(group)){
                    continue;
                }

                var effectiveSelectedIDs = getDisplayEffectiveSelectedIDs(group, selectedIDs);
                if(idListsMatch(effectiveSelectedIDs, normalizeAnswerIDs(answer[group]))){
                    return normalizeAnswerIDs(answer[group]).filter(function(id){
                        return idListContains(effectiveSelectedIDs, id);
                    });
                }
            }

            return selectedIDs || [];
        }

        function getDisplayEffectiveSelectedIDs(groupID, selectedIDs){
            var effectiveSelectedIDs = (selectedIDs || []).slice();
            var rightAnswerIDs = normalizeAnswerIDs(answer[groupID]);

            for(var i=0; i<rightAnswerIDs.length; i++){
                var rightID = rightAnswerIDs[i];
                if(
                    !idListContains(effectiveSelectedIDs, rightID)
                    && (
                        isDisplayReflectedSharedBox(groupID, rightID, selectedIDs)
                        || isLockedCandidateBoxForGroup(groupID, rightID)
                    )
                ){
                    effectiveSelectedIDs.push(rightID);
                }
            }

            return effectiveSelectedIDs;
        }

        function isDisplayReflectedSharedBox(groupID, id, selectedIDs){
            groupID = String(groupID);
            id = parseInt(id);

            var box = puzzleBoxes[id];
            if(!box || !hasGroup(box, groupID) || !hasExplicitGroup(box, groupID)){
                return false;
            }

            var groups = box.explicitGroups || [];
            if(groups.length < 2){
                return false;
            }

            for(var i=0; i<groups.length; i++){
                var otherGroup = String(groups[i]);

                if(otherGroup === groupID){
                    continue;
                }

                if((solvedGroups[otherGroup] || lockedGroups[otherGroup]) && idListContains(groupSelections[otherGroup], id)){
                    return true;
                }

                for(var c=0; c<candidateWordList.length; c++){
                    var candidateIDs = candidateWordList[c];
                    if(
                        candidateIDs !== selectedIDs
                        && idListContains(candidateIDs, id)
                        && isExactAnswerCandidate(otherGroup, candidateIDs)
                    ){
                        return true;
                    }
                }
            }

            return false;
        }

        function isSolvedAnswerCandidate(selectedIDs){
            for(var group in answer){
                if(!solvedGroups[group] || !isPuzzleGroup(group)){
                    continue;
                }

                if(isExactAnswerCandidate(group, selectedIDs)){
                    return true;
                }
            }

            return false;
        }

        function setCandidateWrong(selectedIDs){
            (selectedIDs || []).map(function(id){
                var box = puzzleBoxes[parseInt(id)];
                if(!box){
                    return;
                }

                var groups = box.selectedGroups && box.selectedGroups.length
                    ? box.selectedGroups
                    : box.explicitGroups || [];

                groups.map(function(group){
                    if(!solvedGroups[group]){
                        setGroupStatus(box, group, "wrong");
                    }
                });

                refreshBoxView(box);
            });
        }

        function setCandidateRight(groupID, selectedIDs){
            selectedIDs = (selectedIDs || []).slice();
            var effectiveSelectedIDs = getEffectiveSelectedIDs(groupID, selectedIDs);
            var storedSelectedIDs = effectiveSelectedIDs.slice();
            var previousSelected = groupSelections[groupID] || [];

            previousSelected.map(function(id){
                var box = puzzleBoxes[id];
                if(box && !idListContains(storedSelectedIDs, id)){
                    removeSelectedGroup(box, groupID);
                    setGroupStatus(box, groupID, null);
                    refreshBoxView(box);
                }
            });

            solvedGroups[groupID] = true;
            lockedGroups[groupID] = true;
            groupSelections[groupID] = storedSelectedIDs.slice();

            storedSelectedIDs.map(function(id){
                var box = puzzleBoxes[id];
                if(box){
                    addSelectedGroup(box, groupID);
                    setGroupStatus(box, groupID, "right");
                    refreshBoxView(box);
                }
            });

            updateInput(groupID, true);
            updateCandidateWordsView();
        }

        function saveCandidateWord(selectedIDs){
            selectedIDs = (selectedIDs || []).slice();

            if(!selectedIDs.length){
                return;
            }

            var duplicate = candidateWordList.some(function(candidate){
                return idListsEqualOrdered(candidate, selectedIDs);
            });

            if(duplicate){
                return;
            }

            candidateWordList.push(selectedIDs);

            updateCandidateWordsView();
        }

        function getCandidateWordText(selectedIDs){
            var letters = [];
            var displayIDs = getCandidateDisplayIDs(selectedIDs);

            displayIDs.map(function(id){
                var box = puzzleBoxes[parseInt(id)];
                if(box){
                    letters.push(box.letter);
                }
            });

            if(letters.length){
                return letters.join("");
            }

            return displayIDs.join(",");
        }

        function getCandidateWordRows(){
            var rows = [];

            candidateWordList.map(function(selectedIDs){
                var text = getCandidateWordText(selectedIDs);
                if(text){
                    rows.push(text);
                }
            });

            return rows;
        }

        function selectionMatchesCandidate(selectedIDs, candidateIDs){
            if(idListsEqualOrdered(selectedIDs, candidateIDs)){
                return true;
            }

            var selected = normalizeIDList(selectedIDs);
            var candidate = normalizeIDList(candidateIDs);

            if(selected.length !== candidate.length){
                return false;
            }

            for(var i=0; i<selected.length; i++){
                if(selected[i] !== candidate[i]){
                    return false;
                }
            }

            return true;
        }

        function selectionIsCandidatePart(selectedIDs, candidateIDs){
            selectedIDs = selectedIDs || [];
            candidateIDs = candidateIDs || [];

            if(!selectedIDs.length){
                return false;
            }

            for(var i=0; i<selectedIDs.length; i++){
                if(!idListContains(candidateIDs, selectedIDs[i])){
                    return false;
                }
            }

            return true;
        }

        function shouldClearCandidateGroup(group, selectedIDs){
            var groupSelected = groupSelections[group] || [];

            if(selectionMatchesCandidate(groupSelected, selectedIDs)){
                return true;
            }

            return !solvedGroups[group] && selectionIsCandidatePart(groupSelected, selectedIDs);
        }

        function syncRemovedCandidateBoxes(selectedIDs){
            (selectedIDs || []).map(function(id){
                var box = puzzleBoxes[parseInt(id)];

                if(!box){
                    return;
                }

                (box.selectedGroups || []).slice().map(function(group){
                    if(!groupSelections[group] || !idListContains(groupSelections[group], box.id)){
                        removeSelectedGroup(box, group);
                        setGroupStatus(box, group, null);
                    }
                });

                if(box.selectedGroups.length === 0){
                    box.selected = false;
                    box.status = null;
                }
                refreshBoxView(box);
            });
        }

        function clearCandidateSelection(selectedIDs){
            selectedIDs = selectedIDs || [];
            lockedCandidateSelections = lockedCandidateSelections.filter(function(candidateIDs){
                return !selectionMatchesCandidate(candidateIDs, selectedIDs);
            });

            for(var group in groupSelections){
                if(!shouldClearCandidateGroup(group, selectedIDs)){
                    continue;
                }

                (groupSelections[group] || []).map(function(id){
                    var box = puzzleBoxes[id];
                    if(box){
                        removeSelectedGroup(box, group);
                        setGroupStatus(box, group, null);
                        refreshBoxView(box);
                    }
                });

                groupSelections[group] = [];
                delete solvedGroups[group];
                delete lockedGroups[group];
                updateInput(group, true);
            }

            syncRemovedCandidateBoxes(selectedIDs);

            pendingCandidateSelection = pendingCandidateSelection.filter(function(id){
                return !idListContains(selectedIDs, id);
            });

            controlBtnViewCheck();
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function removeCandidateWord(index){
            index = parseInt(index);

            if(isNaN(index) || !candidateWordList[index]){
                return;
            }

            var removed = candidateWordList.splice(index, 1)[0];
            clearCandidateSelection(removed);
            updateCandidateWordsView();
        }

        function updateCandidateWordsView(){
            if(!puzzleCandidatePanels.length){
                return;
            }

            var rows = getCandidateWordRows();

            puzzleCandidatePanels.map(function(panel){
                if(panel && panel.text){
                    panel.text.innerText = "";
                    panel.text.textContent = "";

                    while(panel.text.firstChild){
                        panel.text.removeChild(panel.text.firstChild);
                    }

                    rows.map(function(row, index){
                        var rowEl = document.createElement("div");
                        var removeEl = document.createElement("button");
                        var textEl = document.createElement("span");

                        rowEl.style.display = "flex";
                        rowEl.style.alignItems = "center";
                        rowEl.style.gap = "8px";
                        rowEl.style.marginBottom = "4px";
                        rowEl.style.overflow = "visible";

                        textEl.textContent = row;
                        textEl.style.flex = "0 0 auto";
                        textEl.style.minWidth = "auto";
                        textEl.style.overflow = "visible";
                        textEl.style.textOverflow = "clip";
                        textEl.style.whiteSpace = "nowrap";

                        removeEl.type = "button";
                        removeEl.dataset.candidateIndex = index;

                        removeEl.style.display = "flex";
                        removeEl.style.alignItems = "center";
                        removeEl.style.justifyContent = "center";
                        removeEl.style.padding = "0";
                        removeEl.style.border = "1px solid #94a3b8";
                        removeEl.style.borderRadius = "4px";
                        removeEl.style.backgroundColor = "#ffffff";
                        removeEl.style.color = "#0f172a";
                        removeEl.style.cursor = "pointer";
                        removeEl.style.flexShrink = "0";

                        removeEl.innerHTML = `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14H6L5 6"></path>
                        <path d="M10 11v6"></path>
                        <path d="M14 11v6"></path>
                        <path d="M9 6V4h6v2"></path>
                    </svg>
                `;

                        removeEl.addEventListener("click", function(event){
                            event.preventDefault();
                            event.stopPropagation();
                            removeCandidateWord(this.dataset.candidateIndex);
                        });

                        rowEl.appendChild(textEl);
                        rowEl.appendChild(removeEl);

                        panel.text.appendChild(rowEl);

                        var textHeight = Math.ceil(
                            textEl.getBoundingClientRect().height * 1.15
                        );

                        removeEl.style.width = textHeight + "px";
                        removeEl.style.height = textHeight + "px";

                        var svg = removeEl.querySelector("svg");

                        if(svg){
                            var iconSize = Math.floor(textHeight * 0.65);

                            svg.setAttribute("width", iconSize);
                            svg.setAttribute("height", iconSize);
                        }
                    });
                }
            });
        }

        function isAutoReflectedSharedBox(groupID, id){
            groupID = String(groupID);
            id = parseInt(id);

            var box = puzzleBoxes[id];
            if(!box || !hasGroup(box, groupID) || !hasExplicitGroup(box, groupID)){
                return false;
            }

            var groups = box.explicitGroups || [];
            if(groups.length < 2){
                return false;
            }

            for(var i=0; i<groups.length; i++){
                var otherGroup = String(groups[i]);

                if(otherGroup === groupID || !solvedGroups[otherGroup]){
                    continue;
                }

                if(idListContains(groupSelections[otherGroup], id)){
                    return true;
                }
            }

            return false;
        }

        function isLockedCandidateBoxForGroup(groupID, id){
            groupID = String(groupID);
            id = parseInt(id);

            var box = puzzleBoxes[id];
            if(!box || !hasExplicitGroup(box, groupID)){
                return false;
            }

            for(var i=0; i<lockedCandidateSelections.length; i++){
                if(idListContains(lockedCandidateSelections[i], id)){
                    return true;
                }
            }

            return false;
        }

        function validateGroupSelection(groupID, selectedIDs){
            selectedIDs = selectedIDs || [];
            var rightAnswerIDs = normalizeAnswerIDs(answer[groupID]);
            var effectiveSelectedIDs = getEffectiveSelectedIDs(groupID, selectedIDs);

            if(!selectedIDs.length || !rightAnswerIDs.length){
                return false;
            }

            for(var i=0; i<selectedIDs.length; i++){
                if(!idListContains(rightAnswerIDs, selectedIDs[i])){
                    return false;
                }
            }

            if(idListsMatch(effectiveSelectedIDs, rightAnswerIDs)){
                return true;
            }

            return false;
        }

        function updateInput(group, updateSolved){
            if(group === undefined || group === null){
                return;
            }

            group = String(group);
            if(!isAnswerGroup(group)){
                var nonAnswerKey = getInputKey(group);
                var legacyNonAnswerKey = getLegacyInputKey(group);
                var removed = false;

                if(SD.inputs[nonAnswerKey] && SD.inputs[nonAnswerKey].type === "puzzle"){
                    delete SD.inputs[nonAnswerKey];
                    removed = true;
                }

                if(SD.inputs[legacyNonAnswerKey] && SD.inputs[legacyNonAnswerKey].type === "puzzle"){
                    delete SD.inputs[legacyNonAnswerKey];
                    removed = true;
                }

                if(removed){
                    inputsChange(SD);
                }

                return;
            }

            var selected = groupSelections[group] || [];
            var input = ensurePuzzleInput(group);
            input.value = selected.length ? selected.slice() : null;
            input.type = "puzzle";
            input.locked = selected.length ? !!lockedGroups[group] : false;
            if(!selected.length){
                input.solved = false;
            }else if(updateSolved){
                input.solved = !!solvedGroups[group];
            }else if(input.solved !== true){
                input.solved = false;
            }

            /* console.log("SD.inputs", JSON.parse(JSON.stringify(SD.inputs))); */
            inputsChange(SD);
        }

        function boxColor(box, color){
            box.bg.style.backgroundColor = color;
        }

        function hasDragPressColor(){
            return dragPressColor !== undefined && dragPressColor !== null && dragPressColor !== "";
        }

        function getDragBorderColor(){
            return dragBorderColor !== undefined
            && dragBorderColor !== null
            && dragBorderColor !== ""
                ? dragBorderColor
                : "orange";
        }

        function hasGroup(box, group){
            return box && box.groups && box.groups.includes(String(group));
        }

        function hasExplicitGroup(box, group){
            return box && box.explicitGroups && box.explicitGroups.includes(String(group));
        }

        function isAnswerGroup(group){
            return Object.prototype.hasOwnProperty.call(answer, String(group));
        }

        function isPuzzleGroup(group){
            return Object.prototype.hasOwnProperty.call(groupSelections, String(group));
        }

        function allPuzzleAnswerGroupsSolved(){
            for(var group in answer){
                if(isPuzzleGroup(group) && !solvedGroups[group]){
                    return false;
                }
            }

            return true;
        }

        function getInputKey(group){
            return "box" + group;
        }

        function getLegacyInputKey(group){
            return "puzzlebox" + group;
        }

        function getPuzzleInputGroup(key, input){
            if(!input || input.type !== "puzzle"){
                return null;
            }

            if(key.indexOf("puzzleBox") === 0){
                return key.replace("puzzleBox", "");
            }

            if(key.indexOf("box") === 0){
                return key.replace("box", "");
            }

            return null;
        }

        function ensurePuzzleInput(group){
            group = String(group);
            if(!isAnswerGroup(group)){
                return null;
            }

            var key = getInputKey(group);
            var legacyKey = getLegacyInputKey(group);

            if(!groupSelections[group]){
                groupSelections[group] = [];
            }

            if(!SD.inputs[key]){
                if(SD.inputs[legacyKey] && SD.inputs[legacyKey].type === "puzzle"){
                    SD.inputs[key] = SD.inputs[legacyKey];
                    delete SD.inputs[legacyKey];
                }else{
                    SD.inputs[key] = {value: null, type: "puzzle", solved: false, locked: false};
                }
            }

            SD.inputs[key].type = "puzzle";
            if(!groupSelections[group].length){
                SD.inputs[key].value = null;
            }else if(SD.inputs[key].value === undefined){
                SD.inputs[key].value = null;
            }
            if(SD.inputs[key].solved === undefined){
                SD.inputs[key].solved = !!solvedGroups[group];
            }
            if(SD.inputs[key].locked === undefined){
                SD.inputs[key].locked = !!lockedGroups[group];
            }

            return SD.inputs[key];
        }

        function ensurePuzzleInputs(){
            for(var key in SD.inputs){
                var input = SD.inputs[key];
                var groupID = getPuzzleInputGroup(key, input);
                if(groupID === null){
                    continue;
                }

                if(!isAnswerGroup(groupID)){
                    delete SD.inputs[key];
                    continue;
                }

                var currentKey = key;
                var expectedKey = getInputKey(groupID);
                if(key !== expectedKey){
                    if(!SD.inputs[expectedKey]){
                        SD.inputs[expectedKey] = input;
                    }
                    delete SD.inputs[key];
                    currentKey = expectedKey;
                    input = SD.inputs[currentKey];
                }

                var selected = groupSelections[groupID] || [];
                var hasValue = input && (Array.isArray(input.value) ? input.value.length : input.value !== undefined && input.value !== null && input.value !== "");
                if(input && input.type === "puzzle" && !selected.length && !hasValue){
                    input.value = null;
                    input.solved = false;
                    input.locked = false;
                }else if(input && input.type === "puzzle"){
                    if(input.solved === undefined){
                        input.solved = false;
                    }
                    if(input.locked === undefined){
                        input.locked = false;
                    }
                }
            }

            for(var answerGroup in answer){
                ensurePuzzleInput(answerGroup);
            }
        }

        function addSelectedGroup(box, group){
            group = String(group);
            if(!box.selectedGroups.includes(group)){
                box.selectedGroups.push(group);
            }

            box.selected = box.selectedGroups.length > 0;
        }

        function removeSelectedGroup(box, group){

            group = String(group);
            box.selectedGroups = box.selectedGroups.filter(function(selectedGroup){
                return selectedGroup !== group;
            });
            box.selected = box.selectedGroups.length > 0;
        }

        function setGroupStatus(box, group, status){

            group = String(group);
            if(status){
                box.groupStatus[group] = status;
            }else{
                delete box.groupStatus[group];
            }

            box.status = null;

            for(var statusGroup in box.groupStatus){
                if(box.groupStatus[statusGroup] === "right"){
                    box.status = "right";
                    return;
                }
            }

            for(var statusGroup in box.groupStatus){
                if(box.groupStatus[statusGroup] === "wrong"){
                    box.status = "wrong";
                    return;
                }
            }
        }

        function hasAnyRightStatus(box){
            for(var group in box.groupStatus){
                if(box.groupStatus[group] === "right"){
                    return true;
                }
            }

            return false;
        }

        function refreshBoxView(box){
            if(hasAnyRightStatus(box)){
                boxColor(box, "#008000");
            }else if(hasLockedSelection(box) || hasLockedCandidateBox(box)){
                boxColor(box, "#64748b");
            }else if(hasUnlockedSelectedGroup(box) || hasPendingCandidateBox(box)){
                boxColor(
                    box,
                    hasDragPressColor()
                        ? dragPressColor
                        : "rgba(192, 192, 192, 1)"
                );
            }else if(box.selectedGroups.length){
                boxColor(
                    box,
                    hasDragPressColor()
                        ? dragPressColor
                        : "rgba(192, 192, 192, 1)"
                );
            }else{
                boxColor(box, box.defaultColor);
            }

            var showDragBorder = dragBorderBoxes[box.id] === true;

            box.bg.style.border = box.dragging || showDragBorder
                ? "4px solid " + getDragBorderColor()
                : "none";

            box.bg.style.boxSizing = "border-box";

            box.main.style.pointerEvents = "auto";
        }

        function clearDragBorders(){
            var oldBorderBoxes = dragBorderBoxes;
            dragBorderBoxes = {};

            for(var id in oldBorderBoxes){
                var box = puzzleBoxes[id];
                if(box){
                    box.dragging = false;
                    refreshBoxView(box);
                }
            }
        }

        function defaultBox(box){
            box.status = null;
            box.groupStatus = {};
            box.selectedGroups = [];
            box.selected = false;
            box.dragging = false;
            delete dragBorderBoxes[box.id];
            box.bg.style.border = "none";
            box.bg.style.boxSizing = "border-box";
            box.main.style.border = "2px solid transparent";
            box.main.style.pointerEvents = "auto";
            boxColor(box, box.defaultColor);
        }

        function clearGroupState(group){
            var selected = groupSelections[group] || [];
            var keepSelected = [];

            selected.map(function(id){
                var box = puzzleBoxes[id];

                if(!box){
                    return;
                }

                if(box.groupStatus[group] === "right"){
                    keepSelected.push(id);
                    return;
                }

                if(lockedGroups[group]){
                    keepSelected.push(id);
                    return;
                }

                removeSelectedGroup(box, group);
                setGroupStatus(box, group, null);
                refreshBoxView(box);
            });

            groupSelections[group] = keepSelected;
        }

        function preserveSolvedGroup(group){
            var selected = groupSelections[group] || [];
            var keepSelected = [];

            selected.map(function(id){
                var box = puzzleBoxes[id];

                if(!box){
                    return;
                }

                if(box.groupStatus[group] === "right"){
                    keepSelected.push(id);
                    return;
                }

                if(lockedGroups[group]){
                    keepSelected.push(id);
                    return;
                }

                removeSelectedGroup(box, group);
                setGroupStatus(box, group, null);
                refreshBoxView(box);
            });

            groupSelections[group] = keepSelected;
            updateInput(group);
        }

        function getBoxSelectionGroups(box){
            if(!box || !box.explicitGroups){
                return [];
            }

            return box.explicitGroups.filter(function(group){
                return !solvedGroups[group];
            });
        }

        function isBoxFullyClosed(box){
            if(!box || !box.explicitGroups || !box.explicitGroups.length){
                return false;
            }

            for(var i=0; i<box.explicitGroups.length; i++){
                var group = box.explicitGroups[i];
                if(!solvedGroups[group]){
                    return false;
                }
            }

            return true;
        }

        function hasUnlockedSelectedGroup(box){
            if(!box || !box.selectedGroups){
                return false;
            }

            for(var i=0; i<box.selectedGroups.length; i++){
                var group = box.selectedGroups[i];
                if(!solvedGroups[group]){
                    return true;
                }
            }

            return false;
        }

        function hasLockedSelection(box){
            if(!box || !box.selectedGroups){
                return false;
            }

            for(var i=0; i<box.selectedGroups.length; i++){
                if(lockedGroups[box.selectedGroups[i]]){
                    return true;
                }
            }

            return false;
        }

        function hasPendingCandidateBox(box){
            return box && idListContains(pendingCandidateSelection, box.id);
        }

        function hasLockedCandidateBox(box){
            if(!box){
                return false;
            }

            for(var i=0; i<lockedCandidateSelections.length; i++){
                if(idListContains(lockedCandidateSelections[i], box.id)){
                    return true;
                }
            }

            return false;
        }

        function addBox(box){
            if(!box){
                return;
            }

            box.dragging = true;
            dragBorderBoxes[box.id] = true;

            var targetGroups = getBoxSelectionGroups(box);
            if(!targetGroups.length){
                refreshBoxView(box);
                return;
            }

            if(!pendingCandidateSelection.includes(box.id)){
                pendingCandidateSelection.push(box.id);
            }

            refreshBoxView(box);
            controlBtnViewCheck();
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function boxFromPoint(clientX, clientY){
            var target = document.elementFromPoint(clientX, clientY);

            while(target){
                if(target.dataset && target.dataset.puzzleId !== undefined){
                    return puzzleBoxes[parseInt(target.dataset.puzzleId)];
                }

                target = target.parentElement;
            }

            return null;
        }

        function startDrag(box, event){
            if(!box){
                return;
            }

            event.preventDefault();
            clearDragBorders();
            isDragging = true;
            box.dragging = true;
            dragBorderBoxes[box.id] = true;
            refreshBoxView(box);
            addBox(box);
        }

        function moveDrag(event){
            if(!isDragging){
                return;
            }

            addBox(boxFromPoint(event.clientX, event.clientY));
        }

        function endDrag(){
            if(!isDragging){
                return;
            }

            isDragging = false;
            puzzleBoxes.map(function(box){
                if(!box){
                    return;
                }

                box.dragging = false;
                refreshBoxView(box);
            });

            controlBtnViewCheck();
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function undoBtnView(status){
            if(!puzzleUndoBtn){
                return;
            }

            var enabled = status === "enable";
            var bg = puzzleUndoBtn.querySelector(".puzzleUndoBg");
            var txt = puzzleUndoBtn.querySelector(".puzzleUndoTxt");

            puzzleUndoBtn.style.opacity = enabled ? 1 : 0.55;
            puzzleUndoBtn.style.cursor = enabled ? "pointer" : "default";
            puzzleUndoBtn.style.pointerEvents = enabled ? "auto" : "none";

            if(bg){
                bg.style.backgroundColor = enabled ? "#2563eb" : "#eef2f7";
                bg.style.outlineColor = enabled ? "#1d4ed8" : "#94a3b8";
            }

            if(txt){
                txt.style.color = enabled ? "#ffffff" : "#475569";
            }
        }

        function undoBtnViewCheck(){
            var found = pendingCandidateSelection.length || candidateWordList.length;

            for(var group in groupSelections){
                var hasOpenSelection = groupSelections[group].some(function(id){
                    return puzzleBoxes[id] && puzzleBoxes[id].groupStatus[group] !== "right";
                });

                if(hasOpenSelection){
                    found = true;
                    break;
                }
            }

            undoBtnView(found ? "enable" : "disable");
        }

        function lockBtnView(status){
            if(!puzzleLockBtn){
                return;
            }

            var enabled = status === "enable";
            var bg = puzzleLockBtn.querySelector(".puzzleLockBg");
            var txt = puzzleLockBtn.querySelector(".puzzleLockTxt");

            puzzleLockBtn.style.opacity = enabled ? 1 : 0.55;
            puzzleLockBtn.style.cursor = enabled ? "pointer" : "default";
            puzzleLockBtn.style.pointerEvents = enabled ? "auto" : "none";

            if(bg){
                bg.style.backgroundColor = enabled ? "#22c55e" : "#eef2f7";
                bg.style.outlineColor = enabled ? "#15803d" : "#94a3b8";
            }

            if(txt){
                txt.style.color = enabled ? "#ffffff" : "#475569";
            }
        }

        function lockBtnViewCheck(){
            lockBtnView(hasLockableSelectionGroup() ? "enable" : "disable");
        }

        function hasLockedSelectionGroup(){
            for(var group in lockedGroups){
                if(!solvedGroups[group] && lockedGroups[group] && groupSelections[group] && groupSelections[group].length){
                    return true;
                }
            }

            return false;
        }

        function hasLockableSelectionGroup(){
            if(pendingCandidateSelection.length){
                return true;
            }

            for(var group in groupSelections){
                if(!solvedGroups[group] && !lockedGroups[group] && groupSelections[group] && groupSelections[group].length){
                    return true;
                }
            }

            return false;
        }

        function getLockableSelectionGroups(){
            var groups = [];

            for(var group in groupSelections){
                if(shouldLockSelectionGroup(group)){
                    groups.push(group);
                }
            }

            return groups;
        }

        function isSharedSelectionReflectedFromAnotherGroup(groupID, id){
            var box = puzzleBoxes[parseInt(id)];
            groupID = String(groupID);

            if(!box || !box.explicitGroups || box.explicitGroups.length < 2){
                return false;
            }

            if(!hasExplicitGroup(box, groupID)){
                return false;
            }

            for(var i=0; i<box.explicitGroups.length; i++){
                var otherGroup = String(box.explicitGroups[i]);

                if(otherGroup === groupID){
                    continue;
                }

                if(groupSelections[otherGroup] && groupSelections[otherGroup].includes(box.id)){
                    return true;
                }
            }

            return false;
        }

        function hasOwnSelection(groupID){
            var selectedIDs = groupSelections[groupID] || [];

            for(var i=0; i<selectedIDs.length; i++){
                if(!isSharedSelectionReflectedFromAnotherGroup(groupID, selectedIDs[i])){
                    return true;
                }
            }

            return false;
        }

        function shouldLockSelectionGroup(groupID){
            var selectedIDs = groupSelections[groupID] || [];

            if(!selectedIDs.length || lockedGroups[groupID]){
                return false;
            }

            if(!hasOwnSelection(groupID)){
                return false;
            }

            if(
                isAnswerGroup(groupID)
                && validateGroupSelection(groupID, selectedIDs)
            ){
                return true;
            }

            return true;
        }

        ensurePuzzleInputs();

        SP.elementList.forEach(function(element){
            if(element.id.includes("puzzleBox")){
                var id = parseInt(element.id.split("_")[1]);
                var txt = element.main.querySelector(".wordTxt");
                var bg = element.main.querySelector(".puzzleBg") || txt;
                var groupValue = getGroupValue(element, id);
                var groups = groupValue.groups;
                var group = groups[0];

                puzzleBoxes[id] = {
                    id: id,
                    group: group,
                    groups: groups,
                    explicitGroups: groups.slice(),
                    main: element.main,
                    txt: txt,
                    bg: bg,
                    letter: normalizeText(txt.innerText || txt.textContent),
                    defaultColor: bg.style.backgroundColor || "rgb(255, 255, 255)",
                    selected: false,
                    selectedGroups: [],
                    dragging: false,
                    groupStatus: {},
                    status: null
                };

                groups.map(function(group){
                    if(!groupSelections[group]){
                        groupSelections[group] = [];
                    }

                });

                element.main.dataset.puzzleId = id;
                txt.dataset.puzzleId = id;
                bg.dataset.puzzleId = id;
                element.main.style.cursor = "pointer";
                element.main.style.userSelect = "none";
                txt.style.userSelect = "none";

                element.main.addEventListener("pointerdown", function(event){
                    startDrag(puzzleBoxes[id], event);
                });
            }else if(element.id.includes("puzzleUndo")){
                puzzleUndoBtn = element.main;
                element.main.style.userSelect = "none";

                element.main.addEventListener("click", function(event){
                    event.preventDefault();
                    undoSelectionFNC();
                });

                undoBtnView("disable");
            }else if(element.id.includes("puzzleLock")){
                puzzleLockBtn = element.main;
                element.main.style.userSelect = "none";

                element.main.addEventListener("click", function(event){
                    event.preventDefault();
                    lockSelectionFNC();
                });

                lockBtnView("disable");
            }else if(element.id.includes("puzzleCandidates")){
                var candidateText = element.main.querySelector(".puzzleCandidatesText");
                if(candidateText){
                    candidateText.style.whiteSpace = "pre-line";
                    candidateText.style.overflowX = "hidden";
                    candidateText.style.overflowY = "auto";
                }

                puzzleCandidatePanels.push({
                    main: element.main,
                    text: candidateText
                });

                updateCandidateWordsView();
            }
        });

        document.addEventListener("pointermove", moveDrag);
        document.addEventListener("pointerup", endDrag);

        function controlBtnViewCheck(){
            controlBtnView(SP, candidateWordList.length || hasLockedSelectionGroup() ? "enable" : "disable");
        }

        function checkAnswer(){
            clearDragBorders();

            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"puzzle", complete:false};
            var currentWrongCount = 0;

            candidateWordList.map(function(candidateIDs){
                var selectedIDs = (candidateIDs || []).slice();
                if(!selectedIDs.length){
                    return;
                }

                var rightGroup = getCandidateAnswerGroup(selectedIDs);
                if(rightGroup !== null){
                    setCandidateRight(rightGroup, selectedIDs);
                }else if(isSolvedAnswerCandidate(selectedIDs)){
                    return;
                }else{
                    currentWrongCount++;
                    setCandidateWrong(selectedIDs);
                }
            });

            for(var group in answer){
                if(!isPuzzleGroup(group)){
                    continue;
                }

                if(solvedGroups[group]){
                    score.totalRight++;
                }else{
                    score.totalEmpty++;
                }
            }

            cumulativeWrongTotal = (SD.wrong || 0) + currentWrongCount;
            score.totalWrong = cumulativeWrongTotal;

            score.complete = allPuzzleAnswerGroupsSolved();
            if(score.complete){
                score.totalWrong = 0;
                score.totalEmpty = 0;
            }

            return score;
        }

        function controlAfterFNC(){
            if(allPuzzleAnswerGroupsSolved() && cumulativeWrongTotal){
                SD.wrong = cumulativeWrongTotal;

                if(SD.historyRight.length){
                    SD.historyRight[SD.historyRight.length - 1].wrong = cumulativeWrongTotal;
                }
            }

            puzzleBoxes.map(function(box){
                if(!box){
                    return;
                }

                if(box.status === "wrong"){
                    boxColor(box, "#c62828");
                }else{
                    refreshBoxView(box);
                }
            });

            setTimeout(resetWrong, 1000);
        }

        function resetWrong(){
            for(var group in groupSelections){
                if(solvedGroups[group]){
                    continue;
                }

                var keepSelected = [];
                groupSelections[group].map(function(id){
                    var box = puzzleBoxes[id];
                    if(!box){
                        return;
                    }

                    if(box.groupStatus[group] === "right"){
                        keepSelected.push(id);
                    }else{
                        removeSelectedGroup(box, group);
                        setGroupStatus(box, group, null);
                        refreshBoxView(box);
                    }
                });

                groupSelections[group] = keepSelected;
                delete lockedGroups[group];
                updateInput(group);
            }

            pendingCandidateSelection = [];
            lockedCandidateSelections = [];
            candidateWordList = [];
            updateCandidateWordsView();
            puzzleBoxes.map(function(box){
                if(!box){
                    return;
                }

                Object.keys(box.groupStatus).map(function(group){
                    if(box.groupStatus[group] !== "right"){
                        setGroupStatus(box, group, null);
                    }
                });

                refreshBoxView(box);
            });
            controlBtnViewCheck();
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function undoSelectionFNC(){
            clearDragBorders();

            for(var group in groupSelections){
                var keepSelected = [];
                groupSelections[group].map(function(id){
                    var box = puzzleBoxes[id];
                    if(!box){
                        return;
                    }

                    if(box.groupStatus[group] === "right"){
                        keepSelected.push(id);
                    }else{
                        removeSelectedGroup(box, group);
                        setGroupStatus(box, group, null);
                        refreshBoxView(box);
                    }
                });

                groupSelections[group] = keepSelected;
                delete lockedGroups[group];
                updateInput(group);
            }

            isDragging = false;
            pendingCandidateSelection = [];
            lockedCandidateSelections = [];
            candidateWordList = [];
            updateCandidateWordsView();
            puzzleBoxes.map(function(box){
                if(box){
                    refreshBoxView(box);
                }
            });
            controlBtnViewCheck();
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function lockSelectionFNC(){
            clearDragBorders();
            var lockableGroups = getLockableSelectionGroups();
            var candidateSelection = pendingCandidateSelection.slice();

            if(!candidateSelection.length){
                lockableGroups.map(function(group){
                    (groupSelections[group] || []).map(function(id){
                        if(!candidateSelection.includes(id)){
                            candidateSelection.push(id);
                        }
                    });
                });
            }

            saveCandidateWord(candidateSelection);
            var candidateGroup = getCandidateAnswerGroup(candidateSelection);
            if(candidateGroup){
                groupSelections[candidateGroup] = candidateSelection.slice();

                updateInput(candidateGroup);
            }
            if(candidateSelection.length){
                lockedCandidateSelections.push(candidateSelection.slice());
            }

            lockableGroups.map(function(group){
                var selectedIDs = groupSelections[group] || [];

                lockedGroups[group] = true;
                updateInput(group);
                selectedIDs.map(function(id){
                    var box = puzzleBoxes[id];
                    if(box){
                        refreshBoxView(box);
                    }
                });
            });

            isDragging = false;
            pendingCandidateSelection = [];
            puzzleBoxes.map(function(box){
                if(box){
                    refreshBoxView(box);
                }
            });
            controlBtnViewCheck();
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function answerActionFNC(){
            clearDragBorders();
            resetFNC();

            for(var group in answer){
                if(!isPuzzleGroup(group)){
                    continue;
                }

                var answerIDs = normalizeAnswerIDs(answer[group]);
                var selected = [];

                answerIDs.map(function(id){
                    var box = puzzleBoxes[id];

                    if(!box || selected.includes(box.id)){
                        return;
                    }

                    if(hasExplicitGroup(box, group)){
                        selected.push(box.id);
                        addSelectedGroup(box, group);
                        setGroupStatus(box, group, "right");
                        refreshBoxView(box);
                    }
                });

                groupSelections[group] = selected;
                solvedGroups[group] = true;
                lockedGroups[group] = true;
                updateInput(group, true);
            }

            controlBtnView(SP, "disable");
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function addBoxToGroupSelection(groupID, box){
            if(!box){
                return;
            }

            if(!groupSelections[groupID]){
                groupSelections[groupID] = [];
            }

            if(groupSelections[groupID].includes(box.id)){
                return;
            }

            groupSelections[groupID].push(box.id);
            addSelectedGroup(box, groupID);
            refreshBoxView(box);
        }

        function addHistorySelection(groupID, value){
            var ids = normalizeAnswerIDs(value);

            if(!ids.length){
                return false;
            }

            ids.map(function(id){
                var box = puzzleBoxes[id];

                if(!box){
                    return;
                }

                if(isAnswerGroup(groupID) || hasGroup(box, groupID)){
                    addBoxToGroupSelection(groupID, box);
                }
            });

            return true;
        }

        function addHistoryWord(groupID, value){
            value = normalizeText(value);
            if(!value.length){
                return;
            }

            var groupBoxes = puzzleBoxes.filter(function(box){
                return box && (isAnswerGroup(groupID) ? hasExplicitGroup(box, groupID) : hasGroup(box, groupID));
            });

            value.split("").map(function(letter){
                for(var i=0; i<groupBoxes.length; i++){
                    var box = groupBoxes[i];
                    if(!groupSelections[groupID].includes(box.id) && box.letter === letter){
                        addBoxToGroupSelection(groupID, box);
                        break;
                    }
                }
            });
        }

        function hasPuzzleHistoryValue(inputs){
            for(var group in inputs){
                var input = inputs[group];
                if(!input || input.type !== "puzzle"){
                    continue;
                }

                var value = input.value;
                if(Array.isArray(value) ? value.length : value !== undefined && value !== null && value !== ""){
                    return true;
                }
            }

            return false;
        }

        function addHistory(){
            var historyInputs = historyExtract(SP, "puzzle");
            historyInputs = JSON.parse(JSON.stringify(historyInputs));

            clearDragBorders();
            ensurePuzzleInputs();
            if(!hasPuzzleHistoryValue(historyInputs)){
                historyInputs = SD.inputs;
            }

            for(var group in historyInputs){
                var input = historyInputs[group];
                var groupID = getPuzzleInputGroup(group, input);
                if(groupID === null){
                    continue;
                }

                var value = input.value;
                var solved = input.solved === true;
                var locked = input.locked === true;
                clearGroupState(groupID);
                if(value === undefined || value === null || value === ""){
                    delete solvedGroups[groupID];
                    delete lockedGroups[groupID];
                    updateInput(groupID);
                    continue;
                }

                if(!addHistorySelection(groupID, value)){
                    addHistoryWord(groupID, value);
                }

                if(solved){
                    solvedGroups[groupID] = true;
                    lockedGroups[groupID] = true;
                    (groupSelections[groupID] || []).map(function(id){
                        var box = puzzleBoxes[id];
                        if(box){
                            setGroupStatus(box, groupID, "right");
                            refreshBoxView(box);
                        }
                    });
                }else{
                    delete solvedGroups[groupID];
                    if(locked){
                        lockedGroups[groupID] = true;
                    }else{
                        delete lockedGroups[groupID];
                    }
                }

                updateInput(groupID, solved);
            }

            ensurePuzzleInputs();
            controlBtnViewCheck();
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function resetFNC(){
            console.log("resetFNC");
            clearDragBorders();
            solvedGroups = {};
            lockedGroups = {};
            candidateWordList = [];
            pendingCandidateSelection = [];
            lockedCandidateSelections = [];
            updateCandidateWordsView();

            puzzleBoxes.map(function(box){
                if(box){
                    defaultBox(box);
                }
            });

            for(var group in groupSelections){
                groupSelections[group] = [];
                updateInput(group);
            }

            for(var answerGroup in answer){
                if(!isPuzzleGroup(answerGroup)){
                    continue;
                }

                updateInput(answerGroup);
            }

            controlBtnViewCheck();
            undoBtnViewCheck();
            lockBtnViewCheck();
        }

        function close(){
            puzzleBoxes.map(function(box){
                if(box){
                    box.main.style.pointerEvents = "none";
                }
            });
        }

        var evaluation = {
            control: checkAnswer,
            wrong: controlAfterFNC,
            right: controlAfterFNC,
            answer: answerActionFNC,
            history: addHistory,
            reset: resetFNC,
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** Add freeDraw **/
    this.initFREEDRAW = function(SP, SD, index){
        console.log("initFreeDraw");

        var isPaint = false;
        var lastLine;
        var mod = "source-over";
        var lastPointerPos = {x: 0, y: 0};
        var activeStageID;
        var defaultTextValue = "Lorem ipsum";
        var closeActiveTextEditor = null;

        var draw = {konva:[], textNodes:[], selectedText: null};

        var settings = {
            /* Douglas Peucker Tolerans 0-10 */
            dp_tolerans: 1,

            /* Çizim anında yumuşaklık */
            kv_tolerans: 0.2,

            /* Sadece 3 pikselden fazla hareket varsa nokta ekle */
            minDistance: 3,

            brushSize: 4,
            eraserSize: 32,
            activeSize:0,
            brushColor: "#ffffff",
            textFontSize: 24
        }

        for(var prop in jsonV2.slides[index].scene){
            settings[prop] = parseInt(jsonV2.slides[index].scene[prop]);
        }

        SP.elementList.map(function(element){
            if(element.id.includes("freeDrawCanvas")){
                var id = parseInt(element.id.split("_")[1]);
                var canvas = element.main.querySelector(".canvas");
                var canvasRect = canvas.getBoundingClientRect();

                draw.konva[id] = {
                    id: id,
                    canvasDOM: canvas,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                    textAddCount: 0
                }

                addCanvas(draw.konva[id]);
                SD.inputs["box"+ id] = {value: null, type: "freeDraw"};
            }else if(element.id.includes("freeDrawNav")){
                draw.navMain = element.main;
                draw.drawBox = element.main.querySelector(".drawBox");
                draw.eraserBox = element.main.querySelector(".eraserBox");
                draw.textBox = element.main.querySelector(".textBox");
                draw.dragBox = element.main.querySelector(".dragBox");
                draw.dragBoxLabel = element.main.querySelector(".dragBoxLabel");
                draw.fontSizeBox = element.main.querySelector(".fontSizeBox");
                draw.colorPalette = element.main.querySelector(".color");
                draw.cleanCanvas = element.main.querySelector(".clean");

                if(element.data && element.data.textFontSize){
                    settings.textFontSize = normalizeTextFontSize(element.data.textFontSize);
                }

                draw.drawBox.addEventListener("click",function(){
                    mod = "source-over";
                    setTextDragMode(false);
                    mouseCursorStatus();
                });

                draw.eraserBox.addEventListener("click",function(){
                    mod = "destination-out";
                    setTextDragMode(false);
                    mouseCursorStatus();
                });

                if(draw.textBox){
                    draw.textBox.addEventListener("click",function(){
                        mod = "textDrag";
                        addText(getActiveDrawCanvas());
                        setTextDragMode(true);
                        mouseCursorStatus();
                    });

                    draw.textBox.style.cursor = "pointer";
                }

                if(draw.dragBox){
                    draw.dragBox.style.display = "none";
                }

                if(draw.dragBoxLabel){
                    draw.dragBoxLabel.style.display = "none";
                }

                if(draw.fontSizeBox){
                    draw.fontSizeInput = createTextFontSizeInput(draw.fontSizeBox, settings.textFontSize);
                    draw.fontSizeBox.remove();
                }

                draw.cleanCanvas.addEventListener("click",function(){
                    checkRightAnswer();
                    clearStage(activeStageID);
                });

                draw.cleanCanvas.style.cursor = "pointer";

                if(draw.colorPalette){
                    const colorInput = document.createElement('input');
                    colorInput.type = "color";
                    colorInput.className = 'colorPalette';
                    colorInput.value = draw.colorPalette.style.backgroundColor;

                    Object.assign(colorInput.style, {
                        left: draw.colorPalette.style.left,
                        top: draw.colorPalette.style.top,
                        borderRadius: draw.colorPalette.style.borderRadius,
                        border: "none",
                        overflow: "hidden",
                        width: draw.colorPalette.style.width,
                        height: draw.colorPalette.style.height,
                        padding: 0,
                        position: "absolute",
                        cursor: "pointer"
                    });

                    draw.colorPalette.remove();
                    draw.eraserBox.after(colorInput);
                    draw.colorPalette = colorInput;
                    settings.brushColor = draw.colorPalette.value;

                    draw.colorPalette.addEventListener("input", function(){
                        changeDrawColor(this.value);
                    });

                    draw.colorPalette.addEventListener("change", function(){
                        changeDrawColor(this.value);
                    });

                    draw.colorPalette.addEventListener("click", function(){
                        mod = "source-over";
                        setTextDragMode(false);
                        mouseCursorStatus();
                    });
                }
            }
        });
        function changeDrawColor(color){
            settings.brushColor = color;
            if(draw.selectedText && draw.selectedText.getStage()){
                draw.selectedText.fill(color);
                updateTextSelection();
                getSceneBase64();
            }
        }

        function getSqSegDist(p, p1, p2) {
            var x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y;
            if (dx !== 0 || dy !== 0) {
                var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
                if (t > 1) {
                    x = p2.x;
                    y = p2.y;
                } else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }
            dx = p.x - x;
            dy = p.y - y;
            return dx * dx + dy * dy;
        }


        function simplifyStep(points, first, last, sqTolerance, simplified) {
            var maxSqDist = sqTolerance, index;
            for (var i = first + 1; i < last; i++) {
                var sqDist = getSqSegDist(points[i], points[first], points[last]);
                if (sqDist > maxSqDist) {
                    index = i;
                    maxSqDist = sqDist;
                }
            }

            if (maxSqDist > sqTolerance) {
                if (index - first > 1) {
                    simplifyStep(points, first, index, sqTolerance, simplified);
                }

                simplified.push(points[index]);

                if (last - index > 1) {
                    simplifyStep(points, index, last, sqTolerance, simplified);
                }
            }
        }

        function simplify(points, tolerance) {
            if (points.length <= 2) return points;
            var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
            var simplified = [points[0]];
            simplifyStep(points, 0, points.length - 1, sqTolerance, simplified);
            simplified.push(points[points.length - 1]);
            return simplified;
        }

        /* ---------------------------- */

        function getDist(p1, p2) {
            return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        }


        function addCanvas(DX){
            DX.stage =  new Konva.Stage({container: DX.canvasDOM, width: DX.canvasWidth, height: DX.canvasHeight});
            DX.layer = new Konva.Layer();
            DX.stage.add(DX.layer);
            DX.pointerInside = false;

            DX.stage.container().addEventListener("mouseenter", function(){
                DX.pointerInside = true;
                activeStageID = DX.id;
                applyFreeDrawCursor();
            });

            DX.stage.container().addEventListener("mouseleave", function(){
                DX.pointerInside = false;
                DX.stage.container().style.cursor = "default";
            });

            DX.emptyDataLength = DX.stage.toDataURL().length;
            DX.stage.on('mousedown touchstart', function(e) {
                activeStageID = DX.id;
                if(e.target !== DX.stage){
                    isPaint = false;
                    return;
                }

                clearTextSelection();

                var pos = DX.stage.getPointerPosition();

                if(mod === "text"){
                    if(closeActiveTextEditor){
                        closeActiveTextEditor(true);
                    }

                    if(e.evt){
                        e.evt.preventDefault();
                        e.evt.stopPropagation();
                    }
                    return;
                }

                isPaint = true;
                lastLine = new Konva.Line({
                    stroke: settings.brushColor,
                    strokeWidth: settings.activeSize,
                    globalCompositeOperation: mod,
                    lineCap: "round",
                    lineJoin: "round",
                    tension: settings.kv_tolerans,
                    points: [pos.x, pos.y],
                    perfectDrawEnabled: false,
                    listening: false,
                    hitGraphEnabled: false,
                    shadowForStrokeEnabled: false
                });
                DX.layer.add(lastLine);
            });

            DX.stage.on("mousemove touchmove", function (e) {
                if (!isPaint) return;

                e.evt.preventDefault();
                var pos = DX.stage.getPointerPosition();

                /* Performans Kilidi: Eğer çok az hareket ettiyse işlem yapma */
                if (getDist(lastPointerPos, pos) < settings.minDistance) {
                    return;
                }

                lastPointerPos = pos;

                var newPoints = lastLine.points().concat([pos.x, pos.y]);
                lastLine.points(newPoints);

                /* Konva'nın en performanslı çizim metodu */
                DX.layer.batchDraw();
            });


            DX.stage.on("mouseup touchend", function(e) {
                drawEnd(DX);
                e.evt.preventDefault();
                e.evt.stopPropagation();
            });

        }

        function getActiveDrawCanvas(){
            if(activeStageID !== undefined && draw.konva[activeStageID]){
                return draw.konva[activeStageID];
            }

            for(var i=0; i<draw.konva.length; i++){
                if(draw.konva[i]){
                    activeStageID = draw.konva[i].id;
                    return draw.konva[i];
                }
            }
        }

        function setTextDragMode(enabled){
            draw.textNodes.map(function(text){
                text.draggable(false);
            });
        }

        function getTextCanvas(text){
            var stage = text.getStage();
            for(var i=0; i<draw.konva.length; i++){
                if(draw.konva[i] && draw.konva[i].stage === stage){
                    return draw.konva[i];
                }
            }
        }

        function getSelectionBox(DX){
            if(!DX.selectionBox){
                DX.selectionBox = new Konva.Rect({
                    stroke: "blue",
                    strokeWidth: 1,
                    listening: false,
                    perfectDrawEnabled: false,
                    visible: false
                });
                DX.layer.add(DX.selectionBox);
            }

            return DX.selectionBox;
        }

        function clearTextSelection(){
            draw.selectedText = null;
            setFontSizeInputStatus(false);
            draw.konva.map(function(konva){
                if(konva && konva.selectionBox){
                    konva.selectionBox.hide();
                    konva.layer.batchDraw();
                }
            });
        }

        function updateTextSelection(){
            var text = draw.selectedText;
            if(!text || !text.getStage()){
                clearTextSelection();
                return;
            }

            var DX = getTextCanvas(text);
            if(!DX){
                return;
            }

            var scale = text.getAbsoluteScale();
            var selectionBox = getSelectionBox(DX);
            selectionBox.setAttrs({
                x: text.x(),
                y: text.y(),
                width: text.width() * scale.x,
                height: text.height() * scale.y
            });
            selectionBox.show();
            selectionBox.moveToTop();
            DX.layer.batchDraw();
        }

        function setFontSizeInputStatus(enabled){
            if(!draw.fontSizeInput){
                return;
            }

            draw.fontSizeInput.disabled = !enabled;
            draw.fontSizeInput.style.opacity = enabled ? 1 : 0.45;
            draw.fontSizeInput.style.cursor = enabled ? "text" : "default";
        }

        function selectTextNode(DX, text){
            draw.selectedText = text;
            activeStageID = DX.id;
            if(draw.fontSizeInput){
                draw.fontSizeInput.value = normalizeTextFontSize(text.fontSize());
                setFontSizeInputStatus(true);
            }
            updateTextSelection();
        }

        function withSelectionHidden(callback){
            var visibleBoxes = [];
            draw.konva.map(function(konva){
                if(konva && konva.selectionBox && konva.selectionBox.visible()){
                    visibleBoxes.push(konva);
                    konva.selectionBox.hide();
                    konva.layer.batchDraw();
                }
            });

            var result = callback();

            visibleBoxes.map(function(konva){
                konva.selectionBox.show();
                konva.selectionBox.moveToTop();
                konva.layer.batchDraw();
            });

            return result;
        }

        function normalizeTextFontSize(value){
            var size = parseInt(value, 10);
            if(isNaN(size)){
                return 24;
            }

            return Math.min(Math.max(size, 8), 96);
        }

        function createTextFontSizeInput(sourceBox, value){
            var label = draw.navMain.querySelector(".fontSizeBoxLabel");
            var input = document.createElement("input");
            input.type = "number";
            input.min = "8";
            input.max = "96";
            input.step = "1";
            input.value = normalizeTextFontSize(value);
            input.className = "fontSizeInput";
            input.disabled = true;

            Object.assign(input.style, {
                left: sourceBox.style.left,
                top: sourceBox.style.top,
                borderRadius: sourceBox.style.borderRadius,
                border: "none",
                width: sourceBox.style.width,
                height: sourceBox.style.height,
                padding: 0,
                position: "absolute",
                boxSizing: "border-box",
                textAlign: "center",
                fontFamily: "Nunito, Arial, sans-serif",
                fontSize: "18px",
                fontWeight: "700",
                color: "#183153",
                background: "#ffffff",
                cursor: "text",
                appearance: "textfield",
                WebkitAppearance: "textfield",
                MozAppearance: "textfield"
            });
            input.style.opacity = 0.45;
            input.style.cursor = "default";
            if(!document.getElementById("fontSizeInputStyle")){
                var style = document.createElement("style");
                style.id = "fontSizeInputStyle";
                style.textContent = `
                .fontSizeInput::-webkit-outer-spin-button,
                .fontSizeInput::-webkit-inner-spin-button{
                    -webkit-appearance: none;
                    margin: 0;
                }
    
                .fontSizeInput{
                    appearance: textfield;
                    -webkit-appearance: textfield;
                    -moz-appearance: textfield;
                }
            `;
                document.head.appendChild(style);
            }
            function updateFontSize(){
                settings.textFontSize = normalizeTextFontSize(input.value);
                input.value = settings.textFontSize;
                if(draw.selectedText && draw.selectedText.getStage()){
                    draw.selectedText.fontSize(settings.textFontSize);
                    updateTextSelection();
                    getSceneBase64();
                }
            }

            input.addEventListener("input", function(){
                if(this.value === ""){
                    return;
                }

                settings.textFontSize = normalizeTextFontSize(this.value);
                if(draw.selectedText && draw.selectedText.getStage()){
                    draw.selectedText.fontSize(settings.textFontSize);
                    updateTextSelection();
                    getSceneBase64();
                }
            });

            input.addEventListener("change", updateFontSize);
            input.addEventListener("click", function(e){
                e.stopPropagation();
            });
            input.addEventListener("mousedown", function(e){
                e.stopPropagation();
            });
            input.addEventListener("touchstart", function(e){
                e.stopPropagation();
            });

            if(label){
                label.remove();
            }

            draw.navMain.appendChild(input);
            return input;
        }

        function getNextTextPosition(DX){
            var positions = [
                {x: 0, y: 0},
                {x: 90, y: 45},
                {x: -90, y: 45},
                {x: 90, y: -45},
                {x: -90, y: -45},
                {x: 0, y: 90},
                {x: 0, y: -90},
                {x: 140, y: 0},
                {x: -140, y: 0}
            ];
            var index = DX.textAddCount || 0;
            var offset = positions[index % positions.length];
            var cycle = Math.floor(index / positions.length);
            var centerX = (DX.stage.width() / 2) - 70;
            var centerY = (DX.stage.height() / 2) - 16;
            var x = centerX + offset.x + (cycle * 18);
            var y = centerY + offset.y + (cycle * 18);

            DX.textAddCount = index + 1;

            return {
                x: Math.min(Math.max(x, 0), Math.max(DX.stage.width() - 150, 0)),
                y: Math.min(Math.max(y, 0), Math.max(DX.stage.height() - 40, 0))
            };
        }

        function addText(DX, pos){
            if(!DX){
                return false;
            }

            activeStageID = DX.id;
            if(!pos){
                pos = getNextTextPosition(DX);
            }

            var text = new Konva.Text({
                text: defaultTextValue,
                x: pos.x,
                y: pos.y,
                fontSize: settings.textFontSize,
                fontFamily: "Nunito",
                fontStyle: "bold",
                fill: settings.brushColor,
                lineHeight: 1.2,
                draggable: false,
                listening: true
            });

            var textEditing = false;
            var textIsDragging = false;
            var textDragReleaseBound = false;
            var textPressBound = false;
            var textPressStart = null;
            var textDragStartDistance = 4;

            function getPointerClientPosition(evt){
                if(evt.touches && evt.touches.length){
                    return {x: evt.touches[0].clientX, y: evt.touches[0].clientY};
                }

                if(evt.changedTouches && evt.changedTouches.length){
                    return {x: evt.changedTouches[0].clientX, y: evt.changedTouches[0].clientY};
                }

                return {x: evt.clientX, y: evt.clientY};
            }

            function bindTextPress(){
                if(textPressBound){
                    return;
                }

                textPressBound = true;
                window.addEventListener("mousemove", checkTextDragStart, true);
                window.addEventListener("touchmove", checkTextDragStart, true);
                window.addEventListener("pointermove", checkTextDragStart, true);
            }

            function unbindTextPress(){
                if(!textPressBound){
                    return;
                }

                textPressBound = false;
                window.removeEventListener("mousemove", checkTextDragStart, true);
                window.removeEventListener("touchmove", checkTextDragStart, true);
                window.removeEventListener("pointermove", checkTextDragStart, true);
            }

            function checkTextDragStart(evt){
                if(textEditing || textIsDragging || !textPressStart){
                    return;
                }

                var pos = getPointerClientPosition(evt);
                var dx = pos.x - textPressStart.x;
                var dy = pos.y - textPressStart.y;
                if(Math.sqrt((dx * dx) + (dy * dy)) < textDragStartDistance){
                    return;
                }

                if(evt.cancelable){
                    evt.preventDefault();
                }

                unbindTextPress();
                text.draggable(true);
                text.startDrag();
            }

            function bindTextDragRelease(){
                if(textDragReleaseBound){
                    return;
                }

                textDragReleaseBound = true;
                window.addEventListener("mouseup", finishTextDrag, true);
                window.addEventListener("touchend", finishTextDrag, true);
                window.addEventListener("pointerup", finishTextDrag, true);
                window.addEventListener("touchcancel", cancelTextDrag, true);
                window.addEventListener("pointercancel", cancelTextDrag, true);
                window.addEventListener("blur", cancelTextDrag, true);
            }

            function unbindTextDragRelease(){
                if(!textDragReleaseBound){
                    return;
                }

                textDragReleaseBound = false;
                window.removeEventListener("mouseup", finishTextDrag, true);
                window.removeEventListener("touchend", finishTextDrag, true);
                window.removeEventListener("pointerup", finishTextDrag, true);
                window.removeEventListener("touchcancel", cancelTextDrag, true);
                window.removeEventListener("pointercancel", cancelTextDrag, true);
                window.removeEventListener("blur", cancelTextDrag, true);
            }

            function resetTextDragCursor(){
                DX.stage.container().style.cursor = "";
                mouseCursorStatus();
                DX.layer.batchDraw();
            }

            function finishTextDrag(){
                if(!textIsDragging){
                    textPressStart = null;
                    unbindTextPress();
                    unbindTextDragRelease();
                    text.draggable(false);
                    selectTextNode(DX, text);
                    resetTextDragCursor();
                    return;
                }

                textIsDragging = false;
                activeStageID = DX.id;
                textPressStart = null;
                unbindTextPress();
                unbindTextDragRelease();
                text.stopDrag();
                text.draggable(false);
                selectTextNode(DX, text);
                updateTextSelection();
                resetTextDragCursor();
                getSceneBase64();
            }

            function cancelTextDrag(){
                if(!textIsDragging){
                    textPressStart = null;
                    unbindTextPress();
                    unbindTextDragRelease();
                    text.draggable(false);
                    return;
                }

                textIsDragging = false;
                activeStageID = DX.id;
                textPressStart = null;
                unbindTextPress();
                unbindTextDragRelease();
                text.stopDrag();
                text.draggable(false);
                selectTextNode(DX, text);
                updateTextSelection();
                resetTextDragCursor();
            }

            text.on("mousedown touchstart", function(e){
                if(textEditing){
                    return;
                }

                activeStageID = DX.id;
                isPaint = false;
                selectTextNode(DX, text);
                text.draggable(false);
                if(e.evt){
                    textPressStart = getPointerClientPosition(e.evt);
                    bindTextPress();
                    bindTextDragRelease();
                }

                if(e.evt){
                    e.evt.preventDefault();
                    e.evt.stopPropagation();
                }
            });

            text.on("dblclick dbltap", function(e){
                activeStageID = DX.id;
                isPaint = false;
                textEditing = true;
                textPressStart = null;
                unbindTextPress();
                clearTextSelection();
                text.stopDrag();
                text.draggable(false);
                openCanvasTextEditor(DX, text, function(){
                    textEditing = false;
                    setTextDragMode(mod === "textDrag");
                    if(text.getStage()){
                        selectTextNode(DX, text);
                    }else{
                        clearTextSelection();
                    }
                });

                if(e.evt){
                    e.evt.preventDefault();
                    e.evt.stopPropagation();
                }
            });

            text.on("dragstart", function(){
                activeStageID = DX.id;
                isPaint = false;
                textIsDragging = true;
                selectTextNode(DX, text);
                DX.stage.container().style.cursor = "grabbing";
            });

            text.on("dragmove", function(){
                updateTextSelection();
            });

            text.on("dragend", function(){
                finishTextDrag();
            });

            text.on("mouseover", function(){
                if(mod === "textDrag"){
                    DX.stage.container().style.cursor = "grab";
                }
            });

            text.on("mouseout", function(){
                DX.stage.container().style.cursor = "";
                mouseCursorStatus();
            });

            draw.textNodes.push(text);
            text.draggable(false);
            DX.layer.add(text);
            selectTextNode(DX, text);
            DX.layer.batchDraw();
            getSceneBase64();
        }

        function openCanvasTextEditor(DX, text, closeCallback){
            var stageBox = DX.stage.container().getBoundingClientRect();
            var scaleX = stageBox.width / DX.stage.width();
            var scaleY = stageBox.height / DX.stage.height();
            var textPosition = text.absolutePosition();
            var originalText = text.text();
            var textarea = document.createElement("textarea");
            var closed = false;
            var minEditorWidth = Math.max(text.width() * scaleX, 160);
            var editorLineHeight = text.fontSize() * text.lineHeight() * scaleY;

            textarea.value = originalText;
            textarea.wrap = "off";
            Object.assign(textarea.style, {
                position: "absolute",
                left: (stageBox.left + window.scrollX + (textPosition.x * scaleX)) + "px",
                top: (stageBox.top + window.scrollY + (textPosition.y * scaleY)) + "px",
                width: minEditorWidth + "px",
                minHeight: editorLineHeight + "px",
                fontSize: (text.fontSize() * scaleY) + "px",
                fontFamily: text.fontFamily(),
                fontWeight: text.fontStyle(),
                lineHeight: text.lineHeight(),
                color: text.fill(),
                background: "transparent",
                border: "1px solid blue",
                outline: "none",
                resize: "none",
                overflow: "hidden",
                whiteSpace: "pre",
                padding: 0,
                zIndex: 10000
            });

            function resizeEditor(){
                textarea.style.width = minEditorWidth + "px";
                textarea.style.height = editorLineHeight + "px";
                textarea.style.width = Math.max(textarea.scrollWidth + 4, minEditorWidth) + "px";
                textarea.style.height = Math.max(textarea.scrollHeight, editorLineHeight) + "px";
            }

            function closeEditor(save){
                if(closed){
                    return;
                }

                closed = true;
                closeActiveTextEditor = null;
                if(save){
                    if(textarea.value.trim() === ""){
                        text.destroy();
                        draw.textNodes = draw.textNodes.filter(function(textNode){
                            return textNode !== text && textNode.getStage();
                        });
                    }else{
                        text.text(textarea.value);
                        text.show();
                    }
                }else{
                    text.text(originalText);
                    text.show();
                }

                textarea.remove();
                DX.layer.batchDraw();
                updateTextSelection();
                getSceneBase64();
                if(closeCallback){
                    closeCallback();
                }
            }

            closeActiveTextEditor = closeEditor;

            textarea.addEventListener("mousedown", function(e){
                e.stopPropagation();
            });

            textarea.addEventListener("touchstart", function(e){
                e.stopPropagation();
            });

            textarea.addEventListener("input", resizeEditor);

            textarea.addEventListener("keydown", function(e){
                if(e.key === "Escape"){
                    e.preventDefault();
                    closeEditor(false);
                }
            });

            textarea.addEventListener("blur", function(){
                closeEditor(true);
            });

            document.body.appendChild(textarea);
            text.hide();
            DX.layer.batchDraw();
            textarea.focus();
            textarea.select();
            resizeEditor();
        }

        function drawEnd(DX){
            if (!isPaint) {
                return false;
            }
            isPaint = false;

            /* Çizim bittiğinde Douglas-Peucker'ı çalıştır */
            var rawPoints = lastLine.points();
            var formattedPoints = [];
            for (var i=0; i<rawPoints.length; i+=2) {
                formattedPoints.push({x: rawPoints[i], y: rawPoints[i + 1]});
            }

            var simplifiedPoints = simplify(formattedPoints, settings.dp_tolerans);

            /* Sadeleşmiş noktaları Konva formatına dönüştür */
            var newRawPoints = [];
            simplifiedPoints.forEach(function (p) {
                newRawPoints.push(p.x, p.y);
            });

            lastLine.points(newRawPoints);

            /* 2. Cache işlemi (Performans için kritik)
            Çizginin etrafındaki alanı hesaplamak için getClientRect kullanılır */
            var clientRect = lastLine.getClientRect();

            /* Eğer çizgi çok küçükse veya boşsa hata vermemesi için kontrol */
            if (clientRect.width > 0 && clientRect.height > 0) {
                lastLine.cache({
                    /* Kenarlarda kırpılma olmaması için pay bırakıyoruz */
                    x: clientRect.x - 5,
                    y: clientRect.y - 5,
                    width: clientRect.width + 10,
                    height: clientRect.height + 10,
                    pixelRatio: 2
                });
            }

            DX.layer.batchDraw();
            getSceneBase64();
        }


        SP.sceneDiv.addEventListener('mouseup', function(){
            drawEnd( draw.konva[activeStageID] );
        });

        SP.sceneDiv.addEventListener('touchend', function(){
            drawEnd( draw.konva[activeStageID] );
        });

        /* canvas base64 get */
        function getSceneBase64() {
            var stage = draw.konva[activeStageID].stage;
            var dataURL = withSelectionHidden(function(){
                return stage.toDataURL({
                    mimeType: "image/png",
                    quality: 1,
                    pixelRatio: 2
                });
            });

            inputsChange(SD, activeStageID, "value", dataURL);
            return dataURL;
        }

        function clearStage(id){
            draw.konva[id].layer.destroyChildren();
            draw.konva[id].textAddCount = 0;
            draw.textNodes = draw.textNodes.filter(function(text){
                return text.getStage();
            });
            draw.konva[id].selectionBox = null;
            if(draw.selectedText && !draw.selectedText.getStage()){
                draw.selectedText = null;
            }
            /* Önceki bellek kayıtlarını temizle */
            draw.konva[id].layer.clearCache();
            draw.konva[id].layer.draw();
        }

        function activeBtnFNC(btn){
            btn.style.border = "2px solid #183153";
        }

        function passiveBtnFNC(btn){
            btn.style.border = "0px";
        }

        function getFreeDrawCursor(){
            if(mod === "source-over"){
                return "url(assets/img/player/pencilcursor.png) -22 22, auto";
            }else if(mod === "destination-out"){
                return "url(assets/img/player/easercursor.png) 10 15, auto";
            }else if(mod === "text"){
                return "text";
            }else if(mod === "textDrag"){
                return "grab";
            }

            return "default";
        }

        function applyFreeDrawCursor(){
            SP.sceneDiv.style.cursor = "default";
            draw.konva.map(function(konva){
                if(konva && konva.stage){
                    konva.stage.container().style.cursor = konva.pointerInside ? getFreeDrawCursor() : "default";
                }
            });
        }

        function mouseCursorStatus(){
            if(mod === "source-over"){
                settings.activeSize = settings.brushSize;
                activeBtnFNC(draw.drawBox);
                passiveBtnFNC(draw.eraserBox);
                if(draw.textBox){
                    passiveBtnFNC(draw.textBox);
                }
                if(draw.dragBox){
                    passiveBtnFNC(draw.dragBox);
                }
            }else if(mod === "destination-out"){
                settings.activeSize = settings.eraserSize;
                activeBtnFNC(draw.eraserBox);
                passiveBtnFNC(draw.drawBox);
                if(draw.textBox){
                    passiveBtnFNC(draw.textBox);
                }
                if(draw.dragBox){
                    passiveBtnFNC(draw.dragBox);
                }
            }else if(mod === "text"){
                settings.activeSize = 0;
                activeBtnFNC(draw.textBox);
                passiveBtnFNC(draw.drawBox);
                passiveBtnFNC(draw.eraserBox);
                if(draw.dragBox){
                    passiveBtnFNC(draw.dragBox);
                }
            }else if(mod === "textDrag"){
                settings.activeSize = 0;
                passiveBtnFNC(draw.drawBox);
                passiveBtnFNC(draw.eraserBox);
                if(draw.textBox){
                    activeBtnFNC(draw.textBox);
                }
            }

            applyFreeDrawCursor();
        }
        mouseCursorStatus();

        /* canvas base64 load */
        function addHistory() {
            var lastMove = historyExtract(SP, 'freeDraw');

            for(var box in lastMove){
                if(lastMove[box].value){
                    var base64 = lastMove[box].value;
                    var id = lastMove[box].id;

                    var img = new Image();
                    img.onload = function () {
                        var konvaImage = new Konva.Image({
                            image: img,
                            x: 0,
                            y: 0,
                            width: draw.konva[id].canvasWidth,
                            height: draw.konva[id].canvasHeight,
                            perfectDrawEnabled: false,
                            listening: false
                        });

                        draw.konva[id].layer.add(konvaImage);
                        draw.konva[id].layer.batchDraw();
                    };

                    img.src = base64;
                }
            }
        }

        function checkRightAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"freeDraw"};
            draw.konva.map(function(konva){
                var currentDataLength = withSelectionHidden(function(){
                    return konva.stage.toDataURL().length;
                });
                var emptyDataLength = konva.emptyDataLength;

                if(currentDataLength > (emptyDataLength+50)){
                    score.totalRight++;
                }else{
                    score.totalEmpty++;
                }
            });

            return score;
        }

        function close(){
            draw.navMain.style.display = "none";
        }

        var evaluation = {
            history: addHistory,
            control: checkRightAnswer,
            wrong: function(){},
            right: function(){},
            answer: function(){},
            close: close
        }

        SP.fnc.push(evaluation);
    }

    /** init dropdown blank **/
    this.initDROPDOWN = function(SP, SD, index){
        console.log("init DROPDOWN");
        var answer = jsonV2.slides[index].answer || {};
        var scene = jsonV2.slides[index].scene || {};
        var DD = {input:{}};
        var defaultOptionBackground = "transparent";
        var defaultOptionHover = "#eaf4ff";
        var optionBackground = scene.optionBg || defaultOptionBackground;
        var optionHover = scene.optionHover || defaultOptionHover;
        var optionTextColor = scene.optionTextColor || null;
        var cumulativeWrongTotal = SD.wrong || 0;

        function getExpectedOptionIndex(id){
            var value = answer[id];
            if(value === undefined){
                value = answer[String(id)];
            }

            if(value === undefined || value === null){
                return null;
            }

            value = String(value).trim();
            if(value.indexOf("option_") === 0){
                value = value.split("option_")[1];
            }

            return value;
        }

        function getOptions(params){
            var options = [];
            params = params || {};

            for(var key in params){
                if(key.indexOf("option_") === 0){
                    var optionIndex = parseInt(key.split("option_")[1], 10);
                    if(!isNaN(optionIndex)){
                        options.push({
                            id: String(optionIndex),
                            text: params[key]
                        });
                    }
                }
            }

            options.sort(function(a, b){
                return parseInt(a.id, 10) - parseInt(b.id, 10);
            });

            return options;
        }

        function getStyleValue(node, key, fallback){
            if(!node){
                return fallback;
            }

            return node.style[key] || fallback;
        }

        SP.elementList.forEach(function(element){
            if(element.id.includes("dropdown")){
                var id = parseInt(element.id.split("_")[1], 10);
                var options = getOptions(element.data);
                var bg = element.main.querySelector(".dropdownBg");
                var text = element.main.querySelector(".dropdownText");
                var arrow = element.main.querySelector(".dropdownArrow");
                var select = document.createElement("select");
                var selectedBox = document.createElement("div");
                var optionPanel = document.createElement("div");
                var boxStyle = {
                    width: element.main.style.width,
                    height: element.main.style.height,
                    fontSize: text ? text.style.fontSize : "18px",
                    fontFamily: text ? text.style.fontFamily : "Nunito",
                    color: text ? text.style.color : "#333333",
                    backgroundColor: getStyleValue(bg, "backgroundColor", "#ffffff"),
                    borderRadius: getStyleValue(bg, "borderRadius", "4px"),
                    outline: getStyleValue(bg, "outline", "1px solid #333333"),
                    outlineOffset: getStyleValue(bg, "outlineOffset", "-1px"),
                    boxSizing: "border-box"
                };
                var selectCSS = {
                    width: "1px",
                    height: "1px",
                    opacity: 0,
                    pointerEvents: "none",
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px"
                };
                var selectedBoxCSS = Object.assign({}, boxStyle, {
                    backgroundColor: "rgba(0,0,0,0)",
                    border: 0,
                    outline: 0,
                    padding: "0 34px 0 10px",
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    zIndex: 2
                });
                var optionPanelCSS = {
                    width: element.main.style.width,
                    position: "absolute",
                    left: "0px",
                    top: (parseFloat(element.main.style.height)) + "px",
                    display: "none",
                    flexDirection: "column",
                    zIndex: 2500,

                    backgroundColor: scene.optionBg ? optionBackground : "#fff",
                    border: boxStyle.outline,
                    borderRadius: boxStyle.borderRadius,
                    overflow: "hidden",
                    boxSizing: "border-box"
                };

                select.appendChild(new Option("", ""));
                options.map(function(option, optionIndex){
                    select.appendChild(new Option(option.text, option.id));
                });

                if(text){
                    selectedBox.innerText = text.innerText || text.textContent || "Seçiniz";
                    text.remove();
                }else{
                    selectedBox.innerText = "Seçiniz";
                }

                if(arrow){
                    arrow.style.pointerEvents = "none";
                    arrow.style.zIndex = 3;
                }

                element.main.appendChild(select);
                element.main.appendChild(selectedBox);
                element.main.appendChild(optionPanel);
                Object.assign(select.style, selectCSS);
                Object.assign(selectedBox.style, selectedBoxCSS);
                Object.assign(optionPanel.style, optionPanelCSS);

                options.map(function(option, optionIndex){
                    var optionBox = document.createElement("div");
                    optionBox.innerText = option.text;
                    optionBox.dataset.value = option.id;
                    Object.assign(optionBox.style, {
                        height: element.main.style.height,
                        padding: "0 10px",
                        cursor: "pointer",

                        display: "flex",
                        alignItems: "center",

                        backgroundColor: optionBackground,
                        color: optionTextColor || boxStyle.color,
                        fontSize: boxStyle.fontSize,
                        fontFamily: boxStyle.fontFamily,

                        borderBottom: optionIndex === options.length - 1
                            ? "none"
                            : "1px solid #dcdcdc",

                        boxSizing: "border-box",
                        userSelect: "none"
                    });
                    optionBox.addEventListener("mouseenter", function () {
                        optionBox.style.backgroundColor = optionHover;
                    });

                    optionBox.addEventListener("mouseleave", function () {
                        optionBox.style.backgroundColor = optionBackground;
                    });
                    optionBox.addEventListener("click", function(e){
                        e.stopPropagation();
                        setSelectedValue(id, option.id);
                        closeOptionPanels();
                        controlBtnViewCheck();
                    });

                    optionPanel.appendChild(optionBox);
                });

                DD.input[id] = {
                    main: element.main,
                    bg: bg,
                    select: select,
                    selectedBox: selectedBox,
                    optionPanel: optionPanel,
                    options: options,
                    zIndex: element.main.style.zIndex,
                    rightAnswer: getExpectedOptionIndex(id),
                    bgColor: bg ? bg.style.backgroundColor : ""
                };

                SD.inputs["box"+ id] = {value: null, type: "dropdown", solved: false};

                selectedBox.addEventListener("click", function(e){
                    e.stopPropagation();
                    toggleOptionPanel(id);
                });
            }
        });

        function getOptionText(id, value){
            var input = DD.input[id];

            for(var i=0; i<input.options.length; i++){
                if(String(input.options[i].id) === String(value)){
                    return input.options[i].text;
                }
            }

            return "Seçiniz";
        }

        function setSelectedValue(id, value){
            DD.input[id].select.value = value || "";
            DD.input[id].selectedBox.innerText = value ? getOptionText(id, value) : "Seçiniz";
            inputsChange(SD, id, "value", value || null);
        }

        function closeOptionPanels(openId){
            for(var id in DD.input){
                if(openId === undefined || String(id) !== String(openId)){
                    DD.input[id].optionPanel.style.display = "none";
                    DD.input[id].main.style.zIndex = DD.input[id].zIndex || "";
                }
            }
        }

        function toggleOptionPanel(id){
            var input = DD.input[id];
            var panel = DD.input[id].optionPanel;
            var isOpen = panel.style.display === "flex";

            closeOptionPanels(id);
            if(isOpen){
                panel.style.display = "none";
                input.main.style.zIndex = input.zIndex || "";
            }else{
                input.main.style.zIndex = 9999;
                panel.style.zIndex = 10000;
                panel.style.display = "flex";
            }
        }

        document.addEventListener("click", function(){
            closeOptionPanels();
        });

        function controlBtnViewCheck(){
            if(SD.complete){
                controlBtnView(SP, "disable");
                return;
            }

            var found = false;

            for(var id in DD.input){
                if(SD.inputs["box"+ id].value){
                    found = true;
                }
            }

            if(found){
                controlBtnView(SP, "enable");
            }else{
                controlBtnView(SP, "disable");
            }
            console.log("SD-İNPUTS",SD.inputs)
        }

        function showRightView(id){
            if(DD.input[id].bg){
                DD.input[id].bg.style.backgroundColor = "green";
            }
            DD.input[id].events = false;
        }

        function showWrongView(id){
            if(DD.input[id].bg){
                DD.input[id].bg.style.backgroundColor = "red";
            }
        }

        function showDefaultView(id){
            if(DD.input[id].bg){
                DD.input[id].bg.style.backgroundColor = DD.input[id].bgColor;
            }
            setSelectedValue(id, null);
        }

        function btnEvents(status){
            for(var id in DD.input){
                DD.input[id].selectedBox.style.pointerEvents = status;
                if(status === "none"){
                    DD.input[id].optionPanel.style.display = "none";
                }
            }
        }

        function checkRightAnswer(){
            var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"dropdown"};
            var currentWrongCount = 0;

            for(var id in DD.input){
                var userAnswer = SD.inputs["box"+ id].value;
                var rightAnswer = DD.input[id].rightAnswer;

                score.totalEmpty++;
                if(!userAnswer){
                    DD.input[id].status = "empty";
                    SD.inputs["box"+ id].solved = false;
                }else if(rightAnswer !== null && String(userAnswer) === String(rightAnswer)){
                    score.totalRight++;
                    score.totalEmpty--;
                    DD.input[id].status = "right";
                    SD.inputs["box"+ id].solved = true;
                }else{
                    currentWrongCount++;
                    DD.input[id].status = "wrong";
                    SD.inputs["box"+ id].solved = false;
                }
            }

            if(currentWrongCount){
                cumulativeWrongTotal = (SD.wrong || cumulativeWrongTotal || 0) + currentWrongCount;
                score.totalWrong = cumulativeWrongTotal;
            }else if(cumulativeWrongTotal && score.totalEmpty){
                score.totalWrong = cumulativeWrongTotal;
            }

            console.log("SCORE-DROPDOWN",score)
            return score;
        }

        function wrongActionFNC(){
            btnEvents("none");
            for(var id in DD.input){
                if(DD.input[id].status === "right"){
                    showRightView(id);
                }else if(DD.input[id].status === "wrong"){
                    showWrongView(id);
                }
            }

            evaluation.timer = setTimeout(function(){
                if(SD.complete){
                    btnEvents("none");
                    controlBtnView(SP, "disable");
                    return;
                }

                btnEvents("auto");
                for(var id in DD.input){
                    if(DD.input[id].status !== "right"){
                        showDefaultView(id);
                    }
                }
                controlBtnViewCheck();
            }, 1000);
        }

        function answerActionFNC(){
            clearInterval(evaluation.timer);
            for(var id in DD.input){
                if(DD.input[id].rightAnswer !== null){
                    setSelectedValue(id, DD.input[id].rightAnswer);
                }
            }
            btnEvents("none");
        }

        function rightActionFNC(){
            if(cumulativeWrongTotal){
                SD.wrong = cumulativeWrongTotal;
                if(SD.historyRight.length){
                    SD.historyRight[SD.historyRight.length - 1].wrong = cumulativeWrongTotal;
                }
            }

            wrongActionFNC();
        }

        function addHistory(){
            var lastMove = historyExtract(SP, "dropdown");
            for(var box in lastMove){
                var id = lastMove[box].id;
                setSelectedValue(id, lastMove[box].value);
            }
        }

        function reset(){
            for(var id in DD.input){
                showDefaultView(id);
            }
        }

        function close(){
            btnEvents("none");
        }

        var evaluation = {
            control: checkRightAnswer,
            wrong: wrongActionFNC,
            right: rightActionFNC,
            answer: answerActionFNC,
            history: addHistory,
            reset: reset,
            close: close
        }

        SP.fnc.push(evaluation);
    }

}
