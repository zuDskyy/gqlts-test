"use strict";
import nodemailer from "nodemailer";



// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail( to :string , html:string) {
  // send mail with defined transport object

let transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "tjnc2m3kxqye6lta@ethereal.email",
    pass: "ZxztfQZVcyNx58DJYE",
  },
});

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', 
    to: to, 
    subject: "Hello ✔",
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

}


