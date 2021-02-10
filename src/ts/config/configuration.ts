                                                                                // @ts-ignore
import icon_questMark from '../../../public/pics/question.png';                    // @ts-ignore
import icon_cross from '../../../public/pics/wrong.png';                           // @ts-ignore
import icon_tick from '../../../public/pics/correct.png';                          // @ts-ignore
import icon_volumeMuted from '../../../public/pics/speaker-muted.png';             // @ts-ignore
import icon_volumeLow from '../../../public/pics/speaker-low-volume.png';          // @ts-ignore
import icon_volumeMedium from '../../../public/pics/speaker-medium-volume.png';    // @ts-ignore
import icon_volumeHigh from '../../../public/pics/speaker-high-volume.png'; 
import { SoundPlayer } from '../media/soundPlayer';


/*
    Application configuration implements singleton pattern
*/

export class Configuration {

    private static instance: Configuration;
    private settersMap: Map<string, Function>;
    public gettersMap: Map<string, Function>;
    private eventsMap: Map<string, string[]>
    private subscribers_media: Function[];
    private subscribers_container: Function[];
    private subscribers_exercise: Function[];
    private subscribers_fractions: Function[];
    private subscribers_custom: Function[];
    private subscribers_test: Function[];

    /* list of assets */
    public static readonly ICON_QUESTION = icon_questMark;
    public static readonly ICON_TICK = icon_tick;
    public static readonly ICON_CROSS = icon_cross;
    public static readonly ICON_VOLUME_MUTE = icon_volumeMuted;
    public static readonly ICON_VOLUME_LOW = icon_volumeLow;
    public static readonly ICON_VOLUME_MEDIUM = icon_volumeMedium;
    public static readonly ICON_VOLUME_HIGH = icon_volumeHigh;

    /* set of namespaces for read/write localstorage access */
    private static readonly NAMESPACE = "maths.config";
    private static readonly SYSTEM = `${Configuration.NAMESPACE}.system`;
    private static readonly GENERAL = `${Configuration.NAMESPACE}.general`;
    public static readonly ADDITION = `${Configuration.NAMESPACE}.addition`;
    public static readonly SUBTRACTION = `${Configuration.NAMESPACE}.subtraction`;
    public static readonly MULTIPLICATION = `${Configuration.NAMESPACE}.multiplication`;
    public static readonly DIVISION = `${Configuration.NAMESPACE}.division`;
    public static readonly FRACTIONS = `${Configuration.NAMESPACE}.fractions`;
    public static readonly CUSTOM = `${Configuration.NAMESPACE}.custom`;
    public static readonly TEST = `${Configuration.NAMESPACE}.test`;
    public static readonly VOLUME = `${Configuration.SYSTEM}.volume`;
    public static readonly TOOLTIPS = `${Configuration.GENERAL}.tooltips`;
    public static readonly RANDOMIZE = `${Configuration.GENERAL}.randomize`;
    public static readonly FRACTIONS_OPERATORS = `${Configuration.FRACTIONS}.operators`;
    public static readonly CUSTOM_OPERANDS = `${Configuration.CUSTOM}.operands`;
    public static readonly CUSTOM_OPERATORS = `${Configuration.CUSTOM}.operators`;
    public static readonly TEST_MODULES = `${Configuration.TEST}.modules`;
    public static readonly TEST_TIMES = `${Configuration.TEST}.times`;
    public static readonly TEST_QUESTIONS = `${Configuration.TEST}.questions`

    /* set of namespaces used to identify groups of event listeners */
    public static readonly EVENT_MEDIA = 'media';
    public static readonly EVENT_CONTAINER = 'container';
    public static readonly EVENT_EXERCISE = 'exercise';
    public static readonly EVENT_FRACTIONS = 'fractions';
    public static readonly EVENT_CUSTOM = 'custom';
    public static readonly EVENT_TEST = 'test';

