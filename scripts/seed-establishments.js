/**
 * seed-establishments.js
 *
 * Seeds the 15 dummy Soothera salon establishments into Firestore
 * by calling the deployed backend REST API directly.
 *
 * Uses ONLY Node.js built-ins + form-data + node-fetch (v2).
 *
 * ── How to run ────────────────────────────────────────────────
 *  1. Install one-time deps (from the Soothera_Frontend root):
 *       npm install --save-dev node-fetch@2 form-data
 *
 *  2. You NEED a valid Bearer token (Admin or SuperAdmin account).
 *     Login at http://fl-soothera-api.somee.com/api/Authentication/login
 *     then paste the token below, OR set env var SOOTHERA_TOKEN.
 *
 *  3. Run:
 *       node scripts/seed-establishments.js
 * ─────────────────────────────────────────────────────────────
 */

const fetch = require('node-fetch');
const FormData = require('form-data');

// ── Config ────────────────────────────────────────────────────
const BASE_URL = 'http://fl-soothera-api.somee.com/api';

// Paste your Bearer token here, or set env var SOOTHERA_TOKEN
const BEARER_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImVlYzIxN2Q0MThjYjhlNWEzMTQzMThhMGQyZmZhNGUwY2ViMmU0Y2MiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc29vdGhlcmFkYiIsImF1ZCI6InNvb3RoZXJhZGIiLCJhdXRoX3RpbWUiOjE3Nzg4MTgwMzgsInVzZXJfaWQiOiJTcVF2NndVMlNNT3NTallodXdTZ0lTZk5zSUIyIiwic3ViIjoiU3FRdjZ3VTJTTU9zU2pZaHV3U2dJU2ZOc0lCMiIsImlhdCI6MTc3ODgxODAzOCwiZXhwIjoxNzc4ODIxNjM4LCJlbWFpbCI6IndpdmFqYTQxNzdAbnlzcHJpbmcuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsid2l2YWphNDE3N0BueXNwcmluZy5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.NqLJHDP6rfYd1EVsEdMlAhXLMW2q4L6R4ATDiUT6mfBk2hn0s51ewSbBe8xfJz0x7Jg8mVIyaKmhpt30MaxWVQBvYQRiCF_OGn1OKgZ8EbmZZUsMscFJxwIJJOaik0dNyeK475t7pAG3IP207qW7nMh4AChgsS2swEPIvaSMvjZ_DbKh7XO4DZDbFCu1twYX9l5YxrOgVzz6pkpPp8cNptUR8nyI254-W2RTwH5oDUi6s87zhabXO4Ou1sz0OeJY3H9etDufVI7nzVm0VPSmm_HrGD_6THzZuP-pfYuCsuhjLZf7jSrWXz05Re1fXXgOGEDS9_tqJgU2fJ2ZtI3E2A';

if (!BEARER_TOKEN || BEARER_TOKEN.length < 20) {
  console.error(
    '\n❌  No token provided!\n' +
    '   Set env var:  SOOTHERA_TOKEN=<your_token>  node scripts/seed-establishments.js\n' +
    '   Or paste your token directly into BEARER_TOKEN in this file.\n'
  );
  process.exit(1);
}

