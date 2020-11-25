import { Operator } from "./operator_abstract";


export class AdditionOperator extends Operator {

    private static instance: AdditionOperator;

    private constructor (symbol: string) {
        super(symbol);
    }

    public static getInstance (symbol: string): Operator {
        if (!this.instance) {
            this.instance = new AdditionOperator(symbol);
        }
        return this.instance;
    }

    getInteger (level: number, subtotal: number | number[], length: number, left: number): number {
        switch (level) {
            case 0:
                return Operator.range(2, 6);
            case 1:
                return Operator.range(4, 19);
            case 2:
                return Operator.range(11, 99);
        }
    }

    getFraction (level: number, subtotal: number | number[], length: number, left: number): number[] {
        let den: number,
            operatorType: string;

        const getNumerator = (den: number, max: number) => {    // returns numerator between 1 and max
            let num = den;                                      // which is never equal to denominator
            if (den === 1) {
                throw "denominator is 1!";
            }
            while(num % den === 0) {
                num = Operator.range(1, max);
            }
            return num;
        };
        const getDenominator = (...nums: number[]) => {
            if (nums.length === 1) {
                return nums[0];
            }
            return Operator.randomValueOf(nums);
        };

        subtotal = subtotal?                // make up subtotal if first number in operation
            subtotal : [0, Operator.range(2, 6)];
        subtotal = (subtotal[1] === 1) ?    // make sure that subtotal's denominator is bigger than 1
            [subtotal[0] * 2, subtotal[1] * 2] : subtotal;

        switch (level) {
            case 0:
                den = (typeof subtotal === "number") ?
                    Operator.range(2, 6): subtotal[1];
                return [getNumerator(den, den - 1), den];
            case 1:
                den = (typeof subtotal === "number") ?
                    Operator.range(2, 7): subtotal[1];
                return [getNumerator(den, (den * 2 - 1)), den];
            case 2:
                if (typeof subtotal === "number") {
                    den = Operator.range(2, 6);
                } else {
                    let divisors = Operator.divisorsOf(subtotal[1]);
                    if (subtotal[1] < 4) {
                        divisors.push(3, 4, 6);
                    }
                    den = getDenominator(...divisors);
                }
                return [getNumerator(den, (den * 3 - 1)), den];
        }
    }

    reduce (prev: number | number[], curr: number | number[]): number | number[] {
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
                    : (curr[1] % prev[1] === 0)?
                        [prev[0] * (curr[1] / prev[1]) + curr[0], curr[1]]
                        : (prev[1] % curr[1] === 0)?
                            [prev[0] + curr[0] * (prev[1] / curr[1]), prev[1]]
                            : [prev[0] * curr[1] + curr[0] * prev[1], prev[1] * curr[1]]
            }
        }
        return total;
    }

}
