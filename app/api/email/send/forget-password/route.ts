import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

console.log("🚀 EMAIL ROUTE LOADED");

const resend = new Resend(process.env.RESEND_API_KEY);
console.log("API KEY EXISTS:", !!process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log("🚀 POST HANDLER EXECUTED");
  try {
    const { to, otp, name } = await req.json();
    console.log("🔔 forget-password route hit:", { to, otp });

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: "Your password reset code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding: 32px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius: 8px; padding: 32px 36px;">
                    <tr>
                      <td>
                        <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 20px 0;">
                          Reset Your Password
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 36px; height: 36px; background-color: #4f46e5; border-radius: 8px; text-align: center; vertical-align: middle;">
                              <div style="width: 12px; height: 12px; background-color: #ffffff; border-radius: 50%; margin: 12px auto;"></div>
                            </td>
                            <td style="padding-left: 10px;">
                              <span style="font-size: 15px; font-weight: 700; color: #111827;">Skillora</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 20px;">
                        <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 12px 0;">
                          ${name ? `Hi ${name},` : "Hi there,"} we received a request to reset your Skillora account password.
                        </p>
                        <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                          Enter the code below to continue. This code expires in 10 minutes.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 8px 0 24px 0;">
                        <div style="display: inline-block; background-color: #f4f4f7; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 32px;">
                          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5;">
                            ${otp}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0;">
                          If you didn't request a password reset, you can safely ignore this email — your password won't be changed.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
    console.log("RESEND DATA:", data);
    console.log("RESEND ERROR:", error);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Reset password email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
