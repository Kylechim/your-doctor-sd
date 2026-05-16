// api/search.js
// Queries our Supabase database of 80,000+ San Diego providers

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const SPECIALTY_ALIASES = {
  'primary care': 'Family Medicine',
  'general practice': 'Family Medicine',
  'gp': 'Family Medicine',
  'ob-gyn': 'OB-GYN',
  'obgyn': 'OB-GYN',
  'obstetrics': 'OB-GYN',
  'gynecology': 'OB-GYN',
  'ent': 'ENT',
  'ear nose throat': 'ENT',
  'otolaryngology': 'ENT',
  'heart': 'Cardiology',
  'cardio': 'Cardiology',
  'ortho': 'Orthopedic Surgery',
  'orthopedics': 'Orthopedic Surgery',
  'orthopaedics': 'Orthopedic Surgery',
  'mental health': 'Psychiatry',
  'psychiatrist': 'Psychiatry',
  'skin': 'Dermatology',
  'dermatologist': 'Dermatology',
  'eye': 'Ophthalmology',
  'eyes': 'Ophthalmology',
  'vision': 'Ophthalmology',
  'stomach': 'Gastroenterology',
  'digestive': 'Gastroenterology',
  'brain': 'Neurology',
  'nerve': 'Neurology',
  'neurologist': 'Neurology',
  'cancer': 'Oncology',
  'oncologist': 'Oncology',
  'lung': 'Pulmonology',
  'lungs': 'Pulmonology',
  'breathing': 'Pulmonology',
  'kidney': 'Nephrology',
  'kidneys': 'Nephrology',
  'blood': 'Hematology',
  'hormone': 'Endocrinology',
  'diabetes': 'Endocrinology',
  'thyroid': 'Endocrinology',
  'joint': 'Rheumatology',
  'arthritis': 'Rheumatology',
  'bladder': 'Urology',
  'urinary': 'Urology',
  'allergy': 'Allergy & Immunology',
  'allergies': 'Allergy & Immunology',
  'allergist': 'Allergy & Immunology',
  'sleep': 'Sleep Medicine',
  'sports': 'Sports Medicine',
  'pain': 'Pain Medicine',
  'np': 'Nurse Practitioner',
  'nurse practitioner': 'Nurse Practitioner',
  'pa': 'Physician Assistant',
  'physician assistant': 'Physician Assistant',
  'dentist': 'General Dentistry',
  'dental': 'General Dentistry',
  'dentistry': 'General Dentistry',
  'optometry': 'Optometry',
  'optometrist': 'Optometry',
  'chiropractor': 'Chiropractic',
  'chiropractic': 'Chiropractic',
  'podiatrist': 'Podiatry',
  'foot': 'Podiatry',
  'feet': 'Podiatry',
  'hearing': 'Audiology',
  'audiologist': 'Audiology',
};

