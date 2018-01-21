$(document).ready(function () {
    
    GetPreviousShiftData();
    CheckPreviousOrdersInShift();
 });

 function GetPreviousShiftData(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/total/shifts',
        dataType: "json",
        cache: false,
        success: handlePreviousShiftData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
 }

 function CheckPreviousOrdersInShift(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/pettycash/check',
        dataType: "json",
        cache: false,
        success: handlePreviousOrdersInShiftData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
 }

 function CapturePettyCash(){
    //console.log($("#txtPettyCash").val());
    var obj = {amount: $("#txtPettyCash").val()};

    $.ajax({
        type: 'POST',
        crossDomain: true,
        data: JSON.stringify(obj),
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/pettycash',
        dataType: "json",
        cache: false,
        success: function(data){
            if(data.status == 1){
                toastr.success(data.message);
                $('#captureButton').attr('disabled', true);
            }
            else{
                toastr.eror(data.message);
            }
        },
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
 }

 /****** AJAX Callback functions ********/
 function handlePreviousShiftData(data){
    //console.log(data);
    var message = data.message, name = data.shift_name, start = data.shift_start, end = data.shift_end, 
        total = data.total === undefined ? 0 : data.total, html = '', html_message = '';

    if(data.status == 1){
        html_message += '<p>Message: '+ message + '</p>';
    }
    else{
        html_message += '<p style="color: red;"><strong>Message: </strong>'+ message + '</p>';
    }

    html += '<p><strong>Previous Shift: </strong>'+ name + '</p>' +
        '<p><strong>Start - End: </strong>'+ start + ' -- ' + end + '</p>' +
        '<p><strong>Total: R </strong>'+ total + '</p>' + html_message;

    $("#PreviousShiftInfo ").html(html);
 }

 function handlePreviousOrdersInShiftData(data){
    console.log(data);

    if(data.status == 1){
        //prompt to capture petty cash.
        toastr.info(data.message);
        $('#captureButton').attr('disabled', false);
    }
    else{
        console.log(data.message);
    }
 }