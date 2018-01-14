var message, bookingId, bookingObj = {};

$(document).ready(function () {
    //Pick up changes in all select elements.
    $(document).on('change', '.shift-change, .booking-status-change', function () {

    });
});

function UpdateBooking(){
    bookingId = $("#lbSelectedShiftBooking").html().toString();
    bookingObj = {
        shift_booking_id: bookingId,
        employee_id: parseInt($("#txtViewBookingEmployee").val()),
        shift_id: parseInt($("#txtViewBookingShift").val()),
        booking_status_id: parseInt($("#txtViewBookingStatus").val()),
        booking_date: $("#txtViewBookingDate").val()
    };

    //Validations
    if (validateEditBookingForm(bookingObj) == true) {
        //console.log(bookingObj);
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(bookingObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/shiftbookings',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //clear form.
                    $("#txtViewBookingEmployee").val(0);
                    $("#txtViewBookingShift").val(0);
                    $("#txtViewBookingStatus").val(0);
                    $("#txtViewBookingTimestamp").val("");
                    $("#txtViewBookingDate").val("");

                    //Reset label for selected event.
                    $("#lbSelectedShiftBooking").text('Selected Shift Booking');

                    //Reload page.
                    setTimeout(function() {
                        location.reload();
                    }, 500);
                }
            },
            error: function (e) {
                console.log(e);
                message = 'Something went wrong';
                toastr.error(message);
            }

        });
    }
    else{
        toastr.error(message);
    }
}

function validateEditBookingForm(bookingObj){
    var flag = true;
    var bookingdate = bookingObj.booking_date;
    var isValidDate = moment(bookingdate.toString(), "YYYY-MM-DD", true).isValid();

    if(!isValidDate){
        flag = false;
        message = 'Invalid date provided.';
    }

    if(bookingObj.shift_id == 0){
        flag = false;
        message = 'No shift selected. Please select a shift';
    }

    if(bookingObj.booking_status_id == 0){
        flag = false;
        message = 'No status selected. Please select a status for your booking.';
    }

    return flag;
}