const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // seu e-mail do Gmail
    pass: process.env.EMAIL_PASS  // senha de app do Gmail
  },
  tls: {
    rejectUnauthorized: false // ignora certificados autoassinados
  }
});

async function enviarEmail({ para, assunto, html }) {
  try {
    await transporter.sendMail({
      from: `"Minha Empresa" <${process.env.EMAIL_USER}>`,
      to: para,
      subject: assunto,
      html
    });
    console.log("✅ E-mail enviado para", para);
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    throw err;
  }
}

module.exports = { enviarEmail };
