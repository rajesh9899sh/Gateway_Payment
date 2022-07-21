const express = require("express");
const checksumLib = require("./Paytm/checksum/checksum");
var path = require('path');

const app = express();
var nodemailer = require('nodemailer');

const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/pay", [parseUrl, parseJson], (req, res) => {
  var paymentDetails = {
    amount: req.body.amount,
    customerId: req.body.firstname,
    customerEmail: req.body.email,
    customerPhone: req.body.phone,
  };
  let params = {};
  params["MID"] = "SUdDNs81892732059036";
  params["WEBSITE"] = "WEBSTAGING";
  params["CHANNEL_ID"] = "WEB";
  params["INDUSTRY_TYPE_ID"] = "Retail";
  params["ORDER_ID"] = "ORD" + new Date().getTime();
  params["CUST_ID"] = paymentDetails.customerId;
  params["CALLBACK_URL"] = "http://localhost:3000/callback";
  params["MOBILE_NO"] = paymentDetails.customerPhone;
  params["EMAIL"] = paymentDetails.customerEmail;
  params["TXN_AMOUNT"] = paymentDetails.amount;

  checksumLib.genchecksum(params, "RqlL_IGvwe_ARDPZ", (err, checksum) => {
    let url = "https://securegw-stage.paytm.in/order/process";
    let formFields = "";
    for (x in params) {
      formFields +=
        "<input type = 'hidden' name = '" +
        x +
        "' value = '" +
        params[x] +
        "'/>";
    }
    formFields +=
      "<input type = 'hidden' name = 'CHECKSUMHASH' value = '" +
      checksum +
      "'>";

    var html =
      '<html><body><center>Please do not refresh this page...</center><form method = "post" action = "' +
      url +
      '" name = "paymentForm">' +
      formFields +
      '</form><script type = "text/javascript">document.paymentForm.submit()</script></body></html>';
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(html);
    res.end();
  });



  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rajeshsharma989967@gmail.com',
      pass: 'Vansh@9899'
    }
  });
  
  var mailOptions = {
    from: 'rajeshsharma989967@gmail.com',
    to: paymentDetails.customerEmail,
    subject: 'Thank You',
    text: `Your donation of rupees` + paymentDetails.amount +` has been recieved`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});


app.post("/callback", (req, res) => {

  res.sendFile(path.join(__dirname + '/index1.html'));

});


app.listen(3000, () => console.log("App is running at port 3000..."));


