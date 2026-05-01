// scripts/import-npi.js
// Downloads the full NPI data file and imports San Diego providers into Supabase
// Run manually: node scripts/import-npi.js
// Also runs automatically every month via GitHub Actions

import { createClient } from '@supabase/supabase-js';
import { createWriteStream, createReadStream, unlinkSync, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import { parse } from 'csv-parse';
import unzipper from 'unzipper';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// San Diego county zip codes
const SD_ZIPS = new Set([
  '91901','91902','91903','91904','91905','91906','91908','91909','91910',
  '91911','91912','91913','91914','91915','91916','91917','91921','91931',
  '91932','91933','91934','91935','91941','91942','91943','91944','91945',
  '91946','91947','91948','91950','91951','91962','91963','91976','91977',
  '91978','91979','91980','91987','92003','92004','92007','92008','92009',
  '92010','92011','92013','92014','92018','92019','92020','92021','92022',
  '92023','92024','92025','92026','92027','92028','92029','92030','92033',
  '92036','92037','92038','92039','92040','92046','92049','92051','92052',
  '92054','92055','92056','92057','92058','92059','92060','92061','92064',
  '92065','92066','92067','92068','92069','92070','92071','92072','92074',
  '92075','92078','92079','92081','92082','92083','92084','92085','92086',
  '92088','92091','92092','92093','92096','92101','92102','92103','92104',
  '92105','92106','92107','92108','92109','92110','92111','92112','92113',
  '92114','92115','92116','92117','92118','92119','92120','92121','92122',
  '92123','92124','92126','92127','92128','92129','92130','92131','92132',
  '92133','92134','92135','92136','92137','92138','92139','92140','92142',
  '92145','92147','92149','92150','92152','92153','92154','92155','92158',
  '92159','92160','92161','92162','92163','92164','92165','92166','92167',
  '92168','92169','92170','92171','92172','92173','92174','92175','92176',
  '92177','92178','92179','92182','92184','92186','92187','92190','92191',
  '92192','92193','92194','92195','92196','92197','92198','92199',
]);

// Only import individual providers (not organizations) with these entity types
const INDIVIDUAL_ENTITY_TYPE = '1';

// NPI taxonomy codes that indicate medical providers (not labs, suppliers etc.)
const MEDICAL_PREFIXES = [
  '207', '208', '363', '364', '367', '374', '376', '111', '122', '124',
  '125', '126', '132', '133', '136', '152', '156', '163', '164', '171',
  '174', '175', '176', '177', '183', '193', '261', '291', '302', '305',
  '310', '311', '313', '314', '315', '317', '320', '321', '322', '323',
  '324', '385',
];

// Full taxonomy code to human-readable specialty name mapping
const TAXONOMY_NAMES = {
  '207Q00000X': 'Family Medicine',
  '207R00000X': 'Internal Medicine',
  '208000000X': 'Pediatrics',
  '207RC0000X': 'Cardiology',
  '207N00000X': 'Dermatology',
  '207X00000X': 'Orthopedic Surgery',
  '2084P0800X': 'Psychiatry',
  '207RG0100X': 'Gastroenterology',
  '207V00000X': 'OB-GYN',
  '2084N0400X': 'Neurology',
  '207RO0200X': 'Oncology',
  '207RE0101X': 'Endocrinology',
  '207RU0200X': 'Pulmonology',
  '207W00000X': 'Ophthalmology',
  '207Y00000X': 'ENT (Otolaryngology)',
  '207RR0500X': 'Rheumatology',
  '208800000X': 'Urology',
  '207P00000X': 'Emergency Medicine',
  '207L00000X': 'Anesthesiology',
  '208600000X': 'Surgery',
  '207RG0300X': 'Geriatric Medicine',
  '207RI0200X': 'Infectious Disease',
  '207RN0300X': 'Nephrology',
  '207RH0000X': 'Hematology',
  '207RA0401X': 'Addiction Medicine',
  '2083P0500X': 'Preventive Medicine',
  '2085R0202X': 'Diagnostic Radiology',
  '207ZP0102X': 'Pathology',
  '207T00000X': 'Neurological Surgery',
  '208200000X': 'Plastic Surgery',
  '207K00000X': 'Allergy & Immunology',
  '207C00000X': 'Colon & Rectal Surgery',
  '208G00000X': 'Thoracic Surgery',
  '208100000X': 'Physical Medicine & Rehabilitation',
  '2084P0802X': 'Addiction Psychiatry',
  '2084P0805X': 'Geriatric Psychiatry',
  '363L00000X': 'Nurse Practitioner',
  '363A00000X': 'Physician Assistant',
  '364S00000X': 'Clinical Nurse Specialist',
  '367500000X': 'Nurse Anesthetist',
  '183500000X': 'Pharmacy',
  '163W00000X': 'Registered Nurse',
  '171M00000X': 'Case Manager',
  '122300000X': 'Dentistry',
  '1223G0001X': 'General Dentistry',
  '1223P0221X': 'Pediatric Dentistry',
  '1223X0400X': 'Orthodontics',
  '1223S0112X': 'Oral Surgery',
  '152W00000X': 'Optometry',
  '156F00000X': 'Optometry Technician',
  '111N00000X': 'Chiropractic',
  '133V00000X': 'Dietitian',
  '171100000X': 'Acupuncturist',
  '175F00000X': 'Case Manager/Care Coordinator',
  '174400000X': 'Specialist',
  '171W00000X': 'Contractor',
  '225100000X': 'Physical Therapy',
  '225200000X': 'Occupational Therapy',
  '225400000X': 'Speech-Language Pathology',
  '225600000X': 'Dance Therapy',
  '225700000X': 'Massage Therapy',
  '225800000X': 'Recreation Therapy',
  '225900000X': 'Respiratory Therapy',
  '225A00000X': 'Music Therapy',
  '225B00000X': 'Pulmonary Function Technologist',
  '225C00000X': 'Rehabilitation Counselor',
  '226300000X': 'Kinesiotherapist',
  '231H00000X': 'Audiologist',
  '235500000X': 'Specialist/Technologist',
  '247100000X': 'Radiologic Technologist',
  '261QM0801X': 'Mental Health Clinic',
  '261QR0400X': 'Rehabilitation Clinic',
  '291U00000X': 'Clinical Medical Laboratory',
  '302R00000X': 'Exclusive Provider Organization',
  '305R00000X': 'Preferred Provider Organization',
  '310400000X': 'Assisted Living Facility',
  '311500000X': 'Alzheimer Center',
  '314000000X': 'Skilled Nursing Facility',
  '320600000X': 'Residential Treatment Facility',
  '323P00000X': 'Psychiatric Residential Treatment Facility',
  '324500000X': 'Substance Abuse Rehabilitation Facility',
  '385H00000X': 'Respite Care Facility',
  '101Y00000X': 'Counselor',
  '101YA0400X': 'Addiction Counselor',
  '101YM0800X': 'Mental Health Counselor',
  '101YP1600X': 'Pastoral Counselor',
  '101YP2500X': 'Psychoanalyst',
  '101YS0200X': 'School Counselor',
  '103G00000X': 'Clinical Neuropsychologist',
  '103K00000X': 'Behavioral Analyst',
  '103T00000X': 'Psychologist',
  '104100000X': 'Social Worker',
  '1041C0700X': 'Clinical Social Worker',
  '1041S0200X': 'School Social Worker',
  '106E00000X': 'Assistant Behavior Analyst',
  '106H00000X': 'Marriage & Family Therapist',
  '106S00000X': 'Behavior Technician',
  '122400000X': 'Denturist',
  '1223D0001X': 'Dental Public Health',
  '1223E0200X': 'Endodontics',
  '1223P0300X': 'Periodontology',
  '1223P0700X': 'Prosthodontics',
  '207QA0401X': 'Addiction Medicine (Family)',
  '207QA0505X': 'Adult Medicine',
  '207QB0002X': 'Obesity Medicine',
  '207QG0300X': 'Geriatric Medicine (Family)',
  '207QH0002X': 'Hospice and Palliative Medicine',
  '207QS0010X': 'Sports Medicine (Family)',
  '207QS1201X': 'Sleep Medicine (Family)',
  '207RA0000X': 'Aerospace Medicine',
  '207RA0001X': 'Addiction Medicine (Internal)',
  '207RA0002X': 'Adult Congenital Heart Disease',
  '207RB0002X': 'Obesity Medicine (Internal)',
  '207RC0200X': 'Critical Care Medicine',
  '207RH0003X': 'Hematology & Oncology',
  '207RI0001X': 'Clinical & Laboratory Immunology',
  '207RM1200X': 'Magnetic Resonance Imaging',
  '207RS0010X': 'Sports Medicine (Internal)',
  '207RS0012X': 'Sleep Medicine (Internal)',
  '207RT0003X': 'Transplant Hepatology',
  '207RX0202X': 'Medical Oncology',
  '207SC0300X': 'Pain Medicine',
  '207SG0201X': 'Gynecological Oncology',
  '207SM0001X': 'Maternal & Fetal Medicine',
  '207SR0006X': 'Reproductive Endocrinology',
  '207SV0000X': 'Vascular Surgery',
  '207VB0002X': 'Obesity Medicine (OB)',
  '207VX0000X': 'Gynecology',
  '207VX0201X': 'Gynecologic Oncology',
  '207XS0106X': 'Hand Surgery (Ortho)',
  '207XS0114X': 'Adult Reconstructive Orthopaedic Surgery',
  '207XS0117X': 'Orthopaedic Surgery of the Spine',
  '207XX0004X': 'Foot and Ankle Surgery',
  '207XX0005X': 'Sports Medicine (Ortho)',
  '207XX0801X': 'Orthopaedic Trauma',
  '207YS0123X': 'Facial Plastic Surgery',
  '207YX0007X': 'Otolaryngic Allergy',
  '207YX0602X': 'Otolaryngology/Facial Plastic Surgery',
  '207YX0901X': 'Otology & Neurotology',
  '207YX0905X': 'Pediatric Otolaryngology',
  '208VP0000X': 'Pain Medicine (Phys Med)',
  '2086S0102X': 'Surgical Oncology',
  '2086S0105X': 'Transplant Surgery',
  '2086S0120X': 'Pediatric Surgery',
  '2086S0122X': 'Plastic and Reconstructive Surgery',
  '2086S0127X': 'Trauma Surgery',
  '2086S0129X': 'Vascular and Interventional Radiology',
  '208VP0014X': 'Interventional Pain Medicine',
  '2084A0401X': 'Addiction Psychiatry',
  '2084B0002X': 'Obesity Medicine (Psych)',
  '2084D0003X': 'Diagnostic Neuroimaging',
  '2084F0202X': 'Forensic Psychiatry',
  '2084H0002X': 'Hospice and Palliative Medicine (Psych)',
  '2084N0402X': 'Neurology with Special Qualifications',
  '2084N0600X': 'Clinical Neurophysiology',
  '2084P0005X': 'Neurodevelopmental Disabilities',
  '2084P0301X': 'Brain Injury Medicine',
  '2084P2900X': 'Pain Medicine (Psych)',
  '2084S0010X': 'Sports Medicine (Psych)',
  '2084S0012X': 'Sleep Medicine (Psych)',
  '2084V0102X': 'Vascular Neurology',
  '208D00000X': 'General Practice',
  '208M00000X': 'Preventive Medicine (Occupational)',
  '208U00000X': 'Clinical Pharmacology',
  '209800000X': 'Legal Medicine',
  '310500000X': 'Intermediate Care Facility',
  '3104A0625X': 'Assisted Living Facility (Behavioral)',
  '3104A0630X': 'Assisted Living Facility (Residential)',
};

function getTaxonomyName(code) {
  if (!code) return 'General Practice';
  const clean = code.toLowerCase().replace(/\s/g, '');
  // Direct lookup
  const upper = code.toUpperCase();
  if (TAXONOMY_NAMES[upper]) return TAXONOMY_NAMES[upper];
  // Partial match on first 7 chars
  const partial = Object.keys(TAXONOMY_NAMES).find(k => k.startsWith(upper.slice(0,7)));
  if (partial) return TAXONOMY_NAMES[partial];
  return 'General Practice';
}

function isMedicalProvider(taxonomyCode) {
  if (!taxonomyCode) return false;
  return MEDICAL_PREFIXES.some(prefix => taxonomyCode.startsWith(prefix));
}

function toProperCase(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function formatPhone(phone) {
  if (!phone) return null;
  const d = phone.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return phone;
}

// ── DOWNLOAD NPI FILE ────────────────────────────────────────────────────────
async function getNPIDownloadUrl() {
  console.log('📡 Finding latest NPI data file...');

  // Try to scrape the CMS page first
  try {
    const res = await fetch('https://download.cms.gov/nppes/NPI_Files.html', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; YourDoctorSD/1.0)' }
    });
    const html = await res.text();

    // Try multiple patterns to find the download link
    const patterns = [
      /href="(https?:\/\/download\.cms\.gov\/nppes\/NPPES_Data_Dissemination_[^"]+\.zip)"/,
      /href="(\/nppes\/NPPES_Data_Dissemination_[^"]+\.zip)"/,
      /(NPPES_Data_Dissemination_[A-Za-z0-9_]+\.zip)/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let url = match[1];
        if (url.startsWith('/')) url = 'https://download.cms.gov' + url;
        if (!url.startsWith('http')) url = 'https://download.cms.gov/nppes/' + url;
        console.log(`✅ Found NPI file: ${url}`);
        return url;
      }
    }
  } catch (e) {
    console.log('Could not scrape CMS page, using direct URL...');
  }

  // Fallback: build URL from current date (CMS uses format: NPPES_Data_Dissemination_MonthYYYY)
  const now = new Date();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const url = `https://download.cms.gov/nppes/NPPES_Data_Dissemination_${month}_${year}.zip`;
  console.log(`✅ Using direct URL: ${url}`);
  return url;
}

