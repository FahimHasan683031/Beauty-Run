import config from '../config'
import { ICreateAccount, IResetPassword, ISupportTicketResolved } from '../interfaces/emailTemplate'

const createAccount = (values: ICreateAccount) => {
  console.log(values, 'values')
  const data = {
    to: values.email,
    subject: `Verify your Beauty Run account, ${values.name}`,
    html: `
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/ZCCGRGf/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:220px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
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
      <td align="center" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
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
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/ZCCGRGf/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:220px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
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
      <td align="center" style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
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
   <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" style="background-color:#FFF0F9; padding:35px 20px; border-top:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/ZCCGRGf/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:210px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.3));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
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
      <td align="center" style="background-color:#FFF0F9; padding:25px 20px; border-top:1px solid #FB6CC033;">
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
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" 
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/ZCCGRGf/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:220px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
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
      <td align="center" 
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
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" 
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/ZCCGRGf/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:220px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
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
      <td align="center" 
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:25px 20px; border-top:1px solid #FB6CC033;">
        <p style="margin:0; color:#5D0032; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Beauty Run</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#5D0032; font-size:13px;">
          Powered by <strong style="color:#FB6CC0;">Beauty Run API</strong> ✨
 e="color:#FB6CC0;">Beauty Run API</strong> ✨
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
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td align="center" 
          style="background:linear-gradient(135deg,#FFF0F9,#FFE6F2); padding:35px 20px; border-bottom:1px solid #FB6CC033;">
        <img src="https://i.ibb.co.com/ZCCGRGf/dd55d4a6535f8e84f9d45593679b0f9429bf90de.png" alt="App"
             style="width:220px; height:auto; filter:drop-shadow(0 0 6px rgba(0,0,0,0.25));">
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
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
      <td align="center" 
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

export const emailTemplate = {
  createAccount,
  resetPassword,
  resendOtp,
  userContactConfirmationEmail,
  adminContactNotificationEmail,
  supportTicketResolved,
}
