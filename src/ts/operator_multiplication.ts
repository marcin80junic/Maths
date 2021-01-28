import { MathModule, Options } from "./module_math";
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

    getInteger (level: number, subtotal: number | number[], length: number, left: number): number {
        let allowed: number,
            num: number;

        subtotal = subtotal? subtotal: 0;
        switch (level) {
            case 0:
                return Operator.range(2, 5);
            case 1:
                return Operator.range(3, 9 - Math.floor(left / 2));
            case 2:
                num = Operator.range(2, 20 - left * 3);
                allowed = 1000 - <number>subtotal;
        }
        return num;
    }

    getFraction (level: number, subtotal: number | number[], length: number, left: number): number[] {
        let num: number,
            den: number,
            divisors: number[],
            minuend: number | number[],
            operatorType: String,
            options = this.options;
        
        const getNumerator = (min: number, max: number, den: number) => {
            let num = den;
            while (num % den === 0) {
                num = Operator.range(min, max);
            }
            return num;
        };
        const getNumeratorSupplied = (den: number, ...nums: number[]) => {
            let num = den;
            if (nums.length === 1) {
                return (nums[0] % den === 0)? nums[0] + 1: nums[0];
            }
            while (num % den === 0) {
                num = Operator.randomValueOf(nums);
            }
            return num;
        };
        const getInitialFraction = (maxDenominator: number) => {
            let den = Operator.range(2, maxDenominator);
            return [getNumerator(1, den - 1, den), den];
        };

        if (subtotal) {
            if (options.index > 3) {
                operatorType = options.operation[options.index - 3].toString();
                if (operatorType === Operator.OPERATORS.get(Operator.ADDITION_OPERATOR)) {
                    subtotal = options.operation[options.index - 2].value();
                } else {
                    for (let i = options.index; i > 3; i -= 2) {
                        operatorType = options.operation[i - 3].toString();
                        if (operatorType === Operator.OPERATORS.get(Operator.ADDITION_OPERATOR)) {
                            subtotal = MathModule.reduce(options.operation.slice(i - 2));
                            break;
                        }
                        if (operatorType === Operator.OPERATORS.get(Operator.SUBTRACTION_OPERATOR)) {
                            minuend = MathModule.reduce(options.operation.slice(0, i - 3));
                            subtotal = MathModule.reduce(options.operation.slice(i - 2));
                            break;
                        }
                    }
                }
            }
            if (subtotal[0] % subtotal[1] === 0) {
                return getInitialFraction(6);
            }
            den = (subtotal[0] > 1)?    
                    subtotal[0]
                    : Operator.range(2, 6)
            divisors = Operator.divisorsOf(subtotal[1]);
            if (subtotal[1] < 4) {
                divisors.push(1);
            } else {
                divisors = divisors.filter((val) => subtotal[1] / 2 <= val)
                if (divisors.every((val) => val % den === 0)) {
                    divisors.push(1);
                }
            }
        } else {
            return getInitialFraction(6);
        }

        switch (level) {
            case 0:
                if (typeof subtotal === "number") {
                    num = Operator.range(1, den - 1);
                    return [num, den];
                }
                num = minuend?
                    getNumeratorSupplied(den, ...divisors)
                    : subtotal[1]
                return [num, den];
            case 1:
                num = minuend?
                    getNumeratorSupplied(den, ...divisors)
                    : getNumerator(subtotal[1], subtotal[1] * 2, den);
                return [num, den];
            case 2:
                num = minuend?
                    getNumeratorSupplied(den, ...divisors)
                    : getNumerator(subtotal[1], subtotal[1] * 4, den);
                return [num, den];
        }
    }

    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        let total: number | number[],
            tempPrev = [prev[0], prev[1]],
            tempCurr = [curr[0], curr[1]];

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
                if (prev[0] % curr[1] === 0) {
                    tempPrev[0] = prev[0] / curr[1];
                    tempCurr[1] = 1;
                } else if (curr[1] % prev[0] === 0) {
                    tempCurr[1] = curr[1] / prev[0];
                    tempPrev[0] = 1;
                }
                if (prev[1] % curr[0] === 0) {
                    tempPrev[1] = prev[1] / curr[0];
                    tempCurr[0] = 1;
                } else if (curr[0] % prev[1] === 0) {
                    tempCurr[0] = curr[0] / prev[1];
                    tempPrev[1] = 1;
                }
                total = [tempPrev[0] * tempCurr[0], tempPrev[1] * tempCurr[1]];
            }
        }
        return total;
    }

}