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
let etherealUrl: string | null = null

async function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  if (!host) {
    const testAccount = await nodemailer.createTestAccount()
    logger.info(`Ethereal email account created: user=${testAccount.user} pass=${testAccount.pass}`)
    logger.info(`Ethereal SMTP config: host=smtp.ethereal.email port=587 requireTLS=true`)
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: testAccount.user, pass: testAccount.pass },
      logger: true,
      debug: true,
    })
    transporter.verify().then(() => {
      logger.info('Ethereal SMTP connection verified successfully')
    }).catch((err) => {
      logger.error(`Ethereal SMTP verification failed: ${err.message}`)
    })
    return transporter
  }

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
  return true
}

export async function sendEmail(to: string, subject: string, html: string) {
  const t = await getTransporter()
  if (!t) {
    logger.warn(`Email not sent (SMTP not configured): "${subject}" to ${to}`)
    return false
  }

  try {
    logger.info(`Attempting to send email: "${subject}" to ${to} via ${process.env.SMTP_HOST || 'Ethereal'}`)
    const info = await t.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    logger.info(`sendMail response: messageId=${info.messageId} accepted=${info.accepted} rejected=${info.rejected}`)
    if (!process.env.SMTP_HOST && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        etherealUrl = previewUrl
        logger.info(`Ethereal preview URL: ${previewUrl}`)
      } else {
        logger.warn('Ethereal preview URL not available (getTestMessageUrl returned null)')
      }
    }
    logger.info(`Email sent successfully: "${subject}" to ${to}`)
    return true
  } catch (err: any) {
    logger.error(`Failed to send email to ${to}: code=${err.code} response=${err.response} message=${err.message}`)
    return false
  }
}

export function getLastEtherealUrl(): string | null {
  return etherealUrl
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

  return {
    sent,
    previewUrl: process.env.SMTP_HOST ? undefined : getLastEtherealUrl(),
    resetLink: env.NODE_ENV === 'development' ? resetLink : undefined,
  }
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
