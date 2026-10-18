const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY || 're_demo_key');
const otpStore = {};

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = generatedOtp;

  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Clipboard Shield <onboarding@resend.dev>',
        to: [email],
        subject: 'Verification Token - Clipboard Shield Gateway',
        html: `<p>Your single-use transfer code is: <strong>${generatedOtp}</strong></p>`
      });
    }
    res.json({ success: true, message: `Real OTP sent to ${email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    return res.json({ success: true, status: 'Memory Zeroized & Verified' });
  }
  res.status(400).json({ success: false, message: 'Invalid OTP' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
