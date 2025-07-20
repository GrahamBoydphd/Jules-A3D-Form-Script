function sendEmailWithAttachment(recipient, subject, emailBody) {
  Logger.log("Attempting to send email with attachment to " + recipient);
  const pdfFile = DriveApp.getFilesByName('Overview_3D_AOM.pdf').next();
  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: emailBody,
    attachments: [pdfFile.getAs(MimeType.PDF)]
  });
  Logger.log("Email sent to " + recipient);
}
