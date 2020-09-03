
maths.addition = (function() {
    let addition = objectCreator(Operation.prototype);
    addition.name = "addition";
    addition.sign = "+";
    addition.container = $("#addition-exercises");
    addition.reducer = (accumulator, number) => accumulator + number;
    addition.getNumbers = function(level) {
      const rand = maths.range;
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
    return addition;
  }());
  
  maths.subtraction = (function() {
    let subtraction = objectCreator(Operation.prototype);
    subtraction.name = "subtraction";
    subtraction.sign = "-";
    subtraction.container = $("#subtraction-exercises");
    subtraction.reducer = (accumulator, number) => accumulator - number;
    subtraction.getNumbers = function(level) {
      const rand = maths.range;
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
        numbers.push(result) //add result as the last number in array
      } else {
        numbers = this.getNumbers(level);
      }
      return numbers;
    };
    return subtraction;
  }());

  maths.multiplication = (function() {
    let multiplication = objectCreator(Operation.prototype);
    multiplication.name = "multiplication";
    multiplication.sign = "\u00D7";
    multiplication.container = $("#multiplication-exercises");
    multiplication.reducer = (accumulator, number) => accumulator * number;
    multiplication.getNumbers = function (level) {
      const rand = maths.range;
      let numbers = [];
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
    return multiplication;
  }());

  maths.division = (function() {
    let division = objectCreator(Operation.prototype);
    division.name = "division";
    division.sign = "\u00F7";
    division.container = $("#division-exercises");
    division.reducer = (accumulator, number) => accumulator / number;
    division.getNumbers = function (level) {
      const rand = maths.range;
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
        numbers.push(result) //add result as the last number in array
      } else {
        numbers = this.getNumbers(level);
      }
      return numbers;
    };
    return division;
  }());
  
  maths.fractions = (function () {
    let fractions = objectCreator(Operation.prototype);
    fractions.name = "fractions";
    fractions.sign = "+";
    fractions.container = $("#fractions-exercises");
    fractions.simpleReducer = (accArray, array) => {
      let num = accArray[0] + array[0], // add two fractions assuming denominators are equal
          den = accArray[1]; 
      return [num, den];
    };
    fractions.reducer = (accArray, array) => {
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
    fractions.getNumbers = function (level) {
      const rand = maths.range,
            fraction = (base, max) => [rand(1, max), base];
      let numbers = [], base1, base2;
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
    return fractions;
  }());