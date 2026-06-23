this.initPUZZLE = function(SP, SD, index){
    console.log("init PUZZLE");

    var answer = jsonV2.slides[index].answer || {};
    var puzzleBoxes = [];
    var groupSelections = {};
    var solvedGroups = {};
    var isDragging = false;
    var dragBorderBoxes = {};
    var dragPressColor = jsonV2.slides[index].scene.selectedColor;
    var dragBorderColor = jsonV2.slides[index].scene.selectedBorderColor;
    var puzzleUndoBtn = null;

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

    function isPuzzleAnswerOrdered(){
        var scene = jsonV2.slides[index].scene || {};

        return scene.puzzleAnswerOrdered !== false
            && scene.answerOrdered !== false
            && scene.orderImportant !== false;
    }

    function compareIDLists(selected, right){
        selected = selected || [];
        right = right || [];

        if(selected.length !== right.length){
            return false;
        }

        if(isPuzzleAnswerOrdered()){
            for(var i=0; i<right.length; i++){
                if(parseInt(selected[i]) !== parseInt(right[i])){
                    return false;
                }
            }

            return true;
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

    function updateInput(group, updateSolved){
        if(group === undefined || group === null){
            return;
        }

        group = String(group);
        var selected = groupSelections[group] || [];
        var key = getInputKey(group);

        if(!selected.length){
            delete SD.inputs[key];
            inputsChange(SD);
            return;
        }

        var input = ensurePuzzleInput(group);
        input.value = selected.slice();
        input.type = "puzzle";
        if(updateSolved){
            input.solved = !!solvedGroups[group];
        }else if(input.solved !== true){
            input.solved = false;
        }

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
        var key = getInputKey(group);
        var legacyKey = getLegacyInputKey(group);

        if(!SD.inputs[key]){
            if(SD.inputs[legacyKey] && SD.inputs[legacyKey].type === "puzzle"){
                SD.inputs[key] = SD.inputs[legacyKey];
                delete SD.inputs[legacyKey];
            }else{
                SD.inputs[key] = {value: null, type: "puzzle", solved: false};
            }
        }

        SD.inputs[key].type = "puzzle";
        if(SD.inputs[key].solved === undefined){
            SD.inputs[key].solved = !!solvedGroups[group];
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
                delete SD.inputs[currentKey];
            }
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

        targetGroups.map(function(group){
            if(!groupSelections[group]){
                groupSelections[group] = [];
            }

            if(groupSelections[group].includes(box.id)){
                return;
            }

            groupSelections[group].push(box.id);
            addSelectedGroup(box, group);
            updateInput(group);
        });

        refreshBoxView(box);
        controlBtnViewCheck();
        undoBtnViewCheck();
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
        console.log("sdInputs:",SD.inputs)
        controlBtnViewCheck();
        undoBtnViewCheck();
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
        var found = false;

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
        }
    });

    document.addEventListener("pointermove", moveDrag);
    document.addEventListener("pointerup", endDrag);

    function controlBtnViewCheck(){
        var found = false;
        for(var group in groupSelections){
            var hasOpenSelection = groupSelections[group].some(function(id){
                return puzzleBoxes[id] && puzzleBoxes[id].groupStatus[group] !== "right";
            });

            if(hasOpenSelection){
                found = true;
            }
        }

        controlBtnView(SP, found ? "enable" : "disable");
    }

    function checkAnswer(){
        clearDragBorders();

        var score = {totalRight:0, totalWrong:0, totalEmpty:0, Type:"puzzle"};
        var checkedGroups = {};

        for(var group in answer){
            if(!isPuzzleGroup(group)){
                continue;
            }

            checkedGroups[group] = true;

            if(solvedGroups[group]){
                preserveSolvedGroup(group);
                updateInput(group, true);
                score.totalRight++;
                continue;
            }

            var selectedIDs = (groupSelections[group] || []).slice();
            var rightAnswerIDs = normalizeAnswerIDs(answer[group]);

            if(!selectedIDs.length){
                score.totalEmpty++;
                updateInput(group, true);
            }else if(compareIDLists(selectedIDs, rightAnswerIDs)){
                score.totalRight++;
                solvedGroups[group] = true;
                (groupSelections[group] || []).map(function(id){
                    setGroupStatus(puzzleBoxes[id], group, "right");
                });
                updateInput(group, true);
            }else{
                score.totalWrong++;
                (groupSelections[group] || []).map(function(id){
                    setGroupStatus(puzzleBoxes[id], group, "wrong");
                });
                updateInput(group, true);
            }
        }

        for(var selectedGroup in groupSelections){
            if(!checkedGroups[selectedGroup] && groupSelections[selectedGroup].length){
                score.totalWrong++;
                groupSelections[selectedGroup].map(function(id){
                    setGroupStatus(puzzleBoxes[id], selectedGroup, "wrong");
                });
                updateInput(selectedGroup, true);
            }
        }

        if(!Object.keys(answer).length){
            score.totalEmpty = 1;
        }

        return score;
    }

    function controlAfterFNC(){
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
            updateInput(group);
        }

        controlBtnViewCheck();
        undoBtnViewCheck();
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
            updateInput(group);
        }

        isDragging = false;
        controlBtnViewCheck();
        undoBtnViewCheck();
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
            updateInput(group, true);
        }

        controlBtnView(SP, "disable");
        undoBtnViewCheck();
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
        clearDragBorders();
        ensurePuzzleInputs();
        var historyInputs = SD.inputs;
        if(!hasPuzzleHistoryValue(historyInputs) && SP.history && SP.history[0] && hasPuzzleHistoryValue(SP.history[0])){
            historyInputs = SP.history[0];
        }

        for(var group in historyInputs){
            var input = historyInputs[group];
            var groupID = getPuzzleInputGroup(group, input);
            if(groupID === null){
                continue;
            }

            var value = input.value;
            var solved = input.solved === true;
            clearGroupState(groupID);
            if(value === undefined || value === null || value === ""){
                delete solvedGroups[groupID];
                updateInput(groupID);
                continue;
            }

            if(!addHistorySelection(groupID, value)){
                addHistoryWord(groupID, value);
            }

            if(solved){
                solvedGroups[groupID] = true;
                (groupSelections[groupID] || []).map(function(id){
                    var box = puzzleBoxes[id];
                    if(box){
                        setGroupStatus(box, groupID, "right");
                        refreshBoxView(box);
                    }
                });
            }else{
                delete solvedGroups[groupID];
            }

            updateInput(groupID, solved);
        }

        ensurePuzzleInputs();
        controlBtnViewCheck();
    }

    function resetFNC(){
        clearDragBorders();
        solvedGroups = {};

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