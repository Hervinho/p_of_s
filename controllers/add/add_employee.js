var message, employeeObj = {};

$(document).ready(function () {
    //Pick up changes in all select elements.
    $(document).on('change', '.gender-change, .role-change', function () {

    });
});

function AddEmployee(){
    employeeObj = {
        employee_id_number: $("#txtAddEmployeeIdNumber").val(),
        employee_dob: $("#txtAddEmployeeDOB").val(),
        employee_name: $("#txtAddEmployeeName").val(),
        employee_email: $("#txtAddEmployeeEmail").val(),
        employee_phone: $("#txtAddEmployeePhone").val(),
        employee_gender_id: parseInt($("#txtAddEmployeeGender").val()),
        employee_role_id: parseInt($("#txtAddEmployeeRole").val())
    };

    //Validations
    if (validateAddEmployeeForm(employeeObj) == true) {
        //toastr.info("Yay");
        $.ajax({
            type: 'POST',
            crossDomain: true,
            data: JSON.stringify(employeeObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/employees',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //clear form.
                    $("#txtAddEmployeeIdNumber").val("");
                    $("#txtAddEmployeeDOB").val("");
                    $("#txtAddEmployeeName").val("");
                    $("#txtAddEmployeeEmail").val("");
                    $("#txtAddEmployeePhone").val("");
                    $("#txtAddEmployeeGender").val(0);
                    $("#txtAddEmployeeRole").val(0);
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

function validateAddEmployeeForm(employeeObj){
    var flag = true;
    var dob = employeeObj.employee_dob;
    var isValidDate = moment(dob.toString(), "YYYY-MM-DD", true).isValid();
    var name_format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var no_numbers = /\d/, no_letters = /[a-zA-Z]/;
    var isMobilePhone = validator.isMobilePhone(employeeObj.employee_phone, 'en-ZA');
    var isEmail = validator.isEmail(employeeObj.employee_email);
    //console.log(employeeObj.employee_id_number.substr(0,1));


    if (no_letters.test(employeeObj.employee_id_number) || name_format.test(employeeObj.employee_id_number) ||
        employeeObj.employee_id_number.length < 9
    ) {
        flag = false;
        message = 'Employee ID Number invalid.';
    }

    if(employeeObj.employee_id_number.substr(0,1) == 0){
        flag = false;
        message = 'Employee ID Number cannot start with zero.';
    }

    if (name_format.test(employeeObj.employee_name) || no_numbers.test(employeeObj.employee_name)) {
        flag = false;
        message = 'Employee Name contains illegal characters.';
    }

    if(!isValidDate){
        flag = false;
        message = 'Invalid date of birth provided.';
    }

    if (employeeObj.employee_name.length <= 2) {
        flag = false;
        message = 'Employee Name is too short.';
    }

    if (!isEmail) {
        flag = false;
        message = 'Invalid email format for employee email.';
    }
    if(!isMobilePhone){
        flag = false;
        message = 'Invalid Phone format for employee.';
    }

    if (employeeObj.employee_gender_id === 0 || employeeObj.employee_gender_id === null || employeeObj.employee_gender_id === undefined) {
        flag = false;
        message = 'No gender selected. Please select a gender';
    }

    if (employeeObj.employee_role_id === 0 || employeeObj.employee_role_id === null || employeeObj.employee_role_id === undefined) {
        flag = false;
        message = 'No role selected. Please select a role';
    }

    return flag;
}