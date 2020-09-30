
import $ from 'jquery';
import { MathOperation } from './m01-prototype';


class Addition extends MathOperation {

  getNumbers(level: number) {

    const operation = [],
      rand = MathOperation.range,
      reduce = MathOperation.reduce,

      easy = () => {
        operation.push(rand(2, 9), this.sign, rand(2, 9));
      },
      medium = () => {
        if (Math.random() < 0.5) {
          if (Math.random() < 0.5) {
            operation.push(rand(10, 19), this.sign, rand(2, 9));
          } else {
            operation.push(rand(2, 9), this.sign, rand(10, 19));
          }
        } else {
          operation.push(rand(2, 9), this.sign, rand(2, 9), this.sign, rand(2, 9));
        }
      },
      hard = () => {
        let random = Math.random();
        if (random < 0.33) {
          if (Math.random() < 0.5) {
            operation.push(rand(2, 9), this.sign, rand(10, 19), this.sign, rand(11, 99));
          } else {
            operation.push(rand(2, 9), this.sign, rand(11, 99), this.sign, rand(10, 19));
          }
        } else if (random < 0.66) {
          if (Math.random() < 0.5) {
            operation.push(rand(10, 19), this.sign, rand(2, 9), this.sign, rand(11, 99));
          } else {
            operation.push(rand(10, 19), this.sign, rand(11, 99), this.sign, rand(2, 9));
          }
        } else {
          if (Math.random() < 0.5) {
            operation.push(rand(11, 99), this.sign, rand(2, 9), this.sign, rand(10, 19));
          } else {
            operation.push(rand(11, 99), this.sign, rand(10, 19), this.sign, rand(2, 9));
          }
        }
      };
        
    switch (level) {
      case 0:
        easy();
        break;
      case 1:
        medium();
        break;
      case 2:
        hard();
        break;
    }
    operation.push('=', reduce(operation));
    return operation;
  }
}


class Subtraction extends MathOperation {

  getNumbers = function(level: number) {

    let subTotal: number;
    const operation = [],
      rand = MathOperation.range,
      reduce = MathOperation.reduce,

      easy = () => {
        subTotal = rand(3, 9)
        operation.push(subTotal, this.sign, rand(2, subTotal - 1));
      },
      medium = () => {
        subTotal = rand(10, 19);
        if (Math.random() < 0.5) {
          operation.push(subTotal, this.sign, rand(2, subTotal - 2));
        } else {
          operation.push(subTotal, this.sign, rand(2, subTotal - 3), this.sign);
          subTotal = reduce(operation);
          operation.push(rand(2, subTotal));
        }
      },
      hard = () => {
        subTotal = rand(20, 99);
        if (Math.random() < 0.5) {
          operation.push(subTotal, this.sign, rand(11, subTotal - 2));
        } else {
          operation.push(subTotal, this.sign, rand(2, 19), this.sign);
          subTotal = reduce(operation);
          operation.push(rand(2, subTotal));
        }
      };

    switch (level) {
      case 0:
        easy();
        break;
      case 1:
        medium();
        break;
      case 2:
        hard();
        break;
    }

    operation.push('=', reduce(operation));
    return operation;
  }

}


class Multiplication extends MathOperation {