function resolveSpecialty(input) {
  if (!input || input === 'All Specialties') return null;
  const lower = input.toLowerCase().trim();
  if (SPECIALTY_ALIASES[lower]) return SPECIALTY_ALIASES[lower];
  return input;
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

function buildDoctor(row, claimed) {
  const firstName = toProperCase(row.first_name || '');
  const lastName = toProperCase(row.last_name || '');
  const credential = (row.credential || 'MD').replace(/\.$/, '');
  const name = `Dr. ${firstName} ${lastName}, ${credential}`.trim();

  return {
    id: row.npi,
    npi: row.npi,
    name,
    specialty: toProperCase(row.specialty || 'General Practice'),
    city: toProperCase(row.city || 'San Diego'),
    address: toProperCase(row.address || ''),
    phone: formatPhone(row.phone) || 'Call for number',
    gender: row.gender || null,
    accepting: claimed ? (claimed.accepting_patients ?? null) : null,
    telehealth: claimed ? (claimed.telehealth ?? null) : null,
    languages: claimed?.languages ?? ['English'],
    insurance: claimed?.insurance ?? [],
    hours: claimed?.hours ?? null,
    photo_url: claimed?.photo_url ?? null,
    bio: claimed?.bio ?? null,
    verified: claimed ? true : false,
  };
}

// Score a result for name search relevance — first name matches rank higher
function scoreNameMatch(row, firstName, lastName) {
  let score = 0;
  const fn = (row.first_name || '').toLowerCase();
  const ln = (row.last_name || '').toLowerCase();

  if (firstName) {
    if (fn === firstName) score += 10;         // exact first name match
    else if (fn.startsWith(firstName)) score += 6; // first name starts with
    else if (fn.includes(firstName)) score += 3;   // first name contains
  }
  if (lastName) {
    if (ln === lastName) score += 8;           // exact last name match
    else if (ln.startsWith(lastName)) score += 4; // last name starts with
    else if (ln.includes(lastName)) score += 2;   // last name contains
  }
  return score;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { specialty, city, name, gender, limit = '200', offset = '0' } = req.query;

  try {
    // For name searches use a higher limit since results are always few
    const effectiveLimit = name ? 1000 : parseInt(limit);

    let query = supabase
      .from('providers')
      .select('*', { count: 'exact' })
      .limit(effectiveLimit)
      .range(parseInt(offset), parseInt(offset) + effectiveLimit - 1);

    const resolvedSpecialty = resolveSpecialty(specialty);

    if (resolvedSpecialty) {
      query = query.ilike('specialty', `%${resolvedSpecialty}%`);
    }

    if (name) {
      // Strip "Dr." prefix
      const cleanName = name.replace(/^dr\.?\s*/i, '').trim();

      // Split into parts to handle "firstname lastname" or just one name
      const parts = cleanName.split(/\s+/).filter(Boolean);

      if (parts.length >= 2) {
        // "John Smith" — search first name AND last name
        const first = parts[0];
        const last = parts.slice(1).join(' ');
        query = query.or(
          `first_name.ilike.%${first}%,last_name.ilike.%${last}%,first_name.ilike.%${last}%,last_name.ilike.%${first}%`
        );
      } else {
        // Single word — search both first and last name
        query = query.or(
          `first_name.ilike.%${cleanName}%,last_name.ilike.%${cleanName}%`
        );
      }
    }

    if (!resolvedSpecialty && !name) {
      query = supabase
        .from('providers')
        .select('*', { count: 'exact' })
        .limit(parseInt(limit))
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    }

    if (city && city !== 'All of San Diego') {
      query = query.ilike('city', city);
    }

    if (gender && gender !== '') {
      query = query.eq('gender', gender);
    }

    // For name searches, don't pre-sort by last_name — we'll sort by relevance below
    if (!name) {
      query = query.order('last_name', { ascending: true });
    }

    const { data: providers, error, count } = await query;

    if (error) throw error;

    const npis = (providers || []).map(p => p.npi);
    let claimedMap = {};

    if (npis.length > 0) {
      const { data: claimed } = await supabase
        .from('claimed_listings')
        .select('*')
        .in('npi', npis)
        .eq('verified', true);

      if (claimed) {
        claimedMap = Object.fromEntries(claimed.map(c => [c.npi, c]));
      }
    }

    let results = (providers || []).map(p => buildDoctor(p, claimedMap[p.npi]));

    // For name searches, sort by relevance — first name matches come first
    if (name) {
      const cleanName = name.replace(/^dr\.?\s*/i, '').trim();
      const parts = cleanName.split(/\s+/).filter(Boolean);
      const firstName = parts.length >= 2 ? parts[0].toLowerCase() : cleanName.toLowerCase();
      const lastName = parts.length >= 2 ? parts.slice(1).join(' ').toLowerCase() : '';

      results = results
        .map(r => {
          const row = providers.find(p => p.npi === r.npi) || {};
          return { ...r, _score: scoreNameMatch(row, firstName, lastName) };
        })
        .sort((a, b) => b._score - a._score)
        .map(({ _score, ...r }) => r);
    }

    return res.status(200).json({
      results,
      total: count || results.length,
      query: { specialty: resolvedSpecialty, city, name, gender },
    });

  } catch (err) {
    console.error('Supabase query error:', err);
    return res.status(500).json({ error: 'Search failed. Please try again.' });
  }
}
