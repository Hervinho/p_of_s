/*jslint browser: true*/
/*global $, MaterialTextfield, jQuery*/
(function ($) {
    'use strict';
    $(function () {
        //initial modal function
        modal();
        var modalOpen = false;
        //format date to YYYY-MM-DD
        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            return [year, month, day].join('-');
        }

        function formatTime(time) {
            var d = new Date(time),
                hours = '' + n(d.getHours()),
                minutes = '' + n(d.getMinutes()),
                seconds = '' + n(d.getSeconds());
            return [hours, minutes, seconds].join(':');
        }
        var _date = new mdDateTimePicker.default({
            type: 'date',
            past: moment('2016-02-29', 'YYYY-MM-DD'),
            future: moment('2050-02-29', 'YYYY-MM-DD'),
            orientation: 'PORTRAIT'
        });
        var _time = new mdDateTimePicker.default({
            type: 'time',
            init: moment('10:5 PM', 'h:m A'),
            orientation: 'PORTRAIT'
        });
        // Event
        $('#start_date').on('click', function () {
            modalOpen = !modalOpen;
            _date.toggle();
            _date.trigger = document.getElementById('start_date');
        });
        $('#start_date').on('onOk', function () {
            modalOpen = !modalOpen;
            this.value = formatDate(_date.time).toString();
        });
        $('#start_date').on('onCancel', function () {
            modalOpen = !modalOpen;
        });
        // PROGRAM
        $('.program-date').each(function () {
            $(this).on('click', function () {
                modalOpen = !modalOpen;
                _date.toggle();
                _date.trigger = document.getElementById($(this).attr('id'));
            });
            $(this).on('onOk', function () {
                modalOpen = !modalOpen;
                this.value = formatDate(_date.time).toString();
            });
            $(this).on('onCancel', function () {
                modalOpen = !modalOpen;
            });
        });
        $('.program-time').each(function () {
            $(this).on('click', function () {
                modalOpen = !modalOpen;
                _time.toggle();
                _time.trigger = document.getElementById($(this).attr('id'));
            });
            $(this).on('onOk', function () {
                modalOpen = !modalOpen;
                this.value = formatTime(_time.time).toString();
            });
            $(this).on('onCancel', function () {
                modalOpen = !modalOpen;
            });
        });
        //Modal
        function modal() {
            $('.form-close, .form-modal button').on('click', function () {
                if (modalOpen) {
                    _date.toggle();
                    _time.toggle();
                }
                $(this).closest('.form-modal').fadeOut('fast');
                $(this).closest('.form-modal').addClass('exit');
                var that = this;
                setTimeout(function () {
                    $('main').css('overflow', 'auto');
                    $('.form-modal .mdl-textfield__input').val("");
                    $(that).closest('.form-modal').fadeOut('fast');
                    $(that).closest('.form-modal').removeClass('exit');
                }, 400);
            });
            $('.mdl-layout__content').on('click', '.modal-trigger', function () {
                $($(this).attr('data-target')).show();
            });
        };

        function n(n) {
            return n > 9 ? "" + n : "0" + n;
        }
    }); // end of document ready
}(jQuery)); // end of jQuery name space