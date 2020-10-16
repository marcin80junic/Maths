import { OperationElement } from "./operation";
import { Operand, OperandFactory } from "./operation_operands";
import { Operator, OperatorFactory } from "./operation_operators";



export class MathModuleBuilder {
    
    private module: MathModule;

    constructor() {
        this.module = new MathModule();
        this.module.equals = OperatorFactory.obtainOperator(Operator.EQUALS_OPERATOR);
    }
    
    setName(name: string) {
        this.module.namespace = name;
        return this;
    }
    setOparators(...operators: Operator[]) {
        this.module.operators = operators;
        return this;
    }
    setOperands(...operands: string[]) {
        this.module.operandTypes = operands;
        return this;
    }

    public build(): MathModule {
        return this.module;
    }
}


export class MathModule {

    public static readonly DIFFICULTY_FAIR = "fair";
    public static readonly DIFFICULTY_ADVANCED = "advanced";
    public static readonly DIFFICULTY_SUPER_HARD = "super hard";
    public static readonly DIFFICULTIES: Map<string, number> = new Map([
        [MathModule.DIFFICULTY_FAIR, 0],
        [MathModule.DIFFICULTY_ADVANCED, 1],
        [MathModule.DIFFICULTY_SUPER_HARD, 2]
    ]);
    public static readonly NUM_OF_EXERCISES = [4, 6, 8, 10, 12, 14, 16, 18, 20];
    public static readonly OPERATION_LENGTHS = [2, 3, 4, 5, 6];

    namespace: string;
    operators: Operator[];
    equals: Operator;
    operandTypes: string[];

    level: number;
    exercisesCount: number;
    operationLength: number;

    private score: number;
    randomize: boolean;
    numbersBank: OperationElement[][];
    answersMap: Map<number, number>;

    init() {
        this.numbersBank = [];
        this.answersMap = new Map();
        this.score = 0;
        this.generateOperations();
    }

    incrementScore() { this.score++; }
    incrementAndGetScore() { return ++this.score }
    resetScore() { return this.score = 0; }
    getScore(): number { return this.score }

    generateOperations() {
        let operation: OperationElement[],
            total: number | number[],
            totalType: string,
            count: number;
        for (let i=0; i<this.exercisesCount; i++) {
            count = 0;
            while (true) {
                count++;    // security latch, if its value exceeds 20 the error will be thrown
                operation = this.opGenerator(this.operationLength);
                total = MathModule.reduce(operation);       // operation's result
                totalType = (typeof total === "number")?    // determine type of operand
                    Operand.INTEGER_OPERAND
                    : Operand.FRACTION_OPERAND;
                /* add operand as a result */
                operation.push(this.equals, OperandFactory.obtainOperand(totalType, total).reduce());
                if (!this.contains(operation)) {       // check if operation array is unique
                    this.numbersBank.push(operation);
                    break;                              // go to next operation if this one is unique
                }
                if (count > 20) {
                    throw new Error(`not enough possible variations, number of attempts: ${count}`);
                }
            }
        }
        this.generateAnswersMap();
    }

    static printMap(map: any) {
        for(const arr of map) {
            console.log(arr);
        }
    }

    private opGenerator(length: number): OperationElement[] {
        let operation = [],
            operator: Operator,
            operandType: string,
            operand: Operand,
            value: number | number[];
        for (let j=0; j<length; j++) {
            if (j !== 1) {                                                  
                operator = Operator.randomValue(this.operators)             // obtain random operator
            }
            operandType = Operator.randomValue(this.operandTypes);          // obtain random operand type
            value = operator.getNumber(this.level, operation, operandType); // obtain next number
            operand = OperandFactory.obtainOperand(operandType, value).reduce();     // create next operand object
            if (j === 0) {
                operation.push(operand);
            } else {
                operation.push(operator, operand);
            }
        }
        return operation;
    }

    private generateAnswersMap() {
        let operation: OperationElement[],
            nums: number[];

        for (let i=0; i<this.numbersBank.length; i++) {
            operation = this.numbersBank[i];
            if (!this.randomize) {
                this.answersMap.set(i, operation.length - 1);
            } else {
                nums = [];
                for (let j=0; j<operation.length; j+=2) {
                    nums.push(j);
                }
                this.answersMap.set(i, Operator.randomValue(nums));
            }
        }
    }

    /*
        *Checks if this module's numbersBank contains array with exactly the same content the argument
        *passed to the function
    */
    private contains(array: OperationElement[]) {
        const operationString = JSON.stringify(array);
        for (const subarray of this.numbersBank) {
            if (JSON.stringify(subarray) === operationString) {
                return true;
            }
        }
        return false;
    }

    static reduce(operation: OperationElement[]): number | number[] {
        let total: number | number[];
            total = (<Operand>operation[0]).value();
        for (let i=1; i<operation.length; i+=2) {
            total = (<Operator>operation[i]).reduce(total, (<Operand>operation[i+1]).value());
        }
        return total;
    }


}