/**
 * Bağımsız Değerlendirme Motoru (Evaluator Engine)
 * ES5 Yapısına Uygun Prototip Tabanlı Nesne Yapısı
 */
var EvaluatorEngine = {

    // %80 Benzerlik Oranı için Levenshtein Algoritması (accuracy80)
    getSimilarity: function(str1, str2) {
        var track = Array(str2.length + 1);
        for (var r = 0; r < track.length; r++) {
            track[r] = Array(str1.length + 1).fill(null);
        }

        for (var i = 0; i <= str1.length; i += 1) track[0][i] = i;
        for (var j = 0; j <= str2.length; j += 1) track[j][0] = j;

        for (var j = 1; j <= str2.length; j += 1) {
            for (var i = 1; i <= str1.length; i += 1) {
                var indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1,
                    track[j - 1][i] + 1,
                    track[j - 1][i - 1] + indicator
                );
            }
        }
        var distance = track[str2.length][str1.length];
        var maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1.0;
        return (maxLength - distance) / maxLength;
    },

    // Virgüllü girdileri temiz bir diziye dönüştürür
    parseToArray: function(inputStr) {
        var items = inputStr.split(',');
        var cleanItems = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i].replace(/["']/g, '').trim().toLowerCase();
            if (item !== "") {
                cleanItems.push(item);
            }
        }
        return cleanItems;
    },

    /**
     * Tüm kuralları ve girdileri işleyen ana karar mekanizması
     */
    evaluate: function(configPayload, currentInputs) {
        var self = this;
        if (!configPayload || !configPayload.groups) return "Y1";

        // Kontrol 1: Tüm box alanlarının değeri boş ise sonuç doğrudan "-" üretir.
        var allBoxesEmpty = true;
        Object.keys(currentInputs).forEach(function(box) {
            if (currentInputs[box] !== null && currentInputs[box] !== "") {
                allBoxesEmpty = false;
            }
        });

        if (allBoxesEmpty) {
            return "-";
        }

        var matchedGroups = [];

        // Tanımlanmış her bir grubu sırayla analiz et
        configPayload.groups.forEach(function(group) {
            var groupPassed = true;
            var actualTrueCount = 0;
            var actualFalseCount = 0;
            var actualNullCount = 0;
            var strictAllTrue = true;

            Object.keys(group.rules).forEach(function(boxName) {
                var rule = group.rules[boxName];
                var liveValue = currentInputs[boxName];
                var ruleResult = false;

                // Değer boş (null) ise durumları kontrol et
                if (liveValue === null || liveValue === "") {
                    actualNullCount++;
                    if (rule.operator === '===' && rule.value === 'null') {
                        ruleResult = true;
                        actualTrueCount++;
                    } else {
                        ruleResult = false;
                        strictAllTrue = false;
                    }
                } else {
                    // 1. Regex Fonksiyon Kontrolü
                    if (rule.operator === 'regex') {
                        try {
                            var pattern = rule.value;
                            var flags = '';
                            if (pattern.indexOf('/') === 0 && pattern.lastIndexOf('/') > 0) {
                                flags = pattern.substring(pattern.lastIndexOf('/') + 1);
                                pattern = pattern.substring(1, pattern.lastIndexOf('/'));
                            }
                            var regex = new RegExp(pattern, flags);
                            ruleResult = regex.test(String(liveValue));
                        } catch (e) {
                            ruleResult = false;
                        }
                    }
                    // 2. Accuracy80 Fonksiyon Kontrolü
                    else if (rule.operator === 'accuracy80') {
                        var similarity = self.getSimilarity(String(liveValue).toLowerCase(), String(rule.value).toLowerCase());
                        ruleResult = (similarity >= 0.80);
                    }
                    // 3. Inarray Fonksiyon Kontrolü
                    else if (rule.operator === 'inarray') {
                        var ruleArr = self.parseToArray(rule.value);
                        var liveArr = self.parseToArray(String(liveValue));

                        if (ruleArr.length === liveArr.length && ruleArr.length > 0) {
                            var allMatch = ruleArr.every(function(item) {
                                return liveArr.indexOf(item) !== -1;
                            }) && liveArr.every(function(item) {
                                return ruleArr.indexOf(item) !== -1;
                            });
                            ruleResult = allMatch;
                        } else {
                            ruleResult = false;
                        }
                    }
                    // 4. Array Fonksiyon Kontrolü
                    else if (rule.operator === 'array') {
                        var ruleArr = self.parseToArray(rule.value);
                        var liveArr = self.parseToArray(String(liveValue));

                        if (ruleArr.length === liveArr.length && ruleArr.length > 0) {
                            ruleResult = ruleArr.every(function(val, idx) {
                                return val === liveArr[idx];
                            });
                        } else {
                            ruleResult = false;
                        }
                    }
                    // 5. Standart Mantıksal Karşılaştırma Operatörleri
                    else {
                        var numLive = isNaN(liveValue) ? liveValue : Number(liveValue);
                        var targetValue = (isNaN(rule.value) || rule.value === "") ? rule.value : Number(rule.value);

                        switch (rule.operator) {
                            case '===': ruleResult = (numLive === targetValue); break;
                            case '==':  ruleResult = (numLive == targetValue); break;
                            case '<=':  ruleResult = (numLive <= targetValue); break;
                            case '>=':  ruleResult = (numLive >= targetValue); break;
                            case '<':   ruleResult = (numLive < targetValue); break;
                            case '>':   ruleResult = (numLive > targetValue); break;
                        }
                    }

                    if (ruleResult === true) {
                        actualTrueCount++;
                    } else {
                        actualFalseCount++;
                        strictAllTrue = false;
                    }
                }
            });

            var isAnyCountOptionActive = (group.meta.truecount !== null || group.meta.falsecount !== null || group.meta.nullcount !== null);

            if (isAnyCountOptionActive) {
                if (group.meta.truecount !== null && group.meta.truecount !== actualTrueCount) groupPassed = false;
                if (group.meta.falsecount !== null && group.meta.falsecount !== actualFalseCount) groupPassed = false;
                if (group.meta.nullcount !== null && group.meta.nullcount !== actualNullCount) groupPassed = false;
            } else {
                if (!strictAllTrue) groupPassed = false;
            }

            if (groupPassed) {
                matchedGroups.push(group.name);
            }
        });

        // Kontrol 2: En az bir kutu doluysa ve uyuşmuyorsa "Y1" üretilir.
        if (matchedGroups.length > 0) {
            var uniqueGroups = [];
            matchedGroups.forEach(function(item) {
                if (uniqueGroups.indexOf(item) === -1) {
                    uniqueGroups.push(item);
                }
            });
            return uniqueGroups.join(', ');
        } else {
            return "Y1";
        }
    }
};