// ── Establishment data ────────────────────────────────────────
const establishments = [
  {
    name: 'Grand Royal Spa',
    address: 'Crowne Garden Hotel, 360 Salinas Dr, Cebu City, 6000 Cebu',
    description:
      'Grand Royal Spa is where elegance meets relaxation. Located in the heart of Cebu City, we specialize in Thai massage and aromatherapy treatments. Our beautifully designed space and expert therapists create an atmosphere of pure luxury and tranquility.',
    contactNumber: '09173080192',
    businessHours: 'Mon - Sun | 11:00 AM - 01:00 AM',
    socials: ['https://www.facebook.com/GlamourHouse'],
  },
  {
    name: 'Serene Wellness Spa',
    address: '2F, Li center, F. Cabahug St, Cebu City, 6000 Cebu',
    description:
      'Serene Wellness Spa combines Eastern healing wisdom with Western therapeutic techniques. Our Shiatsu specialists and combination massage therapists work together to restore balance to your body and mind.',
    contactNumber: '09681051515',
    businessHours: 'Mon - Sun | 2:00 PM - 12:00 AM',
    socials: ['https://www.facebook.com/ZenWellnessCenter'],
  },
  {
    name: 'Dream Spa',
    address: 'F.Cabahug Mabolo, Cebu City, 6000 Cebu',
    description:
      'Dream Spa brings contemporary spa experiences to Cebu City. We blend traditional Dagdagay foot therapy with modern combination massages, creating unique treatment protocols tailored to your needs.',
    contactNumber: '09664905094',
    businessHours: 'Mon - Sun | 24 Hours',
    socials: ['https://www.facebook.com/StyleStudio'],
  },
  {
    name: 'The First Spa and Asian Healing',
    address: 'Unit 4, ESY bldg, MP Yap st, cor Juana Osmeña St, Cebu City',
    description:
      'The First Spa and Asian Healing combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists.',
    contactNumber: '09623314535',
    businessHours: 'Mon - Sun | 2:00 PM - 11:30 PM',
    socials: ['https://www.facebook.com/EleganceMassageSpa'],
  },
  {
    name: 'Green Orkid Wellness Spa',
    address: 'Tres Borces Ext, Mabolo, Cebu City, 6000 Cebu',
    description:
      'Green Orkid Wellness Spa offers a peaceful escape from the urban hustle. Our signature hot stone massages and aromatherapy sessions are designed to melt away stress and tension.',
    contactNumber: '09658957058',
    businessHours: 'Mon - Sun | 24 Hours',
    socials: ['https://www.facebook.com/SerenitySpa'],
  },
  {
    name: "Angel's Paradise",
    address: '2nd floor, Allprime Ventures Building, La Guardia St, Salinas Dr, Cebu City, 6000 Cebu',
    description:
      "Angel's Paradise offers a holistic approach to beauty and wellness. Our team of certified specialists provides personalized treatments using organic products and time-tested Filipino healing traditions.",
    contactNumber: '09393362667',
    businessHours: 'Mon - Sun | 10:00 AM - 05:00 AM',
    socials: ['https://www.facebook.com/BeautyHaven'],
  },
  {
    name: 'Young Hands Spa',
    address: 'PADRE ST, 180 TRES BORCES, Mabolo, Cebu City, 6000 Cebu',
    description:
      'Young Hands Spa specializes in traditional Filipino healing therapies. Our expert practitioners offer authentic Hilot, Dagdagay, and Bentosa treatments passed down through generations.',
    contactNumber: '09665261602',
    businessHours: 'Mon - Sun | 24 Hours',
    socials: ['https://www.facebook.com/TranquilTouch'],
  },
  {
    name: 'Olle Spa',
    address: 'Paseo Saturnino, Cebu City, 6000 Cebu',
    description:
      'Olle Spa is your sanctuary for complete relaxation. Our comprehensive spa menu includes Thai massage, aromatherapy, and hot stone therapies. Each treatment is customized to address your specific wellness goals.',
    contactNumber: '09562206222',
    businessHours: 'Mon - Sun | 10 AM - 12:00 AM',
    socials: ['https://www.facebook.com/BlissfulRetreat'],
  },
  {
    name: 'Selene Spa',
    address: '8WR9+V75, Banilad, Cebu',
    description:
      'Selene Spa at Crossroads brings together the best of multiple massage traditions. Our skilled therapists excel in Shiatsu, Swedish, and specialized foot massage techniques.',
    contactNumber: '09959171277',
    businessHours: 'Mon - Sun | 1:00 PM - 12:00 AM',
    socials: ['https://www.facebook.com/SeleneSpaOfficial'],
  },
  {
    name: 'Spa Del Sur',
    address: '8VJX+9Q5, SSY BUSINESS CENTER, Salinas Dr, Cebu City, 6000 Cebu',
    description:
      'Spa Del Sur combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists.',
    contactNumber: '09618742873',
    businessHours: 'Mon - Sun | 1:00 PM - 1:00 AM',
    socials: ['https://www.facebook.com/EleganceMassageSpa'],
  },
  {
    name: 'PISIL Traditional Filipino Massage',
    address: 'Unit 3, Galleria Fuente, Cebu City, 6000',
    description:
      'PISIL Traditional Filipino Massage specializes in authentic Filipino healing arts. Experience refined luxury with our award-winning therapists.',
    contactNumber: '09694056575',
    businessHours: 'Mon - Sun | 12:00 PM - 3:00 AM',
    socials: ['https://www.facebook.com/EleganceMassageSpa'],
  },
  {
    name: 'Healing Hands Wellness Spa',
    address: 'Ground Floor, Mango Square, Gen. Maxilom Ave., Cebu City',
    description:
      'Healing Hands Wellness Spa delivers therapeutic excellence around the clock. Our Thai massage and hot stone treatments are performed by internationally trained therapists.',
    contactNumber: '09150441354',
    businessHours: 'Mon - Sun | 24 Hours',
    socials: ['https://www.facebook.com/EleganceMassageSpa'],
  },
  {
    name: '108 SPA',
    address: 'T. Borces St., Cebu City, 6000 Cebu',
    description:
      '108 Spa is a luxury wellness destination specializing in premium massage therapies. Our award-winning therapists combine traditional techniques with modern innovations.',
    contactNumber: '09285555651',
    businessHours: 'Mon - Sun | 10:00 AM - 05:00 AM',
    socials: ['https://www.facebook.com/MassageSpaElite'],
  },
  {
    name: 'Thai Cha Massage',
    address: '2-14 J. Solon Dr, Cebu City, 6000 Cebu',
    description:
      'Thai Cha Massage brings authentic Thai healing traditions to Cebu. Our expert practitioners specialise in Thai massage, hot stone, and aromatherapy treatments.',
    contactNumber: '09277112292',
    businessHours: 'Mon - Sun | 24 Hours',
    socials: ['https://www.facebook.com/EleganceMassageSpa'],
  },
  {
    name: 'Noble Spa Massage',
    address: '2nd floor, Archbishop Reyes Ave, Cebu City, 6000 Cebu',
    description:
      'Noble Spa Massage offers a refined wellness experience in the heart of Cebu City. Our therapists are trained in Thai, aromatherapy, hot stone, and traditional Hilot techniques.',
    contactNumber: '09056651615',
    businessHours: 'Mon - Sun | 24 Hours',
    socials: ['https://www.facebook.com/EleganceMassageSpa'],
  },
];

