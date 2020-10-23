import { OperationElement } from "./operation";
import { Operand } from "./operation_operands";


export class OperatorFactory {
    
    public static obtainOperator(name: string): Operator {
        switch(name) {
            case Operator.ADDITION_OPERATOR:
                return AdditionOperator.getInstance(Operator.OPERATORS.get(name));
            case Operator.SUBTRACTION_OPERATOR:
                return SubtractionOperator.getInstance(Operator.OPERATORS.get(name));
            case Operator.MULTIPLICATION_OPERATOR:
                return MultiplicationOperator.getInstance(Operator.OPERATORS.get(name));
            case Operator.DIVISION_OPERATOR:
                return DivisionOperator.getInstance(Operator.OPERATORS.get(name));
            case Operator.EQUALS_OPERATOR:
                return EqualsOperator.getInstance(Operator.OPERATORS.get(name));
            default:
                throw new Error('not recognized operator string');
        }
    }
}


export abstract class Operator implements OperationElement {

    public static readonly ADDITION_OPERATOR = "addition";
    public static readonly SUBTRACTION_OPERATOR = "subtraction";
    public static readonly MULTIPLICATION_OPERATOR = "multiplication";
    public static readonly DIVISION_OPERATOR = "division";
    public static readonly EQUALS_OPERATOR = "equals";
    public static readonly OPERATORS = new Map([
        [Operator.ADDITION_OPERATOR, "+"],
        [Operator.SUBTRACTION_OPERATOR, "-"],
        [Operator.MULTIPLICATION_OPERATOR, "\u00D7"],
        [Operator.DIVISION_OPERATOR, "\u00F7"],
        [Operator.EQUALS_OPERATOR, "="]
    ]);

    protected symbol: string;

    protected constructor(symbol: string) {
        this.symbol = symbol;
    }
      
    abstract getNumber(level: number, subtotal: number | number[], OperandType: string, length?: number)
        : number | number[];
    abstract reduce(prev: number | number[], curr: number | number[]): number | number[];

    value(): number {
        return NaN;
    }
    toString(): string {
        return this.symbol;
    }
    getLayout(): string {
        return `<div>${this.symbol}</div>`;
    }
    draw(context: CanvasRenderingContext2D): void {
        //** */
    }

    /*
        *By default range method returns random integer number between min and max (including) values.
        *If max is < than min NaN will be returned.

        *Optional boolean excludePrimes passed to the method ensures that returned number will not
        *be a prime number. If excludePrimes is provided and its value is true, there should be some
        *not-prime numbers between min and max parameters, otherwise the NaN value will be returned.

        *It is possible to provide an array of numbers as the fourth argument, in which case the randomly
        *chosen number from this array will be returned instead. Only numbers between min and max parameters
        *can be returned. In case when there is no number in range or the array is empty the NaN value 
        *will be returned.
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
                    if (!Operator.isPrime(num) && (num >= min) && (num <= max)) {
                        temp.push(num);
                    }
                }
                /* return random number matching above conditions or NaN if no numbers left */
                return (temp.length === 0) ? NaN : Operator.randomValue(temp);
            }
            /* case when excludePrimes is true and no optional array provided */
            if (max - min > 0) {  // making sure there will be a not-prime number in range
                while (true) {
                    random = Math.floor(Math.random() * (max - min + 1) + min);
                    if (!Operator.isPrime(random)) {
                        return random;
                    }
                }
            }
            return Operator.isPrime(min) ? NaN : min;   // case when min === max
        }
        /* if excludesPrime is false and optArray is provided */
        if (optArray) {
            for (const num of optArray) {
                if ((num >= min) && (num <= max)) {
                    temp.push(num);
                }
            }
            return (temp.length === 0) ? NaN : Operator.randomValue(temp);
        }
        /* simle case when min and max parameters are in order and no optional parameters are provided*/
        return random = Math.floor(Math.random() * (max - min + 1) + min);
    }

    /*
        *Returns true if the argument provided is a prime number
    */
    static isPrime = (num: number) => {
        if (num > 0 && num < 4) {
            return true;
        }
        for (let i = 4; i <= num / 2; i++) {
            if (num % i === 0) {
                return false;
            }
        }
        return true;
    }

    /*
        *Takes an array and returns its one random value
    */
    static randomValue(array: Array<any>) {
        if (array.length === 0) {
            return undefined;
        }
        if (array.length === 1) {
            return array[0];
        }
        return array[Math.floor(Math.random() / (1 / array.length))];
    }

    static reduceFraction(fraction: number[]): number[] {
        let x = fraction[0],
            y = fraction[1],
            temp: number;

        while (y) {                 // find greatest common divisor
            temp = y;
            y = x % y;
            x = temp;
        }
        return [fraction[0] / x, fraction[1] / x];
    }

    static filterDivisors(divident: number, divisors: number[]): number[] {
        const temp = [];

        for (const div of divisors) {
            if (divident % div === 0 || div % divident === 0) {
                temp.push(div);
            }
        }
        return temp;
    }


}


