var message, employeeObj = {};

$(document).ready(function () {

});

function ForgotPassword() {
    employeeObj = {
        employee_id_number: $("#txtEmployeeIdNumber").val(),
        employee_code: $("#txtEmployeeCode").val(),
        new_password: $("#txtEmployeeNewPassword").val(),
        confirm_password: $("#txtEmployeeConfirmPassword").val()
    };

    //Validations
    if (validateForm(employeeObj) == true) {
        //toastr.success('Oui');
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(employeeObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/employees/password/forgot',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    
                    //clear form.
                    $("#txtEmployeeIdNumber").val("");
                    $("#txtEmployeeCode").val("");
                    $("#txtEmployeeNewPassword").val("");
                    $("#txtEmployeeConfirmPassword").val("");
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

function validateForm(employeeObj) {
    var flag = true;
    var special_char = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var numbers = /\d/;
    //console.log('new: ', employeeObj.new_password);
    //console.log('confirm: ', employeeObj.confirm_password);

    if (employeeObj.new_password != employeeObj.confirm_password) {
        flag = false;
        message = 'Passwords do not match.';
    }

    if((employeeObj.new_password.length <= 7) || (employeeObj.confirm_password.length <= 7)){
        flag = false;
        message = 'Password must be at least 8 character-long.';
    }

    if((employeeObj.employee_id_number.length < 7)){
        flag = false;
        message = 'ID Number is too short.';
    }

    if((employeeObj.employee_code.length < 6)){
        flag = false;
        message = 'Employee Code is too short.';
    }

    if(!special_char.test(employeeObj.new_password) || !special_char.test(employeeObj.confirm_password)){
        flag = false;
        message = 'Password must have at least 1 special character ';
    }

    if(!numbers.test(employeeObj.new_password) || !numbers.test(employeeObj.confirm_password)){
        flag = false;
        message = 'Password must have at least 1 number.';
    }

    if(special_char.test(employeeObj.employee_id_number)){
        flag = false;
        message = 'ID Number cannot have special characters';
    }

    if(special_char.test(employeeObj.employee_code)){
        flag = false;
        message = 'Employee Code cannot have special characters';
    }

    return flag;
}