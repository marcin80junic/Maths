import $ from 'jquery';
import { Container } from "./container";
import { ContainerHandler } from "../handler/containerHandler";
import { MathModule } from "../maths/mathModule";
import { Configuration } from "../config/configuration";
import { MathModuleBuilder } from "../maths/mathModuleBuilder";
import { Operator } from "../maths/operationElement/operator_abstract";
import { Operand } from '../maths/operationElement/operand_abstract';
import { OperatorFactory } from '../maths/operationElement/operator_factory';


export class TestContainer extends Container {

    private config: Configuration;
    private levelHandler: ContainerHandler;

    private levelButtons: JQuery;

    private builder: MathModuleBuilder;
    private content: MathModule[];
    
    private unlocked: number;
    private testTimes: number[];
    private questNumber: number;

    private configChanged: boolean;

    constructor (container: JQuery, buttonHandler: ContainerHandler) {
        super(container);
        this.config = Configuration.getConfig();
        this.config.addListener(Configuration.EVENT_TEST, () => this.init());
        this.levelButtons = container.find('.test-level-choice');
        this.levelHandler = buttonHandler;
        this.levelHandler.handleContent((level: number) => this.createTest(level));
        this.builder = new MathModuleBuilder();
        this.init()
    }

    init () {
        this.unlocked = this.config.test_unlocked;
        this.updateLevelButtons();
        this.testTimes = this.config.test_times;
        this.questNumber = this.config.test_questions;
        this.configChanged = false;
    }

    private updateLevelButtons () {
        this.levelButtons.each(
            (index, button) => {
                if (index <= this.unlocked) {
                    $(button).prop('disabled', false);
                } else {
                    $(button).prop('disabled', true); 
                }
            }
        );
    }

    private createTest (level: number): void {
        this.createTestContent(level);
        
    }

    private createTestContent(level: number) {
        let length = 2,
            operands: string[],
            operators: Operator[];
        this.content = [];
        for (const module of this.config.test_modules) {
            operands = [Operand.INTEGER_OPERAND]
            operators = [];
            switch (module) {
                case MathModule.ADDITION:
                    operators.push(OperatorFactory.obtainOperator(Operator.ADDITION_OPERATOR));
                    break;
                case MathModule.SUBTRACTION:
                    operators.push(OperatorFactory.obtainOperator(Operator.SUBTRACTION_OPERATOR));
                    break;
                case MathModule.MULTIPLICATION:
                    operators.push(OperatorFactory.obtainOperator(Operator.MULTIPLICATION_OPERATOR));
                    break;
                case MathModule.DIVISION:
                    operators.push(OperatorFactory.obtainOperator(Operator.DIVISION_OPERATOR));
                    break;
                case MathModule.FRACTIONS:
                    operators.push(OperatorFactory.obtainOperator(Operator.ADDITION_OPERATOR));
                    if (level > 0) {
                        operators.push(OperatorFactory.obtainOperator(Operator.SUBTRACTION_OPERATOR));
                    }
                    if (level > 1) {
                        operators.push(
                            OperatorFactory.obtainOperator(Operator.MULTIPLICATION_OPERATOR),
                            OperatorFactory.obtainOperator(Operator.DIVISION_OPERATOR)
                        );
                    }
                    operands = [Operand.FRACTION_OPERAND];
                    break;
            }
            if (level > 1) {
                operands.push(Operand.COMPOSITE_OPERAND);
            }
            this.builder
                .setName(module)
                .setNamespace("test")
                .setLevel(level)
                .setOperands(...operands)
                .setOperators(...operators)
                .setOperationLength(length)
                .setExercisesCount(this.questNumber)
            
            this.content.push(this.builder.build().init());
            this.builder.reset();
        }
    }

    show() {
        if (this.configChanged) {
            this.init();
        }
        super.show();
    }

    displayTooltip(): boolean {
        return false;
    }

}