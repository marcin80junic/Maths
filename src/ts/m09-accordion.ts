import type { content } from './types';
import $ from 'jquery';
import { maths } from './m02-maths';


export const accordion = {

    container: $('<div class="accordion"></div>'),
    headerElements: $(),
    contentElements: $(),

    start: function() {
        this.headerElements.not(this.headerElements.last()).prop('disabled', false);
        this.show(this.headerElements.eq(1)[0]);
    },

    init: function (contentObj: content) {
        for (const name in contentObj) {
            if (contentObj.hasOwnProperty(name)) {
                this.createSection(name, contentObj[name as keyof content]);
            }
        }
        this.headerElements = $(this.container.find('.accordion-header'));
        this.contentElements = $(this.container.find('.accordion-content'));
        this.headerElements
            .first()
            .prop('disabled', false)
            .addClass("selected");
        this.contentElements
            .first()
            .show();
        this.attachListeners();
        return this.container;
    },

    createSection: function (head: string, cont: string) {
        let header = $('<button class="accordion-header">' + head + '</button>'),
            content = $('<div class="accordion-content">' + cont + '</div>');
        header.prop('disabled', true);
        content.hide();
        this.container.append(header, content);
    },

    attachListeners: function () {
        $(this.headerElements).on("click", function () {
            if (!$(this).is(maths.accordion.headerElements.last())) {
                maths.accordion.show(this);
            }
        });
    },

    show: function (header: HTMLElement, index: number) {
        let $header = $(header),
            $content = $header.next();
        if ($content.is(':hidden')) {
            $(this.headerElements).removeClass("selected");
            $(this.contentElements).hide();
            $header.addClass("selected");
            $content.show();
        }
    },

    unfold: function () {
        this.contentElements.forEach(function (content: JQuery) {
            content.show();
        });
    },

 /*   scrollTo: function (index: number) {
        if (!index) {
            throw new Error("couldn't find the header");
        }
        this.headerElements.forEach((val: JQuery) => val.removeClass("selected"));
        this.headerElements[index].addClass("selected");
        this.headerElements[index][0].scrollIntoView();
    }, */

    dispose: function () {
        this.container.empty();
        this.headerElements = null;
        this.contentElements = null;
    }

}
