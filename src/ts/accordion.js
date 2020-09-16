(function () {

    let headers = document.querySelectorAll('.accordion .accordion-header'),
        first = document.querySelectorAll('.accordion .selected');

    Array.prototype.forEach.call(first, function (head) {    // initialization
        let content = head.nextElementSibling,
            height = content.scrollHeight;
        content.style.setProperty('height', height + 'px');
    });

    Array.prototype.forEach.call(headers, function (head) {  // handler
        head.addEventListener('click', () => {
            if (!head.classList.contains('selected')) {
                let height = head.nextElementSibling.scrollHeight;
                hideOpen(head.parentNode);
                head.nextElementSibling.style.setProperty('height', height + 'px');
                head.classList.toggle('selected');
            }
        });
    });

    function hideOpen(accordion) {
        let open = accordion.querySelectorAll('.selected');
        Array.prototype.forEach.call(open, function (head) {
            head.nextElementSibling.style.setProperty('height', '0');
            head.classList.remove('selected');
        });
    }

}());