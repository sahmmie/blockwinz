export const emailVerificationTemplate = (
  username: string,
  verificationUrl: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Blockwinz - Verify Your Email</title>
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
    .header img {
      width: 120px;
      margin-bottom: 10px;
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
    .steps {
      margin-top: 20px;
    }
    .steps li {
      margin-bottom: 12px;
      font-size: 16px;
      color: #cccccc;
    }
    .cta-button {
      display: inline-block;
      margin: 25px 0;
      background-color: #00dd25;
      color: #ffffff;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      transition: background 0.3s;
    }
    .cta-button:hover {
      background-color: #00b51f;
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
      text-align: center;
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Blockwinz</h1>
    </div>
    <div class="content">
      <h2>Hey ${username}</h2>
      <p>We're thrilled to have you join <strong>Blockwinz</strong> — the next-generation crypto gaming platform where skill meets luck and blockchain guarantees fairness.</p>

      <p><strong>Before you can start playing, please verify your email address by clicking the button below:</strong></p>
      
      <div class="button-container">
        <a class="verify-button" href="${verificationUrl}">Verify Email</a>
      </div>

      <p class="ignore-notice">If you did not create an account, you can ignore this email.</p>
      <p class="expiry-notice">This link will expire in 30 minutes.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #333;">

      <p>Here's what you can do next to get started after verifying your email:</p>
      <ul class="steps">
        <li>💳 <strong>Fund your account</strong> and get ready to play</li>
        <li>🎮 <strong>Explore our game library</strong> – Plinko, Mines, Limbo, Dice, and more</li>
        <li>💰 <strong>Start playing and winning crypto</strong> instantly</li>
      </ul>

      <div class="button-container">
        <a class="cta-button" href="https://blockwinz.com">Launch Blockwinz</a>
      </div>
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
