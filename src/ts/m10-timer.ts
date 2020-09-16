import $ from 'jquery';


export const timer = {
    container: $('<div class="timer"></div>'),
    minutes: "00",
    seconds: "00",
    secondsElapsed: 0,
    init: function (parent: JQuery, time: number, callback: Function) {
        parent.append(this.container);
        if (this.setTimer !== null) {
            this.stop();
        }
        this.start(time, callback);
    },
    state: function () {
        return "<b>" + this.minutes + ":" + this.seconds + "</b>"
    },
    show: function () {
        this.container.html(this.state());
    },
    setTimer: null as any,
    start: function (minutes: number, callback: Function) {
        let count = minutes * 60,
            seconds = count % 60;
        minutes = Math.floor(count / 60);
        this.minutes = (minutes < 10) ? "0" + minutes : "" + minutes;
        this.seconds = (seconds < 10) ? "0" + seconds : "" + seconds;
        this.show();
        var instance = this;
        var start = Date.now();
        this.setTimer = setInterval(function () {
            var elapsed = Math.floor((Date.now() - start) / 1000) - 1;
            instance.secondsElapsed = elapsed;
            if (elapsed >= count + 1) {
                clearInterval(this.setTimer);
                callback(instance.secondsElapsed);
                return;
            }
            var secsElapsed = (elapsed + 60) % 60;
            var secs = (seconds < secsElapsed) ? 60 - (secsElapsed - seconds) : seconds - secsElapsed;
            var minsElapsed = Math.floor(elapsed / 60);
            var mins = (secsElapsed < seconds + 1) ? minutes - minsElapsed : minutes - minsElapsed - 1;
            instance.minutes = (mins < 10) ? "0" + mins : "" + mins;
            instance.seconds = (secs < 10) ? "0" + secs : "" + secs;
            instance.show();
        }, 1000);
    },
    stop: function () {
        clearInterval(this.setTimer);
        return this.secondsElapsed;
    }
};