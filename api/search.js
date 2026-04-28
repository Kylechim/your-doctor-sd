// api/search.js
// Vercel Serverless Function — runs on the server, no CORS issues
// Called by the frontend at /api/search?specialty=Cardiology&city=San+Diego

const TAXONOMY_MAP = {
  'family medicine': 'Family Medicine*',
  'primary care': 'Family Medicine*',
  'internal medicine': 'Internal Medicine*',
  'pediatrics': 'Pediatrics*',
  'cardiology': 'Cardiovascular*',
  'dermatology': 'Dermatology*',
  'orthopedics': 'Orthopaedic*',
  'psychiatry': 'Psychiatry*',
  'gastroenterology': 'Gastroenterology*',
  'ob-gyn': 'Obstetrics*',
  'obgyn': 'Obstetrics*',
  'neurology': 'Neurology*',
  'oncology': 'Oncology*',
  'endocrinology': 'Endocrinology*',
  'pulmonology': 'Pulmonary*',
  'ophthalmology': 'Ophthalmology*',
  'ent': 'Otolaryngology*',
  'rheumatology': 'Rheumatology*',
  'urology': 'Urology*',
};

function formatPhone(phone) {
  if (!phone) return null;
  const d = phone.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return phone;
}

function getSpecialty(taxonomies) {
  if (!taxonomies || !taxonomies.length) return 'General Practice';
  const primary = taxonomies.find(t => t.primary) || taxonomies[0];
  return primary?.desc || 'General Practice';
}

function transformDoctor(raw, index) {
  const b = raw.basic || {};
  const addr = raw.addresses?.find(a => a.address_purpose === 'LOCATION') || raw.addresses?.[0] || {};
  const phone = formatPhone(addr.telephone_number);
  const firstName = b.first_name || '';
  const lastName = b.last_name || '';
  const credential = b.credential || 'MD';
  const name = `Dr. ${firstName} ${lastName}, ${credential}`.trim();

  return {
    id: raw.number || index,
    name,
    specialty: getSpecialty(raw.taxonomies),
    city: addr.city ? addr.city.replace(/\b\w/g, l => l.toUpperCase()) : 'San Diego',
    address: addr.address_1 || '',
    phone: phone || 'Call for number',
    gender: b.gender || null,
    npi: raw.number || '',
    accepting: true, // NPI doesn't provide this — community reports will update it
    telehealth: false, // Same — community driven
    languages: ['English'], // NPI doesn't provide this either
  };
}

export default async function handler(req, res) {
  // Allow requests from our frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { specialty, city, name, limit = '25' } = req.query;

  if (!specialty && !name) {
    return res.status(400).json({ error: 'Please provide a specialty or name to search.' });
  }

  try {
    const params = new URLSearchParams({
      version: '2.1',
      enumeration_type: 'NPI-1',
      limit: Math.min(parseInt(limit), 200).toString(),
      state: 'CA',
    });

    // City filter
    const cityFilter = city && city !== 'All of San Diego' ? city : 'San Diego';
    params.set('city', cityFilter);

    if (name) {
      // Name search — split into first/last
      const parts = name.trim().replace(/^dr\.?\s*/i, '').split(/\s+/);
      if (parts.length >= 2) {
        params.set('first_name', parts[0] + '*');
        params.set('last_name', parts[parts.length - 1] + '*');
      } else {
        params.set('last_name', parts[0] + '*');
      }
    } else {
      // Specialty search — map to NPI taxonomy description
      const key = specialty.toLowerCase().trim();
      const taxonomy = TAXONOMY_MAP[key] || (specialty + '*');
      params.set('taxonomy_description', taxonomy);
    }

    const url = `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NPI API responded with ${response.status}`);
    }

    const data = await response.json();

    if (data.Errors) {
      return res.status(400).json({ error: 'Invalid search parameters.', details: data.Errors });
    }

    const results = (data.results || []).map(transformDoctor);

    return res.status(200).json({
      results,
      total: data.result_count || results.length,
      query: { specialty, city: cityFilter, name },
    });

  } catch (err) {
    console.error('NPI fetch error:', err);
    return res.status(500).json({ error: 'Failed to reach the NPI registry. Please try again.' });
  }
}