async function downloadFile(url, destPath) {
  console.log(`⬇️  Downloading NPI data file (this is large ~700MB, may take a few minutes)...`);
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  
  const fileStream = createWriteStream(destPath);
  await pipeline(res.body, fileStream);
  
  console.log(`✅ Download complete`);
}

// ── PARSE AND IMPORT ─────────────────────────────────────────────────────────
async function importProviders(zipPath) {
  console.log('🔍 Parsing NPI data and filtering to San Diego county...');

  let processed = 0;
  let imported = 0;
  let batch = [];
  const BATCH_SIZE = 500;

  async function flushBatch() {
    if (batch.length === 0) return;
    const { error } = await supabase
      .from('providers')
      .upsert(batch, { onConflict: 'npi' });
    if (error) {
      console.error('❌ Batch insert error:', error.message);
    } else {
      imported += batch.length;
      console.log(`  ✓ Imported ${imported} providers so far...`);
    }
    batch = [];
  }

  // Open the zip and find the CSV file inside
  const directory = await unzipper.Open.file(zipPath);
  const csvFile = directory.files.find(f => f.path.endsWith('.csv') && f.path.includes('npidata'));

  if (!csvFile) {
    throw new Error('Could not find NPI CSV file inside zip. Files found: ' + directory.files.map(f => f.path).join(', '));
  }

  console.log(`📄 Found CSV: ${csvFile.path}`);

  await new Promise((resolve, reject) => {
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });

    let headersLogged = false;
    parser.on('data', async (row) => {
      if (!headersLogged) {
        const genderKeys = Object.keys(row).filter(k => k.toLowerCase().includes('gender'));
        console.log('Gender-related columns:', genderKeys);
        console.log('Sample gender value:', genderKeys.map(k => `${k}: ${row[k]}`));
        headersLogged = true;
      }
      processed++;
      if (processed % 500000 === 0) console.log(`  ... processed ${processed.toLocaleString()} rows`);

      if (row['Entity Type Code'] !== INDIVIDUAL_ENTITY_TYPE) return;
      if (row['Provider Business Practice Location Address State Name'] !== 'CA') return;

      const zip = (row['Provider Business Practice Location Address Postal Code'] || '').slice(0, 5);
      if (!SD_ZIPS.has(zip)) return;

      const taxonomyCode = row['Healthcare Provider Taxonomy Code_1'] || '';
      if (!isMedicalProvider(taxonomyCode)) return;

      if (row['NPI Deactivation Date']) return;

      const npi = row['NPI'];
      if (!npi) return;

      const provider = {
        npi,
        first_name: toProperCase(row['Provider First Name'] || ''),
        last_name: toProperCase(row['Provider Last Name (Legal Name)'] || ''),
        credential: row['Provider Credential Text'] || '',
        gender: row['Provider Gender Code'] || row['provider_gender_code'] || null,
        specialty: getTaxonomyName(row['Healthcare Provider Taxonomy Code_1'] || ''),
        address: toProperCase(row['Provider First Line Business Practice Location Address'] || ''),
        city: toProperCase(row['Provider Business Practice Location Address City Name'] || ''),
        state: 'CA',
        zip,
        phone: formatPhone(row['Provider Business Practice Location Address Telephone Number'] || ''),
        last_updated: new Date().toISOString(),
      };

      batch.push(provider);

      if (batch.length >= BATCH_SIZE) {
        parser.pause();
        await flushBatch();
        parser.resume();
      }
    });

    parser.on('end', async () => {
      await flushBatch();
      console.log(`\n✅ Done! Processed ${processed.toLocaleString()} total NPI records`);
      console.log(`✅ Imported ${imported.toLocaleString()} San Diego providers into Supabase`);
      resolve();
    });

    parser.on('error', reject);

    csvFile.stream().pipe(parser);
  });

  return imported;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🏥 Your Doctor SD — NPI Import Script');
  console.log('=====================================\n');

  const zipPath = path.join(__dirname, 'npi_data.zip');

  try {
    // Step 1: Get download URL
    const downloadUrl = await getNPIDownloadUrl();

    // Step 2: Download the file
    await downloadFile(downloadUrl, zipPath);

    // Step 3: Parse and import
    const count = await importProviders(zipPath);

    // Step 4: Clean up the large zip file
    if (existsSync(zipPath)) {
      unlinkSync(zipPath);
      console.log('🧹 Cleaned up temporary files');
    }

    console.log(`\n🎉 Import complete! ${count.toLocaleString()} San Diego providers are now in your database.`);

  } catch (err) {
    console.error('\n❌ Import failed:', err.message);
    if (existsSync(zipPath)) unlinkSync(zipPath);
    process.exit(1);
  }
}

main();
