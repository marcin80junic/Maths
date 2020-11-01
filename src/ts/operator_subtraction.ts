import { Options } from "./module_math";
import { Operand } from "./operand_abstract";
import { Operator } from "./operator_abstract";



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

    getNumber(options: Options): number | number[] {
        
        let num: number,
            den: number,
            fraction: number[],
            max: number,
            subtotal = options.subtotal;
        const divisors = [2, 3, 4, 5, 6, 7, 8, 9],
            left = options.length - options.index / 2;
    
        if (options.operandType === Operand.INTEGER_OPERAND) {
            subtotal = subtotal?
                (subtotal instanceof Array)?
                    Math.ceil(subtotal[0] / subtotal[1])
                    : <number>subtotal
                : 0
            switch (options.level) {
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

            if (subtotal !== undefined) {
                if (subtotal[1] > 9) {
                    subtotal = Operator.reduceFraction(<number[]>subtotal)
                }
                max = (left < 2)?
                    subtotal[0] - 1
                    : subtotal[0] - left
                num = Operator.range(1, (max < 1)? 1: max);
            } else {
                num = Operator.range(2 * left, 3 * left);
                den = Operator.range(2, 6);
                subtotal = [num, den];
            }

            console.log("subtotal: "+subtotal[0]+", "+subtotal[1])

            switch (options.level) {
                case 0:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 6)
                        : (options.length === 0)?   // first operand in operation
                            den
                            : (subtotal[0] === 1)?  // if minuend is small the subtrahend needs to be smaller
                                subtotal[1] * 2
                                : subtotal[1];
                    fraction = [num, (den === 1)? 2: den];
                    break;
                case 1:
                    den = (typeof subtotal === "number")?
                    Operator.range(2, 6)
                    : 2
                    fraction = [num, den];
                    break;
                case 2:
                    den = (subtotal[1] > 9)?
                        Operator.range(2, 9, false, Operator.filterDivisors(subtotal[1], divisors))
                        : Operator.range(2, 9);
                    num = options.subtotal?
                        Math.ceil(Operator.range(1, subtotal[0] / subtotal[1]))
                        : Operator.range(left * 3, left * 6);
                    fraction = Operator.reduceFraction([num, den]);
                    break;
            }
            console.log("fraction subtraction: " + fraction[0]+", "+fraction[1]);
            return (fraction[0] % fraction[1] === 0)?
                        this.getNumber(options)
                        : fraction;
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