  getNumbers = function (level: number) {

    const operation = [],
      rand = MathOperation.range,
      reduce = MathOperation.reduce,

      easy = () => {
        operation.push(rand(2, 6), this.sign, rand(2, 6));
      },
      medium = () => {
        if (Math.random() < 0.5) {
          operation.push(rand(2, 5), this.sign, rand(2, 5), this.sign, rand(2, 5));
        } else {
          if (Math.random() < 0.5) {
            operation.push(rand(5, 9), this.sign, rand(2, 9));
          } else {
            operation.push(rand(2, 9), this.sign, rand(5, 9));
          }
        }
      },
      hard = () => {
        if (Math.random() < 0.5) {
          if (Math.random() < 0.5) {
            operation.push(rand(2, 9), this.sign, rand(11, 19));
          } else {
            operation.push(rand(11, 19), this.sign, rand(2, 9));
          }
        } else {
          let random = Math.random();
          if (random < 0.33) {
            operation.push(rand(2, 5), this.sign, rand(2, 9), this.sign, rand(2, 9));
          } else if (random < 0.66) {
            operation.push(rand(2, 9), this.sign, rand(2, 5), this.sign, rand(2, 9));
          } else {
            operation.push(rand(2, 9), this.sign, rand(2, 9), this.sign, rand(2, 5));
          }
        }
      };

    switch (level) {
      case 0:
        easy();
        break;
      case 1:
        medium();
        break;
      case 2:
        hard();
        break;
    }

    operation.push('=', reduce(operation));
    return operation;
  }

}


class Division extends MathOperation {

  getNumbers = function (level: number) {

    let subTotal: number,
        divArray: any;
    const operation = [],
      rand = MathOperation.range,
      reduce = MathOperation.reduce,
      divisors = MathOperation.divisors,
      easy = () => {
        subTotal = rand(4, 24, true);
        divArray = divisors(subTotal);
        operation.push(subTotal, this.sign, rand(2, 10, false, divArray));
      },
      medium = () => {
        subTotal = rand(11, 100, true);
        divArray = divisors(subTotal);
        if (Math.random() < 0.5) {
          operation.push(subTotal, this.sign, rand(2, subTotal/2, false, divArray));
        } else {
          operation.push(subTotal, this.sign, rand(2, subTotal/2, false, divArray));
          if (operation[2] < 10) {
            subTotal = reduce(operation);
            divArray = divisors(subTotal);
            if (divArray.length > 0) {
              operation.push(this.sign, rand(2, subTotal, false, divArray));
            }
          }
        }
      },
      hard = () => {
        subTotal = rand(50, 200, true);
        divArray = divisors(subTotal);
        if (Math.random() < 0.5) {

        } else {

        }
      }

    switch (level) {
      case 0:
        easy();
        break;
      case 1:
        medium();
        break;
      case 2:
        numbers = 
        (Math.random() < 0.5) ?
          [rand(20, 200), rand(10, 19)]
          : [rand(20, 200), rand(2, 9), rand(2, 5)];
        break;
    }
    
    operation.push('=', reduce(operation));
    return operation;
  }

}


class Fractions extends MathOperation {

  getNumbers = function (level: number) {
    const rand = MathOperation.range,
          fraction = (base: number, max: number) => [rand(1, max), base];
    let numbers: Array<any> = [],
        base1: number,
        base2: number;
    switch(level) {
      case 0:
        base1 = rand(2, 6);
        numbers = [fraction(base1, base1 - 1), fraction(base1, base1 - 1)];
        break;
      case 1:
        base1 = rand(2, 4);
        base2 = rand(2, 5);
        if (base1 === base2) {
          numbers = [fraction(base1, base1 + 1), fraction(base2, base2 -1)];
        } else {
          numbers = [fraction(base1, Math.floor(base1 / 2)), fraction(base2, Math.floor(base2 / 2))];
        }
        break;
      case 2:
        base1 = rand(2, 10);
        base2 = rand(2, 4);
        numbers = [fraction(base1, 2 * base1 - 1), fraction(base2, 2 * base2 - 1)];
        break;
    }
    numbers.push('=', MathOperation.reduce(numbers))
    return numbers;
  }

}


export const addition = new Addition($('#addition-exercises'), 'addition', '+');

export const subtraction = new Subtraction($("#subtraction-exercises"), "subtraction", "-");

export const multiplication = new Multiplication($("#multiplication-exercises"), "multiplication", "\u00D7");

export const division = new Division($("#division-exercises"), "division", "\u00F7");

export const fractions = new Fractions($("#fractions-exercises"), "fractions", ["+", "-", "\u00D7", "\u00F7"]);