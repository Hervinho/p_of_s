$(document).ready(function () {
    var message, productID, productFilterTypeVal;

    LoadAllProducts();

    $(document).on('change', '.form-control', function() {
        productFilterTypeVal = $("#productFilterType").val();

        if(productFilterTypeVal != 0){
          FilterProductsByType(productFilterTypeVal);
        }
        else{
          LoadAllProducts();
        }
    });
});

function LoadAllProducts(){

  LoadAllProductTypes();

  //Reset all filters.
  $("#productFilterType").val(0);

  $.ajax({
          type: 'GET',
          crossDomain: true,
          contentType: 'application/json; charset=utf-8',
          url: '/api/v1/products',
          dataType: "json",
          cache: false,
          beforeSend: function() {
              var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
              $("#tblProducts tbody").html(wait);
          },
          success: handleProductsData,
          error: function(e){
            message = "Something went wrong";
            toastr.error(message);
          }

        });
}

function ViewEventInfo(id) {
    productID = id;
    $("#lbSelectedEvent").text(productID);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/events/' + productID,
        dataType: "json",
        cache: false,
        success: function(data) {
            //toastr.info(data[0].event_id);
            var eventName = data[0].event_name;
            var eventDesc = data[0].event_desc;
            var eventBackground = data[0].event_background;
            var eventDays = data[0].num_days;
            var eventType = data[0].event_type_name;
            var productTypeId = data[0].event_type_id;

            $("#txtViewEventName").val(eventName);
            $("#txtViewEventType").val(productTypeId);
            $("#txtViewEventDescription").val(eventDesc);
            $("#txtViewEventBackground").val(eventBackground);
            $("#txtViewEventNumOfDays").val(eventDays);
        },
        error: function(e) {
          message = "Something went wrong";
          toastr.error(message);
        }

    });
}

function LoadAllProductTypes() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/producttypes',
        dataType: "json",
        cache: false,
        success: function(data) {
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.product_types.length > 0) {
                var product_types = data.product_types;
                for (var key = 0, size = product_types.length; key < size; key++) {
                  html += '<option value =' + product_types[key].product_type_id + ' >' +
                  product_types[key].product_type_name +
                      '</option>';
                }
            } else {
                html += '<option value = "0">No product types found</option>';
            }

            $("#productFilterType").html(html);

            //Also Populate product types in the dialogViewProduct
            //$("#txtViewEventType").html(html);
        },
        error: function(e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterProductsByType(productTypeId){
  $.ajax({
          type: 'GET',
          crossDomain: true,
          contentType: 'application/json; charset=utf-8',
          url: '/api/v1/products/types/' + productTypeId,
          dataType: "json",
          cache: false,
          beforeSend: function() {
              var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
              $("#tblProducts tbody").html(wait);
          },
          success: handleProductsData,
          error: function(e){
              console.log(e);
            message = "Something went wrong";
            toastr.error(message);
          }

        });
}

/*********** AJAX Callback functions ***********/

function handleProductsData(data){
    
      var html = '';
      if(data && data.status == 1 && data.products.length > 0){
          var products = data.products;
        for (var key = 0, size = products.length; key < size; key++) {
          html += '<tr ><td class="mdl-data-table__cell--non-numeric">'
          + products[key].product_name + '</td><td class="mdl-data-table__cell--non-numeric truncate">'
          + products[key].product_desc + '</td><td class="mdl-data-table__cell--non-numeric">'
          + products[key].product_type + '</td><td class="mdl-data-table__cell--non-numeric">'
          + 'R ' + products[key].product_price + '<td class="mdl-data-table__cell--non-numeric">'
          + '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewEvent" onclick="return ViewEventInfo(\'' + products[key].product_id + '\' )">'
          + '<i class="material-icons">visibility</i></a></td><td class="mdl-data-table__cell--non-numeric">'
          + '</tr>';
        }
      }
      else{
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
      }
      //console.log(html);
      $("#tblProducts tbody").html(html);
}

