// api/notify-claim.js
// Sends email to admin when a doctor submits a claim

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { doctorName, specialty, address, city, npi, email, accepting, telehealth, insurance, languages } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Your Doctor SD <admin@yourdoctorsd.com>',
        to: 'admin@yourdoctorsd.com',
        subject: `New Claim Submission — ${doctorName}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: linear-gradient(135deg, #0d3d52, #1a6b8a); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 20px;">🏥 New Claim Submission</h1>
              <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px;">A provider has submitted a listing claim on Your Doctor SD</p>
            </div>

            <div style="background: #f8fbfc; border: 1.5px solid #d4e8ef; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
              <h2 style="color: #0d3d52; font-size: 18px; margin: 0 0 4px;">${doctorName}</h2>
              <p style="color: #1a6b8a; margin: 0 0 12px; font-size: 14px;">${specialty}</p>
              <p style="color: #6b8f99; margin: 0; font-size: 13px;">📍 ${address}, ${city}, CA</p>
              <p style="color: #6b8f99; margin: 4px 0 0; font-size: 13px;">NPI: ${npi}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr style="border-bottom: 1px solid #e8f0f3;">
                <td style="padding: 10px 0; color: #6b8f99; font-weight: 600; width: 140px;">Contact Email</td>
                <td style="padding: 10px 0; color: #0d3d52;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e8f0f3;">
                <td style="padding: 10px 0; color: #6b8f99; font-weight: 600;">Accepting Patients</td>
                <td style="padding: 10px 0; color: #0d3d52;">${accepting ? '✅ Yes' : '❌ No'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e8f0f3;">
                <td style="padding: 10px 0; color: #6b8f99; font-weight: 600;">Telehealth</td>
                <td style="padding: 10px 0; color: #0d3d52;">${telehealth ? '💻 Available' : 'Not offered'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e8f0f3;">
                <td style="padding: 10px 0; color: #6b8f99; font-weight: 600;">Insurance</td>
                <td style="padding: 10px 0; color: #0d3d52;">${insurance?.length > 0 ? insurance.join(', ') : 'None listed'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b8f99; font-weight: 600;">Languages</td>
                <td style="padding: 10px 0; color: #0d3d52;">${languages?.join(', ') || 'English'}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background: #fff8e6; border: 1px solid #f5d78e; border-radius: 8px; font-size: 13px; color: #7a5c00;">
              <strong>Next step:</strong> Verify this provider at 
              <a href="https://npiregistry.cms.hhs.gov/search?number=${npi}" style="color: #1a6b8a;">nppes.cms.hhs.gov</a> 
              then approve in 
              <a href="https://supabase.com" style="color: #1a6b8a;">Supabase</a> by setting <code>verified = true</code>.
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