// ── Helpers ───────────────────────────────────────────────────

/** Downloads a tiny placeholder JPEG to use as PictureFile for all entries. */
async function fetchPlaceholderImage() {
  const res = await fetch('https://picsum.photos/seed/soothera/200/200.jpg');
  if (!res.ok) throw new Error(`Failed to fetch placeholder image: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Seed function ─────────────────────────────────────────────
async function seedOne(salon, index, imageBuffer) {
  const form = new FormData();
  form.append('Name', salon.name);
  form.append('Address', salon.address);
  if (salon.description) form.append('Description', salon.description);
  if (salon.contactNumber) form.append('ContactNumber', salon.contactNumber);
  if (salon.businessHours) form.append('BusinessHours', salon.businessHours);
  salon.socials.forEach((s) => form.append('Socials', s));
  // Attach the placeholder image so the backend's required PictureFile field is satisfied
  form.append('PictureFile', imageBuffer, { filename: 'salon.jpg', contentType: 'image/jpeg' });

  try {
    const res = await fetch(`${BASE_URL}/Establishment/add`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const raw = await res.text();
    let json;
    try { json = JSON.parse(raw); } catch { json = null; }

    if (json && json.success) {
      console.log(`✅  [${index + 1}/15] "${salon.name}" → id: ${json.data?.id ?? '(no id)'}`);
    } else {
      const msg = json?.message ?? raw.slice(0, 200);
      console.error(`❌  [${index + 1}/15] "${salon.name}" → HTTP ${res.status}: ${msg}`);
    }
  } catch (err) {
    console.error(`💥  [${index + 1}/15] "${salon.name}" → ${err.message}`);
  }
}

async function seed() {
  console.log('\n📥  Fetching placeholder image...');
  let imageBuffer;
  try {
    imageBuffer = await fetchPlaceholderImage();
    console.log(`    ✅ Got placeholder image (${imageBuffer.length} bytes)\n`);
  } catch (err) {
    console.error('💥  Could not fetch placeholder image:', err.message);
    process.exit(1);
  }

  console.log(`🚀  Seeding ${establishments.length} establishments to ${BASE_URL}\n`);
  for (let i = 0; i < establishments.length; i++) {
    await seedOne(establishments[i], i, imageBuffer);
    // Small delay to avoid hammering the server
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log('\n✨  Done!\n');
}

seed();
