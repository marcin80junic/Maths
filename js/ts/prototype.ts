//define Operation class, a backbone of all mathematical operations
function Operation() { };
(function () {
  Operation.prototype.levelDisplayed = null;
  Operation.prototype.numbers = [];
  Operation.prototype.results = [];
  Operation.prototype.answersIdxs = [];
  Operation.prototype.setLevel = function(newLevel) {
    this.level = newLevel;
    this.saveSettings({level: newLevel});
    this.init();
  };
  Operation.prototype.setExerciseNum = function(newNum) {
    this.exerciseNum = newNum;
    this.saveSettings({exerciseNum: newNum});
    this.init();
  };
  Operation.prototype.init = function () {
    if (!this.levelDisplayed) this.loadSettings(); //true only when loading module first time
    this.numbers = this.numbersCreator();
    this.results = []; // reset results array
    this.answersIdxs = [] // and indexes of answers
    maths.layout.exercises(this); //  create layout and assign results property value
    maths.handlers.exercises(this); // attaching handlers to layout elements
  };
  Operation.prototype.numbersCreator = function(num, level) {
    num = num || this.exerciseNum;
    if (typeof level === "undefined") {
      level = this.level;
    } 
    let operation = [],
        numbers = [],
        i;
    for (i = 0; i < num; i += 1) {
      while (true) {
        operation = this.getNumbers(level);
        if (areNumsUnique(operation, numbers)) {
          numbers.push(operation);
          break;
        }
      }
    }
    function areNumsUnique(nums, array) {
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
  Operation.prototype.loadSettings = function () {
    try {
      if (typeof (Storage) !== "undefined") {
        let namespace = "maths." + this.name + ".";
        this.level = parseInt((localStorage.getItem(namespace + "level")), 10) || 0;
        this.exerciseNum = parseInt((localStorage.getItem(namespace + "exerciseNum")), 10) || 6;
      }
    } catch (error) {
      alert("can't access the local storage\nall settings will be restored to its default values");
    }
  };
  Operation.prototype.saveSettings = function (object) {
    try {
      if (typeof (Storage) !== "undefined") {
        let namespace = "maths." + this.name + ".",
            name;
        for (name in object) {
          if (object.hasOwnProperty(name)) {
            localStorage.setItem(namespace + name, object[name]);
          }
        }
      }
    } catch(error) {}
  };
}());


//utility function for creating objects which inherit from "obj"
function objectCreator(obj) {
  function F() { }
  F.prototype = obj;
  return new F();
}
