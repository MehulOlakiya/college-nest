const sgMail = require('@sendgrid/mail')

// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name) =>{
  sgMail.send({
    to: email, // Change to your recipient
    from: 'mehul.olakiya.kevit137@gmail.com', // Change to your verified sender
    subject: 'Thank you for joining in !',
    text: `Welcome to app , ${name}. Let me know how you get alone with the app.`,
    
  })
  console.log("Email Sent");
}


const sendCanceledEmail = (email,name) =>{
  sgMail.send({
    to: email, // Change to your recipient
    from: 'mehul.olakiya.kevit137@gmail.com', // Change to your verified sender
    subject: 'Logout for the app !',
    text: `Good by , ${name}. keep on your dashboard.`,
    
  })
  console.log("Email Sent");
}


module.exports = {
  sendWelcomeEmail ,
  sendCanceledEmail
}