export class AdditionOperator extends Operator {

    private static instance: AdditionOperator;

    private constructor(symbol: string) {
        super(symbol);
    }

    public static getInstance(symbol: string): Operator {
        if (!this.instance) {
            this.instance = new AdditionOperator(symbol);
        }
        return this.instance;
    }

    getNumber(level: number, subtotal: number | number[], operandType: string, left: number)
        : number | number[] {  

        let den: number,
            fraction: number[];
        const divisors = [2, 3, 4, 5, 6, 7, 8, 9];

        if (operandType === Operand.INTEGER_OPERAND) {
            switch (level) {
                case 0:
                    return Operator.range(2, 6);
                case 1:
                    return Operator.range(4, 19);
                case 2:
                    return Operator.range(11, 99);
            }
        } else {
            subtotal = subtotal? subtotal: [0, Operator.range(2,6)];
            switch (level) {
                case 0:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 6)
                        : subtotal[1]
                    fraction = [Operator.range(Math.ceil(left / 2), den - 1 + Math.ceil(left / 2)), den];
                    break;
                case 1:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 7)
                        : subtotal[1]
                    fraction = [Operator.range(Math.ceil(left / 2), den*2 + Math.ceil(left / 2)), den];
                    break;
                case 2:
                    den = (subtotal[1] > 9)?
                        Operator.range(2, 9, false, Operator.filterDivisors(subtotal[1], divisors))
                        : Operator.range(2, 9)
                    fraction = Operator.reduceFraction([Operator.range(left, den*3 + left), den]);
                    break;
            }
            return (fraction[0] % fraction[1] !== 0)?
                fraction
                : this.getNumber(level, subtotal, operandType, left);
        }
    }

    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        let total: number | number[];

        if (typeof prev === "number") {
            if (typeof curr === "number") {
                total = prev + curr;
            } else {
                total = [(prev * curr[1] + curr[0]), curr[1]];
            }
        } else {
            if (typeof curr === "number") {
                total = [prev[1] * curr + prev[0], prev[1]];
            } else {
                total = (prev[1] === curr[1])?
                    [prev[0] + curr[0], prev[1]]
                    : [prev[0] * curr[1] + curr[0] * prev[1], prev[1] * curr[1]];
            }
        }
        return total;
    }

}


export class SubtractionOperator extends Operator {

    private static instance: SubtractionOperator;

    private constructor (symbol: string) {
        super(symbol)
    }
    public static getInstance(symbol: string): Operator {
        if (!this.instance) {
            this.instance = new SubtractionOperator(symbol);
        }
        return this.instance;
    }

