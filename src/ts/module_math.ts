import { Configuration } from "./module_config";
import { OperationElement } from "./operation_el_interface";
import { Operand } from "./operand_abstract";
import { Operator } from "./operator_abstract";
import { OperatorFactory } from "./operator_factory";
import { OperandFactory } from "./operand_factory";


export type Options = {
    level: number,
    operation: OperationElement[],
    operator: Operator,
    operandType: string,
    subtotal: number | number[],
    length: number,
    index: number
}


export class MathModuleBuilder {
    
    private module: MathModule;

    constructor() {
        this.module = new MathModule();
    }

    setName(name: string) {
        this.module.name = name;
        return this;
    }
    
    setNamespace(namespace: string) {
        this.module.namespace = namespace;
        this.module.operationLengths = 
            (namespace === Configuration.MULTIPLICATION || namespace === Configuration.DIVISION)?
                [2, 3]
                : [2, 3, 4, 5, 6];
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
    public static readonly EQUALS: Operator = OperatorFactory.obtainOperator(Operator.EQUALS_OPERATOR);

    name: string;
    namespace: string;
    operators: Operator[];
    operandTypes: string[];
    operationLengths: number[];

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
        let operand: Operand,
            value: number | number[],
            resultType: string,
            options: Options = {
                level: this.level,
                operation: [],
                operator: null,
                operandType: null,
                subtotal: undefined,
                length: length,
                index: 0
            };

        for (let j=0; j<length; j++) {
            options.index = j * 2;
            if (j !== 1) {                                                  
                options.operator = Operator.randomValueOf(this.operators)         // obtain random operator
            }
            options.operandType = Operator.randomValueOf(this.operandTypes);      // obtain random operand type
            
            if (options.operandType === Operand.COMPOSITE_OPERAND) {
                console.log(options.operandType);
                j--;
                continue;
            }
            value = options.operator.getNumber(options);                        // obtain next number
            operand = OperandFactory.obtainOperand(options.operandType, value); // create next operand object
            if (j === 0) {
                options.operation.push(operand);
            } else {
                options.operation.push(options.operator, operand);
            }
            options.subtotal = MathModule.reduce(options.operation);
        }

        resultType = (typeof options.subtotal === "number")?        // determine type of operand
            Operand.INTEGER_OPERAND
            : Operand.FRACTION_OPERAND;
        options.operation.push(                             // add equals sign and reduced operand as a result
            MathModule.EQUALS, OperandFactory.obtainOperand(resultType, options.subtotal).reduceOperand()
        );
        return options.operation;
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
                this.answersMap.set(i, Operator.randomValueOf(nums));
            }
        }
    }

    /*
        *Checks if this module's numbersBank contains array with exactly the same content the argument
        *passed to the function
    */
    private contains(array: OperationElement[]) {
        const operationString = array.toString();
        for (const subarray of this.numbersBank) {
            if (subarray.toString() === operationString) {
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

        if (operation.length < 3) {
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
        
        if (temp.length > 0) {
            total = temp[0].value();
        }
        if (temp.length > 1) {
            for (let j=1; j<temp.length; j+=2) {
                total = temp[j].reduce(total, temp[j + 1].value());
            }
        }
        return total;
    }


}