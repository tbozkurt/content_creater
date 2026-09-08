/**
 * Bağımsız Değerlendirme Motoru Modülü (Evaluator Engine)
 */
function EvaluatorEngine(jsonData, testInputs) {
    return EvaluatorEngine.evaluate(jsonData, testInputs);
}

// Levenshtein algoritması ile %80 metin benzerliği doğrulaması
EvaluatorEngine.checkAccuracy80 = function(str1, str2) {
    str1 = String(str1).toLowerCase().trim();
    str2 = String(str2).toLowerCase().trim();
    if (str1 === str2) return true;

    const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // silme
                track[j - 1][i] + 1, // ekleme
                track[j - 1][i - 1] + indicator // yer değiştirme
            );
        }
    }
    const distance = track[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return true;
    return ((maxLength - distance) / maxLength) >= 0.8;
};

// Virgülle ayrılmış metni temiz bir diziye dönüştürür
EvaluatorEngine.parseArrayString = function(str) {
    return String(str).split(',').map(item => item.replace(/['"]+/g, '').trim());
};

// Tekil koşul kontrol mekanizması
EvaluatorEngine.evaluateCondition = function(userValue, operator, targetValue) {
    const isUserNull = userValue === null || userValue === undefined || String(userValue).trim() === "";
    const isTargetNull = targetValue === null || targetValue === undefined || String(targetValue).trim() === "";

    if (operator === 'review') {
        return !isUserNull ? "true" : "false";
    }

    if (isUserNull && isTargetNull) return "null";
    if (isUserNull) return "null";

    switch (operator) {
        case '===': return (String(userValue) === String(targetValue)) ? "true" : "false";
        case '==': return (String(userValue) == String(targetValue)) ? "true" : "false";
        case '<=': return (Number(userValue) <= Number(targetValue)) ? "true" : "false";
        case '>=': return (Number(userValue) >= Number(targetValue)) ? "true" : "false";
        case '<': return (Number(userValue) < Number(targetValue)) ? "true" : "false";
        case '>': return (Number(userValue) > Number(targetValue)) ? "true" : "false";

        case 'regex':
            try {
                const match = targetValue.match(/^\/(.+)\/([gimy]*)$/);
                const regex = match ? new RegExp(match[1], match[2]) : new RegExp(targetValue);
                return regex.test(String(userValue)) ? "true" : "false";
            } catch(e) { return "false"; }

        case 'accuracy80':
            return this.checkAccuracy80(userValue, targetValue) ? "true" : "false";

        case 'array': {
            const arrUser = this.parseArrayString(userValue);
            const arrTarget = this.parseArrayString(targetValue);
            if (arrUser.length !== arrTarget.length) return "false";
            return arrUser.every((v, i) => v === arrTarget[i]) ? "true" : "false";
        }

        case 'inarray': {
            const arrUser = this.parseArrayString(userValue);
            const arrTarget = this.parseArrayString(targetValue);
            return arrTarget.every(val => arrUser.includes(val)) ? "true" : "false";
        }
        default: return "false";
    }
};

// JSON şeması ve girdileri harmanlayarak grup ve kutu sonuçlarını bulan ana metot
EvaluatorEngine.evaluate = function(jsonData, testInputs) {
    jsonData = jsonData || { boxes: {}, groups: [] };
    testInputs = testInputs || {};

    const groups = Array.isArray(jsonData.groups) ? jsonData.groups : [];

    // T1 (Tam/Doğru) rubriğini referans grup olarak belirle
    const t1Group = groups.find(g => (g.name || "").trim().toUpperCase() === "T1") 
        || groups.find(g => (g.name || "").trim().toLowerCase() === "tam")
        || groups.slice().sort((a, b) => (b.score || 0) - (a.score || 0))[0] 
        || groups[0] 
        || null;

    let boxKeys = Object.keys(jsonData.boxes || {});
    if (t1Group && Array.isArray(t1Group.boxes)) {
        t1Group.boxes.forEach(b => {
            if (b && b.boxId && !boxKeys.includes(b.boxId)) {
                boxKeys.push(b.boxId);
            }
        });
    }
    if (boxKeys.length === 0) {
        groups.forEach(g => {
            if (Array.isArray(g.boxes)) {
                g.boxes.forEach(b => {
                    if (b && b.boxId && !boxKeys.includes(b.boxId)) {
                        boxKeys.push(b.boxId);
                    }
                });
            }
        });
        Object.keys(testInputs).forEach(k => {
            if (!boxKeys.includes(k)) boxKeys.push(k);
        });
    }

    // Kural 1: Tüm box alanlarının değeri boş mu kontrolü
    const allEmpty = boxKeys.length > 0 && boxKeys.every(key => {
        const val = testInputs[key];
        return val === null || val === undefined || String(val).trim() === "" || String(val).trim().toLowerCase() === "null";
    });

    // Her bir kutu için T1 rubriğine göre durum tespiti: doğru -> "right", boş -> "empty", yanlış -> "wrong"
    const boxResults = {};
    let totalRight = 0;
    let totalEmpty = 0;
    let totalWrong = 0;

    boxKeys.forEach(boxId => {
        const uVal = testInputs[boxId] !== undefined ? testInputs[boxId] : null;
        const isBoxEmpty = uVal === null || uVal === undefined || String(uVal).trim() === "" || String(uVal).trim().toLowerCase() === "null";

        if (isBoxEmpty) {
            boxResults[boxId] = "empty";
            totalEmpty++;
            return;
        }

        // Kural doğrudan T1 rubriğinden alınır
        let bConfig = null;
        if (t1Group && Array.isArray(t1Group.boxes)) {
            bConfig = t1Group.boxes.find(b => b.boxId === boxId);
        }

        if (bConfig) {
            const conditionRes = this.evaluateCondition(uVal, bConfig.operator, bConfig.value);
            if (conditionRes === "true") {
                boxResults[boxId] = "right";
                totalRight++;
            } else {
                boxResults[boxId] = "wrong";
                totalWrong++;
            }
        } else {
            boxResults[boxId] = "wrong";
            totalWrong++;
        }
    });

    // Kayıtlı grupları sırayla kontrol et
    let matchedGroup = null;
    let matchedGroupIndex = -2;

    if (!allEmpty) {
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            let trueCount = 0;
            let falseCount = 0;
            let nullCount = 0;
            let totalCheckedBoxes = (group.boxes || []).length;

            (group.boxes || []).forEach(bConfig => {
                const uVal = testInputs[bConfig.boxId] !== undefined ? testInputs[bConfig.boxId] : null;
                const res = this.evaluateCondition(uVal, bConfig.operator, bConfig.value);

                if (res === "true") trueCount++;
                else if (res === "false") falseCount++;
                else if (res === "null") nullCount++;
            });

            const hasExtraConfig = group.extras && (
                group.extras.hasOwnProperty('truecount') ||
                group.extras.hasOwnProperty('falsecount') ||
                group.extras.hasOwnProperty('nullcount')
            );

            if (hasExtraConfig) {
                let match = true;
                if (group.extras.hasOwnProperty('truecount') && group.extras.truecount !== trueCount) match = false;
                if (group.extras.hasOwnProperty('falsecount') && group.extras.falsecount !== falseCount) match = false;
                if (group.extras.hasOwnProperty('nullcount') && group.extras.nullcount !== nullCount) match = false;

                if (match) {
                    matchedGroup = group;
                    matchedGroupIndex = i;
                    break;
                }
            } else {
                if (trueCount === totalCheckedBoxes && totalCheckedBoxes > 0) {
                    matchedGroup = group;
                    matchedGroupIndex = i;
                    break;
                }
            }
        }
    } else {
        matchedGroupIndex = -1;
    }

    let groupValue = "Y1";
    if (allEmpty || (totalEmpty === boxKeys.length && boxKeys.length > 0)) {
        groupValue = "-";
        matchedGroupIndex = -1;
    } else if (matchedGroup) {
        groupValue = matchedGroup.name;
    } else if (totalRight === boxKeys.length && boxKeys.length > 0 && t1Group) {
        groupValue = t1Group.name;
        matchedGroupIndex = groups.indexOf(t1Group);
    } else {
        groupValue = "Y1";
    }

    return {
        boxes: boxResults,
        totalRight: totalRight,
        totalWrong: totalWrong,
        totalEmpty: totalEmpty,
        matchedGroupIndex: matchedGroupIndex,
        result: groupValue
    };
};

if (typeof window !== 'undefined') {
    window.EvaluatorEngine = EvaluatorEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EvaluatorEngine;
}