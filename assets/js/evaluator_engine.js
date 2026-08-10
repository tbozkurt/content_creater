/**
 * Bağımsız Değerlendirme Motoru Modülü
 */
const EvaluatorEngine = {
    // Levenshtein algoritması ile %80 metin benzerliği doğrulaması
    checkAccuracy80: function(str1, str2) {
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
    },

    // Virgülle ayrılmış metni temiz bir diziye dönüştürür
    parseArrayString: function(str) {
        return String(str).split(',').map(item => item.replace(/['"]+/g, '').trim());
    },

    // Tekil koşul kontrol mekanizması
    evaluateCondition: function(userValue, operator, targetValue) {
        const isUserNull = userValue === null || userValue === undefined || String(userValue).trim() === "" /*|| String(userValue).trim().toLowerCase() === "null"*/;
        const isTargetNull = targetValue === null || targetValue === undefined || String(targetValue).trim() === "" /*|| String(targetValue).trim().toLowerCase() === "null"*/;

        if (operator === 'review') {
            return !isUserNull ? "true" : "false";
        }

        if (isUserNull && isTargetNull) return "null";
        if (isUserNull) return "null";

        /* console.log(String(userValue), String(targetValue)); */
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
    },

    // JSON şeması ve girdileri harmanlayarak grup sonucunu bulan ana metot
    evaluate: function(jsonData, testInputs) {
        // Kural 1: Tüm box alanlarının değeri boş ise sonuç "-" üretir
        const allEmpty = Object.keys(jsonData.boxes).every(key => {
            const val = testInputs[key];
            return val === null || val === undefined || String(val).trim() === "" || String(val).trim().toLowerCase() === "null";
        });
        if (allEmpty) return { result: "-", matchedGroupIndex: -1 };

        // Kayıtlı grupları sırayla kontrol et
        for (let i = 0; i < jsonData.groups.length; i++) {
            let group = jsonData.groups[i];
            let trueCount = 0;
            let falseCount = 0;
            let nullCount = 0;
            let totalCheckedBoxes = group.boxes.length;

            group.boxes.forEach(bConfig => {
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

                if (match) return { result: group.name, matchedGroupIndex: i };
            } else {
                if (trueCount === totalCheckedBoxes) {
                    return { result: group.name, matchedGroupIndex: i };
                }
            }
        }

        // Kural 2: Box alanlarından herhangi biri hatalıysa veya uyuşmuyorsa sonuç "Y1" üretir
        return { result: "Y1", matchedGroupIndex: -2 };
    }
};