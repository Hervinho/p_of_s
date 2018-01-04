var message, shiftBookingID, bookingFilterEmployeeVal, bookingFilterShiftVal;

$(document).ready(function () {
    LoadAllBookings();

    $(document).on('change', '.form-control', function () {
        bookingFilterEmployeeVal = $("#bookingFilterEmployee").val();
        bookingFilterShiftVal = $("#bookingFilterShift").val();

        if (bookingFilterEmployeeVal != 0 && bookingFilterShiftVal == 0) {
            FilterBookingsByEmployee(bookingFilterEmployeeVal);
        } 
        else if(bookingFilterEmployeeVal == 0 && bookingFilterShiftVal != 0){
            FilterBookingsByShift(bookingFilterShiftVal);
        }
        else {
            LoadAllBookings();
        }
    });
});

function LoadAllBookings(){
    LoadAllEmployees();
    LoadAllShifts();

    //Reset all filters.
    $("#bookingFilterEmployee").val(0);
    $("#bookingFilterShift").val(0);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shiftbookings',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblShiftBookings tbody").html(wait);
        },
        success: handleBookingsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllEmployees(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.employees.length > 0) {
                var employees = data.employees;
                for (var key = 0, size = employees.length; key < size; key++) {
                    html += '<option value =' + employees[key].employee_id + ' >' +
                    employees[key].employee_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No employees found</option>';
            }

            $("#bookingFilterEmployee").html(html);

            //Also Populate dialogViewBooking
            $("#txtViewBookingEmployee").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllShifts(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shifts',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.shifts.length > 0) {
                var shifts = data.shifts;
                for (var key = 0, size = shifts.length; key < size; key++) {
                    html += '<option value =' + shifts[key].shift_id + ' >' +
                    shifts[key].shift_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No shifts found</option>';
            }

            $("#bookingFilterShift").html(html);

            //Also Populate dialogViewBooking
            $("#txtViewBookingShift").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterBookingsByEmployee(id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shiftbookings/employees/' + id,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblShiftBookings tbody").html(wait);
        },
        success: handleBookingsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterBookingsByShift(id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shiftbookings/shifts/' + id,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblShiftBookings tbody").html(wait);
        },
        success: handleBookingsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewBookingInfo(id) {
    shiftBookingID = id;
    $("#lbSelectedShiftBooking").text(shiftBookingID);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shiftbookings/' + id,
        dataType: "json",
        cache: false,
        success: function (data) {
            console.log(data);
            var booking = data.booking;
            var employeeId = booking.employee_id, shiftId = booking.shift_id,
                timestamp = booking.booking_timestamp, bookingDate = booking.booking_date;

            $("#txtViewBookingEmployee").val(employeeId);
            $("#txtViewBookingShift").val(shiftId);
            $("#txtViewBookingTimestamp").val(timestamp);
            $("#txtViewBookingDate").val(bookingDate);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleBookingsData(data) {
    var html = '';
    if (data && data.status == 1 && data.bookings.length > 0) {
        var bookings = data.bookings;
        for (var key = 0, size = bookings.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                bookings[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                bookings[key].booking_date + '</td><td class="mdl-data-table__cell--non-numeric">' +
                bookings[key].booking_timestamp + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewBooking" onclick="return ViewBookingInfo(\'' + bookings[key].shift_booking_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblShiftBookings tbody").html(html);
}