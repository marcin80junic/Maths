
import $ from 'jquery';
import { maths } from './m03-maths';


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

    init: function (contentObj: object) {
        for (const name in contentObj) {
            if (contentObj.hasOwnProperty(name)) {
                this.createSection(name, contentObj[name as keyof object]);
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
        if (!maths.isTouchscreen) {
            header.addClass("no-touch");
        }
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

    showSummary: function () {
        this.last()[0].scrollIntoView();
    }, 

    dispose: function () {
        this.container.empty();
        this.headerElements = null;
        this.contentElements = null;
    }

}
