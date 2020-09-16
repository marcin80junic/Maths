import { maths } from './m02-maths';
import type { content } from './types';


// define Operation class, a backbone of all mathematical operations

export function Operation() {
  
  const proto = Operation.prototype;

  proto.levelDisplayed = -1;

  proto.numbers = [];

  proto.results = [];

  proto.answersIdxs = [];

  proto.setLevel = function(newLevel: number) {
    this.level = newLevel;
    this.saveSettings({level: newLevel});
    this.init();
  };

  proto.setExerciseNum = function(newNum: number) {
    this.exerciseNum = newNum;
    this.saveSettings({exerciseNum: newNum});
    this.init();
  };

  proto.init = function() {
    if (this.levelDisplayed === -1) this.loadSettings(); //true only when loading module first time
    this.numbers = this.numbersCreator();
    this.results = []; // reset results array
    this.answersIdxs = [] // and indexes of answers
    maths.layout.exercises(this); //  create layout and assign results property value
    maths.handlers.exercises(this); // attaching handlers to layout elements
  };

  proto.numbersCreator = function(num: number, level: number) {
    num = num || this.exerciseNum;
    if (typeof level === "undefined") {
      level = this.level;
    } 
    let operation: Array<number> = [],
        numbers: Array<Array<number>> = [],
        i: number;
    for (i = 0; i < num; i += 1) {
      while (true) {
        operation = this.getNumbers(level);
        if (areNumsUnique({ nums: operation, array: numbers })) {
          numbers.push(operation);
          break;
        }
      }
    }
    function areNumsUnique({ nums, array }: { nums: Array<number>; array: Array<Array<number>>; }) {
      let max: number = array.length,
          i: number;
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
    } catch (error) {
      alert("can't access the local storage\nall settings will be restored to its default values");
    }
  };

  proto.saveSettings = function (object: content) {
    try {
      if (typeof (Storage) !== "undefined") {
        let namespace: string = "maths." + this.name + ".",
            name: string;
        for (name in object) {
          if (object.hasOwnProperty(name)) {
            localStorage.setItem(namespace + name, object[name as keyof content]);
          }
        }
      }
    } catch(error) {}
  };
}

Operation();  // initialize Operation

//utility function for creating objects which inherit from "obj"

export function objectCreator(obj: any) {
  function F(this: any) { }
  F.prototype = obj;
  return new (F as any)();
}