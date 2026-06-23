// ==========================================
// DEĞİŞKEN ÜZERİNDEN DURUM GERİ YÜKLEME (INITIAL STATE)
// ==========================================
var initialState = null;

// Şablon Başlangıç Objesi Yapısı
var mockJsonConfig = {
    "boxes": []
};


var rubrikData;
function getLocalData(){
    if (typeof(Storage) !== "undefined") {
        var occSceneRubrikData = localStorage.getItem("occSceneRubrikData");
        console.log(occSceneRubrikData);

        if(occSceneRubrikData){
            rubrikData = JSON.parse(occSceneRubrikData);
            mockJsonConfig = rubrikData.boxes;
            initialState = rubrikData.rubrik;
            console.log(rubrikData);
            document.querySelector(".info-note").innerHTML = `<code>File: ${rubrikData.user.selectedFile}<br> Scene: ${rubrikData.scene.name}</code>`;
            localStorage.removeItem("occSceneRubrikData");
        }
    }
}

getLocalData();

console.log(mockJsonConfig);
console.log(initialState);

// Uygulama Runtime Belleği (State)
var baseState = {};
var savedGroups = [];
var currentEditingGroupId = null;

// DOM Tanımlamaları
var boxesContainer = document.getElementById('boxes-container');
var evaluatorContainer = document.getElementById('evaluator-container');
var groupNameInput = document.getElementById('group-name-input');
var btnSaveGroup = document.getElementById('btn-save-group');
var btnCancelEdit = document.getElementById('btn-cancel-edit');
var groupsContainer = document.getElementById('groups-container');
var btnEvaluate = document.getElementById('btn-evaluate');
var evaluationResult = document.getElementById('evaluation-result');
var btnExportJson = document.getElementById('Kaydet');

var metaControls = {
    truecount: { chk: document.getElementById('chk-truecount'), num: document.getElementById('num-truecount') },
    falsecount: { chk: document.getElementById('chk-falsecount'), num: document.getElementById('num-falsecount') },
    nullcount: { chk: document.getElementById('chk-nullcount'), num: document.getElementById('num-nullcount') }
};

// Limit checkbox dinamik kilit mekanizmaları
Object.keys(metaControls).forEach(function(key) {
    metaControls[key].chk.addEventListener('change', function(e) {
        metaControls[key].num.disabled = !e.target.checked;
    });
});

// Uygulama Başlatıcı (Init)
function init() {
    mockJsonConfig.boxes.forEach(function(box) {
        baseState[box] = null;
    });

    renderFormInputs();
    renderEvaluatorInputs();

    if (initialState && initialState.groups) {
        loadStateFromVariable(initialState);
    }
}

// Sol kural tanımlama elemanlarını listeler
function renderFormInputs() {
    boxesContainer.innerHTML = '';
    mockJsonConfig.boxes.forEach(function(box) {
        var row = document.createElement('div');
        row.className = 'row';
        row.dataset.box = box;

        row.innerHTML =
            '<input type="checkbox" class="box-select">' +
            '<label>' + box + '</label>' +
            '<select class="box-operator">' +
            '<option value="===">===</option>' +
            '<option value="==">==</option>' +
            '<option value="<=">&lt;=</option>' +
            '<option value=">=">&gt;=</option>' +
            '<option value="<">&lt;</option>' +
            '<option value=">">&gt;</option>' +
            '<option value="regex">regex</option>' +
            '<option value="accuracy80">accuracy80</option>' +
            '<option value="inarray">inarray</option>' +
            '<option value="array">array</option>' +
            '</select>' +
            '<input type="text" class="box-value" placeholder="Koşul değeri">';
        boxesContainer.appendChild(row);
    });
}

// Sağ taraftaki test motoru elemanlarını listeler
function renderEvaluatorInputs() {
    evaluatorContainer.innerHTML = '';
    mockJsonConfig.boxes.forEach(function(box) {
        var row = document.createElement('div');
        row.className = 'row';
        row.innerHTML =
            '<label style="width:80px;">' + box + ' =</label>' +
            '<input type="text" class="eval-input" data-box="' + box + '" placeholder="Sınama değeri">';
        evaluatorContainer.appendChild(row);
    });
}

