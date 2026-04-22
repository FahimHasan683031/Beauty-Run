import config from '../config'
import { ICreateAccount, IOrderInvoice, IResetPassword, ISupportTicketNotification, ISupportTicketResolved } from '../interfaces/emailTemplate'

const createAccount = (values: ICreateAccount) => {
  console.log(values, 'values')
  const data = {
    to: values.email,
    subject: `Verify your Beauty Run account, ${values.name}`,
    html: `
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-cell { padding: 30px 20px !important; }
      .header-cell { padding: 30px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="main-table"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <tr>
      <td align="center" class="header-cell" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/DDgsFXq3/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:260px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="content-cell" style="padding:45px;">
        <h1 style="color:#FB6CC0; font-size:26px; font-weight:700; margin-bottom:15px; text-align:center;">
          Verify Your Email ✨
        </h1>

        <p style="color:#5D0032; font-size:16px; line-height:1.6; margin-bottom:25px; text-align:center;">
          Hey <strong>${values.name}</strong>, welcome to <strong>Beauty Run</strong>! 🎉<br>
          Please verify your email to activate your account.
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(145deg,#FFF0F9,#FFE6F2); border:2px solid #FB6CC0; 
                    border-radius:12px; padding:25px 0; text-align:center; margin:30px auto; max-width:300px;">
          <span style="font-size:40px; font-weight:700; color:#5D0032; letter-spacing:6px;">
            ${values.otp}
          </span>
        </div>

        <p style="color:#5D0032; font-size:15px; line-height:1.6; text-align:center;">
          This code will expire in <strong>5 minutes</strong>.<br>
          If you didn’t request this, you can safely ignore this email.
        </p>

        <!-- Tip -->
        <div style="margin-top:35px; background-color:#fff8e1; border-left:6px solid #ffd54f; 
                    border-radius:8px; padding:15px 18px;">
          <p style="margin:0; color:#4a4a4a; font-size:14px;">
            🔒 For security reasons, never share this code with anyone.
          </p>
        </div>


      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" class="footer-cell" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
        <p style="margin:0; color:#5D0032; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Beauty Run</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#5D0032; font-size:13px;">
          Powered by <strong style="color:#FB6CC0;">Beauty Run API</strong> ✨
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }
  return data
}

const resetPassword = (values: IResetPassword) => {
  console.log(values, 'values')
  const data = {
    to: values.email,
    subject: `Reset your Beauty Run password, ${values.name}`,
    html: `
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-cell { padding: 30px 20px !important; }
      .header-cell { padding: 30px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="main-table"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <tr>
      <td align="center" class="header-cell" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/DDgsFXq3/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:260px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="content-cell" style="padding:45px;">
        <h1 style="color:#FB6CC0; font-size:26px; font-weight:700; margin-bottom:15px; text-align:center;">
          Password Reset Request 🔐
        </h1>

        <p style="color:#5D0032; font-size:16px; line-height:1.6; margin-bottom:25px; text-align:center;">
          Hi <strong>${values.name}</strong>, 👋<br>
          We received a request to reset your password for your <strong>Beauty Run</strong> account.
          <br>Enter the code below to complete the process:
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(145deg,#FFF0F9,#FFE6F2); border:2px solid #FB6CC0;
                    border-radius:12px; padding:25px 0; text-align:center; margin:30px auto; max-width:300px;">
          <span style="font-size:40px; font-weight:700; color:#5D0032; letter-spacing:6px;">
            ${values.otp}
          </span>
        </div>

        <p style="color:#5D0032; font-size:15px; line-height:1.6; text-align:center;">
          This verification code is valid for <strong>5 minutes</strong>.<br>
          If you didn’t request this, please ignore this email — your account is safe.
        </p>

        <!-- Tip -->
        <div style="margin-top:35px; background-color:#fff8e1; border-left:6px solid #ffd54f;
                    border-radius:8px; padding:15px 18px;">
          <p style="margin:0; color:#4a4a4a; font-size:14px;">
            ⚠️ <strong>Security Tip:</strong> Never share your reset code with anyone. Beauty Run will never ask for it.
          </p>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" class="footer-cell" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
        <p style="margin:0; color:#5D0032; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Beauty Run</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#5D0032; font-size:13px;">
          Powered by <strong style="color:#FB6CC0;">Beauty Run API</strong> ✨
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }

  return data
}

const resendOtp = (values: {
  email: string
  name: string
  otp: string
  type: 'resetPassword' | 'createAccount'
}) => {
  console.log(values, 'values')
  const isReset = values.type === 'resetPassword'

  const data = {
    to: values.email,
    subject: `${isReset ? 'Password Reset' : 'Account Verification'} - New Code`,
    html: `
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-cell { padding: 30px 20px !important; }
      .header-cell { padding: 30px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="main-table"
         style="max-width:640px; margin:40px auto; background:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" class="header-cell" style="background-color:#FFF0F9; padding:35px 20px; border-top:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/DDgsFXq3/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:260px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.3));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="content-cell" style="padding:45px;">
        <h1 style="color:#5D0032; font-size:26px; font-weight:700; margin-bottom:15px; text-align:center;">
          ${isReset ? 'Reset Your Password 🔐' : 'Verify Your Account 🚀'}
        </h1>

        <p style="color:#5D0032; font-size:16px; line-height:1.6; margin-bottom:25px; text-align:center;">
          Hi <strong>${values.name}</strong>, 👋<br>
          ${isReset
        ? 'You requested a new verification code to reset your Beauty Run password.'
        : 'Here is your new verification code to complete your Beauty Run account setup.'
      }<br>
          Use the code below to continue:
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(145deg,#FFF0F9,#FFE6F2);
                    border:2px solid #FB6CC0; border-radius:12px;
                    padding:25px 0; text-align:center;
                    margin:30px auto; max-width:300px;">
          <span style="font-size:40px; font-weight:700; color:#5D0032; letter-spacing:6px;">
            ${values.otp}
          </span>
        </div>

        <p style="color:#5D0032; font-size:15px; line-height:1.6; text-align:center;">
          This code is valid for <strong>5 minutes</strong>.<br>
          If this was not you, please ignore the email.
        </p>

        <!-- Tip -->
        <div style="margin-top:35px; background-color:#fff8e1;
                    border-left:6px solid #ffd54f;
                    border-radius:8px; padding:15px 18px;">
          <p style="margin:0; color:#4a4a4a; font-size:14px;">
            🔒 <strong>Security Tip:</strong> Never share your OTP with anyone. Beauty Run
 will never request it.
          </p>
        </div>


      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" class="footer-cell" style="background-color:#FFF0F9; padding:25px 20px; border-top:1px solid #FB6CC033;">
        <p style="margin:0; color:#5D0032; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Beauty Run</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#5D0032; font-size:13px;">
          Powered by <strong style="color:#FB6CC0;">Beauty Run API</strong> 🚀
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }

  return data
}

const adminContactNotificationEmail = (payload: {
  name: string
  email: string
  phone?: string
  message: string
}) => {
  return {
    to: config.super_admin.email as string,
    subject: '📩 New Contact Form Submission – Beauty Run',
    html: `
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-cell { padding: 30px 20px !important; }
      .header-cell { padding: 30px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="main-table"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" class="header-cell"
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/DDgsFXq3/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:260px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="content-cell" style="padding:45px;">
        <h1 style="color:#FB6CC0; font-size:26px; font-weight:700; margin-bottom:20px; text-align:center;">
          📬 New Contact Submission
         </h1>

        <p style="color:#5D0032; font-size:16px; text-align:center; margin-bottom:30px;">
          A new contact message has been submitted on <strong>Beauty Run</strong>.
        </p>

        <!-- Contact Details -->
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr>
            <td style="padding:12px 0; font-size:15px; color:#5D0032;">👤 <strong>Name:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#5D0032; text-align:right;">
              ${payload.name}
            </td>
          </tr>

          <tr style="border-top:1px solid #FB6CC022;">
            <td style="padding:12px 0; font-size:15px; color:#5D0032;">📧 <strong>Email:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#5D0032; text-align:right;">
              ${payload.email}
            </td>
          </tr>

          <tr style="border-top:1px solid #FB6CC022;">
            <td style="padding:12px 0; font-size:15px; color:#5D0032;">📞 <strong>Phone:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#5D0032; text-align:right;">
              ${payload.phone || 'N/A'}
            </td>
          </tr>
        </table>

        <!-- Message Box -->
        <div style="background:linear-gradient(145deg,#FFF0F9,#FFE6F2); border:2px solid #FB6CC0;
                    border-radius:12px; padding:20px; margin-top:30px;">
          <p style="margin:0; font-size:15px; color:#5D0032; line-height:1.6;">
            “${payload.message}”
          </p>
        </div>

        <p style="color:#5D0032; font-size:14px; margin-top:30px; text-align:center;">
          You can respond directly to <strong>${payload.email}</strong>.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" class="footer-cell"
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
        <p style="margin:0; color:#5D0032; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Beauty Run</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#5D0032; font-size:13px;">
          Powered by <strong style="color:#FB6CC0;">Beauty Run API</strong> 
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }
}


const userContactConfirmationEmail = (payload: {
  name: string
  email: string
  message: string
}) => {
  return {
    to: payload.email,
    subject: '💬 Thank You for Contacting Beauty Run',
    html: `
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-cell { padding: 30px 20px !important; }
      .header-cell { padding: 30px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="main-table"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" class="header-cell"
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/DDgsFXq3/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:260px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="content-cell" style="padding:45px;">
        <h1 style="color:#FB6CC0; font-size:26px; font-weight:700; margin-bottom:20px; text-align:center;">
          Thank You for Contacting Us 💗
        </h1>

        <p style="color:#5D0032; font-size:16px; line-height:1.6; text-align:center;">
          Dear <strong>${payload.name}</strong>,<br>
          We’ve received your message! Our support team will reach out to you shortly.
        </p>

        <!-- User Message -->
        <div style="background:linear-gradient(145deg,#FFF0F9,#FFE6F2); border:2px solid #FB6CC0; 
                    border-radius:12px; padding:25px 20px; text-align:center; margin:30px auto; max-width:500px;">
          <p style="font-size:15px; color:#5D0032; line-height:1.6; margin:0;">
            <em>“${payload.message}”</em>
          </p>
        </div>

        <p style="color:#5D0032; font-size:15px; line-height:1.6; text-align:center;">
          Thanks for reaching out to <strong>Beauty Run</strong>.<br>
          We truly appreciate your message 💗
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" class="footer-cell"
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
        <p style="margin:0; color:#5D0032; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Beauty Run</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#5D0032; font-size:13px;">
          Powered by <strong style="color:#FB6CC0;">Beauty Run API</strong> ✨
        </p>
      </td>
    </tr>
  </table>
</body>
`,
  }
}

const adminSupportTicketNotificationEmail = (payload: ISupportTicketNotification) => {
  return {
    to: config.super_admin.email as string,
    subject: '🎫 New Support Ticket Created – Beauty Run',
    html: `
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-cell { padding: 30px 20px !important; }
      .header-cell { padding: 30px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="main-table"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" class="header-cell"
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/DDgsFXq3/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:260px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="content-cell" style="padding:45px;">
        <h1 style="color:#FB6CC0; font-size:26px; font-weight:700; margin-bottom:20px; text-align:center;">
          🎫 New Support Ticket
         </h1>

        <p style="color:#5D0032; font-size:16px; text-align:center; margin-bottom:30px;">
          A new support ticket has been opened on <strong>Beauty Run</strong>.
        </p>

        <!-- Ticket Details -->
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr>
            <td style="padding:12px 0; font-size:15px; color:#5D0032;">👤 <strong>User:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#5D0032; text-align:right;">
              ${payload.userName}
            </td>
          </tr>
          <tr style="border-top:1px solid #FB6CC022;">
            <td style="padding:12px 0; font-size:15px; color:#5D0032;">📧 <strong>Email:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#5D0032; text-align:right;">
              ${payload.userEmail}
            </td>
          </tr>
          <tr style="border-top:1px solid #FB6CC022;">
            <td style="padding:12px 0; font-size:15px; color:#5D0032;">📌 <strong>Title:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#5D0032; text-align:right;">
              ${payload.ticketTitle}
            </td>
          </tr>
        </table>

        <!-- Description Box -->
        <div style="background:linear-gradient(145deg,#FFF0F9,#FFE6F2); border:2px solid #FB6CC0;
                    border-radius:12px; padding:20px; margin-top:30px;">
          <p style="margin:0; font-size:15px; color:#5D0032; line-height:1.6;">
            <strong>Description:</strong><br>
            “${payload.ticketDescription}”
          </p>
        </div>

        <p style="color:#5D0032; font-size:14px; margin-top:30px; text-align:center;">
          Please log in to the admin panel to resolve this ticket.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" class="footer-cell"
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
        <p style="margin:0; color:#5D0032; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Beauty Run</strong>. All rights reserved.
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }
}

const supportTicketResolved = (payload: ISupportTicketResolved) => {
  return {
    to: payload.email,
    subject: '✅ Your Support Ticket has been Resolved – Beauty Run',
    html: `
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-cell { padding: 30px 20px !important; }
      .header-cell { padding: 30px 20px !important; }
      .footer-cell { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="main-table"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" class="header-cell"
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/DDgsFXq3/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:260px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="content-cell" style="padding:45px;">
        <h1 style="color:#FB6CC0; font-size:26px; font-weight:700; margin-bottom:20px; text-align:center;">
          Ticket Resolved ✅
        </h1>

        <p style="color:#5D0032; font-size:16px; line-height:1.6; text-align:center;">
          Dear <strong>${payload.name}</strong>,<br>
          We are pleased to inform you that your support ticket has been resolved!
        </p>

        <!-- Ticket Info Box -->
        <div style="background:linear-gradient(145deg,#FFF0F9,#FFE6F2); border:2px solid #FB6CC0; 
                    border-radius:12px; padding:25px 20px; text-align:center; margin:30px auto; max-width:500px;">
          <p style="font-size:15px; color:#5D0032; line-height:1.6; margin:0;">
            <strong>Ticket Title:</strong><br>
            <em>${payload.ticketTitle}</em>
          </p>
          ${payload.adminReply ? `
          <div style="margin-top:20px; padding-top:20px; border-top:1px solid #FB6CC033;">
            <p style="font-size:15px; color:#5D0032; line-height:1.6; margin:0;">
              <strong>Admin's Reply:</strong><br>
              <em>${payload.adminReply}</em>
            </p>
          </div>
          ` : ''}
        </div>

        <p style="color:#5D0032; font-size:15px; line-height:1.6; text-align:center;">
          If you have any further questions or need additional assistance, please feel free to open a new support ticket or reply to our support team.<br>
          Thanks for choosing <strong>Beauty Run</strong> 💗
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" class="footer-cell"
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
        <p style="margin:0; color:#5D0032; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Beauty Run</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#5D0032; font-size:13px;">
          Powered by <strong style="color:#FB6CC0;">Beauty Run API</strong> ✨
        </p>
      </td>
    </tr>
  </table>
</body>
`,
  }
}

const orderInvoice = (values: IOrderInvoice) => {
  return {
    to: values.customerEmail,
    subject: `Your Beauty Run Order Invoice - #${values.orderId}`,
    html: `
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .main-table { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .responsive-column { display: block !important; width: 100% !important; padding: 0 !important; margin-bottom: 30px !important; }
      .header-cell { padding: 30px 20px !important; }
      .body-cell { padding: 30px 20px !important; }
      .info-bar-cell { padding: 20px !important; }
      .item-table th, .item-table td { padding: 12px 10px !important; font-size: 13px !important; }
      .total-wrapper { width: 100% !important; }
      .spacer-cell { display: none !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" class="main-table"
         style="max-width:700px; margin:40px auto; background-color:#ffffff; border-radius:16px;
                overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
    
    <tr>
      <td align="center" class="header-cell" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/DDgsFXq3/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="Beauty Run"
             style="width:260px; height:auto;">
        <h1 style="color:#FB6CC0; font-size:28px; margin-top:20px; font-weight:700; letter-spacing:1px;">Order Invoice</h1>
      </td>
    </tr>

    <!-- Order Info Bar -->
    <tr>
      <td class="info-bar-cell" style="padding:30px 40px; background-color:#FFF0F9; border-bottom:1px solid #FB6CC022;">
        <table width="100%">
          <tr>
            <td>
              <p style="margin:0; color:#5D0032; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Order ID</p>
              <p style="margin:5px 0 0; color:#FB6CC0; font-size:16px; font-weight:700;">#${values.orderId}</p>
            </td>
            <td align="right">
              <p style="margin:0; color:#5D0032; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Date</p>
              <p style="margin:5px 0 0; color:#5D0032; font-size:16px; font-weight:600;">${values.date}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="body-cell" style="padding:40px;">
        <!-- Customer & Shipping Section -->
        <table width="100%" style="margin-bottom:20px;">
          <tr>
            <td width="50%" class="responsive-column" style="vertical-align:top;">
              <h3 style="color:#5D0032; font-size:16px; margin-bottom:15px; border-bottom:2px solid #FB6CC0; display:inline-block; padding-bottom:5px;">Billed To</h3>
              <p style="margin:0; color:#5D0032; font-size:15px; line-height:1.6;">
                <strong>${values.customerName}</strong><br>
                ${values.customerEmail}
              </p>
            </td>
            <td width="50%" class="responsive-column" style="vertical-align:top; padding-left:20px;">
              <h3 style="color:#5D0032; font-size:16px; margin-bottom:15px; border-bottom:2px solid #FB6CC0; display:inline-block; padding-bottom:5px;">Shipping Address</h3>
              <p style="margin:0; color:#5D0032; font-size:15px; line-height:1.6;">
                ${values.shippingAddress}
              </p>
            </td>
          </tr>
        </table>

        <!-- Items Table -->
        <table width="100%" cellpadding="0" cellspacing="0" class="item-table" style="border-collapse:collapse; margin-bottom:30px;">
          <thead>
            <tr style="background-color:#5D0032;">
              <th align="left" style="padding:15px 20px; color:#ffffff; font-size:14px; border-radius:8px 0 0 8px;">Description</th>
              <th align="center" style="padding:15px 20px; color:#ffffff; font-size:14px;">Price</th>
              <th align="center" style="padding:15px 20px; color:#ffffff; font-size:14px;">Qty</th>
              <th align="right" style="padding:15px 20px; color:#ffffff; font-size:14px; border-radius:0 8px 8px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:25px 20px; border-bottom:1px solid #eeeeee; color:#5D0032; font-size:15px; font-weight:600;">
                ${values.productName}
              </td>
              <td align="center" style="padding:25px 20px; border-bottom:1px solid #eeeeee; color:#5D0032; font-size:15px;">
                $${values.productPrice.toFixed(2)}
              </td>
              <td align="center" style="padding:25px 20px; border-bottom:1px solid #eeeeee; color:#5D0032; font-size:15px;">
                ${values.quantity}
              </td>
              <td align="right" style="padding:25px 20px; border-bottom:1px solid #eeeeee; color:#5D0032; font-size:15px; font-weight:700;">
                $${(values.productPrice * values.quantity).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Totals Section -->
        <table width="100%">
          <tr>
            <td width="60%" class="spacer-cell"></td>
            <td width="40%" class="total-wrapper">
              <table width="100%" style="color:#5D0032; font-size:15px;">
                <tr>
                  <td style="padding:10px 0;">Subtotal</td>
                  <td align="right" style="padding:10px 0;">$${(values.productPrice * values.quantity).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">Delivery Charge</td>
                  <td align="right" style="padding:10px 0;">$${values.deliveryCharge.toFixed(2)}</td>
                </tr>
                ${values.discount > 0 ? `
                <tr>
                  <td style="padding:10px 0; color:#FB6CC0;">Discount</td>
                  <td align="right" style="padding:10px 0; color:#FB6CC0;">-$${values.discount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr style="font-weight:700; font-size:18px;">
                  <td style="padding:20px 0; border-top:2px solid #5D0032;">Total Amount</td>
                  <td align="right" style="padding:20px 0; border-top:2px solid #5D0032; color:#FB6CC0;">$${values.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Payment Note -->
        <div style="margin-top:40px; padding:20px; background-color:#fdf2f8; border-radius:12px; text-align:center;">
          <p style="margin:0; color:#5D0032; font-size:14px; font-style:italic;">
            Transaction ID: <strong>${values.transactionId}</strong><br>
            Thank you for shopping with Beauty Run! Your payment has been successfully processed.
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color:#5D0032; padding:30px; text-align:center;">
        <p style="margin:0; color:#ffffff; font-size:13px; opacity:0.8;">
          © ${new Date().getFullYear()} Beauty Run. All rights reserved.<br>
          If you have any questions about this invoice, please contact our support.
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }
}

export const emailTemplate = {
  createAccount,
  resetPassword,
  resendOtp,
  userContactConfirmationEmail,
  adminContactNotificationEmail,
  adminSupportTicketNotificationEmail,
  supportTicketResolved,
  orderInvoice,
}
