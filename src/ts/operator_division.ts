import { Options } from "./module_math";
import { Operand } from "./operand_abstract";
import { Operator } from "./operator_abstract";



export class DivisionOperator extends Operator {

    private static instance: DivisionOperator;
    private startNums: Map<number, Set<number>>;

    private constructor (symbol: string) {
        super(symbol);
        this.startNums = new Map();
    }
    public static getInstance(symbol: string): Operator {
        if (!this.instance) {
            this.instance = new DivisionOperator(symbol);
        }
        return this.instance;
    }

    private getInteger(level: number, subtotal: number | number[], length: number, left: number): number {
        let startSet: Set<number>,
            divisors: number[],
            num: number;

        if (subtotal) {
            subtotal = <number>subtotal;
            divisors = Operator.divisors(subtotal);
            console.log("length: "+divisors.length)
        } else {
            startSet = this.startNums.get(length)
            if (!startSet) {
                startSet = new Set();
                for (let i=4; i<999; i++) {
                    if (Operator.divisors(i).length > length + 1) {
                        startSet.add(i);
                    }
                }
                this.startNums.set(length, startSet);
            }
            return Operator.range(left * 4, left * 12, true, [...startSet]);
        }
        
        switch (level) {
            case 0:
                if (length === 2) {
                    return Operator.range(2, subtotal / 2, false, divisors)
                } else {
                    if (left > 1) {
                        do {
                            num = Operator.range(2, subtotal / left, false, divisors);
                        } while (!Operator.isPrime(subtotal / num))
                    } else {
                        return Operator.range(2, subtotal, false, divisors);
                    }
                }
                break;
            case 1:
                return Operator.range(3, 9 - Math.floor(left/2));
            case 2:
                num = Operator.range(2, 20 - left * 3);
        }
        return num;
    }

    private getFraction(): number[] {
        let num: number,
            den: number,
            fraction: number[];

        return null;
    }

    getNumber(options: Options): number | number[] {

        const left = options.length - options.index / 2;

        console.log(`division subtotal: ${options.subtotal}`)

        if (options.operandType === Operand.INTEGER_OPERAND) {
            return this.getInteger(options.level, options.subtotal, options.length, left);
        } else {
            return this.getFraction();
        }

    }

    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        let total: number | number[];

        if (typeof prev === "number") {
            if (typeof curr === "number") {
                total = prev / curr;
            } else {
                total = [prev * curr[1], curr[0]];
            }
        } else {
            if (typeof curr === "number") {
                total = [prev[1] * curr, prev[0]];
            } else {
                total = [prev[0] * curr[1], prev[1] * curr[0]];
            }
        }
        return total;
    }

}


