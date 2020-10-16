import { MathModule } from "./module_math";
import { OperationElement } from "./operation";
import { Operand } from "./operation_operands";


export class OperatorFactory {
    
    public static obtainOperator(symbol: string): Operator {
        switch(symbol) {
            case Operator.ADDITION_OPERATOR:
                return AdditionOperator.getInstance(symbol);
            case Operator.SUBTRACTION_OPERATOR:
                return SubtractionOperator.getInstance(symbol);
            case Operator.MULTIPLICATION_OPERATOR:
                return MultiplicationOperator.getInstance(symbol);
            case Operator.DIVISION_OPERATOR:
                return DivisionOperator.getInstance(symbol);
            case Operator.EQUALS_OPERATOR:
                return EqualsOperator.getInstance(symbol);
            default:
                throw new Error('not recognized operator string');
        }
    }
}


export abstract class Operator implements OperationElement {

    public static readonly ADDITION_OPERATOR = "+";
    public static readonly SUBTRACTION_OPERATOR = "-";
    public static readonly MULTIPLICATION_OPERATOR = "\u00D7";
    public static readonly DIVISION_OPERATOR = "\u00F7";
    public static readonly EQUALS_OPERATOR = "="
    
    protected symbol: string;

    protected constructor(symbol: string) {
        this.symbol = symbol;
    }
      
    abstract getNumber(level: number, operation: OperationElement[], OperandType: string): number | number[];
    abstract reduce(prev: number | number[], current: number | number[]): number | number[];

    value(): string {
        return this.symbol;
    }
    getLayout(): string {
        return `<div>${this.symbol}</div>`;
    }
    draw(context: CanvasRenderingContext2D): void {
        
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

    getNumber(level: number, operation: OperationElement[], operandType: string): number | number[] {   
        const subtotal = (operation.length === 0)? 0: MathModule.reduce(operation);
        let den: number;

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
            switch (level) {
                case 0:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 6)
                        : subtotal[1]
                    return [Operator.range(1, den - 1), den];
                case 1:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 9)
                        : subtotal[1]
                    return [Operator.range(1, den*2), den];
                case 2:
                    den = Operator.range(2, 9);
                    return [Operator.range(2, den*3), den];
            }
        }
    }

    reduce(prev: number | number[], current: number | number[]): number | number[] {
        let total: number | number[];
        if (typeof prev === "number") {
            if (typeof current === "number") {
                total = prev + current;
            } else {
                total = [(prev * current[1] + current[0]), current[1]];
            }
        } else {
            if (typeof current === "number") {
                total = [prev[1] * current + prev[0], prev[1]];
            } else {
                total = [prev[0] * current[1] + current[0] * prev[1], prev[1] * current[1]];
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

    getNumber(level: number, operation: OperationElement[], operandType: string): number | number[] {
        
        return null;
    }

    reduce(prev: number | number[], current: number | number[]): number | number[] {
        throw new Error("Method not implemented.");
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

    getNumber(level: number, operation: OperationElement[], operandType: string): number | number[] {
        
        return null;
    }

    reduce(prev: number | number[], current: number | number[]): number | number[] {
        throw new Error("Method not implemented.");
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

    getNumber(level: number, operation: OperationElement[], operandType: string): number | number[] {
        
        return null;
    }

    reduce(prev: number | number[], current: number | number[]): number | number[] {
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

    getNumber(level: number, operation: OperationElement[], operandType: string): number | number[] {
        throw new Error("Method not implemented.");
    }
    reduce(prev: number | number[], current: number | number[]): number | number[] {
        throw new Error("Method not implemented.");
    }
    
}