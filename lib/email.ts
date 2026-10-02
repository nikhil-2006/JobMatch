import nodemailer from 'nodemailer'
import { getAppBaseUrl } from '@/lib/utils'

export async function sendVerificationEmail(data: {
  email: string
  name: string
  verificationLink: string
  role?: string
}) {
  const { email, name, verificationLink, role } = data
  const baseUrl = getAppBaseUrl()

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER || process.env.GMAIL_USER
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS
  const from = process.env.SMTP_FROM || `"MVGR JobMatch" <noreply@mvgr.ac.in>`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #333333; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800; }
          .content { font-size: 15px; line-height: 1.6; color: #475569; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
          .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MVGR JobMatch Verification</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for registering on <strong>MVGR JobMatch</strong> as a ${role === 'employer' ? 'Campus Partner / Employer' : 'Student Candidate'}.</p>
            <p>To verify your email address and activate your account on our portal, please click the button below:</p>
            <div class="btn-container">
              <a href="${verificationLink}" class="btn" target="_blank">Verify Email Address</a>
            </div>
            <p>If the button above does not work, you can copy and paste the following URL into your browser:</p>
            <p style="word-break: break-all; color: #2563eb; font-size: 13px;">${verificationLink}</p>
            <p>If you did not initiate this registration, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MVGR JobMatch | Maharaj Vijayaram Gajapathi Raj College of Engineering</p>
          </div>
        </div>
      </body>
    </html>
  `

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })

      await transporter.sendMail({
        from,
        to: email,
        subject: 'Verify your MVGR JobMatch Account',
        html: htmlContent,
      })
      console.log(`[Email Service] Verification email successfully sent to ${email}`)
      return { success: true }
    } catch (err) {
      console.error('[Email Service] Failed to send SMTP email:', err)
    }
  }

  // Fallback log for development / deployment console inspection
  console.log(`[Email Dispatch Simulation] Send email to: ${email}`)
  console.log(`[Email Verification Link]: ${verificationLink}`)

  return { success: true, simulated: true }
}
