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

    getInteger(level: number, subtotal: number | number[], length: number, left: number): number {

        subtotal = subtotal ?
            (subtotal instanceof Array) ?
                Math.ceil(subtotal[0] / subtotal[1])
                : <number>subtotal
            : 0
        switch (level) {
            case 0:
                return subtotal ?
                    Operator.range(2, subtotal - 2 * left)
                    : Operator.range(4 * Math.ceil(left / 2), 10 * Math.ceil(left / 2));
            case 1:
                return subtotal ?
                    Operator.range(2, subtotal - 2 * left)
                    : Operator.range(9 * Math.ceil(left / 2), 19 * Math.ceil(left / 2));
            case 2:
                return subtotal ?
                    Operator.range(2, subtotal - 2 * left)
                    : Operator.range(19 * Math.ceil(left / 2), 99 * Math.ceil(left / 2));
        }
    }

    getFraction(level: number, subtotal: number | number[], length: number, left: number): number[] {
        let num: number,
            den: number,
            maxNum: number,
            operatorType: string;

        const getNumerator = (den: number, min: number, max: number) => {    
            let num = den;                                    
            if (den === 1) {
                throw `denominator is "1"!`;
            }
            while (num % den === 0) {
                num = Operator.range(min, max);
            }
            return num;
        };
        const getDenominator = (...nums: number[]) => {
            let num: number;
            if (nums.length === 1) {
                num = nums[0];
                return (subtotal[0] === 1)?  // if minuend is small the subtrahend needs to be smaller
                    num * 2
                    : num;
            } else {
                return Operator.randomValueOf(nums);
            }
        }

        if (subtotal === undefined) {
            den = Operator.range(2, 6);
            num = getNumerator(den, 2 * left, 3 * left);
            return [num, den];
        }

        if (this.options.index > 3) {
            operatorType = this.options.operation[this.options.index - 3].toString();
                if (
                    operatorType === Operator.OPERATORS.get(Operator.MULTIPLICATION_OPERATOR)
                    || operatorType === Operator.OPERATORS.get(Operator.DIVISION_OPERATOR)
                    ) {
               //     subtotal = Operator.reduceFraction(<number[]>subtotal);
                }
        }

        switch (level) {
            case 0:
                den = (typeof subtotal === "number")?
                    Operator.range(2, 6)
                    : getDenominator(subtotal[1])
                break;
            case 1:
                den = (typeof subtotal === "number")?
                    Operator.range(2, 6)
                    : getDenominator(subtotal[1])
                break;
            case 2:
                if (typeof subtotal === "number") {
                    den = Operator.range(2, 6);
                } else {
                    let divisors = Operator.divisorsOf(subtotal[1]);
                    if (subtotal[1] < 4) {
                        divisors.push(3, 4, 6);
                    }
                    den = getDenominator(...divisors);
                    if (den > subtotal[1]) {
                        subtotal = [(den / subtotal[1]) * subtotal[0], (den / subtotal[1]) * subtotal[1]];
                    }
                    if (den < subtotal[1]) {
                        subtotal = [subtotal[0] / (subtotal[1] / den), subtotal[1] / (subtotal[1] / den)];
                    }
                }
                break;
        }

        den = (den === 1)? 2: den;
        maxNum = subtotal[0] - left;
        if (maxNum < 1) {
            return [1, subtotal[1] * 2];
        }
        num = getNumerator(den, 1, maxNum);
        return [num, den];
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
                    : (curr[1] % prev[1] === 0)?
                        [prev[0] * (curr[1] / prev[1]) - curr[0], curr[1]]
                        : (prev[1] % curr[1] === 0)?
                            [prev[0] - curr[0] * (prev[1] / curr[1]), prev[1]]
                            : [prev[0] * curr[1] - curr[0] * prev[1], prev[1] * curr[1]];
            }
        }
        return total;
    }

}