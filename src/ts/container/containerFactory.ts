import { Configuration } from "../config/configuration";
import { MathModuleBuilder } from "../maths/mathModuleBuilder";
import { Operand } from "../maths/operationElement/operand_abstract";
import { Operator } from "../maths/operationElement/operator_abstract";
import { OperatorFactory } from "../maths/operationElement/operator_factory";
import { Container } from "./container";
import { CustomContainer } from "./customContainer";
import { ExerciseContainer } from "./exerciseContainer";
import { FractionContainer } from "./fractionContainer";
import { HomeContainer } from "./homeContainer";
import { TestContainer } from "./testContainer";
import { SettingsContainer } from "./settingsContainer";
import { LocalExerciseConfig } from "../config/localExerciseConfig";


export interface ContainerFactory {

    createContainer(container: JQuery, config?: Configuration): Container;

}


export class HomeContainerFactory implements ContainerFactory {
    createContainer(container: JQuery): Container {
        return new HomeContainer(container);
    }
    
}


export class AdditionContainerFactory implements ContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("addition")
            .setNamespace(Configuration.ADDITION)
            .setOperators(OperatorFactory.obtainOperator(Operator.ADDITION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(
            container,
            builder.build(),
            new LocalExerciseConfig(Configuration.ADDITION)
        );
    }
}


export class SubtractionContainerFactory implements ContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("subtraction")
            .setNamespace(Configuration.SUBTRACTION)
            .setOperators(OperatorFactory.obtainOperator(Operator.SUBTRACTION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(
            container,
            builder.build(),
            new LocalExerciseConfig(Configuration.SUBTRACTION)
        );
    }
}


export class MultiplicationContainerFactory implements ContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("multiplication")
            .setNamespace(Configuration.MULTIPLICATION)
            .setOperators(OperatorFactory.obtainOperator(Operator.MULTIPLICATION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(
            container,
            builder.build(),
            new LocalExerciseConfig(Configuration.MULTIPLICATION)
        );
    }
}


export class DivisionContainerFactory implements ContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("division")
            .setNamespace(Configuration.DIVISION)
            .setOperators(OperatorFactory.obtainOperator(Operator.DIVISION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(
            container,
            builder.build(),
            new LocalExerciseConfig(Configuration.DIVISION)
        );
    }
}


export class FractionsContainerFactory implements ContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder(),
              operators: Operator[] = [];
            
        for (const operator of config.fractions_operators) {
            operators.push(OperatorFactory.obtainOperator(operator));
        }
        builder
            .setName("fractions")
            .setNamespace(Configuration.FRACTIONS)
            .setOperators(...operators)
            .setOperands(Operand.FRACTION_OPERAND);
        return new FractionContainer(
            container,
            builder.build(),
            new LocalExerciseConfig(Configuration.FRACTIONS)
        );
    }
}


export class CustomContainerFactory implements ContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder(),
              operators: Operator[] = [];
            
        for (const operator of config.custom_operators) {
            operators.push(OperatorFactory.obtainOperator(operator));
        }
        builder
            .setName("custom")
            .setNamespace(Configuration.CUSTOM)
            .setOperators(...operators)
            .setOperands(Operand.INTEGER_OPERAND, Operand.FRACTION_OPERAND, Operand.COMPOSITE_OPERAND);
        return new CustomContainer(
            container,
            builder.build(),
            new LocalExerciseConfig(Configuration.CUSTOM)
        );
    }
}


export class TestAccordionFactory implements ContainerFactory {
    createContainer(container: JQuery): Container {
        return new TestContainer(container);
    }
}


export class SettingsContainerFactory implements ContainerFactory {
    createContainer(container: JQuery): Container {
        return new SettingsContainer(container);
    }
}
