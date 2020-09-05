
maths.addition = (function() {

    let addition: Operation = objectCreator(Operation.prototype);

    addition.container = $("#addition-exercises");

    addition.name = "addition";

    addition.sign = "+";

    addition.getNumbers = function(level: number) {
      const rand = maths.range;
      let numbers: Array<number> = [];
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

    addition.reducer = (accumulator: number, number: number) => accumulator + number;

    return addition;

  }());
  

  maths.subtraction = (function() {

    let subtraction: Operation = objectCreator(Operation.prototype);

    subtraction.container = $("#subtraction-exercises");

    subtraction.name = "subtraction";

    subtraction.sign = "-";
    
    subtraction.getNumbers = function(level: number) {
      const rand = maths.range;
      let numbers: Array<number> = [];
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
        numbers.push(result) //add result as the last number in array
      } else {
        numbers = this.getNumbers(level);
      }
      return numbers;
    };

    subtraction.reducer = (accumulator: number, number: number) => accumulator - number;

    return subtraction;

  }());


  maths.multiplication = (function() {

    let multiplication: Operation = objectCreator(Operation.prototype);

    multiplication.container = $("#multiplication-exercises");

    multiplication.name = "multiplication";

    multiplication.sign = "\u00D7";
   
    multiplication.getNumbers = function (level: number) {
      const rand = maths.range;
      let numbers: Array<number> = [];
      switch (level) {
        case 0:
          numbers = 
          (Math.random() < 0.5)?
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

    multiplication.reducer = (accumulator: number, number: number) => accumulator * number;

    return multiplication;

  }());


  maths.division = (function() {

    let division: Operation = objectCreator(Operation.prototype);

    division.container = $("#division-exercises");

    division.name = "division";

    division.sign = "\u00F7";
    
    division.getNumbers = function (level: number) {
      const rand = maths.range;
      let numbers: Array<number> = [];
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
        numbers.push(result) //add result as the last number in array
      } else {
        numbers = this.getNumbers(level);
      }
      return numbers;
    };

    division.reducer = (accumulator: number, number: number) => {
      return accumulator / number;
    };

    return division;

  }());
  
  
  maths.fractions = (function () {

    let fractions: Operation = objectCreator(Operation.prototype);

    fractions.container = $("#fractions-exercises");

    fractions.name = "fractions";

    fractions.sign = "+";

    fractions.getNumbers = function (level: number) {
      const rand = maths.range,
            fraction = (base: number, max: number) => [rand(1, max), base];
      let numbers: Array<Array<number>> = [],
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
      if (level === 0) numbers.push(numbers.reduce(this.simpleReducer));
      else numbers.push(numbers.reduce(this.reducer));
      return numbers;
    };

    fractions.reducer = (accArray: Array<number>, array: Array<number>) => {
      let num = accArray[0] * array[1] + array[0] * accArray[1],
          den = accArray[1] * array[1],  // add two fractions using common denominator
          x = num, y = den;
      while (y) {  // find greatest common divisor
        var temp = y;
        y = x % y;
        x = temp;
      }
      return [num / x, den / x]; // return reduced fraction
    };

    fractions.simpleReducer = (accArray: Array<number>, array: Array<number>) => {
      let num = accArray[0] + array[0], // add two fractions assuming denominators are equal
          den = accArray[1]; 
      return [num, den];
    };

    return fractions;

  }());