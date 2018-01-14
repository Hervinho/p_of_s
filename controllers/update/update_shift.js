var message, shiftId, shiftObj = {};

$(document).ready(function () {

});

function UpdateShift() {
    shiftId = $("#lbSelectedShift").html().toString();
    shiftObj = {
        shift_id: shiftId,
        shift_name: $("#txtViewShiftName").val(),
        shift_start_time: $("#txtViewShiftStartTime").val(),
        shift_end_time: $("#txtViewShiftEndTime").val()
    };

    //Validations
    if (validateEditShiftForm(shiftObj) == true) {
        //toastr.success('Oui');
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(shiftObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/shifts/',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //clear form.
                    $("#txtViewShiftName").val("");
                    $("#txtViewShiftStartTime").val("");
                    $("#txtViewShiftEndTime").val("");

                    //Reset label for selected event.
                    $("#lbSelectedShift").text('Selected Shift');

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
    } else {
        toastr.error(message);
    }

}

function validateEditShiftForm(shiftObj) {
    var flag = true, no_letters = /[a-zA-Z]/;
    var isValidTime = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
    
    /*console.log('START: ', isValidTime.test(shiftObj.shift_start_time));
    console.log('END: ', isValidTime.test(shiftObj.shift_end_time));*/

    if (!isValidTime.test(shiftObj.shift_start_time)) {
        flag = false;
        message = 'Invalid Start Time Format';
    }

    if (!isValidTime.test(shiftObj.shift_end_time)) {
        flag = false;
        message = 'Invalid End Time Format';
    }

    if(shiftObj.shift_start_time == shiftObj.shift_end_time){
        flag = false;
        message = 'Start and End Times cannot be equal';
    }

    return flag;
}
