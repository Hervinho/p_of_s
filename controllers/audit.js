$(document).ready(function () {

    LoadAllAudits();

    $(document).on('change', '.form-control', function () {
        
    });
});

function LoadAllAudits() {

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/audits',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblAudits tbody").html(wait);
        },
        success: handleAuditData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleAuditData(data) {

    var html = '';
    if (data && data.status == 1 && data.audits.length > 0) {
        var audits = data.audits;
        for (var key = 0, size = audits.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
            audits[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
            audits[key].action_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
            audits[key].timestamp + '</td><td class="mdl-data-table__cell--non-numeric">' +
            audits[key].description + '</td></tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblAudits tbody").html(html);
}