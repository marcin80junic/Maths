
import { maths } from './m02-maths';


// define MathOperation class, a backbone of all mathematical operations

export abstract class MathOperation {

  container: JQuery;
  name: string;
  sign: string | string[];

  levelDisplayed = -1;
  _level: number;
  _exercisesCount: number;
  numbersBank: Array<Array<any>>;
  answersMap: Map<number, number>;

  constructor(container: JQuery, name: string, sign: string | Array<string>) {
    this.container = container;
    this.name = name;
    this.sign = sign;
  }


  abstract getNumbers(level: number): Array<any>;


  init() {
    if (this.levelDisplayed === -1) {                     // true only when loading module first time
      this.loadSettings();
    }
    this.numbersBank = this.generateOperations(this.exercisesCount, this.level);
    this.answersMap = new Map();                          // reset results array
    maths.layout.exercises(this);                         // create layout and assign results property value
    maths.handlers.exercises(this);                       // attach handlers to layout elements
  }


  get level() {
    return this._level;
  }

  set level(newLevel: number) {
    this._level = newLevel;
    this.saveSettings({level: newLevel});
    this.init();
  }


  get exercisesCount() {
    return this._exercisesCount;
  }

  set exercisesCount(newNum: number) {
    this._exercisesCount = newNum;
    this.saveSettings({exerciseNum: newNum});
    this.init();
  }


  generateOperations(count: number, level: number): Array<Array<any>> {
    let operation = [];
    const numbers = [],
      areNumsUnique = (numBank: Array<any>, nums: Array<any>) => {
        const operationString = JSON.stringify(nums);
        for(const sub of numBank) {
          if (JSON.stringify(sub) === operationString) {
            return false;
          }
        }
        return true;
      };

    for (let i = 0; i < count; i += 1) {
      while (true) {
        operation = this.getNumbers(level);
        if (areNumsUnique(numbers, operation)) {
          numbers.push(operation);
          break;
        }
      }
    }
    return numbers;
  }


  static divisors(number: number) {
    const divArray = [];
    if (number <= 1) {
      return divArray;
    }
    for (let i=2; i<number/2+1; i++) {
      if (number % i === 0) {
        divArray.push(i);
      }
    }
    return divArray;
  }


  static isPrime = (num: number) => {
    if (num > 0 && num < 4) {
      return true;
    } 
    for (let i=4; i<=num/2; i++) {
      if (num % i === 0) {
        return false;
      }
    }
    return true;
  }


  static range(min: number, max: number, excludePrimes?: boolean, optArray?: Array<number>) {
    let random: number;
    const temp = [],
      getOptNum = (array: Array<number>) => {
        if (array.length === 0) {
          return NaN;
        }
        let chance = 1 / array.length;
        return array[Math.floor(Math.random() / chance)];
      };

    if (min > max) {
      return NaN;
    }

    if (excludePrimes) {
      if (max < 4) {
        return NaN;
      }
      if (optArray) {
        for (const num of optArray) {
          if (!MathOperation.isPrime(num) && (num >= min) && (num <= max)) {
            temp.push(num);
          }
        }
        if (temp.length === 0) {
          return NaN;
        }
        return getOptNum(temp);
      } else {
        while (true) {
          random = Math.floor(Math.random() * (max - min + 1) + min);
          if (!MathOperation.isPrime(random)) {
            return random;
          }
        }
      }
    }
    if (optArray) {
      console.log(`min: ${min} , max: ${max}, array: ${optArray}`)
      for (const num of optArray) {
        if ((num >= min) && (num <= max)) {
          temp.push(num);
        }
      }
      return getOptNum(temp);
    }

    return random = Math.floor(Math.random() * (max - min + 1) + min);
  }


  static reduce(array: Array<any>) {  // reduce whole operation array
    let total = array[0];
    const size = array.length,
          isFraction = (array[0].length > 1);

    for (let i=2; i<size; i+=2) {
      total = MathOperation.reducer(total, array[i], array[i-1], isFraction);
    }
    return total;
  }


  static reducer(prev: any, curr: any, sign: string, isFraction: boolean) {   // reduce single operation

    const reduceFraction = (num: number, den: number) => {
      while (den) {        // find greatest common divisor
        var temp = den;
         den = num % den;
         num = temp;
      }
      return [num, den];
    }
    const addFraction = () => {
      let num = prev[0] * curr[1] + curr[0] * prev[1],
          den = prev[1] * curr[1];
      return reduceFraction(num, den);
    }
    const subtrFraction = () => {
      let num = prev[0] * curr[1] - curr[0] * prev[1],
          den = prev[1] * curr[1];
      return reduceFraction(num, den);
    }
    const multiplyFraction = () => {
      let num = prev[0] * curr[0],
          den = prev[1] * curr[1];
      return reduceFraction(num, den);
    }
    const divideFraction = () => {
      let num = prev[0] * curr[1],
          den = prev[1] * curr[0];
      return reduceFraction(num, den);
    }

    switch(sign) {
      case '+':
        return isFraction?
          addFraction()
          : prev + curr;
      case '-':
        return isFraction?
          subtrFraction()
          : prev - curr;
      case '\u00D7':
        return isFraction?
          multiplyFraction()
          : prev * curr;
      case '\u00F7':
        return isFraction?
        divideFraction()
        : prev / curr;
      default:
        throw new Error('unrecognized operation sign character');
    }
  }


  loadSettings() {
    try {
      if (typeof (Storage) !== "undefined") {
        let namespace = `maths.${this.name}`;
        this._level = parseInt((localStorage.getItem(`${namespace}.level`)), 10) || 0;
        this._exercisesCount = parseInt( (localStorage.getItem(`${namespace}.exercisesCount`) ), 10) || 6;
      }
    } catch (error) {
      alert("can't access the local storage\nall settings will be restored to its default values");
    }
  }


  saveSettings(newSettings: object) {
    if (typeof (Storage) !== "undefined") {
      try {
        if (typeof (Storage) !== "undefined") {
          let namespace = `maths.${this.name}`;
          for (const name in newSettings) {
            if (newSettings.hasOwnProperty(name)) {
              localStorage.setItem(`${namespace}.${name}`, newSettings[name as keyof object]);
            }
          }
        }
      } catch(error) {
        alert("can't access the local starage\nall changes will NOT be saved");
      }
    }
  }


}