
import $ from 'jquery';
import type { mainObject } from './types';
import { MathOperation } from './m01-prototype';
import { maths } from './m03-maths';


export const settings = {
    name: "settings",
    areLoaded: false,
    fields: {
        volume: $('#volume'),

        isRandomized: $('#settings input[name="isRandomized"]'),
        showTooltips: $('#settings input[name="showTooltips"]'),

        fractionSigns: $('#settings #fractions-settings input[name="signs"]'),

        testModules: $('#settings #test-settings input[name="modules"]'),
        testTimes: $('#settings select[name="times"]'),
        testNumOfQuest: $('#settings select[name="numOfQuest"]'),

        clearButton: $('#settings-clear'),
        applyButton: $('#settings-apply'),
        settingsForm: $('#settings-form')
    },
    system: {
        volume: 0.5
    },
    general: {
        showTooltips: "true",
        isRandomized: "false"
    },
    fractions: {
        signs: "addition,subtraction"
    },
    test: {
        modules: "addition,subtraction,multiplication,division,fractions",
        numOfQuest: "4",
        times: "10,8,6",
        unlocked: "0"
    },
    changed: {
        system: {},
        general: {},
        fractions: {},
        test: {}
    },

    init: function() {
        const ns = maths.settings,
            namespace = "maths.settings.",
            all = {
                system: this.system,
                general: this.general,
                fractions: this.fractions,
                test: this.test
            },
            readCheckBtnGroup = (group: JQuery) => {
                const mods: Array<string> = [];
                group.each((i: number, el: HTMLElement) => {
                    if ($(el).is(':checked')) {
                        mods.push(<string>$(el).val())
                    } 
                });
                return mods.join(",");
            },
            enableApplyButton = () => {
                if ($.isEmptyObject(this.changed.system)
                    && $.isEmptyObject(this.changed.general)
                    && $.isEmptyObject(this.changed.fractions)
                    && $.isEmptyObject(this.changed.test))    {
                        ns.fields.applyButton.prop('disabled', true);
                } else  {
                    ns.fields.applyButton.prop('disabled', false);
                }
            };
            
        // read settings from local storage and update all settings fields
        this.accessStorage(all, namespace, false);
        this.areLoaded = true;
        this.updateModuleSigns("fractions");
        this.restoreSettings();

        // define handlers for all settings input fields
        if (!maths.isTouchscreen) {
            this.fields.volume.on('input change', () => this.updateVolumeLabel(this.fields.volume.val()));
            this.fields.volume.on('change', function() {
            let volume = <number>$(this).val() / 100;
            if (ns.system.volume == volume) delete ns.changed.system.volume
            else ns.changed.system.volume = volume
            maths.playSound(true, volume);
            enableApplyButton();
            });
        }
        this.fields.isRandomized.on('change', function() {
            let isRand = $(this).val();
            if (isRand === ns.general.isRandomized) delete ns.changed.general.isRandomized
            else ns.changed.general.isRandomized = isRand
            enableApplyButton();
        });
        this.fields.showTooltips.on('change reset', function() {
            let isTooltip = $(this).val();
            if (isTooltip === ns.general.showTooltips) delete ns.changed.general.showTooltips
            else ns.changed.general.showTooltips = isTooltip
            enableApplyButton();
        });
        this.fields.fractionSigns.on('change', () => {
            const options = readCheckBtnGroup(this.fields.fractionSigns);
            if (options === ns.fractions.signs) {
                delete ns.changed.fractions.signs
            } else {
                ns.changed.fractions.signs = options;
            }
            enableApplyButton();
        });
        this.fields.testModules.on('change', () => {
            const options = readCheckBtnGroup(this.fields.testModules);
            if (options === ns.test.modules) {
                delete ns.changed.test.modules
            } else {
                ns.changed.test.modules = options;
            }
            enableApplyButton();
        });
        this.fields.testTimes.on('change', function() {
            let times: Array<string> = [];
            ns.fields.testTimes.each( (i: number, el: HTMLElement) => {
                times[i] = <string>$(el).val();
            });
            if (times.join(",") === ns.test.times) {
                delete ns.changed.test.times;
            } else {
                ns.changed.test.times = times.join(",");
            }
            enableApplyButton();
        });
        this.fields.testNumOfQuest.on('change', () => {
            let num = this.fields.testNumOfQuest.val();
            if (num == ns.test.numOfQuest) delete ns.changed.test.numOfQuest
            else ns.changed.test.numOfQuest = num;
            enableApplyButton();
        });
        this.fields.clearButton.on('click', () => {
            this.clearChanges();
            this.restoreSettings();
            this.fields.clearButton.trigger('blur');;
            enableApplyButton();
        });
        this.fields.settingsForm.on('submit', function(e: Event) {
            e.preventDefault();
            if (ns.confirmChanges()) {  // check whether changes will reset any modules and display..
                ns.applyChanges();      // ..confirmation dialog
                ns.accessStorage(ns.changed, namespace, true);
                ns.clearChanges();
                enableApplyButton();
            }   // do nothing if changes are refused
        });
        this.fields.settingsForm.on('reset', ()=>{
            setTimeout(() => this.fields.volume.trigger('input'), 100);
            $('#settings-default').trigger('blur');
            enableApplyButton();
        });
    },

    accessStorage: function(object: any, namespace: string, write: boolean) {
        try {
            if (typeof (Storage) !== "undefined") {
                for (let field in object) {
                    if (object.hasOwnProperty(field)) {
                        if (typeof object[field] === 'object') {    // obtaining all values recursively
                            this.accessStorage(object[field], namespace + field + ".", write);
                        } else if(write) {
                            localStorage.setItem(namespace + field, object[field]);
                            console.log("saving: " + namespace + field + ": " + object[field]); /** */
                        } else {
                            let loaded = localStorage.getItem(namespace + field);
                            console.log("loading: " + namespace + field + ": " + loaded);   //** */
                            if (loaded !== null) object[field] = loaded;
                        }
                    }
                }
            }
        } catch(error) {
            alert("can't access the local storage");
        }
    },

    applyChanges: function() {
        let temp: any,
            isEmpty: boolean;
        const changed = this.changed,
            resetModules = (module?: string) => {  // resets levelDisplayed property of Operation modules, this will cause
                if (module) {
                    maths[module]["levelDisplayed"] = -1;
                } else {
                    for (const object in maths) {  // the program to reload modules next time they will be displayed
                        if (maths.hasOwnProperty(object) &&  
                            maths[object as keyof mainObject] instanceof MathOperation) {
                            maths[object as keyof mainObject]["levelDisplayed"] = -1; // actual reset
                        }
                    }
                }
            },
            resetTest = () => {
                maths.settings.test.unlocked = "0";
                maths.test.isLoaded = false;
                this.accessStorage({"unlocked": "0"}, "maths.settings.test.", true);
            };

        for (const object in changed) {   // assign temporary changes to actual settings
            if (changed.hasOwnProperty(object)) {
                temp = changed[object];
                isEmpty = true;
                for (const field in temp) {
                    if (temp.hasOwnProperty(field)) {
                        this[object][field] = temp[field];
                        isEmpty = false;
                    }
                }
                if (!isEmpty) {
                    if (object === "general") resetModules();   // reset all modules
                    if (object === "fractions") {
                        this.updateModuleSigns("fractions");
                        resetModules("fractions");
                    }
                    if (object === "test") resetTest();
                }
            }
        }   
    },

    restoreSettings: function() {
        const fractionSigns = this.fractions.signs.split(','),
              testModules = this.test.modules.split(','), 
              testTimes = this.test.times.split(','),
              setCheckBtnGroup = ($el: JQuery, values: string[]) => {
                let checked = false;
                values.forEach((val: string) => {
                    if ($el.is(`[value="${val}"]`)) {
                        checked = true;
                    }
                });
                $el.prop('checked', checked);
              };

        this.fields.volume.val(this.system.volume * 100);  
        this.updateVolumeLabel(this.system.volume * 100);    
        this.fields.isRandomized.filter(`[value="${this.general.isRandomized}"]`).prop('checked', true);
        this.fields.showTooltips.filter(`[value="${this.general.showTooltips}"]`).prop('checked', true);
        this.fields.fractionSigns.each((i: number, el: HTMLElement) => {
            setCheckBtnGroup($(el), fractionSigns);
        });
        this.fields.testModules.each((i: number, el: HTMLElement) => {
            setCheckBtnGroup($(el), testModules);
        });
        this.fields.testTimes.each((i: number, el: HTMLElement) => {
            $(el).val(testTimes[i]);
        });
        this.fields.testNumOfQuest.val(this.test.numOfQuest);
    },

    clearChanges: function() {
        for (let field in this.changed) {
            if (this.changed.hasOwnProperty(field)) {
                this.changed[field] = {};
            }
        }
    },

    confirmChanges: function() {
        let conf = true,
            general = !$.isEmptyObject(this.changed.general),
            test = !$.isEmptyObject(this.changed.test);
        if (general && test) {
            conf = confirm("changing these options will void any progress throughout all modules and test");
        }
        else if (general) {
            conf = confirm("changing these options will void any progress throughout all modules (not test)");
        }
        else if (test) {
            conf = confirm("changing these options will void any progress in the test module");
        }
        return conf;
    },

    updateModuleSigns: function(module: string) {
        const moduleSigns = [],
              moduleSettings = this.fractions.signs.split(',');
              
        for (const settSign of moduleSettings) {
            moduleSigns.push(maths.signMap.get(settSign));
        }
        maths[module].sign = moduleSigns;
    },

    updateVolumeLabel: function(value: number) {
        $('#volume-label').html(value + "%");
        if (value < 1) $('#speaker').prop('src', maths.icons.volumeMuted);
        else if (value < 30) $('#speaker').prop('src', maths.icons.volumeLow);
        else if (value < 70) $('#speaker').prop('src', maths.icons.volumeMedium);
        else $('#speaker').prop('src', maths.icons.volumeHigh);
    }

}