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


exports.otpVerificationAdmin = async (name, email, randomOTP) => {
  try {
    const info = await transporter.sendMail({
      from: '"Your App Name" <kushagra100chhabra@gmail.com>',
      to: email,
      subject: "🔐 Admin OTP Verification Code",
      text: `Hello ${name},\n\nYour One-Time Password (OTP) for admin access verification is: ${randomOTP}\n\nThis OTP is valid for 10 minutes. If you didn't request this, please report immediately.\n\n– The Your App Name Team`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #2c3e50;">Hello ${name} 👋</h2>
          <p>You are receiving this email because an admin verification was requested using your email address.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f1f1f1; padding: 15px 25px; font-size: 22px; font-weight: bold; border-radius: 8px; display: inline-block; margin: 10px 0;">
            ${randomOTP}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not initiate this request, please secure your account and contact support immediately.</p>
          <hr style="margin: 30px 0;"/>
          <p style="font-size: 14px; color: #888;">This is an automated message. Please do not reply.</p>
          <p style="font-size: 14px; color: #888;">– The Your App Name Team</p>
        </div>
      `
    });

    console.log("✅ OTP email sent successfully:", info.messageId);
  } catch (e) {
    console.error("❌ Failed to send OTP email:", e);
  }
};
