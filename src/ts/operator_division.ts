import { Options } from "./module_math";
import { Operator } from "./operation_operators";



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

    getNumber(options: Options): number | number[] {
        
        return null;
    }

    reduce(prev: number | number[], curr: number | number[]): number | number[] {
        throw new Error("Method not implemented.");
    }

}


