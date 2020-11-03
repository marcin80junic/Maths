import { MathModule, Options } from "./module_math";
import { Operand } from "./operand_abstract";
import { Operator } from "./operator_abstract";



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

    getNumber(options: Options): number | number[] {
        let num: number,
            den: number,
            fraction: number[],
            allowed: number,
            minuend: number | number[],
            subtotal = options.subtotal,
            opType: String;
        const divisors = [1, 2, 3, 4, 5, 6, 7, 8, 9],
            left = options.length - options.index / 2;

        if (options.operandType === Operand.INTEGER_OPERAND) {
            subtotal = subtotal? subtotal: 0;
            switch (options.level) {
                case 0:
                    return Operator.range(2, 5);
                case 1:
                    return Operator.range(3, 9 - Math.floor(left/2));
                case 2:
                    num = Operator.range(2, 20 - left * 3);
                    allowed = 1000 - <number>subtotal;
                    return (<number>subtotal * num + ((left - 1) * <number>subtotal * num) < allowed)?
                        num
                        : this.getNumber(options);
            }
        } else {
            if (subtotal) {
                if (options.index > 3) {
                    opType = options.operation[options.index - 3].toString();
                    if (opType === Operator.OPERATORS.get(Operator.ADDITION_OPERATOR)) {
                        subtotal = options.operation[options.index - 2].value();
                    } else {
                        for (let i=options.index; i>3; i-=2) {
                            opType = options.operation[i-3].toString();
                            if (opType === Operator.OPERATORS.get(Operator.ADDITION_OPERATOR)) {
                                subtotal = MathModule.reduce(options.operation.slice(i-2));
                                break;
                            }
                            if (opType === Operator.OPERATORS.get(Operator.SUBTRACTION_OPERATOR)) {
                                minuend = MathModule.reduce(options.operation.slice(0, i-3));
                                subtotal = MathModule.reduce(options.operation.slice(i-2));
                                break;
                            }
                        }
                    }
                }
                subtotal = Operator.reduceFraction(<number[]>subtotal);
            } else {
                subtotal = [1, 6];
            }
        
            switch (options.level) {
                case 0:
                    if (typeof subtotal === "number") {
                        console.log("NUMBERRRRR")
                    }
                    if (minuend) {
                       
                    } else {
                        
                    }
                    fraction = [num, den];
                    break;
                case 1:
                    if (minuend) {
                       
                    } else {
                        
                    }
                    fraction = [num, den];
                    break;
                case 2:
                    if (minuend) {

                    } else {

                    }
                    fraction = [num, den];
                    break;
            }
            console.log("fraction multiplicatoion: "+fraction[0] +", "+fraction[1]);
         
            return fraction;
        }
    }

    private createFraction(minuend: number[], subtotal: number[]) {
        
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