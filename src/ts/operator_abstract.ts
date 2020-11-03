import { Options } from "./module_math";
import { OperationElement } from "./operation_el_interface";



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
      
    abstract getNumber(options: Options): number | number[];
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
        for (let i = 2; i <= num / 2; i++) {
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

    /*
        divisors method takes number and returns its divisors NOT including 1
    */
    static divisors(number: number): number[] {
        const divArray: number[] = [];

        if (number <= 1) {
            return divArray;
        }

        for (let i = 2; i < number / 2 + 1; i++) {
            if (number % i === 0) {
                divArray.push(i);
            }
        }
        
        divArray.push(number);
        return divArray;
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

    getNumber(options: Options): number | number[] {
        throw new Error("Method not implemented.");
    }
    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        throw new Error("Method not implemented.");
    }
    
}