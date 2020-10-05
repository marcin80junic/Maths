import $ from 'jquery';

/*
    Applications settings follow singleton pattern
*/

export class Configuration {

    private static readonly instance = new Configuration();
    private readonly config = new Map();
    private readonly changed = new Map();
    private static loaded = false;

    private static readonly NAMESPACE = "maths.config";
    private static readonly SYSTEM = `${Configuration.NAMESPACE}.system`;
    private static readonly GENERAL = `${Configuration.NAMESPACE}.general`;
    private static readonly FRACTIONS = `${Configuration.NAMESPACE}.fractions`;
    private static readonly CUSTOM = `${Configuration.NAMESPACE}.custom`;
    private static readonly TEST = `${Configuration.NAMESPACE}.test`;
    public static readonly VOLUME = `${Configuration.SYSTEM}.volume`;
    public static readonly TOOLTIPS = `${Configuration.GENERAL}.tooltips`;
    public static readonly RANDOMIZE = `${Configuration.GENERAL}.randomize`;
    public static readonly FRACTIONS_OPERATORS = `${Configuration.FRACTIONS}.operators`;
    public static readonly TEST_MODULES = `${Configuration.TEST}.modules`;
    public static readonly TEST_TIMES = `${Configuration.TEST}.times`;
    public static readonly TEST_QUESTIONS = `${Configuration.TEST}.questions`
    
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

    private _system_volume = "0.5";
    private _general_tooltips = "true";
    private _general_randomize = "false";
    private _fractions_operators = "addition, subtraction";
    private _test_modules = "addition,subtraction,multiplication,division,fractions";
    private _test_times = "10, 8, 6";
    private _test_questions = "4";

    public readonly isTouchscreen = "ontouchstart" in document.documentElement;
    public readonly noTouchClass = this.isTouchscreen? "": "no-touch";


    private constructor() {
        this.config
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
            this.instance.init();
            this.loaded = true;
        }
        return this.instance;
    }

    private init() {
        let loaded: string;
        for (let [key, value] of this.config.keys()) {
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

    get system_volume() { return parseInt(this._system_volume); }
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