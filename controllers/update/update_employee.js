var message, employeeId, employeeObj = {};

$(document).ready(function () {
    //Pick up changes in all select elements.
    $(document).on('change', '.employee-status-change, .employee-gender-change, .employee-role-change', function () {

    });
});

function UpdateEmployee(){
    employeeId = $("#lbSelectedEmployee").html().toString();
    employeeObj = {
        employee_id: employeeId,
        /*employee_name: $("#txtViewEmployeeName").val(),
        employee_code: $("#txtViewEmployeeCode").val(),
        employee_phone: $("#txtViewEmployeePhone").val(),
        employee_email: $("#txtViewEmployeeEmail").val(),
        employee_gender_id: parseInt($("#txtViewEmployeeGender").val()),*/
        employee_role_id: parseInt($("#txtViewEmployeeRole").val()),
        employee_status_id: parseInt($("#txtViewEmployeeStatus").val())
    };

    //Validations
    if (validateEditEmployeeForm(employeeObj) == true) {
        //toastr.success('Oui');
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(employeeObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/employees/',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //clear form.
                    $("#txtViewEmployeeName").val("");
                    $("#txtViewEmployeeCode").val("");
                    $("#txtViewEmployeePhone").val("");
                    $("#txtViewEmployeeEmail").val("");
                    $("#txtViewEmployeeGender").val(0);
                    $("#txtViewEmployeeRole").val(0);
                    $("#txtViewEmployeeStatus").val(0);

                    //Reset label for selected event.
                    $("#lbSelectedEmployee").text('Selected Employee');

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

function validateEditEmployeeForm(employee) {
    var flag = true;
    
    if(employee.employee_role_id === 0){
        flag = false;
        message = 'No role selected. Please select a role.';
    }
    if(employee.employee_status_id === 0){
        flag = false;
        message = 'No status selected. Please select a status.';
    }

    return flag;
}