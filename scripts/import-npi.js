// scripts/import-npi.js
// Downloads the full NPI data file and imports San Diego providers into Supabase
// Run manually: node scripts/import-npi.js
// Also runs automatically every month via GitHub Actions

import { createClient } from '@supabase/supabase-js';
import { createWriteStream, createReadStream, unlinkSync, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import { createUnzip } from 'zlib';
import { parse } from 'csv-parse';
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
  
  // CMS publishes monthly NPI files — fetch the download page to get latest URL
  const res = await fetch('https://download.cms.gov/nppes/NPI_Files.html');
  const html = await res.text();
  
  // Find the full replacement file download link
  const match = html.match(/href="(https:\/\/download\.cms\.gov\/nppes\/NPPES_Data_Dissemination_[^"]+\.zip)"/);
  
  if (!match) {
    throw new Error('Could not find NPI download URL on CMS website');
  }
  
  console.log(`✅ Found NPI file: ${match[1]}`);
  return match[1];
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

  await new Promise((resolve, reject) => {
    const gunzip = createUnzip();
    const fileStream = createReadStream(zipPath);

    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });

    parser.on('data', async (row) => {
      processed++;

      // Only individual providers
      if (row['Entity Type Code'] !== INDIVIDUAL_ENTITY_TYPE) return;

      // Only CA providers
      if (row['Provider Business Practice Location Address State Name'] !== 'CA') return;

      // Only San Diego zip codes
      const zip = (row['Provider Business Practice Location Address Postal Code'] || '').slice(0, 5);
      if (!SD_ZIPS.has(zip)) return;

      // Only medical providers
      const taxonomyCode = row['Healthcare Provider Taxonomy Code_1'] || '';
      if (!isMedicalProvider(taxonomyCode)) return;

      // Only active records
      if (row['NPI Deactivation Date']) return;

      const npi = row['NPI'];
      if (!npi) return;

      const provider = {
        npi,
        first_name: toProperCase(row['Provider First Name'] || ''),
        last_name: toProperCase(row['Provider Last Name (Legal Name)'] || ''),
        credential: row['Provider Credential Text'] || '',
        gender: row['Provider Gender Code'] || null,
        specialty: toProperCase(row['Healthcare Provider Taxonomy Switch_1'] || row['Healthcare Provider Taxonomy Code_1'] || ''),
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

    // Pipe: zip file → gunzip → csv parser
    pipeline(fileStream, gunzip, parser).catch(reject);
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
