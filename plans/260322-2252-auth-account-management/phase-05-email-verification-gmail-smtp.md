---
phase: 5
title: "Email Verification via Gmail SMTP"
status: completed
priority: P1
effort: 1h
depends_on: [2]
---

# Phase 5: Email Verification via Gmail SMTP

## Context Links

- [Better Auth Email Verification](https://www.better-auth.com/docs/authentication/email-password#email-verification)
- [Nodemailer Gmail](https://nodemailer.com/usage/using-gmail/)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)

## Overview

Implement email sending for verification using Nodemailer with Gmail SMTP. Replace the `console.log` placeholder in `src/lib/auth.ts` with actual email delivery.

## Key Insights

- Gmail SMTP via App Password: no OAuth needed, simple setup
- Nodemailer is the standard Node.js email library
- Gmail allows 500 emails/day with App Password (more than enough for personal project)
- Better Auth calls `sendVerificationEmail({ user, url, token })` automatically on signup
- The `url` parameter is the complete verification link users click
- Keep email template simple HTML; no template engine needed

## Requirements

**Functional:**
- Verification email sent on user registration
- Email contains clickable verification link
- Resend verification email on demand
- Simple, clean HTML email template

**Non-functional:**
- Email sending is async (non-blocking)
- Errors logged but don't crash auth flow
- Email utility < 60 lines

## Architecture

```
src/lib/email.ts          <- Nodemailer transporter + sendEmail function
src/lib/auth.ts           <- Uses sendEmail in emailVerification.sendVerificationEmail
.env.local                <- SMTP credentials
```

## Related Code Files

**Create:**
- `src/lib/email.ts` - Email utility with Nodemailer

**Modify:**
- `src/lib/auth.ts` - Replace console.log with actual email sending

## Implementation Steps

### Step 1: Install Nodemailer

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### Step 2: Create email utility `src/lib/email.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - email failure shouldn't block auth flow
  }
}

export function verificationEmailHtml(userName: string, verifyUrl: string) {
  return `
    <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;color:#1f2937">
      <div style="padding:32px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
        <h2 style="margin:0 0 8px;color:#1e40af">ThinkNote</h2>
        <p>Hi ${userName},</p>
        <p>Click the button below to verify your email address:</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${verifyUrl}"
             style="display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
            Verify Email
          </a>
        </div>
        <p style="font-size:13px;color:#6b7280">
          If the button doesn't work, copy this link:<br/>
          <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all">${verifyUrl}</a>
        </p>
        <p style="font-size:12px;color:#9ca3af;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
          If you didn't create an account, ignore this email.
        </p>
      </div>
    </div>
  `;
}
```

### Step 3: Update `src/lib/auth.ts` - replace email placeholder

Replace the `sendVerificationEmail` in the existing auth config:

```typescript
// In the emailVerification config, replace the console.log version:
import { sendEmail, verificationEmailHtml } from './email';

// Inside betterAuth config:
emailVerification: {
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
  sendVerificationEmail: async ({ user, url }) => {
    await sendEmail({
      to: user.email,
      subject: 'Verify your ThinkNote email',
      html: verificationEmailHtml(user.name, url),
    });
  },
},
```

### Step 4: Configure Gmail App Password

1. Go to Google Account > Security > 2-Step Verification (must be enabled)
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create app password for "Mail" / "Other (ThinkNote)"
4. Copy the 16-char password
5. Update `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM="ThinkNote <your-actual-email@gmail.com>"
```

### Step 5: Test email delivery

1. Start dev server: `npm run dev`
2. Register a new user with a real email
3. Check inbox (and spam folder) for verification email
4. Click verification link
5. Verify user.emailVerified = true in Prisma Studio

## Todo List

- [x] Install nodemailer and @types/nodemailer
- [x] Create src/lib/email.ts with transporter + template
- [ ] Update src/lib/auth.ts emailVerification config (blocked: phase 2 must create auth.ts first)
- [ ] Configure Gmail App Password in .env.local (manual step)
- [ ] Test email delivery on registration (requires DB + SMTP config)
- [ ] Test verification link click (requires DB + SMTP config)
- [ ] Test resend verification email (requires DB + SMTP config)
- [ ] Verify email lands in inbox (not spam) (requires DB + SMTP config)

## Success Criteria

- Registration triggers verification email within 5 seconds
- Email contains clickable verification link
- Clicking link verifies the user (emailVerified = true in DB)
- Email renders correctly in Gmail, Outlook
- Non-blocking: auth flow continues even if email fails

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Gmail blocks sending | Low | App Password bypasses OAuth; within free limits |
| Email lands in spam | Medium | Use proper FROM name; user checks spam folder |
| SMTP credentials leak | High | Only in .env.local; never committed |
| Nodemailer connection timeout | Low | Gmail SMTP is reliable; error is caught and logged |

## Security Considerations

- SMTP credentials in `.env.local` only
- Email template has no user-controlled HTML injection (name is text-only context)
- Verification tokens are time-limited (Better Auth manages expiry)
- App Password is separate from Google account password

## Next Steps

- Phase 6: User profile page (depends on working auth flow)
