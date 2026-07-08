import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function otpEmailTemplate({ name, otp }: { name?: string; otp: string }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your Sign-In Code</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#F3F2FD] font-sans m-0 p-0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-[#F3F2FD] py-10">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0"
              class="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(76,63,214,0.08)]">

              <!-- Header -->
              <tr>
                <td class="bg-[#2E2A87] px-10 py-8 text-center">
                  
                  <h1 class="text-white text-xl font-semibold m-0">
                    Skillora Certification
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td class="px-10 pt-10 pb-6">
                  <h2 class="text-[#1E1B4B] text-2xl font-bold mb-3 mt-0">
                    Verify Your Email
                  </h2>
                  <p class="text-[#4B4B63] text-[15px] leading-relaxed mb-6 mt-0">
                    Hi ${name || 'there'},<br />
                    Use the code below to sign in to your account. This code is valid for the next 10 minutes.
                  </p>

                  <!-- OTP Box -->
                  <div class="bg-[#EDEBFC] border border-[#C9C3F5] rounded-xl p-6 text-center mb-6">
                    <span class="inline-block text-4xl font-bold tracking-[10px] text-[#3730A3] font-mono">
                      ${otp}
                    </span>
                  </div>

                  <p class="text-[#8280A8] text-xs leading-relaxed m-0">
                    If you didn't request this code, you can safely ignore this email — no changes will be made to your account.
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td class="px-10">
                  <hr class="border-t border-[#E5E3F5] m-0" />
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="px-10 pt-6 pb-8 text-center">
                  <p class="text-[#A7A4C9] text-xs m-0">
                    &copy; 2026 Uncle Joe Certification. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { to, otp, name } = await req.json();

    if (!to || !otp) {
      return NextResponse.json(
        { error: 'Missing required fields: to, otp' },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: 'Your Sign-In Code',
      html: otpEmailTemplate({ name, otp }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}