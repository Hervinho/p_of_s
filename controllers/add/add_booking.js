var message, bookingObj = {};

$(document).ready(function () {
    //Pick up changes in all select elements.
    $(document).on('change', '.shift-change', function () {

    });
});

function AddBooking(){
    bookingObj = {
        shift_id: parseInt($("#txtAddBookingShift").val()),
        booking_date: $("#txtAddBookingDate").val()
    };

    //Validations
    if (validateAddBookingForm(bookingObj) == true) {
        //toastr.info("Hey");
        $.ajax({
            type: 'POST',
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
                    $("#txtAddBookingShift").val(0);
                    $("#txtAddBookingDate").val("");

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

function validateAddBookingForm(bookingObj){
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

    return flag;
}