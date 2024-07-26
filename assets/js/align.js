function ALIGN(){
    this.Left = function(Selected){
        if(Selected.length >= 2) {
            var temp = [];
            Selected.forEach(function (obj) {
                temp.push(obj.x());
            });

            var min = Math.min(...temp);

            Selected.forEach(function (obj) {
                obj.x(min);
            });
        }
    }

    this.HorizontalCenter = function(Selected){
        if(Selected.length >= 2) {
            var temp = [];
            Selected.forEach(function (obj) {
                temp.push(obj.x());
            });

            var xPos = SELECT.x() - IDE.layer.x;
            var selectRectWidth = (xPos + (SELECT.width() / 2));

            Selected.forEach(function (obj) {
                var halfWidth = obj.width() / 2;
                obj.x(selectRectWidth - halfWidth);
            });
        }
    }

    this.Right = function(Selected){
        if(Selected.length >= 2) {
            var temp = [];
            Selected.forEach(function (obj) {
                temp.push(obj.x());
            });

            var max = Math.max(...temp);

            Selected.forEach(function (obj) {
                obj.x(max);
            });
        }
    }

    this.Top = function(Selected){
        if(Selected.length >= 2) {
            var tempTop = [];
            Selected.forEach(function (obj) {
                tempTop.push(obj.y());
            });

            var min = Math.min(...tempTop);

            Selected.forEach(function (obj) {
                obj.y(min);
            });
        }
    }

    this.VerticalCenter = function(Selected){
        if(Selected.length >= 2) {
            var temp = [];
            Selected.forEach(function (obj) {
                temp.push(obj.y());
            });

            var yPos = SELECT.y() - IDE.layer.y;
            var selectRectHeight = (yPos + (SELECT.height() / 2));

            Selected.forEach(function (obj) {
                var halfHeight = obj.height() / 2;
                obj.y(selectRectHeight - halfHeight);
            });
        }
    }

    this.Bottom = function(Selected){
        if(Selected.length >= 2) {
            var tempBottom = [];
            Selected.forEach(function (obj) {
                tempBottom.push(obj.y() + obj.height());
            });

            var max = Math.max(...tempBottom);

            Selected.forEach(function (obj) {
                obj.y(max - obj.height());
            });
        }
    }

    this.SpaceHorizontal = function(Selected){
        if(Selected.length >= 3) {
            var allLeft = [];
            var sortArray = [];
            var objTotalWidth = 0;

            Selected.forEach(function (obj) {
                allLeft.push(obj.x());
            });

            allLeft.sort(function (a, b) {
                return a - b
            })

            allLeft.forEach(function (left) {
                for (var i = 0; i < Selected.length; i++) {
                    if (left === Selected[i].x()) {
                        sortArray.push(Selected[i]);
                        objTotalWidth += Selected[i].width();
                        break;
                    }
                }
            });

            var gap = (SELECT.width() - objTotalWidth) / (sortArray.length - 1);
            objTotalWidth = 0;

            sortArray.forEach(function (o, i) {
                o.x(allLeft[0] + (objTotalWidth + (i * gap)));
                objTotalWidth += o.width();
            })
        }
    }

    this.SpaceVertical = function(Selected){
        if(Selected.length >= 3) {
            var allTop = [];
            var sortArray = [];
            var objTotalHeight = 0;

            Selected.forEach(function (obj) {
                allTop.push(obj.y());
            });

            allTop.sort(function (a, b) {
                return a - b
            })

            allTop.forEach(function (top) {
                for (var i = 0; i < Selected.length; i++) {
                    if (top === Selected[i].y()) {
                        sortArray.push(Selected[i]);
                        objTotalHeight += Selected[i].height();
                        break;
                    }
                }
            });

            var gap = (SELECT.height() - objTotalHeight) / (sortArray.length - 1);
            objTotalHeight = 0;

            sortArray.forEach(function (o, i) {
                o.y(allTop[0] + (objTotalHeight + (i * gap)));
                objTotalHeight += o.height();
            })
        }
    }

    this.CenterStage = function(Selected){
        if(Selected.length === 1){
            var objWCenter = Selected[0].width()/2;
            var objHCenter = Selected[0].height()/2;
            var stageWCenter = 1280/2;
            var stageHCenter = 720/2;
            var calc1 = stageWCenter - objWCenter;
            var calc2 = stageHCenter - objHCenter;
            Selected[0].x(calc1);
            Selected[0].y(calc2);
        }
    }
}