// PANELİN EN ALTINDAKİ ENTEGRE "KAYDET" AKSİYONU
btnExportJson.addEventListener('click', function() {
    var payload = {
        stateStructure: baseState,
        groups: savedGroups.map(function(g) {
            return {
                id: g.id,
                name: g.name,
                rules: g.rules,
                meta: g.meta
            };
        })
    };
    //console.clear();
    console.log("=== UYGULAMA KAYDEDİLEN JSON VERİSİ ===");
    console.log(JSON.stringify(payload, null, 2));
    if (typeof(Storage) !== "undefined"){
        console.log(rubrikData)
        var occSceneRubrikSave = {user: rubrikData.user, payload:payload};
        localStorage.setItem("occSceneRubrikSave", JSON.stringify(occSceneRubrikSave));
        window.close();
    }
    console.log("=======================================");
});

// JSON verisi verildiğinde kaldığı yerden sistemi ayağa kaldıran fonksiyon
function loadStateFromVariable(stateObj) {
    try {
        savedGroups = stateObj.groups.map(function(g) {
            return {
                id: g.id || 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                name: g.name,
                rules: g.rules,
                meta: g.meta
            };
        });
        renderGroups();
    } catch (err) {
        console.error("Kayıttan yükleme işlemi başarısız oldu:", err);
    }
}

// Grubu Kaydetme ve Son Hali Güncelleme Tetikleyicisi
btnSaveGroup.addEventListener('click', function() {
    var groupName = groupNameInput.value.trim();
    if (!groupName) {
        alert('Lütfen geçerli bir grup adı girin!');
        return;
    }

    var selectedRules = {};
    var rows = boxesContainer.querySelectorAll('.row');
    var selectedCount = 0;

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var boxName = row.dataset.box;
        var isChecked = row.querySelector('.box-select').checked;
        var operator = row.querySelector('.box-operator').value;
        var value = row.querySelector('.box-value').value;

        if (isChecked) {
            selectedRules[boxName] = { operator: operator, value: value.trim() };
            selectedCount++;
        }
    }

    if (selectedCount === 0) {
        alert('Lütfen gruba bağlamak için en az bir kutuyu işaretleyin.');
        return;
    }

    var meta = {};
    Object.keys(metaControls).forEach(function(key) {
        meta[key] = metaControls[key].chk.checked ? (parseInt(metaControls[key].num.value) || 0) : null;
    });

    if (currentEditingGroupId !== null) {
        var index = -1;
        for (var j = 0; j < savedGroups.length; j++) {
            if (savedGroups[j].id === currentEditingGroupId) {
                index = j;
                break;
            }
        }
        if (index !== -1) {
            savedGroups[index].name = groupName;
            savedGroups[index].rules = selectedRules;
            savedGroups[index].meta = meta;
        }
        exitEditMode();
    } else {
        savedGroups.push({
            id: 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: groupName,
            rules: selectedRules,
            meta: meta
        });
    }

    resetFormFields();
    renderGroups();
});

// Grupları Listeleme Modülü
function renderGroups() {
    groupsContainer.innerHTML = '';
    if (savedGroups.length === 0) {
        groupsContainer.innerHTML = 'Kayıtlı grup bulunmuyor.';
        return;
    }

    savedGroups.forEach(function(group) {
        var div = document.createElement('div');
        div.className = 'group-list-item';
        div.onclick = function() { loadGroupToForm(group.id); };

        var boxesIncluded = Object.keys(group.rules).join(', ');
        div.innerHTML =
            '<div>' +
            '<strong>Grup: ' + group.name + '</strong>' +
            '<span style="font-size:0.8rem; color:#7f8c8d; margin-left:10px;">(' + boxesIncluded + ')</span>' +
            '</div>' +
            '<button class="btn-danger" style="padding:4px 8px; font-size:0.75rem; border:none; border-radius:4px; color:white;" class="delete-btn">Sil</button>';

        div.querySelector('button').addEventListener('click', function(event) {
            deleteGroup(event, group.id);
        });

        groupsContainer.appendChild(div);
    });
}

