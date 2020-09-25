import $ from 'jquery';
import { maths } from "./m02-maths";


export const dialog = {

    container: $('.dialog'),
    title: $('.dialog-head-title'),
    custom: $('.dialog-head-custom'),
    closeBtn: $('.dialog-head-close'),
    body: $('.dialog-body'),
    dimmer: $('#dim'),

    init: function(content: JQuery, options: any) {
        if (options.title) {
            this.title.text(options.title);
        }
        if (options.custom) {
            this.custom.append(options.custom);
        }
        this.body.append(content);
        this.dimmer.addClass('active');
        this.container.addClass('active');
        this.closeBtn.on('click', function() {
            maths.dialog.dispose(options.callback? options.callback: null);
        } );
        $('body').addClass('body-hidden-overflow');
    },

    dispose: function(callback: Function) {
        this.closeBtn.off();
        this.container.removeClass('active');
        this.dimmer.removeClass('active');
        this.body.empty();
        this.custom.empty();
        this.title.text('');
        if (callback) {
            callback();
        }
        $('body').removeClass('body-hidden-overflow');
    },

}