    /* set of configuration properties initialized with default values */
    private _system_volume = "0.5";
    private _general_tooltips = "true";
    private _general_randomize = "false";
    private _fractions_operators = "addition,subtraction";
    private _custom_operands = "integer";
    private _custom_operators = "addition,subtraction";
    private _test_modules = "addition,subtraction,multiplication,division,fractions";
    private _test_times = "10, 8, 6";
    private _test_questions = "4";

    /* touchscreen detection */
    public static readonly isTouchscreen = "ontouchstart" in document.documentElement;
    public static readonly noTouchClass = Configuration.isTouchscreen ? "" : "no-touch";

    /* default sound player */
    public static readonly PLAYER = SoundPlayer.getPlayer();


    private constructor() {
        this.settersMap = new Map([
            [Configuration.VOLUME, this.setVolume],
            [Configuration.TOOLTIPS, this.setTooltips],
            [Configuration.RANDOMIZE, this.setRandomize],
            [Configuration.FRACTIONS_OPERATORS, this.setFractionsOperators],
            [Configuration.CUSTOM_OPERANDS, this.setCustomOperands],
            [Configuration.CUSTOM_OPERATORS, this.setCustomOperators],
            [Configuration.TEST_MODULES, this.setTestModules],
            [Configuration.TEST_TIMES, this.setTestTimes],
            [Configuration.TEST_QUESTIONS, this.setTestQuestions]
        ]);
        this.gettersMap = new Map([
            [Configuration.VOLUME, () => this._system_volume],
            [Configuration.TOOLTIPS, () => this._general_tooltips],
            [Configuration.RANDOMIZE, () => this._general_randomize],
            [Configuration.FRACTIONS_OPERATORS, () => this._fractions_operators],
            [Configuration.CUSTOM_OPERANDS, () => this._custom_operands],
            [Configuration.CUSTOM_OPERATORS, () => this._custom_operators],
            [Configuration.TEST_MODULES, () => this._test_modules],
            [Configuration.TEST_TIMES, () => this._test_times],
            [Configuration.TEST_QUESTIONS, () => this._test_questions]
        ]);
        this.eventsMap = new Map([
            [Configuration.VOLUME, [Configuration.EVENT_MEDIA]],
            [Configuration.TOOLTIPS, [Configuration.EVENT_CONTAINER]],
            [Configuration.RANDOMIZE, [Configuration.EVENT_EXERCISE, Configuration.EVENT_TEST]],
            [Configuration.FRACTIONS_OPERATORS, [Configuration.EVENT_FRACTIONS, Configuration.EVENT_TEST]],
            [Configuration.CUSTOM_OPERANDS, [Configuration.EVENT_CUSTOM]],
            [Configuration.CUSTOM_OPERATORS, [Configuration.EVENT_CUSTOM]],
            [Configuration.TEST_MODULES, [Configuration.EVENT_TEST]],
            [Configuration.TEST_TIMES, [Configuration.EVENT_TEST]],
            [Configuration.TEST_QUESTIONS, [Configuration.EVENT_TEST]]
        ]);
        this.subscribers_media = [];
        this.subscribers_container = [];
        this.subscribers_fractions = [];
        this.subscribers_custom = [];
        this.subscribers_exercise = [];
        this.subscribers_test = [];
        this.init();
    };

