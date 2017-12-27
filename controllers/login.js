var employee = {},
    message;

$(document).ready(function () {

});

function Login() {

    employee = {
        employee_code: $("#txtEmployeeCode").val(),
        employee_password: $("#txtEmployeePassword").val()
    };

    //Validations
    if (ValidateFormInput(employee) == true) {
        //toastr.info("Yes");
        $.ajax({
            type: 'POST',
            crossDomain: true,
            data: JSON.stringify(employee),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/employees/login/',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else if (data.status == 1 && typeof data.redirect == 'string') {
                    console.log(data);
                    //window.location.replace(window.location.protocol + "//" + window.location.host + data.redirect);
                }
            },
            error: function (e) {
                console.log(e);
                message = 'Something went wrong'
                toastr.error(message);
            }

        });
    } else {
        toastr.error(message);
    }

}

function ValidateFormInput(employee) {
    var flag = true;
    if (employee.employee_code.length <= 0 || employee.employee_code === null) {
        flag = false;
        message = 'Employee Code cannot be empty.';
    }
    if (employee.employee_password <= 0 || employee.employee_password === null) {
        flag = false;
        message = 'Employee Password cannot be empty.';
    }

    return flag;
}