// Seçilen gruba tıklayınca form alanlarını getirme, grupta olmayanları sıfırlama
function loadGroupToForm(groupId) {
    var group = null;
    for (var i = 0; i < savedGroups.length; i++) {
        if (savedGroups[i].id === groupId) {
            group = savedGroups[i];
            break;
        }
    }
    if (!group) return;

    currentEditingGroupId = groupId;
    groupNameInput.value = group.name;
    btnSaveGroup.textContent = "Son Hali Tekrar Kaydet";
    btnCancelEdit.style.display = "inline-block";

    var rows = boxesContainer.querySelectorAll('.row');
    for (var k = 0; k < rows.length; k++) {
        var row = rows[k];
        var boxName = row.dataset.box;
        var chk = row.querySelector('.box-select');
        var op = row.querySelector('.box-operator');
        var val = row.querySelector('.box-value');

        if (group.rules[boxName]) {
            chk.checked = true;
            op.value = group.rules[boxName].operator;
            val.value = group.rules[boxName].value;
        } else {
            chk.checked = false;
            op.value = "===";
            val.value = "";
        }
    }

    Object.keys(metaControls).forEach(function(key) {
        if (group.meta[key] !== null) {
            metaControls[key].chk.checked = true;
            metaControls[key].num.disabled = false;
            metaControls[key].num.value = group.meta[key];
        } else {
            metaControls[key].chk.checked = false;
            metaControls[key].num.disabled = true;
            metaControls[key].num.value = 0;
        }
    });
}

function exitEditMode() {
    currentEditingGroupId = null;
    btnSaveGroup.textContent = "Grubu Kaydet";
    btnCancelEdit.style.display = "none";
}

function deleteGroup(event, groupId) {
    event.stopPropagation();
    savedGroups = savedGroups.filter(function(g) { return g.id !== groupId; });
    if (currentEditingGroupId === groupId) exitEditMode();
    resetFormFields();
    renderGroups();
}

function resetFormFields() {
    groupNameInput.value = '';
    var rows = boxesContainer.querySelectorAll('.row');
    for (var i = 0; i < rows.length; i++) {
        rows[i].querySelector('.box-select').checked = false;
        rows[i].querySelector('.box-operator').value = "===";
        rows[i].querySelector('.box-value').value = "";
    }
    Object.keys(metaControls).forEach(function(key) {
        metaControls[key].chk.checked = false;
        metaControls[key].num.disabled = true;
        metaControls[key].num.value = 0;
    });
}

btnCancelEdit.addEventListener('click', function() {
    exitEditMode();
    resetFormFields();
});

// ==========================================
// HARİCİ MOTORU TETİKLEYEN SEKTÖR (UI BRIDGE)
// ==========================================
btnEvaluate.addEventListener('click', function() {
    var currentInputs = {};
    var evalRows = evaluatorContainer.querySelectorAll('.eval-input');

    for (var i = 0; i < evalRows.length; i++) {
        var input = evalRows[i];
        var box = input.dataset.box;
        var val = input.value.trim();
        currentInputs[box] = (val === "") ? null : val;
    }

    var payload = {
        stateStructure: baseState,
        groups: savedGroups
    };

    console.log(payload);
    console.log(currentInputs);

    var result = EvaluatorEngine.evaluate(payload, currentInputs);

    if (result === "-") {
        evaluationResult.className = "result-box empty-match";
        evaluationResult.innerHTML = 'Tüm Alanlar Boş! Sonuç: <strong>-</strong>';
    } else if (result === "Y1") {
        evaluationResult.className = "result-box default-match";
        evaluationResult.innerHTML = 'Hatalı Giriş / Uyuşmayan Kural! Sonuç: <strong>Y1</strong>';
    } else {
        evaluationResult.className = "result-box matched";
        evaluationResult.innerHTML = 'Eşleşen Grup(lar): <strong>' + result + '</strong>';
    }
});

init();