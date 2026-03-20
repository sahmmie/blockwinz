export const resendEmailVerificationTemplate = (verificationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification - Blockwinz</title>
  <style>
    body {
      background-color: #151832;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background-color: #1f223e;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0,0,0,0.4);
    }
    .header {
      background-color: #00dd25;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #151832;
      font-size: 26px;
    }
    .content {
      padding: 30px;
    }
    .content h2 {
      margin-top: 0;
      color: #ffffff;
      font-size: 22px;
    }
    .content p {
      line-height: 1.6;
      color: #dddddd;
    }
    .verify-button {
      display: inline-block;
      margin: 30px 0;
      background-color: #00dd25;
      color: #ffffff;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      transition: background 0.3s;
    }
    .verify-button:hover {
      background-color: #00b51f;
    }
    .button-container {
      text-align: center;
    }
    .footer {
      background-color: #000A27;
      color: #888;
      text-align: center;
      padding: 25px;
      font-size: 12px;
    }
    .social-icons {
      margin-top: 15px;
    }
    .social-icons a {
      margin: 0 10px;
      display: inline-block;
    }
    .social-icons img {
      width: 24px;
      height: 24px;
    }
    a {
      color: #00dd25;
      text-decoration: none;
    }
    .expiry-notice {
      color: #ffaa00;
      font-weight: bold;
      margin-top: 15px;
    }
    .ignore-notice {
      color: #999;
      font-size: 14px;
      margin-top: 15px;
    }
    .signature {
      margin-top: 30px;
      color: #dddddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Blockwinz</h1>
    </div>
    <div class="content">
      <h2>Email Verification</h2>
      <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
      
      <div class="button-container">
        <a class="verify-button" href="${verificationUrl}">Verify Email</a>
      </div>

      <p class="ignore-notice">If you did not create an account, you can ignore this email.</p>
      <p class="expiry-notice">This link will expire in 30 minutes.</p>

      <p class="signature">Best regards,<br>Blockwinz Team</p>
    </div>
    <div class="footer">
      &copy; 2025 Blockwinz. All rights reserved.<br>
      Need help? <a href="mailto:support@blockwinz.com">support@blockwinz.com</a>
      <div class="social-icons">
        <a href="https://discord.gg/dGTbVbWV"><img src="https://cdn-icons-png.flaticon.com/512/3670/3670157.png" alt="Discord" /></a>
        <a href="https://x.com/Blockwinz_"><img src="https://cdn-icons-png.flaticon.com/512/3670/3670211.png" alt="Twitter" /></a>
        <a href="https://t.me/blockwinz"><img src="https://cdn-icons-png.flaticon.com/512/3670/3670159.png" alt="Telegram" /></a>
      </div>
    </div>
  </div>
</body>
</html>
`;
