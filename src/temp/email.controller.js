const Model = require('./model');
const nodemailer = require('nodemailer');

// Function to send confirmation email
const sendConfirmationEmail = (email) => {
  // Implement your email sending logic here
  // This is just a placeholder
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Confirmation Email',
    text: 'Please click the link to confirm your email.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

// Function to handle user registration
async function handleRegister(req, res) {
  try {
    let { email, name, cpf, password } = req.body;
    const joined = new Date();

    // Data validation
    password = bcrypt.hashSync(password, saltRounds);

    if (isNaN(joined)) {
      return res.status(400).json({
        error: 'Data de registro inválida.',
      });
    }

    const userData = { email, name, cpf, joined, password };
    const registeredUser = await Model.registerUser(userData);

    // Send confirmation email
    sendConfirmationEmail(email);

    res.status(201).json(registeredUser);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao registrar novo usuário.' });
  }
}

// Function to handle user confirmation
async function handleConfirmation(req, res) {
  try {
    const { userId } = req.params;
    await Model.confirmUser(userId);
    res.status(200).json({ message: 'User confirmation successful.' });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao confirmar usuário.' });
  }
}

module.exports = {
  handleRegister,
  handleConfirmation
};
