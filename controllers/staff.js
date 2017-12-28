$(document).ready(function () {
    var message, employeeID, roleFilterTypeVal, statusFilterTypeVal, shiftFilterTypeVal;

    LoadAllEmployees();

    $(document).on('change', '.form-control', function () {
        roleFilterTypeVal = $("#employeeFilterRole").val();
        statusFilterTypeVal = $("#employeeFilterStatus").val();
        shiftFilterTypeVal = $("#employeeFilterShift").val();

        if (roleFilterTypeVal != 0 && statusFilterTypeVal == 0 && shiftFilterTypeVal == 0) {
            FilterEmployeesByRole(roleFilterTypeVal);
        } else if(roleFilterTypeVal == 0 && statusFilterTypeVal != 0 && shiftFilterTypeVal == 0){
            FilterEmployeesByStatus(statusFilterTypeVal);
        } else if(roleFilterTypeVal == 0 && statusFilterTypeVal == 0 && shiftFilterTypeVal != 0){
            FilterEmployeesByShift(shiftFilterTypeVal);
        }
        else {
            LoadAllEmployees();
        }
    });
});

function LoadAllEmployees() {

    LoadAllRoles();
    LoadAllStatuses();
    LoadAllShifts();
    LoadAllGenders();

    //Reset all filters.
    $("#employeeFilterRole").val(0);
    $("#employeeFilterStatus").val(0);
    $("#employeeFilterShift").val(0);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblEmployees tbody").html(wait);
        },
        success: handleEmployeesData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllGenders() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/genders',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.genders.length > 0) {
                var genders = data.genders;
                for (var key = 0, size = genders.length; key < size; key++) {
                    html += '<option value =' + genders[key].gender_id + ' >' +
                    genders[key].gender_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No genders found</option>';
            }

            //$("#employeeFilterGender").html(html);

            //Also Populate dialogViewEmployee
            $("#txtViewEmployeeGender").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewEmployeeInfo(id) {
    employeeID = id;
    $("#lbSelectedEmployee").text(employeeID);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees/' + employeeID,
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var employee = data.employee;
            var IdNumber = employee.employee_id_number, dob = employee.employee_dob, name = employee.employee_name, 
                genderId = employee.employee_gender_id, roleId = employee.employee_role_id, code = employee.employee_code,
                phone = employee.employee_phone, email = employee.employee_email, shiftId = employee.shift_id,
                statusId = employee.employee_status_id;

            $("#txtViewEmployeeRole").val(roleId);
            $("#txtViewEmployeeGender").val(genderId);
            $("#txtViewEmployeeStatus").val(statusId);
            $("#txtViewEmployeeShift").val(shiftId);
            $("#txtViewEmployeeIdNumber").val(IdNumber);
            $("#txtViewEmployeeDOB").val(dob);
            $("#txtViewEmployeeName").val(name);
            $("#txtViewEmployeeCode").val(code);
            $("#txtViewEmployeePhone").val(phone);
            $("#txtViewEmployeeEmail").val(email);
            console.log(phone);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllRoles() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/roles',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.roles.length > 0) {
                var roles = data.roles;
                for (var key = 0, size = roles.length; key < size; key++) {
                    html += '<option value =' + roles[key].role_id + ' >' +
                    roles[key].role_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No roles found</option>';
            }

            $("#employeeFilterRole").html(html);

            //Also Populate dialogViewEmployee
            $("#txtViewEmployeeRole").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllStatuses(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employeestatuses',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.employee_statuses.length > 0) {
                var employee_statuses = data.employee_statuses;
                for (var key = 0, size = employee_statuses.length; key < size; key++) {
                    html += '<option value =' + employee_statuses[key].employee_status_id + ' >' +
                    employee_statuses[key].employee_status_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No statuses found</option>';
            }

            $("#employeeFilterStatus").html(html);

            //Also Populate dialogViewEmployee
            $("#txtViewEmployeeStatus").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllShifts() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shifts',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.shifts.length > 0) {
                var shifts = data.shifts;
                for (var key = 0, size = shifts.length; key < size; key++) {
                    html += '<option value =' + shifts[key].shift_id + ' >' +
                    shifts[key].shift_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No shifts found</option>';
            }

            $("#employeeFilterShift").html(html);

            //Also Populate dialogViewEmployee
            $("#txtViewEmployeeShift").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterEmployeesByStatus(statusId) {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees/statuses/' + statusId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblEmployees tbody").html(wait);
        },
        success: handleEmployeesData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterEmployeesByShift(shiftId) {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees/shifts/' + shiftId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblEmployees tbody").html(wait);
        },
        success: handleEmployeesData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterEmployeesByRole(roleId) {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees/roles/' + roleId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblEmployees tbody").html(wait);
        },
        success: handleEmployeesData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleEmployeesData(data) {

    var html = '';
    if (data && data.status == 1 && data.employees.length > 0) {
        var employees = data.employees;
        for (var key = 0, size = employees.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
            employees[key].employee_id_number + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
            employees[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                employees[key].employee_phone + '</td><td class="mdl-data-table__cell--non-numeric">' +
                employees[key].employee_code + '<td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewEmployee" onclick="return ViewEmployeeInfo(\'' + employees[key].employee_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td><td class="mdl-data-table__cell--non-numeric">' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblEmployees tbody").html(html);
}
