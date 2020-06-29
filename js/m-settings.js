
maths.settings = {
    name: "settings",
    areLoaded: false,
    fields: {
        volume: $('#volume'),
        isRandomized: $('#settings input[name="isRandomized"]'),
        showTooltips: $('#settings input[name="showTooltips"]'),
        applyButton: $('#settings-apply'),
        settingsForm: $('#settings-form')
    },
    system: {
        volume: 50
    },
    general: {
        showTooltips: "true",
        isRandomized: "false"
    },
    fractions: {

    },
    test: {
        timerTime: 6
    },
    changed: {
        system: {},
        general: {},
        fractions: {},
        test: {}
    },

    init: function() {
        let ns = maths.settings,
            namespace = "maths.settings.";
            all = {
                system: this.system,
                general: this.general,
                fractions: this.fractions,
                test: this.test
            },
            updateVolumeLabel = value => $('#volume-label').html(value + "%"),
            enableApplyButton = enable => ns.fields.applyButton.prop('disabled', !enable),

        this.accessStorage(all, namespace, false);
        this.areLoaded = true;
        this.fields.volume.val(this.system.volume);
        updateVolumeLabel(this.system.volume);
        this.fields.isRandomized.filter('[value="' + this.general.isRandomized + '"]').prop('checked', true);
        this.fields.showTooltips.filter('[value="' + this.general.showTooltips + '"]').prop('checked', true);

        this.fields.volume.on('input change', function() {
            updateVolumeLabel($(this).val());
            ns.changed.system.volume = this.value;
            enableApplyButton(true);
        });
        this.fields.isRandomized.on('change', function() {
            ns.changed.general.isRandomized = $(this).val();
            ns.fields.applyButton.prop('disabled', false);
        });
        this.fields.showTooltips.on('change', function() {
            ns.changed.general.showTooltips = $(this).val();
            enableApplyButton(true);
        });
        this.fields.settingsForm.on('submit', function(e) {
            e.preventDefault();
            ns.accessStorage(ns.changed, namespace, true);
            ns.applyChanges();
            ns.resetChanges();
            enableApplyButton(false);
        });
        this.fields.settingsForm.on('reset', ()=>{
            setTimeout(() => this.fields.volume.trigger('change'), 100);
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
                            console.log("saving: " + namespace + field + "\t" + object[field]);
                        } else {
                            let loaded = localStorage.getItem(namespace + field);
                            if (loaded !== null) object[field] = loaded;
                            console.log("loading: " + namespace + field + "\t" + loaded);
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
            object, temp, field;
        for (object in changed) {   // assign temporary changes to actual settings
            if (changed.hasOwnProperty(object)) {
                temp = changed[object];
                for (field in temp) {
                    if (temp.hasOwnProperty(field)) {
                        this[object][field] = temp[field];
                    }
                }
            }
        }   
        // reset levelDisplayed property of Operation modules, this will cause
        for (object in maths) {  // the program to reload modules next time they will be displayed
            if (maths.hasOwnProperty(object) &&  
                Object.getPrototypeOf(maths[object]) === Operation.prototype) {
                    maths[object]["levelDisplayed"] = null;
            }
        }
    },
    resetChanges: function() {
        for (let field in this.changed) {
            if (this.changed.hasOwnProperty(field)) {
                this.changed[field] = {};
            }
        }
    }

}