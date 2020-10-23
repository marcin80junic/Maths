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
        this.module.name = name;
        return this;
    }
    
    setNamespace(name: string) {
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

    name: string;
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
            count: number;

        for (let i=0; i<this.exercisesCount; i++) {
            count = 0;
            while (true) {
                count++;                    // security latch, if its value exceeds 20 the error will be thrown
                operation = this.opGenerator(this.operationLength);
                if (!this.contains(operation)) {                // check if operation array is unique
                    this.numbersBank.push(operation);
                    break;                                      // go to next operation if this one is unique
                }
                if (count > 20) {
                    throw new Error(`not enough possible variations, number of attempts: ${count}`);
                }
            }
        }
        this.generateAnswersMap();
    }

    private opGenerator(length: number): OperationElement[] {
        let operation: OperationElement[] = [],
            operator: Operator,
            operandType: string,
            operand: Operand,
            value: number | number[],
            subtotal: number | number[],
            resultType: string;

        for (let j=0; j<length; j++) {
            if (j !== 1) {                                                  
                operator = Operator.randomValue(this.operators)                 // obtain random operator
            }
            operandType = Operator.randomValue(this.operandTypes);              // obtain random operand type
            
            if (operandType === Operand.COMPOSITE_OPERAND) {
                console.log(operandType);
                j--;
                continue;
            }
            value = operator.getNumber(this.level, subtotal, operandType, length - j);  // obtain next number
            operand = OperandFactory.obtainOperand(operandType, value);         // create next operand object
            if (j === 0) {
                operation.push(operand);
            } else {
                operation.push(operator, operand);
            }
            subtotal = MathModule.reduce(operation);
        }

        resultType = (typeof subtotal === "number")?        // determine type of operand
            Operand.INTEGER_OPERAND
            : Operand.FRACTION_OPERAND;
        /* add equals sign and reduced operand as a result */
        operation.push(this.equals, OperandFactory.obtainOperand(resultType, subtotal).reduceOperand());
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
        const temp: OperationElement[] = [],
            isHighPrecedence = 
                (element: OperationElement): boolean => {
                    return element.toString() === Operator.OPERATORS.get(Operator.MULTIPLICATION_OPERATOR)
                        || element.toString() === Operator.OPERATORS.get(Operator.DIVISION_OPERATOR)
                }, 
            reduceOperands = 
                (oprtr: OperationElement, op1: OperationElement, op2: OperationElement): Operand => {
                    let sum = oprtr.reduce(op1.value(), op2.value()),
                        sumType = (typeof sum === "number")?        // determine type of operand
                            Operand.INTEGER_OPERAND
                            : Operand.FRACTION_OPERAND;
                    return OperandFactory.obtainOperand(sumType, sum);
                };
        let total: number | number[] = operation[0].value();

        if (operation.length === 1) {
            return total;
        }
        if (operation.length === 3) {
            return operation[1].reduce(operation[0].value(), operation[2].value());
        }

        for (let i=1; i<operation.length; i+=2) {

            if (isHighPrecedence(operation[i])) {
                if ((i - 2 >= 0) && isHighPrecedence(operation[i - 2])) {
                    temp[temp.length - 1] = 
                        reduceOperands(operation[i], temp[temp.length - 1], operation[i + 1])
                } else {
                    temp.push(reduceOperands(operation[i], operation[i - 1], operation[i + 1]));
                }
            } else {
                if (i === 1) {
                    temp.push(operation[i - 1]);
                }
                if ((i + 2 < operation.length) && !isHighPrecedence(operation[i + 2])
                    || i + 2 >= operation.length) {
                    temp.push(operation[i], operation[i + 1]);
                } else {
                    temp.push(operation[i])
                }
            }
        }
        console.log(`temp array: ${temp}`)
        if (temp.length > 0) {
            total = temp[0].value();
        }
        if (temp.length > 1) {
            for (let j=1; j<temp.length; j+=2) {
                total = temp[j].reduce(total, temp[j + 1].value());
            }
        }
        console.log(`total: ${total}`)
        return total;
    }


}