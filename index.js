'use strict';


let taxjar = require('taxjar')(process.env.TAXJAR_API_KEY);

exports.handler = (order, context, callback) => {

    let address = order.Shipping.ShippingParty[0].ShippingShippingAddress.Address;

    let taxRequest = {
       // from_country: process.env.WAREHOUSE_COUNTRY,
       // from_zip: process.env.WAREHOUSE_POSTAL_CODE,
       // from_state: process.env.WAREHOUSE_STATE,
        from_street: "75 West center",
        from_city: "Provo",
        from_country: "US",
        from_zip:84601,
        from_state: "UT",
        to_street: address.Street1,
        to_city: address.City,
        to_country: address.CountryCode,
        to_zip: address.PostalCode,
        to_state: address.Region,
        amount:order.OrderTotals.TaxBase,
        shipping: order.OrderTotals.Shipping,
    };

    taxRequest.line_items = [];
    order.Items.forEach(function(item){
        taxRequest.line_items.push({quantity:item.RequestedQuantity, unit_price:item.TaxBase, product_tax_code:item.TaxCode})
    });

    taxjar.taxForOrder(taxRequest).then(function(res) {

        console.log("sucess");

        callback(null, {
            rate: res.tax.rate,
            taxable_amount: res.tax.taxable_amount,
            amount_to_collect:  res.tax.amount_to_collect,
            order_total_amount: res.tax.order_total_amount,
        });
    }).catch(function(err) {
        callback({statusCode:err.status, message:err.detail},null);
    });

};
