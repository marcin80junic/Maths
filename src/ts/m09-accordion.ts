import type { content } from './types';
import $ from 'jquery';
import { maths } from './m02-maths';


export const accordion = {

    container: $('<div class="accordion"></div>'),
    headerElements: $(),
    contentElements: $(),

    last: () => maths.accordion.headerElements.last(),

    start: function() {
        this.headerElements
            .not(this.last())
            .prop('disabled', false);
        this.show(this.headerElements.eq(1)[0], 1);
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
        this.container.append(header, content);
    },

    attachListeners: function () {
        $(this.headerElements).on("click", function () {
            if (!$(this).is(maths.accordion.last())) {
                maths.accordion.show(this, maths.accordion.headerElements.index($(this)));
            }
        });
    },

    show: function (header: HTMLElement, index: number) {
        let $header = $(header),
            $content = $header.next(),
            height = $content[0].scrollHeight;
        if (!$header.is('selected')) {
            this.headerElements.removeClass("selected");    
            $header.addClass('selected');               // styling for selected header
            this.contentElements.css('height', '0');    // hide all elements
            $content.css('height', height + 'px');      // height value is required for transition to work
        }
    },

    unfold: function () {
        this.contentElements.css('height', 'auto');
        this.headerElements
            .addClass('selected')
            .not(this.last())
            .prop('disabled', true);
    },

    scrollTo: function (index: number) {
        if (index < 0 || index > this.headerElements.length - 1) {
            throw new Error(`couldn't find the header at index ${ index }`);
        }
        this.headerElements.eq(index)[0].scrollIntoView();
    }, 

    dispose: function () {
        this.container.empty();
        this.headerElements = null;
        this.contentElements = null;
    }

}
