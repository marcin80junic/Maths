
maths.settings = {
    name: "settings",
    isLoaded: false,
    fields: {
        volume: $('#volume'),
        applyButton: $('#settings-apply'),
        settingsForm: $('#settings-form')
    },
    system: {
        volume: 50
    },
    general: {
        showTooltips: true,
        isRandomized: true
    },
    changed: {
        system: {},
        general: {},
        fractions: {},
        test: {}
    },

    init: function() {
        let ns = maths.settings;

        this.loadSettings();
        this.isLoaded = true;

        this.fields.volume.on('input change', function() {
            $('#volume-label').html($(this).val() + "%");
            ns.changed.system.volume = this.value;
            ns.fields.applyButton.prop('disabled', false);
        });
        this.fields.volume.val(this.system.volume);
        $('#volume-label').html(this.system.volume + "%");

        this.fields.settingsForm.on('submit', function(e) {
            e.preventDefault();
            ns.saveSettings(ns.changed, "maths.settings.");
            ns.resetChanges();
            ns.fields.applyButton.prop('disabled', true);
        });

    },
    loadSettings: function() {
        try {
            if (typeof (Storage) !== "undefined") {
                for (let field in this.system) {
                    if (this.system.hasOwnProperty(field)) {
                        let loaded = localStorage.getItem("maths.settings.system." + field) || "50";
                        if (loaded !== undefined) this.system[field] = loaded;
                    }
                }
            } 
        }   catch (error) {
            alert("can't access the local storage\nall settings will be restored to its default values");
        }
    },
    saveSettings: function(object, namespace) {
        try {
            if (typeof (Storage) !== "undefined") {
                for (let field in object) {
                    if (object.hasOwnProperty(field)) {
                        if (typeof object[field] === 'object') {    // obtaining all values recursively
                            this.saveSettings(object[field], namespace + field + ".");
                        }
                        else localStorage.setItem(namespace + field, object[field]);
                    }
                }
            }
        } catch(error) {
            alert("can't access the local storage");
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