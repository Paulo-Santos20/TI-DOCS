import nodemailer from 'nodemailer'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from '../config/database'
import { passwordResetTokens, users } from '../db/schema'
import { eq, sql, and, isNull } from 'drizzle-orm'
import logger from '../config/logger'
import { AppError } from '../middleware/error.middleware'
import { env } from '../config/environment'

const FROM_NAME = 'TI Docs'
const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@tidocs.com'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  if (!host) return null

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  })

  return transporter
}

export function isEmailConfigured(): boolean {
  return !!process.env.SMTP_HOST
}

export async function sendEmail(to: string, subject: string, html: string) {
  const t = getTransporter()
  if (!t) {
    logger.warn(`Email not sent (SMTP not configured): "${subject}" to ${to}`)
    return false
  }

  try {
    await t.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    logger.info(`Email sent: "${subject}" to ${to}`)
    return true
  } catch (err) {
    logger.error(`Failed to send email to ${to}:`, err)
    return false
  }
}

export async function sendPasswordResetEmail(email: string) {
  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, email)).limit(1)
  if (!user) return { sent: false }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  })

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`

  const sent = await sendEmail(
    email,
    'Redefinição de senha - TI Docs',
    `<p>Olá ${user.name},</p>
     <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
     <p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">Redefinir senha</a></p>
     <p>Este link expira em 1 hora.</p>
     <p>Se você não solicitou esta redefinição, ignore este email.</p>`,
  )

  return { sent }
}

export async function resetPassword(token: string, newPassword: string) {
  const [stored] = await db.select()
    .from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.token, token),
      isNull(passwordResetTokens.usedAt),
      sql`${passwordResetTokens.expiresAt} > NOW()`,
    ))
    .limit(1)

  if (!stored) throw new AppError(400, 'Token inválido ou expirado')

  const hash = await bcrypt.hash(newPassword, 10)

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash: hash }).where(eq(users.id, stored.userId))
    await tx.update(passwordResetTokens).set({ usedAt: sql`NOW()` }).where(eq(passwordResetTokens.id, stored.id))
  })

  return { reset: true }
}
