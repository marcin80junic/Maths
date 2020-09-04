
maths.settings = {
    name: "settings",
    areLoaded: false,
    fields: {
        volume: $('#volume'),
        isRandomized: $('#settings input[name="isRandomized"]'),
        showTooltips: $('#settings input[name="showTooltips"]'),
        testModules: $('#settings input[name="modules"]'),
        testTimes: $('#settings select[name="times"'),
        testNumOfQuest: $('#settings select[name="numOfQuest"'),
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

    },
    test: {
        exerciseNum: "4",
        modules: "addition,subtraction,multiplication,division,fractions",
        times: "10,8,6",
        unlocked: "0"
    },
    changed: {
        system: {},
        general: {},
        test: {}
    },

    init: function() {
        let ns = maths.settings,
            namespace = "maths.settings.",
            all = {
                system: this.system,
                general: this.general,
                test: this.test
            };
        const enableApplyButton = () => {
            if ($.isEmptyObject(ns.changed.system)
                && $.isEmptyObject(ns.changed.general)
                && $.isEmptyObject(ns.changed.test))
                ns.fields.applyButton.prop('disabled', true)
            else  ns.fields.applyButton.prop('disabled', false)
        }
            
        // read settings from local storage and update all settings fields
        this.accessStorage(all, namespace, false);
        this.areLoaded = true;
        this.restoreSettings();

        // define handlers for all settings input fields
        this.fields.volume.on('input change', () => this.updateVolumeLabel(this.fields.volume.val()) );
        this.fields.volume.on('change', function() {
            let volume = $(this).val() / 100;
            if (ns.system.volume == volume) delete ns.changed.system.volume
            else ns.changed.system.volume = volume
            maths.playSound(true, volume);
            enableApplyButton();
        });
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
        this.fields.testModules.on('change', function() {
            let mods = [];
            ns.fields.testModules.each((i, el) => {
                if ($(el).is(':checked')) mods.push($(el).val())
            });
            if (mods.join(",") === ns.test.modules) delete ns.changed.test.modules
            else ns.changed.test.modules = mods.join(",");
            enableApplyButton();
        });
        this.fields.testTimes.on('change', function() {
            let times = [];
            ns.fields.testTimes.each( (i, el) => times[i] = $(el).val() );
            if (times.join(",") === ns.test.times) delete ns.changed.test.times
            else ns.changed.test.times = times.join(",")
            enableApplyButton();
        });
        this.fields.testNumOfQuest.on('change', () => {
            let num = this.fields.testNumOfQuest.val();
            if (num == ns.test.exerciseNum) delete ns.changed.test.exerciseNum
            else ns.changed.test.exerciseNum = num;
            enableApplyButton();
        });
        this.fields.clearButton.on('click', () => {
            this.clearChanges();
            this.restoreSettings();
            this.fields.clearButton.blur();
            enableApplyButton();
        });
        this.fields.settingsForm.on('submit', function(e) {
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
            $('#settings-default').blur();
            enableApplyButton();
        });
    },
    accessStorage: function(object, namespace, write) {
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
        let changed = this.changed,
            apply = false,
            object, temp, field, isEmpty,
            resetModules = () => {  // resets levelDisplayed property of Operation modules, this will cause
                for (object in maths) {  // the program to reload modules next time they will be displayed
                    if (maths.hasOwnProperty(object) &&  
                        Object.getPrototypeOf(maths[object]) === Operation.prototype) {
                        maths[object]["levelDisplayed"] = null; // actual reset
                    }
                }
            }
            resetTest = () => {
                maths.settings.test.unlocked = "0";
                this.accessStorage({"unlocked": "0"}, "maths.settings.test.", true);
            }

        for (object in changed) {   // assign temporary changes to actual settings
            if (changed.hasOwnProperty(object)) {
                temp = changed[object];
                isEmpty = true;
                for (field in temp) {
                    if (temp.hasOwnProperty(field)) {
                        this[object][field] = temp[field];
                        isEmpty = false;
                    }
                }
                if (!isEmpty) {
                    if (object === "general") resetModules();
                    if (object === "test") resetTest();
                }
            }
        }   
    },
    restoreSettings: function() {
        let testModules = this.test.modules.split(","), 
            testTimes = this.test.times.split(","); 

        this.fields.volume.val(this.system.volume * 100);  
        this.updateVolumeLabel(this.system.volume * 100);    
        this.fields.isRandomized.filter('[value="' + this.general.isRandomized + '"]').prop('checked', true);
        this.fields.showTooltips.filter('[value="' + this.general.showTooltips + '"]').prop('checked', true);
        this.fields.testModules.each((_i, el) => {
            let checked = false;
            testModules.forEach((val) => {
                if ($(el).is('[value="' + val + '"]')) {
                    checked = true;
                }
            });
            $(el).prop('checked', checked);
        });
        this.fields.testTimes.each( (i, el) => $(el).val(testTimes[i]) );
        this.fields.testNumOfQuest.val(this.test.exerciseNum);
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
    updateVolumeLabel: function(value) {
        $('#volume-label').html(value + "%");
        if (value < 1) $('#speaker').prop('src', 'pics/speaker-muted.png');
        else if (value < 30) $('#speaker').prop('src', 'pics/speaker-low-volume.png');
        else if (value < 70) $('#speaker').prop('src', 'pics/speaker-medium-volume.png');
        else $('#speaker').prop('src', 'pics/speaker-high-volume.png');
    }

}