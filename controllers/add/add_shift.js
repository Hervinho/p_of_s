var message, shiftObj = {};

$(document).ready(function () {
    //Pick up changes in all select elements.
    $(document).on('change', '.shift-time', function () {

    });
});

function AddShift(){
    shiftObj = {
        shift_name: $("#txtShiftName").val(),
        shift_start_time: $("#txtShiftStartTime").val(),
        shift_end_time: $("#txtShiftEndTime").val(),
    };

    //Validations
    if (validateAddShiftForm(shiftObj) == true) {
        //toastr.info("Hey");
        $.ajax({
            type: 'POST',
            crossDomain: true,
            data: JSON.stringify(shiftObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/shifts',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //clear form.
                    $("#txtShiftName").val("");
                    $("#txtShiftStartTime").val("");
                    $("#txtShiftEndTime").val("");

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

function validateAddShiftForm(shiftObj){
    var flag = true;
    var starttime = shiftObj.shift_start_time, endtime = shiftObj.shift_end_time;
    var isValidStartTime = moment(starttime.toString(), "HH:mm:ss", true).isValid(), 
        isValidEndTime = moment(endtime.toString(), "HH:mm:ss", true).isValid();
    var no_numbers = /\d/, name_format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var start = moment(starttime, "HH:mm:ss"), end = moment(endtime, "HH:mm:ss");
    var check = start.isBefore(end);
    console.log('Check: ', check);

    if(!isValidStartTime || !isValidEndTime){
        flag = false;
        message = 'Invalid time provided.';
    }

    if(start.isBefore(end) == false){
        flag = false;
        message = 'Start Time cannot be greater than or equal to End Time';
    }

    if (name_format.test(shiftObj.shift_name) || no_numbers.test(shiftObj.shift_name)) {
        flag = false;
        message = 'Shift Name contains illegal characters.';
    }

    if (shiftObj.shift_name.length <= 3) {
        flag = false;
        message = 'Shift Name is too short.';
    }

    return flag;
}