    public static getConfig(): Configuration {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }
        return Configuration.instance;
    }

    private init() {
        let loaded: string;
        for (let [key, setter] of this.settersMap) {
            loaded = this.accessStorage(key);
            if (loaded) {
                setter(loaded);
            }
        }
    }

    save(map: Map<string, string>): void {
        const eventTypes: Set<string> = new Set();
        for (const [key, value] of map) {
            this.accessStorage(key, value);
            let events = this.eventsMap.get(key);
            for (const eventType of events) {
                eventTypes.add(eventType);
            }
        }
        this.init();
        this.notifySubscibers(eventTypes);
    }

    private accessStorage(namespace: string, newValue?: string) {
        try {
            if (typeof Storage !== "undefined") {
                if (newValue) {
                    localStorage.setItem(namespace, newValue);
                } else {
                    let loaded = localStorage.getItem(namespace);
                    return loaded;
                }
            }
        } catch (error) {
            console.error("can't access the local storage");
        }
    }

    public addListener(type: string, callback: Function) {
        
        switch (type) {
            case Configuration.EVENT_MEDIA:
                this.subscribers_media.push(callback);
                break;
            case Configuration.EVENT_CONTAINER:
                this.subscribers_container.push(callback);
                break;
            case Configuration.EVENT_EXERCISE:
                this.subscribers_exercise.push(callback);
                break;
            case Configuration.EVENT_FRACTIONS:
                this.subscribers_fractions.push(callback);
                break;
            case Configuration.EVENT_CUSTOM:
                this.subscribers_custom.push(callback);
                break;
            case Configuration.EVENT_TEST:
                this.subscribers_test.push(callback);
                break;
        }
    }

    private notifySubscibers(events: Iterable<string>) {
        const notify = (subscribers_list: Function[]) => {
            for (const callback of subscribers_list) {
                callback();
            }
        }
        for (const event of events) {
            switch (event) {
                case Configuration.EVENT_MEDIA:
                    notify(this.subscribers_media);
                    break;
                case Configuration.EVENT_CONTAINER:
                    notify(this.subscribers_container);
                    break;
                case Configuration.EVENT_EXERCISE:
                    notify(this.subscribers_exercise);
                    break;
                case Configuration.EVENT_FRACTIONS:
                    notify(this.subscribers_fractions);
                    break;
                case Configuration.EVENT_CUSTOM:
                    notify(this.subscribers_custom);
                    break;
                case Configuration.EVENT_TEST:
                    notify(this.subscribers_test);
                    break;
            }
        }
    }

    /* private setters used to load settings from the local storage */
    private setVolume = (newValue: string) => this._system_volume = newValue;
    private setTooltips = (newValue: string) => this._general_tooltips = newValue;
    private setRandomize = (newValue: string) => this._general_randomize = newValue;
    private setFractionsOperators = (newValue: string) => this._fractions_operators = newValue;
    private setCustomOperands = (newValue: string) => this._custom_operands = newValue;
    private setCustomOperators = (newValue: string) => this._custom_operators = newValue;
    private setTestModules = (newValue: string) => this._test_modules = newValue;
    private setTestTimes = (newValue: string) => this._test_times = newValue;
    private setTestQuestions = (newValue: string) => this._test_questions = newValue;

    /* setters and getters for configuration properties */
    get system_volume() { return parseFloat(this._system_volume); }
    set system_volume(newVal) { this._system_volume = "" + newVal; }
    get general_tooltips() { return (this._general_tooltips === "true") ? true : false; }
    set general_tooltips(newVal) { this._general_tooltips = "" + newVal; }
    get general_randomize() { return (this._general_randomize === "true") ? true : false; }
    set general_randomize(newVal) { this._general_randomize = "" + newVal; }
    get fractions_operators() { return this._fractions_operators.split(",") }
    set fractions_operators(newVal) { this._fractions_operators = newVal.join(",") }
    get custom_operands() { return this._custom_operands.split(",") }
    set custom_operands(newVal) { this._custom_operands = newVal.join(",") }
    get custom_operators() { return this._custom_operators.split(",") }
    set custom_operators(newVal) { this._custom_operators = newVal.join(",") }
    get test_modules() { return this._test_modules.split(",") }
    set test_modules(newVal) { this._test_modules = newVal.join(",") }
    get test_times() { return this._test_times.split(",").map((val) => parseInt(val, 10)) }
    set test_times(newVal) { this._test_times = newVal.join(",") }
    get test_questions() { return parseInt(this._test_questions, 10) }
    set test_questions(newVal) { this._test_questions = "" + newVal }

}
