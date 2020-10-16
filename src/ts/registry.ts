import $ from 'jquery';
import { HomeContainerFactory, Container } from "./container_home";
import { AdditionContainerFactory,
        SubtractionContainerFactory,
        MultiplicationContainerFactory, 
        DivisionContainerFactory,
        FractionsContainerFactory,
        CustomContainerFactory} from "./container_exercise";
import { TestAccordionFactory } from "./container_accordion";
import { SettingsContainerFactory } from "./container_settings";
import { Configuration } from './module_config';


export abstract class ModuleRegistry {

    private static readonly HOME_CONTAINER = document.getElementById('home');
    private static readonly ADDITION_CONTAINER = document.getElementById('addition');
    private static readonly SUBTRACTION_CONTAINER = document.getElementById('subtraction');
    private static readonly MULTIPLICATION_CONTAINER = document.getElementById('multiplication');
    private static readonly DIVISION_CONTAINER = document.getElementById('division');
    private static readonly FRACTIONS_CONTAINER = document.getElementById('fractions');
    private static readonly CUSTOM_CONTAINER = document.getElementById('custom');
    private static readonly TEST_CONTAINER = document.getElementById('test');
    private static readonly SETTINGS_CONTAINER = document.getElementById('settings');

    private static MAP = new Map([
        [ModuleRegistry.HOME_CONTAINER, HomeContainerFactory],
        [ModuleRegistry.ADDITION_CONTAINER, AdditionContainerFactory],
        [ModuleRegistry.SUBTRACTION_CONTAINER, SubtractionContainerFactory],
        [ModuleRegistry.MULTIPLICATION_CONTAINER, MultiplicationContainerFactory],
        [ModuleRegistry.DIVISION_CONTAINER, DivisionContainerFactory],
        [ModuleRegistry.FRACTIONS_CONTAINER, FractionsContainerFactory],
        [ModuleRegistry.CUSTOM_CONTAINER, CustomContainerFactory],
        [ModuleRegistry.TEST_CONTAINER, TestAccordionFactory],
        [ModuleRegistry.SETTINGS_CONTAINER, SettingsContainerFactory]
    ]);

    private static readonly containerRegistry: Map<HTMLElement, Container> = new Map();
    private static readonly config = Configuration.getConfig();

    public static getModule(container: HTMLElement): Container {
        if (!ModuleRegistry.containerRegistry.has(container)) {
            const factory = ModuleRegistry.MAP.get(container),
                  mathContainer = new factory().createContainer($(container), ModuleRegistry.config);
            ModuleRegistry.containerRegistry.set(container, mathContainer);
        }
        return ModuleRegistry.containerRegistry.get(container);
    }

    
}