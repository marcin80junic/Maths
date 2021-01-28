import { Configuration } from "./module_config";
import { MathModuleBuilder } from "./module_math";
import { AbstractContainerFactory, Container } from "./container_home";
import { Operator } from './operator_abstract';
import { Operand } from './operand_abstract';
import { OperatorFactory } from "./operator_factory";
import { CustomContainer, ExerciseContainer, FractionContainer } from "./container_exercises";


export class AdditionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("addition")
            .setNamespace(Configuration.ADDITION)
            .setOparators(OperatorFactory.obtainOperator(Operator.ADDITION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}

export class SubtractionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("subtraction")
            .setNamespace(Configuration.SUBTRACTION)
            .setOparators(OperatorFactory.obtainOperator(Operator.SUBTRACTION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}

export class MultiplicationContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("multiplication")
            .setNamespace(Configuration.MULTIPLICATION)
            .setOparators(OperatorFactory.obtainOperator(Operator.MULTIPLICATION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}

export class DivisionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("division")
            .setNamespace(Configuration.DIVISION)
            .setOparators(OperatorFactory.obtainOperator(Operator.DIVISION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}

export class FractionsContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder(),
              operators: Operator[] = [];
            
        for (const operator of config.fractions_operators) {
            operators.push(OperatorFactory.obtainOperator(operator));
        }
        builder
            .setName("fractions")
            .setNamespace(Configuration.FRACTIONS)
            .setOparators(...operators)
            .setOperands(Operand.FRACTION_OPERAND);
        return new FractionContainer(container, builder.build());
    }
}

export class CustomContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder(),
              operators: Operator[] = [];
            
        for (const operator of config.custom_operators) {
            operators.push(OperatorFactory.obtainOperator(operator));
        }
        builder
            .setName("custom")
            .setNamespace(Configuration.CUSTOM)
            .setOparators(...operators)
            .setOperands(Operand.INTEGER_OPERAND, Operand.FRACTION_OPERAND, Operand.COMPOSITE_OPERAND);
        return new CustomContainer(container, builder.build());
    }
}