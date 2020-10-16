import $ from 'jquery';
import { AbstractContainerFactory, Container } from "./container_home";
import { Configuration, MediaPlayback } from "./module_config";


export class SettingsContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        return new SettingsContainer(container);
    }
}

export class SettingsContainer extends Container {

    /* set of interactive input fields */
    private readonly system_volume_input = this.container.find('#volume');
    private readonly system_volume_label = this.container.find('#volume-label');
    private readonly system_volume_icon = this.container.find('#speaker');
    private readonly general_randomize_input = this.container.find('input[name="isRandomized"]');
    private readonly general_tooltips_input = this.container.find('input[name="showTooltips"]');
    private readonly fractions_operators_input = this.container.find('#fractions-settings input[name="signs"]');
    private readonly test_modules_input = this.container.find('#test-settings input[name="modules"]');
    private readonly test_times_input = this.container.find('select[name="times"]');
    private readonly test_questions_input = this.container.find('select[name="numOfQuest"]');
    private readonly form_clear_button = this.container.find('#settings-clear');
    private readonly form_apply_button = this.container.find('#settings-apply');
    private readonly form_all_submit = this.container.find('#settings-form');

    private config: Configuration;
    private readonly changed: Map<string, string>;
    private loaded: boolean;
    
    constructor(container: JQuery) {
        super(container);
        this.config = Configuration.getConfig();
        this.changed = new Map();
        this.loaded = false;
    }

    show() {
        if (!this.loaded) {
            this.updateInputFields();
            this.listen();
        }
        super.show();
    }

    hide(callback: Function) {
        super.hide(callback);
    }
    
    displayTooltip(): boolean {
        throw new Error("Method not implemented.");
    }

    private updateInputFields(): void {
        const setCheckBtnGroup = ($checkButton: JQuery, values: string[]) => {
            let checked = false;
            values.forEach((val: string) => {
                if ($checkButton.is(`[value="${val}"]`)) {
                    checked = true;
                }
            });
            $checkButton.prop('checked', checked);
        };
        this.system_volume_input.val(this.config.system_volume * 100);  
        this.updateVolumeLabel(this.config.system_volume * 100);    
        this.general_randomize_input.filter(`[value="${this.config.general_randomize}"]`)
            .prop('checked', true);
        this.general_tooltips_input.filter(`[value="${this.config.general_tooltips}"]`)
            .prop('checked', true);
        this.fractions_operators_input.each((i: number, el: HTMLElement) => {
            setCheckBtnGroup ($(el), this.config.fractions_operators);
        });
        this.test_modules_input.each((i: number, el: HTMLElement) => {
            setCheckBtnGroup($(el), this.config.test_modules);
        });
        this.test_times_input.each((i: number, el: HTMLElement) => {
            $(el).val(this.config.test_times[i]);
        });
        this.test_questions_input.val(this.config.test_questions);
    }

    private listen(): void {
        const updateApplyButton = () => this.form_apply_button.prop('disabled', this.changed.size === 0);
        const updateChanged = (key: string, value: string) => {
            if (this.config.gettersMap.get(key)() === value) {
                this.changed.delete(key);
            } else {
                this.changed.set(key, value);
            }
            updateApplyButton();
        };
        const readCheckBtnGroup = (group: JQuery): string => {
            const mods: string[] = [];
            group.each((i: number, el: HTMLElement) => {
                if ($(el).is(':checked')) {
                    mods.push(<string>$(el).val())
                } 
            });
            return mods.join(",");
        };
        const readSelectGroup = (group: JQuery): string => {
            const times: string[] = [];
            group.each( (i: number, el: HTMLElement) => {
                times[i] = <string>$(el).val();
            });
            return times.join(",");
        }

        if (!Configuration.isTouchscreen) {
            this.system_volume_input
                .on('input change', () => this.updateVolumeLabel(<number>this.system_volume_input.val()));
            this.system_volume_input.on('change', () => {
                let volume = <number>this.system_volume_input.val() / 100;
                MediaPlayback.playSound(MediaPlayback.SOUND_CHEER, volume);
                updateChanged(Configuration.VOLUME, '' + volume)
            });
        }
        this.general_randomize_input.on('change', () => {
            let isRand = '' + this.general_randomize_input.filter(':checked').val();
            updateChanged(Configuration.RANDOMIZE, isRand);
        });
        this.general_tooltips_input.on('change reset', () => {
            let isTooltip = '' + this.general_tooltips_input.filter(':checked').val();
            updateChanged(Configuration.TOOLTIPS, isTooltip)
        });
        this.fractions_operators_input.on('change', () => {
            const options = readCheckBtnGroup(this.fractions_operators_input);
            updateChanged(Configuration.FRACTIONS_OPERATORS, options);
        });
        this.test_modules_input.on('change', () => {
            const options = readCheckBtnGroup(this.test_modules_input);
            updateChanged(Configuration.TEST_MODULES, options);
        });
        this.test_times_input.on('change', () => {
            const options = readSelectGroup(this.test_times_input);
            updateChanged(Configuration.TEST_TIMES, options);
        });
        this.test_questions_input.on('change', () => {
            let num = '' + this.test_questions_input.val();
            updateChanged(Configuration.TEST_QUESTIONS, num);
        });
        this.form_clear_button.on('click', () => {
            this.changed.clear();
            this.form_clear_button.trigger('blur');
            this.updateInputFields();
            updateApplyButton();
        });
        this.form_all_submit.on('submit', this, function(event) {
            event.preventDefault();
            event.data.config.save(event.data.changed);
            event.data.changed.clear();
            updateApplyButton();
        });
    }

    private updateVolumeLabel(value: number): void {
        this.system_volume_label.html(value + "%");
        if (value < 1) this.system_volume_icon.prop('src', Configuration.ICON_VOLUME_MUTE);
        else if (value < 30) this.system_volume_icon.prop('src', Configuration.ICON_VOLUME_LOW);
        else if (value < 70) this.system_volume_icon.prop('src', Configuration.ICON_VOLUME_MEDIUM);
        else this.system_volume_icon.prop('src', Configuration.ICON_VOLUME_HIGH);
    }
    
}