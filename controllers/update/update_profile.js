var message, profileObj = {};

$(document).ready(function () {

});

function UpdateProfile() {
    profileObj = {
        employee_phone: $("#txtViewEmployeePhone").val(),
        employee_email: $("#txtViewEmployeeEmail").val(),
    };

    //Validations
    if (validateEditProfileForm(profileObj) == true) {
        //toastr.success('Oui');
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(profileObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/employees/profile',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //Update UI.
                    $("#txtViewEmployeePhone").val(data.employee_phone);
                    $("#txtViewEmployeeEmail").val(data.employee_email);
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

function validateEditProfileForm(profileObj) {
    var flag = true;
    var isMobilePhone = validator.isMobilePhone(profileObj.employee_phone, 'en-ZA');
    var isEmail = validator.isEmail(profileObj.employee_email);

    if (!isEmail) {
        flag = false;
        message = 'Invalid email format for employee email.';
    }
    if (!isMobilePhone) {
        flag = false;
        message = 'Invalid Phone number.';
    }

    return flag;
}