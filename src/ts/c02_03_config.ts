import $ from 'jquery';
// @ts-ignore
import questMark from '../../public/pics/question.png'; 

/*
    Applications settings follow singleton pattern
*/

export class Configuration {

    private static instance: Configuration;
    private readonly SETTINGS = new Map();
    private readonly changed = new Map();
    private subscribers: Function[] = [];
    private static loaded = false;

    /* list of assets */
    public static readonly ICON_QUESTION = questMark;
    public static readonly ICON_TICK = '../../public/pics/correct.png';
    public static readonly ICON_CROSS = '../../public/pics/wrong.png';

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
    private static readonly TEST = `${Configuration.NAMESPACE}.test`;
    public static readonly VOLUME = `${Configuration.SYSTEM}.volume`;
    public static readonly TOOLTIPS = `${Configuration.GENERAL}.tooltips`;
    public static readonly RANDOMIZE = `${Configuration.GENERAL}.randomize`;
    public static readonly FRACTIONS_OPERATORS = `${Configuration.FRACTIONS}.operators`;
    public static readonly TEST_MODULES = `${Configuration.TEST}.modules`;
    public static readonly TEST_TIMES = `${Configuration.TEST}.times`;
    public static readonly TEST_QUESTIONS = `${Configuration.TEST}.questions`
    
    /* set of interactive input fields */
    private readonly system_volume_input = $('#volume');
    private readonly general_randomize_input = $('#settings input[name="isRandomized"]');
    private readonly general_tooltips_input = $('#settings input[name="showTooltips"]');
    private readonly fractions_operators_input = $('#settings #fractions-settings input[name="signs"]');
    private readonly test_modules_input = $('#settings #test-settings input[name="modules"]');
    private readonly test_times_input = $('#settings select[name="times"]');
    private readonly test_questions_input = $('#settings select[name="numOfQuest"]');
    private readonly form_clear_button = $('#settings-clear');
    private readonly form_apply_button = $('#settings-apply');
    private readonly form_all_submit = $('#settings-form');

    /* set of configuration properties initialized with default values */
    private _system_volume = "0.5";

    private _general_tooltips = "true";
    private _general_randomize = "false";

    private _fractions_operators = "addition,subtraction";

    private _test_modules = "addition,subtraction,multiplication,division,fractions";
    private _test_times = "10, 8, 6";
    private _test_questions = "4";

    /* touchscreen detection */
    public static readonly isTouchscreen = "ontouchstart" in document.documentElement;
    public static readonly noTouchClass = Configuration.isTouchscreen? "": "no-touch";


    private constructor() {
        this.SETTINGS
            .set(Configuration.VOLUME, this.system_volume)
            .set(Configuration.TOOLTIPS, this.general_tooltips)
            .set(Configuration.RANDOMIZE, this.general_randomize)
            .set(Configuration.FRACTIONS_OPERATORS, this.fractions_operators)
            .set(Configuration.TEST_MODULES, this.test_modules)
            .set(Configuration.TEST_TIMES, this.test_times)
            .set(Configuration.TEST_QUESTIONS, this.test_questions);
    };

    public static getConfig(): Configuration {
        if (!this.loaded) {
            this.instance = new Configuration()
            this.instance.init();
            this.loaded = true;
        }
        return this.instance;
    }

    get(option: string) {
        return this.SETTINGS.get(option);
    }
    set(option: string, value: any) {   /* to be tested */
        let setter = this.SETTINGS.get(option);
        setter = value;
    }

    private init() {
        let loaded: string;
        for (let [key, value] of this.SETTINGS) {
            loaded = this.accessStorage(key);
            if (loaded) {
                value = loaded;
            }
        }
    }

    private accessStorage(namespace: string, newValue?: string) {
        try {
            if (typeof Storage !== "undefined") {
                if (newValue) {
                    localStorage.setItem(namespace, newValue);
                    console.log("saving: " + namespace + ": " + newValue); /** */
                } else {
                    let loaded = localStorage.getItem(namespace);
                    console.log("loading: " + namespace + ": " + loaded);   //** */
                    return loaded;
                }
            }
        } catch(error) {
            console.error("can't access the local storage");
        }
    }

    subscribe(callback: Function) {
        this.subscribers.push(callback);
    }

    notifySubscibers() {
        for (const notify of this.subscribers) {
            notify();
        }
    }

    /* setters and getters for private configuration properties */
    get system_volume() { return parseFloat(this._system_volume); }
    set system_volume(newVal) { this._system_volume = "" + newVal; }
    get general_tooltips() { return (this._general_tooltips === "true")? true: false; }
    set general_tooltips(newVal) { this._general_tooltips = "" + newVal; }
    get general_randomize() { return (this._general_randomize === "true")? true: false; }
    set general_randomize(newVal) { this._general_randomize = "" + newVal; }
    get fractions_operators() { return this._fractions_operators.split(",") }
    set fractions_operators(newVal) { this._fractions_operators = newVal.join(",") }
    get test_modules() { return this._test_modules.split(",") }
    set test_modules(newVal) { this._test_modules = newVal.join(",") }
    get test_times() { return this._test_times.split(",").map((val) => parseInt(val, 10)) }
    set test_times(newVal) { this._test_times = newVal.join(",") }
    get test_questions() { return parseInt(this._test_questions, 10) }
    set test_questions(newVal) { this._test_questions = "" + newVal }

}   