export const passwordResetTemplate = (otp: string): string => {
  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                <strong>${otp}</strong>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>Blockwinz Team</p>
        </div>
    `;
};
