const nodemailer = require("nodemailer");
const dotenv = require("dotenv")
dotenv.config()

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 465,
  secure: false, 
  service: "gmail",
  auth: { 
    user: process.env.NodeMailerUser, 
    pass: process.env.NodeMailerPassword,
  },
});

exports.otpVerificationUser = async (name, email, randomOTP) => {
  try {
    const info = await transporter.sendMail({
      from: '"Your app name" kushagra100chhabra@gmail.com',
      to: email,
      subject: "Your OTP Code for Verification",
      text: `Hello ${name}, your OTP is ${randomOTP}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Hello, ${name} 👋</h2>
          <p>Thank you for registering with us!</p>
          <p>Your One-Time Password (OTP) for email verification is:</p>
          <div style="background: #f3f3f3; padding: 10px 20px; display: inline-block; border-radius: 5px; font-size: 20px; font-weight: bold;">
            ${randomOTP}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br/>
          <p style="color: #888;">– The Team</p>
        </div>
      `
    });

    console.log("OTP email sent:", info.messageId);
  } catch (e) {
    console.error("Failed to send OTP email:", e); 
  }
};
