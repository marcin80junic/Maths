define(["require", "exports", "./m1-prototype", "./m3-operations", "./m4-test", "./m5-layout", "./m6-handlers", "./m7-settings"], function (require, exports, m1_prototype_1, operations, test, m5_layout_1, m6_handlers_1, m7_settings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.maths = void 0;
    /*
      *define global application object
    */
    const maths = {
        icons: {
            tick: 'public/pics/correct.png',
            cross: 'public/pics/wrong.png',
            questMark: 'public/pics/question.png',
            volumeMuted: 'public/pics/speaker-muted.png',
            volumeLow: 'public/pics/speaker-low-volume.png',
            volumeMedium: 'public/pics/speaker-medium-volume.png',
            volumeHigh: 'public/pics/speaker-high-volume.png'
        },
        sounds: {
            cheer: new Audio("public/sounds/cheering.wav"),
            wrong: new Audio("public/sounds/fart.wav")
        },
        difficulties: ["Fair", "Advanced", "Super Hard"],
        numOfExercises: ["6", "8", "10", "12", "16", "20", "24"],
        active: $("#home"),
        switch: function (id) {
            let moduleName = id.replace("#", ""), module = this[moduleName]; // obtaining actual object which is a property of maths
            this.active = $(id); // matches the id of maths modules (divs)
            if (!this.settings.areLoaded)
                this.settings.init(); //initialize settings module if needed
            if (m1_prototype_1.Operation.prototype === Object.getPrototypeOf(module)) {
                if (module.level !== module.levelDisplayed) {
                    module.init(); // initialize module if it's an instance of..
                } //..Operation class(excludes settings and home). Only when loaded first time..       
            } //..the levelDisplayed is -1 and will not match the module's level property
            this.active.scrollTop(0);
        },
        range: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
        playSound: function (isCorrect, volume) {
            let cheer = this.sounds.cheer, wrong = this.sounds.wrong;
            if (volume !== 0) { // if called while adjusting settings the volume arg will have a value otherwise..
                volume = volume || maths.settings.system.volume; //..it will be undefined so use stored setting value
            }
            else { // only if volume is muted while adjusting in settings
                cheer.pause();
                return;
            }
            if (isCorrect) {
                cheer.currentTime = 0.5;
                cheer.volume = volume;
                cheer.play();
            }
            else {
                wrong.volume = volume;
                wrong.play();
            }
        },
        createAndAppendCanvas: function (parent, module, index) {
            let numbers = module.numbers[index], answerIdx = module.answersIdxs[index], sign = module.sign, i, temp = [], scd, nums = (answerIdx !== numbers.length - 1) ?
                transform() // transform the pattern if answer index is not last
                : numbers.slice(0, numbers.length - 1), // otherwise only cut off the answer
            factor = $('body').width() / ($('body').width() / 80), // calculate width factor
            width = calculateWidth(factor), // calculate width according to the window width
            canvas = $('<canvas class="canvas" width="' + width + 'px" height="80px"></canvas>')[0], c = canvas.getContext("2d");
            const rads = (x) => Math.PI * x / 180;
            if (nums[0].length === 2) { // find common denominator for fractions
                scd = findSCD(nums[0][1], nums[1][1]);
            }
            parent.width(width); //set size of tooltip container
            c.fillStyle = "red";
            c.lineWidth = 0.5;
            c.font = "30px sans-serif"; // font only used for signs
            c.translate(40, 40); // center of first circle
            for (i = 0; i < nums.length; i += 1) {
                if (nums[i].length === 2) {
                    nums[i] = [nums[i][0] * (scd / nums[i][1]), scd]; //transform fractions so they have common denominator
                    drawFraction(c, nums[i]);
                }
                else {
                    drawInteger(nums[i]);
                }
                if (i < nums.length - 1) {
                    drawSign(sign);
                    c.translate(57, 0);
                }
                else {
                    drawSign("=");
                    c.translate(50, 0);
                    drawIcon(maths.icons.questMark);
                }
            }
            function calculateWidth(factor) {
                let sum = 1, whole, i, j;
                for (i = 0; i < nums.length; i += 1) {
                    if (nums[i].length === 2) {
                        whole = nums[i][0] / nums[i][1];
                        for (j = 0; j < whole; j += 1) {
                            sum += 1;
                        }
                    }
                }
                return sum * factor;
            }
            function transform() {
                switch (sign) { // if transforming addition and multiplication the sign needs to be changed
                    case "+":
                        sign = "-";
                        break;
                    case "\u00D7":
                        sign = "\u00F7";
                        break;
                }
                for (i = numbers.length - 1; i >= 0; i--) {
                    if (i !== answerIdx)
                        temp.push(numbers[i]); // reverse the order and leave the answer off
                }
                return temp;
            }
            function findSCD(den1, den2) {
                let i, temp, smaller = (den1 < den2) ? den1 : den2, greater = (den1 > den2) ? den1 : den2;
                if (den2 === den1)
                    return den1;
                if (greater % smaller === 0)
                    return greater;
                else {
                    for (i = 2; i <= greater; i++) {
                        temp = i * smaller;
                        if (temp > greater) {
                            if (temp % greater === 0)
                                return temp;
                        }
                    }
                }
            }
            function drawFraction(c, nums) {
                let whole, leftOver, i;
                if (nums[0] >= nums[1]) {
                    whole = Math.floor(nums[0] / nums[1]);
                    leftOver = nums[0] % nums[1];
                    for (i = 0; i < whole; i += 1) {
                        drawCircle(c, nums[1], nums[1]);
                        if (i < whole - 1)
                            c.translate(70, 0);
                        if (leftOver && i === whole - 1) {
                            c.translate(70, 0);
                            drawCircle(c, leftOver, nums[1]);
                        }
                    }
                }
                else {
                    drawCircle(c, nums[0], nums[1]);
                }
                function drawCircle(c, numerator, denominator) {
                    let advance = 360 / denominator, startAngle = -90, endAngle = -90, i;
                    for (i = 1; i <= denominator; i += 1) {
                        endAngle += advance;
                        c.beginPath();
                        c.moveTo(0, 0);
                        c.arc(0, 0, 30, rads(startAngle), rads(endAngle), false);
                        if (i <= numerator) {
                            c.fill();
                        }
                        c.closePath();
                        c.stroke();
                        startAngle = endAngle;
                    }
                }
            }
            function drawInteger(num) {
            }
            function drawSign(sign) {
                c.fillStyle = "black";
                c.translate(40, 0);
                c.fillText(sign, 0, 11);
                c.fillStyle = "red";
            }
            function drawIcon(path) {
                c.translate(-25, -15);
                var img = document.createElement("img");
                img.src = path;
                c.drawImage(img, 0, 0);
            }
            return parent.append(canvas);
        },
        home: {},
        addition: operations.addition,
        subtraction: operations.subtraction,
        multiplication: operations.multiplication,
        division: operations.division,
        fractions: operations.fractions,
        test: test.test,
        accordion: test.accordion,
        timer: test.timer,
        layout: m5_layout_1.layout,
        handlers: m6_handlers_1.handlers,
        settings: m7_settings_1.settings
    };
    exports.maths = maths;
});
