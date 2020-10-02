
import { maths } from './m03-maths';


// define MathOperation class, a backbone of all mathematical operations

export abstract class MathOperation {

  container: JQuery;
  name: string;
  _sign: string | string[];

  public static ADDITION_SIGN = "+";
  public static SUBTRACTION_SIGN = "-";
  public static MULTIPLICATION_SIGN = "\u00D7";
  public static DIVISION_SIGN = "\u00F7";

  levelDisplayed = -1;
  _level: number;
  _exercisesCount: number;
  score: number;
  numbersBank: Array<Array<any>>;
  answersMap: Map<number, number>;

  constructor(container: JQuery, name: string, sign: string | Array<string>) {
    this.container = container;
    this.name = name;
    this._sign = sign;
    this.score = 0;
  }


  abstract getNumbers(level: number): Array<any>;


  init() {
    if (this.levelDisplayed === -1) {                     // true only when loading module first time
      this.loadSettings();
    }
    this.numbersBank = this.generateOperations(this.exercisesCount, this.level);
    /* Security measure in case if the loop inside generateOperations function runs out of variations.
      It stops the application by throwing error */
    setTimeout(() => (this.levelDisplayed === -1)? new Error('genereteOperations time out!'): null, 3000);
    this.answersMap = new Map();                          // reset results array
    maths.layout.exercises(this);                         // create layout and assign results property value
    maths.handlers.exercises(this);                       // attach handlers to layout elements
  }


  get sign() {
    return this._sign;
  }
  set sign(newSign: string | string[]) {
    if (newSign.length === 0) {
      this._sign = MathOperation.ADDITION_SIGN;
    } else {
      this._sign = newSign;
    }
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

  /*
    divisors method takes number and returns its divisors NOT including 1 and number itself
  */
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


  /*
    takes an array and returns its one random value
  */
  static randomValue = (array: Array<number>) => { 
    if (array.length === 0) {             
      return undefined;
    }
    let chance = 1 / array.length;
    return array[Math.floor(Math.random() / chance)];
  }


  /*
    By default range method returns random integer number between min and max (including) values.
    If max is < than min NaN will be returned.

    Optional boolean excludePrimes passed to the method ensures that returned number will not
    be a prime number. If excludePrimes is provided and its value is true, there should be some
    not-prime numbers between min and max parameters, otherwise the NaN value will be returned.

    It is possible to provide an array of numbers as the fourth argument, in which case the randomly
    chosen number from this array will be returned instead. Only numbers between min and max parameters
    can be returned. In case when there is no number in range or the array is empty the NaN value 
    will be returned.
  */
  static range(min: number, max: number, excludePrimes?: boolean, optArray?: Array<number>) {

    let random: number;
    const temp = [];

    min = Math.floor(min);
    max = Math.floor(max);

    if (min > max) {  // exclude abnormal case
      return NaN;
    }

    if (excludePrimes) {
      if (max < 4) {  // nums 1-3 are primes
        return NaN;
      }
      if (optArray) {
        for (const num of optArray) {
          if (!MathOperation.isPrime(num) && (num >= min) && (num <= max)) {
            temp.push(num);
          }
        }

        /* return random number matching above conditions or NaN if no numbers left */
        return (temp.length === 0)? NaN : MathOperation.randomValue(temp);
      } 

      /* case when excludePrimes is true and no optional array provided */
      if (max - min > 0) {  // making sure there will be a not-prime number in range
        while (true) {
          random = Math.floor(Math.random() * (max - min + 1) + min);
          if (!MathOperation.isPrime(random)) {
            return random;
          }
        }
      }
      return MathOperation.isPrime(min)? NaN : min;   // case when min === max
    }

    /* if excludesPrime is false and optArray is provided */
    if (optArray) { 
      for (const num of optArray) {
        if ((num >= min) && (num <= max)) {
          temp.push(num);
        }
      }
      return (temp.length === 0)? NaN : MathOperation.randomValue(temp);
    }

    /* simle case when min and max parameters are in order and no optional parameters are provided*/
    return random = Math.floor(Math.random() * (max - min + 1) + min);
  }


  /* 
    Reduce method takes whole operation array and returns its total result.
    It is using a reducer method (see below) to get sub totals of each operation.
    Every second index (starting at 1) should be an operation sign.
    The valid operation signs are MathOperation constants: ADDITION_SIGN, SUBTRACTION_SIGN,
    MULTIPLICATION_SIGN and DIVISION_SIGN.
  */
  static reduce(array: Array<any>) { 
    let total = array[0];
    const size = array.length,
          isFraction = (array[0].length > 1);
    
    if (array.length < 3) {
      return isFraction?
        array[0][0] / array[0][1]
        : array[0];
    }
    for (let i=2; i<size; i+=2) {
      total = MathOperation.reducer(total, array[i], array[i-1], isFraction);
    }
    return total;
  }


  /*
    Reduces single operation. 
  */
  static reducer(prev: any, curr: any, sign: string, isFraction: boolean) {
  
    const reduceFraction = (num: number, den: number) => {
            let x = num, y = den, temp: number;
            while (y) {  // find greatest common divisor
              temp = y;
              y = x % y;
              x = temp;
            }
            return [num / x, den / x];
          },
          addFraction = () => {
            let num = prev[0] * curr[1] + curr[0] * prev[1],
                den = prev[1] * curr[1];
            return reduceFraction(num, den);
          },
          subtrFraction = () => {
          let num = prev[0] * curr[1] - curr[0] * prev[1],
              den = prev[1] * curr[1];
          return reduceFraction(num, den);
          },
          multiplyFraction = () => {
            let num = prev[0] * curr[0],
                den = prev[1] * curr[1];
            return reduceFraction(num, den);
          },
          divideFraction = () => {
            let num = prev[0] * curr[1],
                den = prev[1] * curr[0];
            return reduceFraction(num, den);
          };

    switch(sign) {
      case MathOperation.ADDITION_SIGN:
        return isFraction?
          addFraction()
          : prev + curr;
      case MathOperation.SUBTRACTION_SIGN:
        return isFraction?
          subtrFraction()
          : prev - curr;
      case MathOperation.MULTIPLICATION_SIGN:
        return isFraction?
          multiplyFraction()
          : prev * curr;
      case MathOperation.DIVISION_SIGN:
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