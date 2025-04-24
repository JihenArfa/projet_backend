const nodemailer = require("nodemailer");
const transporter = require('./email');
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // << 🔥 Ignore les certificats SSL invalides
      },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html, // Utilisation du champ HTML pour envoyer des emails avec du contenu HTML
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès !");
  } catch (error) {
    console.error("Erreur d'envoi d'email :", error);
  }
};

module.exports = sendEmail; // <--- IMPORTANT