    getNumber(level: number, subtotal: number | number[], operandType: string, left: number)
        : number | number[] {
        
        let den: number,
            num: number,
            max: number,
            fraction: number[];
        const divisors = [2, 3, 4, 5, 6, 7, 8, 9],
            temptotal = subtotal;
    
        if (operandType === Operand.INTEGER_OPERAND) {
            subtotal = subtotal?
                (subtotal instanceof Array)?
                    Math.ceil(subtotal[0] / subtotal[1])
                    : <number>subtotal
                : 0
            switch (level) {
                case 0:
                    return subtotal?
                        Operator.range(2, subtotal - 2 * left)
                        : Operator.range(4 * Math.ceil(left / 2), 10 * Math.ceil(left / 2));
                case 1:
                    return subtotal?
                        Operator.range(2, subtotal - 2 * left)
                        : Operator.range(9 * Math.ceil(left / 2), 19 * Math.ceil(left / 2));
                case 2:
                    return subtotal?
                        Operator.range(2, subtotal - 2 * left)
                        : Operator.range(19 * Math.ceil(left / 2), 99 * Math.ceil(left / 2));
            }
        } else {
            if (!subtotal) {
                subtotal = [1, Operator.range(2, 6)];
                num = Operator.range(2 * left, 3 * left);
            } else {
                max = (left < 2)?
                    subtotal[0] - 1
                    : subtotal[0] - left;
                num = Operator.range(1, max);
            }
            switch (level) {
                case 0:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 6)
                        : subtotal[1]
                    fraction = [num, den];
                    break;
                case 1:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 9)
                        : subtotal[1]
                    fraction = [num, den];
                    break;
                case 2:
                    den = (subtotal[1] > 9)?
                        Operator.range(2, 9, false, Operator.filterDivisors(subtotal[1], divisors))
                        : Operator.range(2, 9);
                    num = temptotal?
                        Math.floor(Operator.range(1, subtotal[0] / subtotal[1]))
                        : Operator.range(left * 3, left * 6);
                    fraction = Operator.reduceFraction([num, den]);
                    break;
            }
            return (fraction[0] % fraction[1] !== 0)?
                fraction
                : this.getNumber(level, temptotal, operandType, left);
        }
    }

    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        let total: number | number[];

        if (typeof prev === "number") {
            if (typeof curr === "number") {
                total = prev - curr;
            } else {
                total = [(prev * curr[1] - curr[0]), curr[1]];
            }
        } else {
            if (typeof curr === "number") {
                total = [prev[1] * curr - prev[0], prev[1]];
            } else {
                total = (prev[1] === curr[1])?
                    [prev[0] - curr[0], prev[1]]
                    : [prev[0] * curr[1] - curr[0] * prev[1], prev[1] * curr[1]];
            }
        }
        return total;
    }

}


export class MultiplicationOperator extends Operator {

    private static instance: MultiplicationOperator;

    private constructor (symbol: string) {
        super(symbol)
    }
    public static getInstance(symbol: string): Operator {
        if (!this.instance) {
            this.instance = new MultiplicationOperator(symbol);
        }
        return this.instance;
    }

    getNumber(level: number, subtotal: number | number[], operandType: string, left: number)
        : number | number[] {

        let den: number,
            fraction: number[];
        const divisors = [2, 3, 4, 5, 6, 7, 8, 9];

        if (operandType === Operand.INTEGER_OPERAND) {
            switch (level) {
                case 0:
                    return Operator.range(2, 5);
                case 1:
                    return Operator.range(2, 9);
                case 2:
                    return Operator.range(4, 20);
            }
        } else {
            subtotal = subtotal? subtotal: [1, Operator.range(2,6)];
            switch (level) {
                case 0:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 6)
                        : subtotal[1]
                    fraction = [Operator.range(Math.ceil(left / 2), den - 1 + Math.ceil(left / 2)), den];
                    break;
                case 1:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 7)
                        : subtotal[1]
                    fraction = [Operator.range(Math.ceil(left / 2), den*2 + Math.ceil(left / 2)), den];
                    break;
                case 2:
                    den = (subtotal[1] > 9)?
                        Operator.range(2, 9, false, Operator.filterDivisors(subtotal[1], divisors))
                        : Operator.range(2, 9)
                    fraction = Operator.reduceFraction([Operator.range(left, den*3 + left), den]);
                    break;
            }
            return (fraction[0] % fraction[1] !== 0)?
                fraction
                : this.getNumber(level, subtotal, operandType, left);
        }
    }

    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        let total: number | number[];

        if (typeof prev === "number") {
            if (typeof curr === "number") {
                total = prev * curr;
            } else {
                total = [prev * curr[0], curr[1]];
            }
        } else {
            if (typeof curr === "number") {
                total = [prev[0] * curr, prev[1]];
            } else {
                total = [prev[0] * curr[0], prev[1] * curr[1]];
            }
        }
        return total;
    }

}


export class DivisionOperator extends Operator {

    private static instance: DivisionOperator;

    private constructor (symbol: string) {
        super(symbol)
    }
    public static getInstance(symbol: string): Operator {
        if (!this.instance) {
            this.instance = new DivisionOperator(symbol);
        }
        return this.instance;
    }

    getNumber(level: number, subtotal: number | number[], operandType: string): number | number[] {
        
        return null;
    }

    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        throw new Error("Method not implemented.");
    }

}


export class EqualsOperator extends Operator {

    private static instance: EqualsOperator;

    private constructor (symbol: string) {
        super(symbol)
    }
    public static getInstance(symbol: string): Operator {
        if (!this.instance) {
            this.instance = new EqualsOperator(symbol);
        }
        return this.instance;
    }

    getNumber(level: number, subtotal: number | number[], operandType: string): number | number[] {
        throw new Error("Method not implemented.");
    }
    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        throw new Error("Method not implemented.");
    }
    
}