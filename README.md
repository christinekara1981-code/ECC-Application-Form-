# ECC Online Application Form

This folder contains a simple online application form based on `ECC_Application Form.pdf`.

## Files

- `index.html` - the client-facing form.
- `styles.css` - ECC-branded form styling.
- `script.js` - date prefill, signature pad, and PDF copy download.
- Signature pad - clients can draw, upload, and clear their signature.
- `ecc-logo.jpeg` - logo used in the form.

## PDF copy

The form no longer sends applications by email automatically.

Clients fill the form, sign in the signature box, then click `Download PDF Copy`. The browser print dialog opens, where they can choose `Save as PDF`. The downloaded PDF uses the same visible form layout and includes the signature.

## How to make a client link

Upload all files in this folder to any static hosting service, such as:

- Netlify
- Vercel
- GitHub Pages
- Your existing website hosting or cPanel public folder

After upload, send clients the hosted `index.html` link.
