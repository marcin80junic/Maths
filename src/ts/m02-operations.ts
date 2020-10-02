
import { MathOperation } from './m01-prototype';


export class Addition extends MathOperation {

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


export class Subtraction extends MathOperation {

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


export class Multiplication extends MathOperation {

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


export class Division extends MathOperation {

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
          operation.push(subTotal, this.sign, rand(2, subTotal/2, false, divArray));
          subTotal = reduce(operation);
          if (subTotal > 10) {
            divArray = divisors(subTotal);
            if (divArray.length > 0) {
              operation.push(this.sign, rand(2, subTotal/2, false, divArray));
            }
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
        hard();
        break;
    }
    
    operation.push('=', reduce(operation));
    return operation;
  }

}


export class Fractions extends MathOperation {

  getNumbers = function (level: number) {

    let subTotal: number,
        divArray: any,
        den1: number,
        num1: number,
        den2: number,
        num2: number,
        sign = (this.sign.length > 1)? MathOperation.randomValue(this.sign): this.sign[0];
    const operation = [],
      rand = MathOperation.range,
      reduce = MathOperation.reduce,
      fract = (maxNum: number, den: number) => [rand(1, maxNum), den],

      easy = () => {
        den1 = rand(2, 6);
        if (sign === MathOperation.SUBTRACTION_SIGN) {
          num1 = rand(2, den1);
          num2 = rand(1, num1-1);
        } else {
          num1 = rand(1, den1-1);
          num2 = rand(1, den1-num1);
        }
        operation.push([num1, den1], sign, [num2, den1]);
      },

      medium = () => {
        den1 = rand(2, 9);
        if (sign === MathOperation.SUBTRACTION_SIGN) {
          num1 = rand(2, den1*2);
          num2 = rand(1, num1-1);
        } else {
          num1 = rand(1, den1-1);
          num2 = rand(1, den1*2);
        }
        operation.push([num1, den1], sign, [num2, den1]);
      },

      hard = () => {
        den1 = rand(2, 7);
        den2 = rand(3, 5);
        if (sign === MathOperation.SUBTRACTION_SIGN) {
          num1 = rand(5, den1*3);
          num2 = rand(1, num1/den1*den2 - 1);
        } else {
          num1 = rand(1, den1*3);
          num2 = rand(1, den2*3);
        }
        if (num1 % den1 === 0 && num2 % den2 === 0) {
          num2 -= 1;
        }
        operation.push([num1, den1], sign, [num2, den2]);
      }
        
    switch(level) {
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