define(["require", "exports", "./m2-resources"], function (require, exports, m2_resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.objectCreator = exports.Operation = void 0;
    // define Operation class, a backbone of all mathematical operations
    function Operation() {
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
