define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("m1-prototype", ["require", "exports", "m2-resources"], function (require, exports, m2_resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.objectCreator = exports.Operation = void 0;
    // define Operation class, a backbone of all mathematical operations
    function Operation() {
        alert("opera");
        const proto = Operation.prototype;
        proto.levelDisplayed = -1;
        proto.numbers = [];
        proto.results = [];
        proto.answersIdxs = [];
        proto.setLevel = function (newLevel) {
            this.level = newLevel;
            this.saveSettings({ level: newLevel });
            this.init();
        };
        proto.setExerciseNum = function (newNum) {
            this.exerciseNum = newNum;
            this.saveSettings({ exerciseNum: newNum });
            this.init();
        };
        proto.init = function () {
            if (this.levelDisplayed === -1)
                this.loadSettings(); //true only when loading module first time
            this.numbers = this.numbersCreator();
            this.results = []; // reset results array
            this.answersIdxs = []; // and indexes of answers
            m2_resources_1.maths.layout.exercises(this); //  create layout and assign results property value
            m2_resources_1.maths.handlers.exercises(this); // attaching handlers to layout elements
        };
        proto.numbersCreator = function (num, level) {
            num = num || this.exerciseNum;
            if (typeof level === "undefined") {
                level = this.level;
            }
            let operation = [], numbers = [], i;
            for (i = 0; i < num; i += 1) {
                while (true) {
                    operation = this.getNumbers(level);
                    if (areNumsUnique({ nums: operation, array: numbers })) {
                        numbers.push(operation);
                        break;
                    }
                }
            }
            function areNumsUnique({ nums, array }) {
                let max = array.length, i;
                for (i = 0; i < max; i += 1) {
                    if (JSON.stringify(nums) === JSON.stringify(array[i])) {
                        return false;
                    }
                }
                return true;
            }
            return numbers;
        };
        proto.loadSettings = function () {
            try {
                if (typeof (Storage) !== "undefined") {
                    let namespace = "maths." + this.name + ".";
                    this.level = parseInt((localStorage.getItem(namespace + "level")), 10) || 0;
                    this.exerciseNum = parseInt((localStorage.getItem(namespace + "exerciseNum")), 10) || 6;
                }
            }
            catch (error) {
                alert("can't access the local storage\nall settings will be restored to its default values");
            }
        };
        proto.saveSettings = function (object) {
            try {
                if (typeof (Storage) !== "undefined") {
                    let namespace = "maths." + this.name + ".", name;
                    for (name in object) {
                        if (object.hasOwnProperty(name)) {
                            localStorage.setItem(namespace + name, object[name]);
                        }
                    }
                }
            }
            catch (error) { }
        };
    }
    exports.Operation = Operation;
    Operation(); // initialize Operation
    //utility function for creating objects which inherit from "obj"
    function objectCreator(obj) {
        function F() { }
        F.prototype = obj;
        return new F();
    }
    exports.objectCreator = objectCreator;
});
define("m2-resources", ["require", "exports", "m1-prototype"], function (require, exports, m1_prototype_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.maths = void 0;
    /*
      *define global application object
    */
    const maths = {
        icons: {
            tick: "pics/correct.png",
            cross: "pics/wrong.png",
            questMark: "pics/question.png"
        },
        sounds: {
            cheer: new Audio("sounds/cheering.wav"),
            wrong: new Audio("sounds/fart.wav")
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
        test: {},
        accordion: {},
        timer: {},
        layout: {},
        handlers: {},
        settings: {}
    };
    exports.maths = maths;
});
define("init", ["require", "exports", "m2-resources"], function (require, exports, m2_resources_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    $('document').ready(function () {
        //find and hide all modules except for #home
        $('#main-menu a').each((index, el) => {
            let link = $(el), href = link.prop('href');
            href = href.substring(href.indexOf('#'));
            if (href !== '#home') {
                $(href).hide();
            }
        });
        //event handler for navigation menu
        $('#main-menu').on('click', (e) => {
            let link = $(e.target), href = link.prop('href');
            if (href !== undefined) {
                href = href.substring(href.indexOf('#'));
                $('.selected').removeClass('selected');
                link.addClass('selected');
                m2_resources_2.maths.active.fadeOut(() => {
                    m2_resources_2.maths.switch(href);
                    m2_resources_2.maths.active.fadeIn();
                    // assigns padding to all lines and defines handler for window resize
                    //   maths.handlers.centerColumns(maths.active.find('.columns-line')); 
                });
            }
            if ($('.mobile-toggle-button').is(':visible')) {
                $('.sidenav').toggleClass('is-open');
                $('body').toggleClass('body-hidden-overflow');
            }
            e.preventDefault();
        });
        //adjust exercises columns padding if window resizes*/
        $(window).resize(() => {
            let column = $('.columns:visible');
            if (column.length > 0) {
                m2_resources_2.maths.handlers.adjustLinesPadding(column.children());
            }
        });
    });
});
define("m3-operations", ["require", "exports", "m1-prototype", "m1-prototype", "m2-resources"], function (require, exports, m1_prototype_2, m1_prototype_3, m2_resources_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    m2_resources_3.maths.addition = (function () {
        console.log("addition init");
        let addition = m1_prototype_2.objectCreator(m1_prototype_3.Operation.prototype);
        addition.container = $("#addition-exercises");
        addition.name = "addition";
        addition.sign = "+";
        addition.getNumbers = function (level) {
            const rand = m2_resources_3.maths.range;
            let numbers = [];
            switch (level) {
                case 0:
                    numbers = [rand(2, 9), rand(2, 9)];
                    break;
                case 1:
                    numbers =
                        (Math.random() < 0.5) ?
                            (Math.random() < 0.5) ?
                                [rand(10, 19), rand(2, 9)]
                                : [rand(2, 9), rand(10, 19)]
                            : [rand(2, 9), rand(2, 9), rand(2, 9)];
                    break;
                case 2:
                    numbers =
                        (Math.random() < 0.5) ?
                            [rand(10, 99), rand(10, 19), rand(2, 9)]
                            : [rand(10, 19), rand(2, 9), rand(10, 99)];
                    break;
            }
            numbers.push(numbers.reduce(this.reducer)); //add result as the last number in array
            return numbers;
        };
        addition.reducer = (accumulator, number) => accumulator + number;
        return addition;
    }());
    m2_resources_3.maths.subtraction = (function () {
        let subtraction = m1_prototype_2.objectCreator(m1_prototype_3.Operation.prototype);
        subtraction.container = $("#subtraction-exercises");
        subtraction.name = "subtraction";
        subtraction.sign = "-";
        subtraction.getNumbers = function (level) {
            const rand = m2_resources_3.maths.range;
            let numbers = [];
            switch (level) {
                case 0:
                    numbers = [rand(3, 9), rand(2, 8)];
                    break;
                case 1:
                    numbers =
                        (Math.random() < 0.5) ?
                            [rand(10, 19), rand(2, 9)]
                            : [rand(10, 19), rand(2, 9), rand(2, 5)];
                    break;
                case 2:
                    numbers =
                        (Math.random() < 0.5) ?
                            [rand(10, 99), rand(10, 19), rand(2, 9)]
                            : [rand(10, 99), rand(10, 97)];
                    break;
            }
            let result = numbers.reduce(this.reducer);
            if (result > 0) {
                numbers.push(result); //add result as the last number in array
            }
            else {
                numbers = this.getNumbers(level);
            }
            return numbers;
        };
        subtraction.reducer = (accumulator, number) => accumulator - number;
        return subtraction;
    }());
    m2_resources_3.maths.multiplication = (function () {
        let multiplication = m1_prototype_2.objectCreator(m1_prototype_3.Operation.prototype);
        multiplication.container = $("#multiplication-exercises");
        multiplication.name = "multiplication";
        multiplication.sign = "\u00D7";
        multiplication.getNumbers = function (level) {
            const rand = m2_resources_3.maths.range;
            let numbers = [];
            switch (level) {
                case 0:
                    numbers =
                        (Math.random() < 0.5) ?
                            [rand(2, 5), rand(2, 6)]
                            : [rand(2, 6), rand(2, 5)];
                    break;
                case 1:
                    numbers = [rand(2, 9), rand(2, 9)];
                    break;
                case 2:
                    numbers =
                        (Math.random() < 0.5) ?
                            [rand(2, 5), rand(10, 19)]
                            : (Math.random() < 0.5) ?
                                [rand(2, 9), rand(2, 5), rand(2, 9)]
                                : [rand(2, 9), rand(2, 9), rand(2, 5)];
                    break;
            }
            numbers.push(numbers.reduce(this.reducer)); //add result as the last number in an array
            return numbers;
        };
        multiplication.reducer = (accumulator, number) => accumulator * number;
        return multiplication;
    }());
    m2_resources_3.maths.division = (function () {
        let division = m1_prototype_2.objectCreator(m1_prototype_3.Operation.prototype);
        division.container = $("#division-exercises");
        division.name = "division";
        division.sign = "\u00F7";
        division.getNumbers = function (level) {
            const rand = m2_resources_3.maths.range;
            let numbers = [];
            switch (level) {
                case 0:
                    numbers = [rand(4, 20), rand(2, 9)];
                    break;
                case 1:
                    numbers = [rand(12, 100), rand(3, 9)];
                    break;
                case 2:
                    numbers =
                        (Math.random() < 0.5) ?
                            [rand(20, 200), rand(10, 19)]
                            : [rand(20, 200), rand(2, 9), rand(2, 5)];
                    break;
            }
            let result = numbers.reduce(this.reducer);
            if ((result % 1 === 0 && result > 1) && ((level !== 1) || (level === 1 && result < 10))) {
                numbers.push(result); //add result as the last number in array
            }
            else {
                numbers = this.getNumbers(level);
            }
            return numbers;
        };
        division.reducer = (accumulator, number) => {
            return accumulator / number;
        };
        return division;
    }());
    m2_resources_3.maths.fractions = (function () {
        let fractions = m1_prototype_2.objectCreator(m1_prototype_3.Operation.prototype);
        fractions.container = $("#fractions-exercises");
        fractions.name = "fractions";
        fractions.sign = "+";
        fractions.getNumbers = function (level) {
            const rand = m2_resources_3.maths.range, fraction = (base, max) => [rand(1, max), base];
            let numbers = [], base1, base2;
            switch (level) {
                case 0:
                    base1 = rand(2, 6);
                    numbers = [fraction(base1, base1 - 1), fraction(base1, base1 - 1)];
                    break;
                case 1:
                    base1 = rand(2, 4);
                    base2 = rand(2, 5);
                    if (base1 === base2) {
                        numbers = [fraction(base1, base1 + 1), fraction(base2, base2 - 1)];
                    }
                    else {
                        numbers = [fraction(base1, Math.floor(base1 / 2)), fraction(base2, Math.floor(base2 / 2))];
                    }
                    break;
                case 2:
                    base1 = rand(2, 10);
                    base2 = rand(2, 4);
                    numbers = [fraction(base1, 2 * base1 - 1), fraction(base2, 2 * base2 - 1)];
                    break;
            }
            if (level === 0)
                numbers.push(numbers.reduce(this.simpleReducer));
            else
                numbers.push(numbers.reduce(this.reducer));
            return numbers;
        };
        fractions.reducer = (accArray, array) => {
            let num = accArray[0] * array[1] + array[0] * accArray[1], den = accArray[1] * array[1], // add two fractions using common denominator
            x = num, y = den;
            while (y) { // find greatest common divisor
                var temp = y;
                y = x % y;
                x = temp;
            }
            return [num / x, den / x]; // return reduced fraction
        };
        fractions.simpleReducer = (accArray, array) => {
            let num = accArray[0] + array[0], // add two fractions assuming denominators are equal
            den = accArray[1];
            return [num, den];
        };
        return fractions;
    }());
});
define("m4-test", ["require", "exports", "m1-prototype", "m1-prototype", "m2-resources"], function (require, exports, m1_prototype_4, m1_prototype_5, m2_resources_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    m2_resources_4.maths.test = (function () {
        let test = m1_prototype_4.objectCreator(m1_prototype_5.Operation.prototype);
        test.container = $("#test");
        test.name = "test";
        /* following properties will be initialized during module init below */
        test.modules = [];
        test.times = [];
        test.exerciseNum = 0;
        test.unlocked = 0;
        test.init = function () {
            let choiceButtons = $(".test-level-choice");
            this.modules = m2_resources_4.maths.settings.test.modules.split(",");
            this.times = m2_resources_4.maths.settings.test.times.split(",");
            this.exerciseNum = parseInt(m2_resources_4.maths.settings.test.exerciseNum);
            this.unlocked = parseInt(m2_resources_4.maths.settings.test.unlocked);
            choiceButtons.each(function (index) {
                if (index <= m2_resources_4.maths.test.unlocked)
                    $(this).prop("disabled", false);
                else
                    $(this).prop("disabled", true);
            });
            if (this.levelDisplayed === -1) {
                choiceButtons.on("click", function (e) {
                    m2_resources_4.maths.test.level = choiceButtons.index(this);
                    test.createTest();
                });
                this.levelDisplayed = this.level;
            }
        };
        test.createTest = function () {
            let module, max = this.modules.length, content = {
                info: this.info()
            }, html = "";
            this.results = []; // reset results array
            this.answersIdxs = []; // and indexes of answers
            for (let i = 0; i < max; i += 1) {
                module = m2_resources_4.maths[this.modules[i].name];
                if (module) {
                    this.numbers = module.numbersCreator(this.exerciseNum, this.level);
                    this.sign = module.sign; // sign and numbers properties to be used by layout object
                    html = m2_resources_4.maths.layout.main(this); // string containing markup for operations
                    if (i === max - 1) { // add bottom navigation depending on the position in test
                        html += m2_resources_4.maths.layout.testNavigation(false, true);
                    }
                    else {
                        html += m2_resources_4.maths.layout.testNavigation(false, false);
                    }
                    content[module.name] = html; // create property of content object and assign it the markup
                }
            }
            content["summary"] = this.summary;
            m2_resources_4.maths.accordion.init($("#test .content"), this.name, content);
            m2_resources_4.maths.handlers.test(this);
        };
        test.info = function () {
            let html = `<div class="test-interface">';
                    <h3 class="center">Level: ${m2_resources_4.maths.difficulties[this.level]}</h3>
                    <h3 class="center">Number of questions: ${this.modules.length * this.exerciseNum}</h3>
                    <h3 class="center">Questions per module: ${this.exerciseNum}</h3>
                    <h3 class="center">Modules: `;
            this.modules.forEach(function (module) {
                html += module.name + ", ";
            });
            html = html.replace(/,\s$/, "") + '</h3>'; // remove last coma
            html += `<h3 class="center">Time to complete: ${this.times[this.level]} minutes</h3>
               <h2 class="center">GOOD LUCK!</h2>
               ${m2_resources_4.maths.layout.testNavigation(true, false)}
              </div>`;
            return html;
        };
        test.summary = '<div id="test-summary" class="test-interface">' +
            '<div class="test-navigation"><button id="test-close">Close</button></div></div>';
        test.displayResults = function (scores, secs) {
            let mods = this.modules, exNums = this.exerciseNum, results = [], percs = [], sum = 0, points = 0, score = 0, minutes, seconds, minutesStr, secondsStr, i, unlockMessage = '', html = '';
            const processResults = () => {
                scores.forEach(function (value, idx) {
                    i = (idx + 1) / exNums;
                    sum += value;
                    if (Number.isInteger(i)) {
                        percs[i - 1] = Math.round(sum / exNums * 100);
                        results[i - 1] = sum;
                        points += sum;
                        sum = 0;
                    }
                });
                score = Math.round(points / (exNums * mods.length) * 100);
                if (score > 59 && this.unlocked < 2 && this.unlocked === this.level) {
                    if (score > 74) {
                        unlockMessage = 'Congratulations, You have unlocked next level!';
                        this.unlocked = this.level + 1;
                        $(".test-level-choice").eq(this.unlocked).prop("disabled", false);
                        m2_resources_4.maths.settings.accessStorage({ unlocked: this.level + 1 }, "maths.settings.test.", true);
                    }
                    else {
                        unlockMessage = 'To unlock next level you need to score at least 75%.. Try again';
                    }
                }
                seconds = secs % 60;
                minutes = Math.floor(secs / 60);
                minutesStr = (minutes < 1) ? "" : (minutes === 1) ? minutes + ' minute' : minutes + ' minutes';
                secondsStr = (seconds === 1) ? seconds + ' second' : seconds + ' seconds';
                html += (score > 59) ?
                    '<h2 class="center">Congratulations You Passed!</h2>'
                    : '<h2 class="center">You need to practice a bit more!</h2>';
                html += `<h3 class="center">Your score: ${score}%</h3>
                   <h3 class="center">Your time: ${minutesStr} ${secondsStr}</h3>`;
                for (i = 0; i < mods.length; i += 1) {
                    html += `<h3 class="center">${mods[i]} score: ${results[i]}/${exNums} (${percs[i]}%)</h3>`;
                }
                html += `<h3 class="center">Total points: ${points}/${exNums * mods.length}</h3>
                   <h3 class="center">${unlockMessage}</h3>`;
                $("#test-summary").prepend(html).css("height", "73vh");
                ;
                m2_resources_4.maths.playSound(score > 59);
            };
            processResults();
            m2_resources_4.maths.accordion.unfold();
            m2_resources_4.maths.accordion.scrollTo(this.modules.length + 1);
        };
        return test;
    }());
    m2_resources_4.maths.accordion = {
        container: $('<div class="test-accordeon"></div>'),
        content: $('<div class="test-accordeon-content"></div>'),
        dimmer: $('<div class="dim"></div>'),
        closeBtn: null,
        headers: [],
        contents: [],
        first: function () {
            return this.headers[0];
        },
        last: function () {
            return this.headers[this.headers.length - 1];
        },
        init: function (parent, title, contentObj) {
            this.container.append(this.createTitleBar(title));
            for (const name in contentObj) {
                if (contentObj.hasOwnProperty(name)) {
                    this.content.append(this.createSection(name, contentObj[name]));
                }
            }
            parent.append(this.container);
            this.container.append(this.content).show();
            this.dimmer.appendTo("body");
            this.headers[0].addClass("selected");
            $('.test-accordeon-section-content').eq(0).show();
            $('.test-accordeon-section-header').css("border-top", "none");
        },
        createTitleBar: function (title) {
            let bar = $('<div class="test-accordeon-titlebar"></div>'), foo = $('<div class="test-accordeon-titlebar-foo"></div>'), barTitle = $('<h4 class="test-accordeon-titlebar-title">' + title + '</h4>');
            this.closeBtn = $('<button class="test-accordeon-titlebar-close">&times;</button>');
            this.closeBtn.on("click", () => this.dispose());
            return bar.append(barTitle, foo, this.closeBtn);
        },
        createSection: function (head, cont) {
            let section = $('<div class="test-accordeon-section"></div>'), header = $('<button class="test-accordeon-section-header">' + head + '</button>'), sectionContent = $('<div class="test-accordeon-section-content">' + cont + '</div>');
            sectionContent.hide();
            this.headers.push(header);
            this.contents.push(sectionContent);
            return section.append(header, sectionContent);
        },
        dispose: function () {
            this.container.empty().hide();
            this.content.empty();
            this.dimmer.remove();
            this.headers = [];
        },
        attachListeners: function () {
            $('.test-accordeon-section-header').on("click", function () {
                if (!$(this).is(m2_resources_4.maths.accordion.last())) {
                    m2_resources_4.maths.accordion.show(this);
                }
            });
        },
        show: function (header, index) {
            let $header = $(header), $content = $header.next();
            if ($content.is(':hidden')) {
                this.headers.forEach((val) => val.removeClass("selected"));
                $('.test-accordeon-section-content:visible').slideUp();
                $content.slideDown();
                $header.addClass("selected");
                if (index > this.headers.length / 2)
                    this.content.scrollTop(99);
                else
                    this.content.scrollTop(0);
            }
        },
        unfold: function () {
            this.contents.forEach(function (content) {
                content.show();
            });
        },
        scrollTo: function (index) {
            if (!index) {
                throw new Error("couldn't find the header");
            }
            this.headers.forEach((val) => val.removeClass("selected"));
            this.headers[index].addClass("selected");
            this.headers[index][0].scrollIntoView();
        }
    };
    m2_resources_4.maths.timer = {
        container: $('<div class="timer"></div>'),
        minutes: "00",
        seconds: "00",
        secondsElapsed: 0,
        init: function (parent, time, callback) {
            parent.append(this.container);
            if (this.setTimer !== null) {
                this.stop();
            }
            this.start(time, callback);
        },
        state: function () {
            return "<b>" + this.minutes + ":" + this.seconds + "</b>";
        },
        show: function () {
            this.container.html(this.state());
        },
        setTimer: null,
        start: function (minutes, callback) {
            let count = minutes * 60, seconds = count % 60;
            minutes = Math.floor(count / 60);
            this.minutes = (minutes < 10) ? "0" + minutes : "" + minutes;
            this.seconds = (seconds < 10) ? "0" + seconds : "" + seconds;
            this.show();
            var instance = this;
            var start = Date.now();
            this.setTimer = setInterval(function () {
                var elapsed = Math.floor((Date.now() - start) / 1000) - 1;
                instance.secondsElapsed = elapsed;
                if (elapsed >= count + 1) {
                    clearInterval(this.setTimer);
                    callback(instance.secondsElapsed);
                    return;
                }
                var secsElapsed = (elapsed + 60) % 60;
                var secs = (seconds < secsElapsed) ? 60 - (secsElapsed - seconds) : seconds - secsElapsed;
                var minsElapsed = Math.floor(elapsed / 60);
                var mins = (secsElapsed < seconds + 1) ? minutes - minsElapsed : minutes - minsElapsed - 1;
                instance.minutes = (mins < 10) ? "0" + mins : "" + mins;
                instance.seconds = (secs < 10) ? "0" + secs : "" + secs;
                instance.show();
            }, 1000);
        },
        stop: function () {
            clearInterval(this.setTimer);
            return this.secondsElapsed;
        }
    };
});
define("m5-layout", ["require", "exports", "m2-resources"], function (require, exports, m2_resources_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    m2_resources_5.maths.layout = {
        exercises: function (module) {
            let num = module.exerciseNum, html = "";
            // user interface on top
            html += '<div class="interface">';
            // choice of level
            html += `<div class="interface-item">
                    <label for="level">Difficulty:</label>
                    <select class="level">`;
            m2_resources_5.maths.difficulties.forEach((item, index) => {
                html += (module.level === index) ?
                    '<option selected="selected">' + item + '</option>'
                    : '<option>' + item + '</option>';
            });
            html += '</select></div>'; // end of level
            // number of exercises choice
            html += `<div class="interface-item">
                    <label for="exerciseNum">How many exercises?</label>
                    <select class="exerciseNum">`;
            m2_resources_5.maths.numOfExercises.forEach((item, index) => {
                html += (module.exerciseNum === parseInt(item, 10)) ?
                    '<option selected="selected">' + item + '</option>'
                    : '<option>' + item + '</option>';
            });
            html += '</select></div>'; // end of num of exercises choice
            // current score
            html += '<div class="interface-item-score">';
            html += '<div>Your Score:</div>';
            html += '<div><div class="score">0</div>';
            html += '<div>/</div>';
            html += '<div>' + num + '</div>';
            html += '</div></div>'; // end of score
            html += '</div>'; // end of interface
            html += this.main(module, num); //add main content and assign results to module's results property
            //bottom button group
            html += '<div class="interface">';
            html += '<input type="reset" class="reset">';
            html += '<input type="submit" value="Reload" class="reload">';
            html += '<input type="submit" value="Check All" class="check-all">';
            html += '</div>'; // end of button group
            module.levelDisplayed = module.level;
            module.container.html(html);
        },
        main: function (module) {
            let isTest = module.name === "test", isRandomized = (m2_resources_5.maths.settings.general.isRandomized === "true"), isFraction, isAnswer, sign = module.sign, allNumbers = module.numbers, // numbers bank
            length = allNumbers.length, // how many operations in a bank
            numbers, // numbers for single operation
            len, // number of numbers in operation
            random, // a random number used to randomize placement of answer field
            perc, // a chance for number to be an answer field
            index, // index of answer field
            results = module.results, // bank of answers
            html = '<div class="columns">'; // markup
            for (let i = 0; i < length; i += 1) {
                numbers = allNumbers[i];
                len = numbers.length;
                if (isRandomized) { // check whether to randomize answer fields or not
                    perc = 1 / len;
                    random = Math.random();
                    index = Math.floor(random / perc);
                }
                else { // if not then answer field is placed on the right of equality sign
                    index = len - 1; // index of answer field
                }
                // single operation
                html += '<div class="columns-line">';
                for (let j = 0; j < len; j += 1) {
                    isFraction = (numbers[j].length > 1);
                    isAnswer = (j === index);
                    if (isAnswer) {
                        module.answersIdxs.push(j);
                    }
                    html += isFraction ? // methods below return layout and assign number(s) to results array
                        this.fraction(numbers[j], isAnswer, results)
                        : this.integer(numbers[j], isAnswer, results);
                    if (j === len - 1) {
                        break;
                    }
                    html += (j === len - 2) ?
                        '<div> = </div>'
                        : '<div>' + sign + '</div>';
                }
                html += '<img src="' + m2_resources_5.maths.icons.questMark + '" class="icon">';
                html += !isTest ? // insert a check button if not a test
                    '<input type="submit" value="check" class="check">' : "";
                html += '</div>';
                // end of single operation
            }
            html += '</div>';
            return html;
        },
        integer: function (number, isAnswer, results) {
            let html = '';
            html += isAnswer ?
                '<div class="tooltip"><input type="text" maxlength="3" class="answer">' +
                    '<span class="tiptext"></span></div>'
                : '<div>' + number + '</div>';
            if (isAnswer) {
                results.push(number);
            }
            return html;
        },
        fraction: function (array, isAnswer, results) {
            let number = array[0] / array[1], // decimal representation of fraction
            wholeNum = Math.floor(number), // whole part of a fraction
            isInteger = Number.isInteger(number), // is fraction an integer?
            tempArray = [], html = '';
            html += isAnswer ? '<span class="tooltip">' : ''; // if it's an answer wrap fraction in a tooltip module
            html += '<div class="fraction">'; // opening fraction tag
            html += (wholeNum >= 1) ? // is there a whole number before a fraction part?
                isAnswer ?
                    '<div class="whole"><input type="text" maxlength="1" class="answer"></div>'
                    : '<div class="whole">' + wholeNum + '</div>'
                : '';
            if (isInteger) { // if fraction is an integer add closing tags and return
                html += '</div>';
                if (isAnswer) {
                    html += '<span class="tiptext"></span></span>';
                    results.push(array);
                }
                return html;
            }
            // calculate what is left after taking the whole number
            tempArray = [array[0] - (wholeNum * array[1]), array[1]];
            html += '<div class="fraction-unit">';
            html += '<div class="numerator">';
            html += isAnswer ?
                '<input type="text" class="answer" size="1">'
                : tempArray[0];
            html += '</div>'; // closing 'numerator' tag
            html += '<div class="denominator">';
            html += isAnswer ?
                '<input type="text" class="answer" size="1">'
                : tempArray[1];
            html += '</div></div></div>'; // closing 'denominator', 'fraction-unit' and 'fraction' tags
            if (isAnswer) {
                html += '<span class="tiptext"></span>';
                html += '</span>'; // closing tooltip module tag
                results.push(array);
            }
            return html;
        },
        testNavigation: function (isFirst, isLast) {
            let first = isFirst ? "Start" : "Prev", last = isLast ? "Finish" : "Next", firstClass = isFirst ? "button-start" : "button-prev", lastClass = isLast ? "button-finish" : "button-next", html = '<div class="test-navigation">';
            html += '<button class="' + firstClass + '">' + first + '</button>';
            html += isFirst ? ""
                : '<button class="' + lastClass + '">' + last + '</button></div>';
            return html;
        }
    };
});
define("m6-handlers", ["require", "exports", "m2-resources"], function (require, exports, m2_resources_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    m2_resources_6.maths.handlers = {
        exercises: function (module) {
            let levelChoice = module.container.find(".level"), exerciseNumChoice = module.container.find(".exerciseNum"), scoreField = module.container.find(".score"), score = 0, rows = module.container.find(".columns-line"), tooltips = rows.find(".tooltip"), showTooltips = (m2_resources_6.maths.settings.general.showTooltips === "true"), answerFields = rows.find(".answer"), icons = rows.find(".icon"), checkButtons = rows.find(".check"), resetButton = module.container.find(".reset"), reloadButton = module.container.find(".reload"), checkAllButton = module.container.find(".check-all"), answerField, icon, checkBtn, result, // result of a single operation
            answers, // user's answers
            timeout = null; // tooltip display delay
            const goodAnswer = function () {
                scoreField.text(++score);
                answerField.each(function (idx) {
                    let className = $(this).parents().is('.fraction-unit') ? "" : "close";
                    $(this).hide().after('<span class="' + className + '">' + answers[idx] + '</span>');
                });
                icon.prop("src", m2_resources_6.maths.icons.tick);
                checkBtn.addClass("invisible");
                return true;
            }, wrongAnswer = function () {
                icon.prop("src", m2_resources_6.maths.icons.cross);
                answerField.addClass("warning");
                return false;
            }, processOperation = function (index) {
                answerField = rows.eq(index).find(".answer");
                icon = icons.eq(index);
                checkBtn = checkButtons.eq(index);
                result = module.results[index];
                answers = [];
                let isCorrect = m2_resources_6.maths.handlers.validateOperation(answerField, result, answers);
                return isCorrect ? goodAnswer() : wrongAnswer();
            };
            $(document).ready(() => this.adjustLinesPadding(rows)); //adjust padding
            levelChoice.on("change", function () {
                let name = $(this).find("option:selected").text();
                module.setLevel(m2_resources_6.maths.difficulties.indexOf(name));
            });
            exerciseNumChoice.on("change", function () {
                let number = $(this).find("option:selected").text();
                module.setExerciseNum(parseInt(number, 10));
            });
            tooltips.on("mouseover mouseout", function (e) {
                if (showTooltips) {
                    let tip = $(this).find(".tiptext"), idx = tooltips.index(this);
                    if (e.type === "mouseover") { // position tooltip by setting its margin-left property
                        let el_center = $(this).width() / 2, // find 'tooltip' wrapper center
                        tip_center;
                        timeout = setTimeout(function () {
                            if (tip.children().length === 0) {
                                m2_resources_6.maths.createAndAppendCanvas(tip, module, idx); // create tiptext content
                                tip_center = tip.width() / 2, // find tiptext center
                                    tip.css('marginLeft', el_center - (tip_center + 11) + "px");
                            }
                            tip.addClass("showtip");
                        }, 1200);
                    }
                    else {
                        if (timeout !== null) {
                            clearTimeout(timeout);
                        }
                        tip.removeClass("showtip");
                    }
                }
            });
            checkButtons.on("click", function (e) {
                e.preventDefault();
                let index = checkButtons.index(this), isCorrect = processOperation(index);
                m2_resources_6.maths.playSound(isCorrect);
                $(this).blur();
            });
            resetButton.on("click", () => {
                score = 0;
                scoreField.text(score);
                answerFields.show().removeClass("warning").next().remove();
                icons.prop("src", m2_resources_6.maths.icons.questMark);
                checkButtons.removeClass("invisible");
                resetButton.blur();
            });
            reloadButton.on("click", (e) => {
                e.preventDefault();
                module.init();
            });
            checkAllButton.on("click", (e) => {
                e.preventDefault();
                checkButtons.each(function (index, btn) {
                    if (!$(btn).is(".invisible")) {
                        processOperation(index);
                    }
                });
                checkAllButton.blur();
            });
            this.textInputs(rows, answerFields, processOperation); //add input fields filtering
        },
        test: function (module) {
            let rows = module.container.find(".columns-line"), answerFields = module.container.find(".answer"), prevBtn = module.container.find('.button-prev'), nextBtn = module.container.find('.button-next'), startBtn = module.container.find('.button-start'), finishBtn = module.container.find('.button-finish'), headers = module.container.find('.test-accordeon-section-header'), closeBtn = m2_resources_6.maths.accordion.closeBtn, closeBtn2 = $("#test-close"), lastFocusableElements = $(startBtn).add(nextBtn).add(finishBtn).add(closeBtn).add(closeBtn2);
            const processTest = function () {
                let scores = [], icons = module.container.find(".icon"), results = module.results;
                const wrongAnswer = function (index) {
                    scores[index] = 0;
                    rows.eq(index).find(".answer").addClass("warning");
                    icons.eq(index).prop("src", m2_resources_6.maths.icons.cross);
                };
                const correctAnswer = function (index) {
                    scores[index] = 1;
                    rows.eq(index).find(".answer").addClass("correct");
                    icons.eq(index).prop("src", m2_resources_6.maths.icons.tick);
                };
                rows.each(function (idx, row) {
                    let fields = $(row).find(".answer"), result = module.results[idx], isCorrect = m2_resources_6.maths.handlers.validateOperation(fields, result);
                    if (isCorrect) {
                        correctAnswer(idx);
                    }
                    else {
                        wrongAnswer(idx);
                    }
                });
                return scores;
            };
            $(document).ready(() => this.adjustLinesPadding(rows)); //adjust padding
            startBtn.on("click", function () {
                if ($(this).text() === "Start") {
                    let ns = m2_resources_6.maths.test;
                    m2_resources_6.maths.timer.init($('.test-accordeon-titlebar-foo'), ns.times[ns.level], ns.summary);
                    m2_resources_6.maths.accordion.attachListeners();
                    $(this).text("Next");
                }
                m2_resources_6.maths.accordion.show(headers.eq(1), 1);
            });
            prevBtn.on("click", function () {
                let index = prevBtn.index(this);
                m2_resources_6.maths.accordion.show(headers.eq(index), index);
            });
            nextBtn.on("click", function () {
                let index = nextBtn.index(this);
                m2_resources_6.maths.accordion.show(headers.eq(index + 2), index + 2);
            });
            finishBtn.on("click", function () {
                let scores = processTest();
                answerFields.prop("disabled", "true");
                $(startBtn).add(prevBtn).add(nextBtn).add(finishBtn).hide();
                m2_resources_6.maths.test.displayResults(scores, m2_resources_6.maths.timer.stop());
            });
            closeBtn2.on("click", () => m2_resources_6.maths.accordion.dispose());
            lastFocusableElements.on("keydown", function (e) {
                if (e.which === 9) { // keep focus traversing inside the dialog container
                    if (e.shiftKey) {
                        if ($(this).is(closeBtn)) {
                            lastFocusableElements.filter(":visible").focus();
                            e.preventDefault();
                        }
                    }
                    else if (!$(this).is(closeBtn)) {
                        closeBtn.focus();
                        e.preventDefault();
                    }
                }
            });
            this.textInputs(rows, answerFields); // add input fields filtering
        },
        validateOperation: function (answerFields, result, answers) {
            let fraction = [], input;
            answers = answers || [];
            answerFields.each(function (idx) {
                input = $(this).val();
                if (input === "") {
                    if (result.length && idx === 0 && result[0] > result[1]) {
                        input = "0"; // if no input in "whole" part of fraction assume zero
                    }
                    else {
                        return false;
                    }
                }
                answers.push(parseInt(input, 10));
            });
            if (result.length) { // if dealing with fractions convert answers to simple fractions
                if (answers.length === 1) {
                    fraction = [answers[0], 1];
                }
                if (answers.length === 2) {
                    fraction = answers;
                }
                if (answers.length === 3) {
                    fraction = [answers[0] * answers[2] + answers[1], answers[2]];
                    answers[0] = (answers[0] === 0) ? "" : answers[0]; // remove zero if there was one added
                }
            }
            if (fraction.length === 0) { // if not a fraction
                return (answers[0] === result) ? true : false;
            }
            else { // if a fraction
                return (fraction[0] / fraction[1] === result[0] / result[1]) ? true : false;
            }
        },
        textInputs: function (rows, answerFields, callback) {
            answerFields.on("paste", () => false);
            answerFields.on("blur", function () {
                let field = $(this);
                if (field.val() === "") {
                    let parent = field.removeClass("warning").parents(".columns-line");
                    let fields = parent.find(".answer");
                    if (fields.length > 1) { // only if a fraction
                        if (fields.not(field).val() !== "") {
                            return;
                        }
                    }
                    parent.find(".icon").prop("src", m2_resources_6.maths.icons.questMark);
                }
            });
            answerFields.on("keydown", function (e) {
                let field = $(this), row = field.parents(".columns-line"), index = rows.index(row), isFraction = row.find(".answer").length > 1, char = String.fromCharCode(e.which), length = field.val().length, limit = 3;
                if (isFraction) { // adjust variables if fraction
                    limit = 2;
                }
                if ((window.getSelection().toString() !== "") && ($.isNumeric(char) ||
                    (e.which > 95 && e.which < 106))) {
                    return true; //allow replacing selection with numbers
                }
                if (e.which === 8 || e.which === 9 || e.which === 46 || e.which === 37 || e.which === 39) {
                    return true; //allow backspace, tab, delete, left and right arrow
                }
                if ((e.which > 95) && (e.which < 106) && (length < limit)) {
                    return true; //allow numeric keyboard
                }
                if (e.which === 13 && typeof callback === "function") {
                    let isCorrect = callback(index); // check line when "enter" pressed
                    m2_resources_6.maths.playSound(isCorrect);
                    return false;
                }
                if (!$.isNumeric(char) || (length === limit)) {
                    return false;
                }
            });
        },
        adjustLinesPadding: function ($lines) {
            let width = $lines[0].getBoundingClientRect().width, // line's width (equal for all lines)
            max = 0, // the longest line
            min = width, // the shortest line
            padding;
            Array.prototype.forEach.call($lines, function (line) {
                let children = line.children, sum = 0, // length of all child elements in pixels
                style, margin;
                Array.prototype.forEach.call(children, function (child) {
                    style = window.getComputedStyle(child) || child.currentStyle;
                    margin = style.marginLeft;
                    sum += parseInt(margin.substring(0, margin.indexOf('px')), 10) + 2;
                    sum += child.getBoundingClientRect().width;
                });
                min = (sum < min) ? sum : min;
                max = (sum > max) ? sum : max;
            });
            padding = (width - ((max + min) / 2)) / 2; // padding based on average line width
            padding = (padding > (width - max)) ? (width - max) / 2 : padding; // adjust it if max is too long
            Array.prototype.forEach.call($lines, function (line) {
                line.style.paddingRight = padding + 'px';
            });
        }
    };
});
define("m7-settings", ["require", "exports", "m1-prototype", "m2-resources"], function (require, exports, m1_prototype_6, m2_resources_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    m2_resources_7.maths.settings = {
        name: "settings",
        areLoaded: false,
        fields: {
            volume: $('#volume'),
            isRandomized: $('#settings input[name="isRandomized"]'),
            showTooltips: $('#settings input[name="showTooltips"]'),
            testModules: $('#settings input[name="modules"]'),
            testTimes: $('#settings select[name="times"'),
            testNumOfQuest: $('#settings select[name="numOfQuest"'),
            clearButton: $('#settings-clear'),
            applyButton: $('#settings-apply'),
            settingsForm: $('#settings-form')
        },
        system: {
            volume: 0.5
        },
        general: {
            showTooltips: "true",
            isRandomized: "false"
        },
        fractions: {},
        test: {
            exerciseNum: "4",
            modules: "addition,subtraction,multiplication,division,fractions",
            times: "10,8,6",
            unlocked: "0"
        },
        changed: {
            system: {},
            general: {},
            test: {}
        },
        init: function () {
            let ns = m2_resources_7.maths.settings, namespace = "maths.settings.", all = {
                system: this.system,
                general: this.general,
                test: this.test
            };
            const enableApplyButton = () => {
                if ($.isEmptyObject(ns.changed.system)
                    && $.isEmptyObject(ns.changed.general)
                    && $.isEmptyObject(ns.changed.test))
                    ns.fields.applyButton.prop('disabled', true);
                else
                    ns.fields.applyButton.prop('disabled', false);
            };
            // read settings from local storage and update all settings fields
            this.accessStorage(all, namespace, false);
            this.areLoaded = true;
            this.restoreSettings();
            // define handlers for all settings input fields
            this.fields.volume.on('input change', () => this.updateVolumeLabel(this.fields.volume.val()));
            this.fields.volume.on('change', function () {
                let volume = $(this).val() / 100;
                if (ns.system.volume == volume)
                    delete ns.changed.system.volume;
                else
                    ns.changed.system.volume = volume;
                m2_resources_7.maths.playSound(true, volume);
                enableApplyButton();
            });
            this.fields.isRandomized.on('change', function () {
                let isRand = $(this).val();
                if (isRand === ns.general.isRandomized)
                    delete ns.changed.general.isRandomized;
                else
                    ns.changed.general.isRandomized = isRand;
                enableApplyButton();
            });
            this.fields.showTooltips.on('change reset', function () {
                let isTooltip = $(this).val();
                if (isTooltip === ns.general.showTooltips)
                    delete ns.changed.general.showTooltips;
                else
                    ns.changed.general.showTooltips = isTooltip;
                enableApplyButton();
            });
            this.fields.testModules.on('change', function () {
                let mods = [];
                ns.fields.testModules.each((i, el) => {
                    if ($(el).is(':checked')) {
                        mods.push($(el).val());
                    }
                });
                if (mods.join(",") === ns.test.modules)
                    delete ns.changed.test.modules;
                else
                    ns.changed.test.modules = mods.join(",");
                enableApplyButton();
            });
            this.fields.testTimes.on('change', function () {
                let times = [];
                ns.fields.testTimes.each((i, el) => {
                    times[i] = $(el).val();
                });
                if (times.join(",") === ns.test.times) {
                    delete ns.changed.test.times;
                }
                else {
                    ns.changed.test.times = times.join(",");
                }
                enableApplyButton();
            });
            this.fields.testNumOfQuest.on('change', () => {
                let num = this.fields.testNumOfQuest.val();
                if (num == ns.test.exerciseNum)
                    delete ns.changed.test.exerciseNum;
                else
                    ns.changed.test.exerciseNum = num;
                enableApplyButton();
            });
            this.fields.clearButton.on('click', () => {
                this.clearChanges();
                this.restoreSettings();
                this.fields.clearButton.blur();
                enableApplyButton();
            });
            this.fields.settingsForm.on('submit', function (e) {
                e.preventDefault();
                if (ns.confirmChanges()) { // check whether changes will reset any modules and display..
                    ns.applyChanges(); // ..confirmation dialog
                    ns.accessStorage(ns.changed, namespace, true);
                    ns.clearChanges();
                    enableApplyButton();
                } // do nothing if changes are refused
            });
            this.fields.settingsForm.on('reset', () => {
                setTimeout(() => this.fields.volume.trigger('input'), 100);
                $('#settings-default').blur();
                enableApplyButton();
            });
        },
        accessStorage: function (object, namespace, write) {
            try {
                if (typeof (Storage) !== "undefined") {
                    for (let field in object) {
                        if (object.hasOwnProperty(field)) {
                            if (typeof object[field] === 'object') { // obtaining all values recursively
                                this.accessStorage(object[field], namespace + field + ".", write);
                            }
                            else if (write) {
                                localStorage.setItem(namespace + field, object[field]);
                                console.log("saving: " + namespace + field + ": " + object[field]); /** */
                            }
                            else {
                                let loaded = localStorage.getItem(namespace + field);
                                console.log("loading: " + namespace + field + ": " + loaded); //** */
                                if (loaded !== null)
                                    object[field] = loaded;
                            }
                        }
                    }
                }
            }
            catch (error) {
                alert("can't access the local storage");
            }
        },
        applyChanges: function () {
            let changed = this.changed, apply = false, temp, isEmpty, resetModules = () => {
                for (const object in m2_resources_7.maths) { // the program to reload modules next time they will be displayed
                    if (m2_resources_7.maths.hasOwnProperty(object) &&
                        Object.getPrototypeOf(m2_resources_7.maths[object]) === m1_prototype_6.Operation.prototype) {
                        m2_resources_7.maths[object]["levelDisplayed"] = -1; // actual reset
                    }
                }
            }, resetTest = () => {
                m2_resources_7.maths.settings.test.unlocked = "0";
                this.accessStorage({ "unlocked": "0" }, "maths.settings.test.", true);
            };
            for (const object in changed) { // assign temporary changes to actual settings
                if (changed.hasOwnProperty(object)) {
                    temp = changed[object];
                    isEmpty = true;
                    for (const field in temp) {
                        if (temp.hasOwnProperty(field)) {
                            this[object][field] = temp[field];
                            isEmpty = false;
                        }
                    }
                    if (!isEmpty) {
                        if (object === "general")
                            resetModules();
                        if (object === "test")
                            resetTest();
                    }
                }
            }
        },
        restoreSettings: function () {
            let testModules = this.test.modules.split(","), testTimes = this.test.times.split(",");
            this.fields.volume.val(this.system.volume * 100);
            this.updateVolumeLabel(this.system.volume * 100);
            this.fields.isRandomized.filter('[value="' + this.general.isRandomized + '"]').prop('checked', true);
            this.fields.showTooltips.filter('[value="' + this.general.showTooltips + '"]').prop('checked', true);
            this.fields.testModules.each((i, el) => {
                let checked = false;
                testModules.forEach((val) => {
                    if ($(el).is('[value="' + val + '"]')) {
                        checked = true;
                    }
                });
                $(el).prop('checked', checked);
            });
            this.fields.testTimes.each((i, el) => {
                $(el).val(testTimes[i]);
            });
            this.fields.testNumOfQuest.val(this.test.exerciseNum);
        },
        clearChanges: function () {
            for (let field in this.changed) {
                if (this.changed.hasOwnProperty(field)) {
                    this.changed[field] = {};
                }
            }
        },
        confirmChanges: function () {
            let conf = true, general = !$.isEmptyObject(this.changed.general), test = !$.isEmptyObject(this.changed.test);
            if (general && test) {
                conf = confirm("changing these options will void any progress throughout all modules and test");
            }
            else if (general) {
                conf = confirm("changing these options will void any progress throughout all modules (not test)");
            }
            else if (test) {
                conf = confirm("changing these options will void any progress in the test module");
            }
            return conf;
        },
        updateVolumeLabel: function (value) {
            $('#volume-label').html(value + "%");
            if (value < 1)
                $('#speaker').prop('src', 'pics/speaker-muted.png');
            else if (value < 30)
                $('#speaker').prop('src', 'pics/speaker-low-volume.png');
            else if (value < 70)
                $('#speaker').prop('src', 'pics/speaker-medium-volume.png');
            else
                $('#speaker').prop('src', 'pics/speaker-high-volume.png');
        }
    };
});
