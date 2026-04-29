/*******************************************************************************
 * File:        nodeMailer.js
 * Description: Configures a Nodemailer SMTP transporter using Brevo (formerly
 *              Sendinblue) and exports a helper for sending emails.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import nodemailer from 'nodemailer'

// Create a transporter object using SMTP settings
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, 
    },
});

/*******************************************************************************
 * Function:    sendEmail
 * Description: Sends an HTML email via the configured Brevo SMTP transporter.
 * Input:       to (string) - recipient address
 *              subject (string) - email subject line
 *              body (string) - HTML body content
 * Output:      Email sent via SMTP
 * Return:      Promise<SentMessageInfo> - Nodemailer send response object
 ******************************************************************************/
const sendEmail = async ({ to, subject, body }) => {
    const response = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html: body
    });

    return response;
};

export default sendEmail