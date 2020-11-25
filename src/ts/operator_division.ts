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

    getInteger(level: number, subtotal: number | number[], length: number, left: number): number {
        let startSet: Set<number>,
            divisors: number[],
            max: number,
            num: number;

        if (subtotal) {
            subtotal = <number>subtotal;
            divisors = Operator.divisorsOf(subtotal);
            max = subtotal / (left * 3);
            max = (max < 2)? 2: max;
        } else {
            startSet = this.startNums.get(length);
            if (!startSet) {
                startSet = new Set();
                for (let i=4; i<999; i++) {
                    if (Operator.divisorsOf(i).length >= length) {
                        startSet.add(i);
                    }
                }
                this.startNums.set(length, startSet);
            }
            return Operator.range
                (left * Math.pow(level + 2, 2) - 4, left * Math.pow(level + 2, 3) + 4, true, [...startSet]);
        }

        if (length === 2) {
            return Operator.range(2, subtotal / 2, false, divisors)
        } else {
            if (left > 1) {
                num = Operator.range(2, max, false, divisors);
                if (isNaN(num)) {
                    num = divisors[0];
                }
            } else {
                return Operator.range(2, subtotal, false, divisors);
            }
        }
        return num;
    }

    getFraction (level: number, subtotal: number | number[], length: number, left: number): number[] {
        let num: number,
            den: number,
            fraction: number[];

        return null;
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


