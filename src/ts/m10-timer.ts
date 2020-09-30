
import $ from 'jquery';


export const timer = {
    container: $('<div class="timer"></div>'),
    minutes: "00",
    seconds: "00",
    totalSecs: 0,
    totalMins: 0,
    elapsed: 0,
    setTimer: null as any,

    getTimer: function(minutes: number) {
        if (this.setTimer !== null) {
            this.stop();
        }
        let totalSecs = minutes * 60,
            totalMins = Math.floor(totalSecs / 60),
            seconds = totalSecs % 60;
            
        this.minutes = (totalMins < 10) ? "0" + totalMins : "" + totalMins;
        this.seconds = (seconds < 10) ? "0" + seconds : "" + seconds;
        this.totalSecs = totalSecs;
        this.totalMins = totalMins;
        this.show();
        return this.container;
    },

    state: function () {
        return "<b>" + this.minutes + ":" + this.seconds + "</b>"
    },

    show: function () {
        this.container.html(this.state());
    },

    start: function (callback: Function) {
        const instance = this,
              start = Date.now(),
              seconds = this.totalSecs,
              minutes = this.totalMins,
              secsModulus = this.totalSecs % 60;

        this.setTimer = setInterval(function () {

            instance.elapsed = Math.floor((Date.now() - start) / 1000) - 1;

            if (instance.elapsed >= seconds + 1) {
                clearInterval(this.setTimer);
                callback(instance.elapsed);
                return;
            }
            let minsElapsed = Math.floor(instance.elapsed / 60),
                secsElapsed = (instance.elapsed + 60) % 60,
                mins = (secsElapsed < secsModulus + 1) ? minutes - minsElapsed : minutes - minsElapsed - 1,
                secs = (secsModulus < secsElapsed) ? 60 - (secsElapsed - secsModulus) : secsModulus - secsElapsed;

            instance.minutes = (mins < 10) ? "0" + mins : "" + mins;
            instance.seconds = (secs < 10) ? "0" + secs : "" + secs;
            instance.show();
        }, 1000);
    },

    stop: function () {
        clearInterval(this.setTimer);
        this.minutes = "00";
        this.seconds = "00";
        this.setTimer = null;
        return this.elapsed;
    }

};