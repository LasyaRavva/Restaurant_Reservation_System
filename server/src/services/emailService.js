import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

function getTransport() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  })
}

function buildReservationMail({ headline, intro, name, restaurantName, date, timeSlot, note, cta }) {
  return {
    subject: `${headline} | ${restaurantName}`,
    text: [
      `Hello ${name},`,
      '',
      intro,
      '',
      `Restaurant: ${restaurantName}`,
      `Date: ${date}`,
      `Time: ${timeSlot}`,
      '',
      note,
      '',
      cta,
      '',
      'Warm regards,',
      `${restaurantName} Reservations`
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; background:#f8f4ef; padding:24px;">
        <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #eadfd3; border-radius:18px; overflow:hidden;">
          <div style="background:#7a4f2b; color:#fff; padding:24px 28px;">
            <p style="margin:0; letter-spacing:2px; text-transform:uppercase; font-size:12px; opacity:0.85;">Reservation update</p>
            <h1 style="margin:10px 0 0; font-size:28px; line-height:1.2;">${headline}</h1>
          </div>
          <div style="padding:28px; color:#2e241d;">
            <p style="font-size:16px; line-height:1.7; margin:0 0 18px;">Hello ${name},</p>
            <p style="font-size:16px; line-height:1.7; margin:0 0 20px;">${intro}</p>
            <div style="border:1px solid #eadfd3; border-radius:14px; padding:18px 20px; background:#fffaf6;">
              <p style="margin:0 0 10px; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#8a6c57;">Reservation details</p>
              <p style="margin:0 0 8px; font-size:16px;"><strong>Restaurant:</strong> ${restaurantName}</p>
              <p style="margin:0 0 8px; font-size:16px;"><strong>Date:</strong> ${date}</p>
              <p style="margin:0; font-size:16px;"><strong>Time:</strong> ${timeSlot}</p>
            </div>
            <p style="font-size:16px; line-height:1.7; margin:20px 0 10px;">${note}</p>
            <p style="font-size:16px; line-height:1.7; margin:0 0 24px;">${cta}</p>
            <p style="font-size:15px; line-height:1.7; margin:0;">Warm regards,<br />${restaurantName} Reservations</p>
          </div>
        </div>
      </div>
    `
  }
}

export async function sendReservationReceivedEmail({ to, name, restaurantName, date, timeSlot }) {
  const transport = getTransport()
  if (!transport) return { skipped: true }

  const mail = buildReservationMail({
    headline: 'Your table request is received',
    intro: 'Thank you for choosing us. Your reservation has been created and is now awaiting payment and final confirmation.',
    name,
    restaurantName,
    date,
    timeSlot,
    note: 'A confirmation message will be sent once your reservation is completed.',
    cta: 'We are preparing your table experience with care.'
  })

  await transport.sendMail({
    from: env.emailFrom,
    to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html
  })

  return { skipped: false }
}

export async function sendReservationConfirmationEmail({ to, name, restaurantName, date, timeSlot }) {
  const transport = getTransport()
  if (!transport) return { skipped: true }

  const mail = buildReservationMail({
    headline: 'Your reservation is confirmed',
    intro: 'Great news. Your table is confirmed and ready for your visit.',
    name,
    restaurantName,
    date,
    timeSlot,
    note: 'Please arrive a few minutes early. If your plans change, you can update or cancel from your booking area.',
    cta: 'We look forward to welcoming you soon.'
  })

  await transport.sendMail({
    from: env.emailFrom,
    to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html
  })

  return { skipped: false }
}
