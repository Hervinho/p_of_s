var message, passwordObj = {};

$(document).ready(function () {

});

function ResetPassword() {
    passwordObj = {
        current_password: $("#txtViewEmployeeCurrentPass").val(),
        new_password: $("#txtViewEmployeeNewPass").val(),
        confirm_password: $("#txtViewEmployeeConfirmNewPass").val()
    };

    //Validations
    if (validateEditPasswordForm(passwordObj) == true) {
        toastr.success('Oui');
        /*$.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(passwordObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/employees/profile',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                }
            },
            error: function (e) {
                console.log(e);
                message = 'Something went wrong';
                toastr.error(message);
            }

        });*/
    } else {
        toastr.error(message);
    }
}

function validateEditPasswordForm(passwordObj) {
    var flag = true;
    var special_char = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var numbers = /\d/;
    console.log('current: ', passwordObj.current_password);
    console.log('new: ', passwordObj.new_password);
    console.log('confirm: ', passwordObj.confirm_password);

    if (passwordObj.new_password != passwordObj.confirm_password) {
        flag = false;
        message = 'Passwords do not match.';
    }
    if ((passwordObj.current_password == passwordObj.new_password) || (passwordObj.current_password == passwordObj.confirm_password)) {
        flag = false;
        message = 'Current and new password cannot be the same.';
    }

    if((passwordObj.new_password.length <= 7) || (passwordObj.confirm_password.length <= 7)){
        flag = false;
        message = 'Password must be at least 8 character-long.';
    }

    if(!special_char.test(passwordObj.new_password) || !special_char.test(passwordObj.confirm_password)){
        flag = false;
        message = 'Password must have at least 1 special character ';
    }

    if(!numbers.test(passwordObj.new_password) || !numbers.test(passwordObj.confirm_password)){
        flag = false;
        message = 'Password must have at least 1 number.';
    }

    return flag;
}