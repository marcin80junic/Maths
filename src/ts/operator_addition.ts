import { Options } from "./module_math";
import { Operand } from "./operand_abstract";
import { Operator } from "./operator_abstract";



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

    getNumber(options: Options): number | number[] {  

        let den: number,
            fraction: number[],
            subtotal = options.subtotal;
        const divisors = [2, 3, 4, 5, 6, 7, 8, 9],
            left = options.length - options.index / 2;

        if (options.operandType === Operand.INTEGER_OPERAND) {
            switch (options.level) {
                case 0:
                    return Operator.range(2, 6);
                case 1:
                    return Operator.range(4, 19);
                case 2:
                    return Operator.range(11, 99);
            }
        } else {
            subtotal = subtotal? subtotal: [0, Operator.range(2,6)];
            subtotal = (subtotal[1] > 9)?
                Operator.reduceFraction(<number[]>subtotal): subtotal;
            subtotal = (subtotal[1] === 1)?
                [subtotal[0] * 2, subtotal[1] * 2]: subtotal;
            
            switch (options.level) {
                case 0:
                    den = (typeof subtotal === "number")?
                        Operator.range(2, 6)
                        : subtotal[1]
                    fraction = [Operator.range(Math.ceil(left / 2), den + Math.ceil(left / 2)), den];
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
            return (fraction[0] % fraction[1] === 0)?
                        this.getNumber(options)
                        : fraction;
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
