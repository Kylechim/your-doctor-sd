// api/search.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// SD zip codes with approximate lat/lng centers
const SD_ZIP_COORDS = {
  "91901": [32.7448, -116.7664], "91902": [32.6731, -116.9292], "91905": [32.6773, -116.4756],
  "91906": [32.6154, -116.5423], "91910": [32.6401, -117.0842], "91911": [32.6018, -117.0484],
  "91913": [32.6232, -117.0284], "91914": [32.6565, -116.9739], "91915": [32.6101, -116.9528],
  "91916": [32.8107, -116.6364], "91917": [32.5762, -116.8903], "91931": [32.7154, -116.7089],
  "91932": [32.5673, -117.1231], "91934": [32.5984, -116.4423], "91935": [32.7154, -116.8486],
  "91941": [32.7678, -117.0228], "91942": [32.7826, -117.0145], "91945": [32.7248, -117.0314],
  "91946": [32.7448, -117.0089], "91948": [32.8651, -116.5664], "91950": [32.6781, -117.0992],
  "91962": [32.7651, -116.6089], "91963": [32.5973, -116.6756], "91977": [32.7448, -116.9989],
  "91978": [32.7248, -116.9314], "91980": [32.5562, -116.6256], "92003": [33.2551, -117.2159],
  "92004": [33.1484, -116.3756], "92007": [33.0118, -117.2712], "92008": [33.1581, -117.3506],
  "92009": [33.0951, -117.2712], "92010": [33.1351, -117.3089], "92011": [33.1051, -117.3089],
  "92014": [32.9595, -117.2653], "92019": [32.7826, -116.9314], "92020": [32.7948, -116.9625],
  "92021": [32.8284, -116.9314], "92024": [33.0369, -117.2920], "92025": [33.1192, -117.0864],
  "92026": [33.1651, -117.0645], "92027": [33.1484, -117.0228], "92028": [33.2284, -117.1284],
  "92029": [33.0751, -117.1284], "92036": [33.0484, -116.5756], "92037": [32.8328, -117.2713],
  "92040": [32.8576, -116.9225], "92054": [33.1959, -117.3795], "92055": [33.2751, -117.3506],
  "92056": [33.2151, -117.2712], "92057": [33.2284, -117.3284], "92058": [33.1751, -117.3789],
  "92059": [33.2984, -117.1145], "92060": [33.3284, -117.0228], "92061": [33.2484, -116.9739],
  "92064": [32.9628, -117.0359], "92065": [33.0151, -116.8645], "92066": [33.2984, -116.7089],
  "92067": [33.0234, -117.1987], "92069": [33.1434, -117.1661], "92070": [33.1151, -116.7756],
  "92071": [32.8284, -117.0228], "92074": [33.0151, -117.0284], "92075": [32.9912, -117.2712],
  "92078": [33.1284, -117.1987], "92081": [33.1784, -117.2284], "92082": [33.2151, -117.0645],
  "92083": [33.1951, -117.2489], "92084": [33.2151, -117.2059], "92086": [33.3651, -116.8645],
  "92091": [33.0234, -117.1987], "92092": [32.8751, -117.2284], "92093": [32.8784, -117.2359],
  "92096": [33.1284, -117.1645], "92101": [32.7157, -117.1611], "92102": [32.7051, -117.1284],
  "92103": [32.7467, -117.1600], "92104": [32.7478, -117.1298], "92105": [32.7284, -117.0939],
  "92106": [32.7151, -117.2284], "92107": [32.7384, -117.2512], "92108": [32.7674, -117.1485],
  "92109": [32.7965, -117.2358], "92110": [32.7651, -117.2059], "92111": [32.8051, -117.1645],
  "92113": [32.6851, -117.1284], "92114": [32.6951, -117.0645], "92115": [32.7451, -117.0784],
  "92116": [32.7551, -117.1284], "92117": [32.8151, -117.2059], "92118": [32.6684, -117.1612],
  "92119": [32.7951, -117.0284], "92120": [32.7851, -117.0645], "92121": [32.8951, -117.2284],
  "92122": [32.8584, -117.2059], "92123": [32.8051, -117.1284], "92124": [32.8284, -117.0939],
  "92126": [32.9151, -117.1645], "92127": [33.0151, -117.1284], "92128": [33.0451, -117.0784],
  "92129": [32.9584, -117.1284], "92130": [32.9284, -117.2284], "92131": [32.9151, -117.0784],
  "92132": [32.7151, -117.1987], "92134": [32.7251, -117.1512], "92136": [32.6784, -117.1512],
  "92139": [32.6751, -117.0645], "92140": [32.7384, -117.2059], "92145": [32.8851, -117.1512],
  "92154": [32.5551, -117.0284], "92173": [32.5584, -117.0512],
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // miles
  const dlat = (lat2 - lat1) * Math.PI / 180;
  const dlon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dlat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dlon/2)**2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function getZipsWithinRadius(lat, lng, radiusMiles) {
  return Object.entries(SD_ZIP_COORDS)
    .filter(([, [zlat, zlng]]) => haversine(lat, lng, zlat, zlng) <= radiusMiles)
    .map(([zip]) => zip);
}

const SPECIALTY_ALIASES = {
  'primary care': 'Family Medicine', 'general practice': 'Family Medicine', 'gp': 'Family Medicine',
  'ob-gyn': 'OB-GYN', 'obgyn': 'OB-GYN', 'obstetrics': 'OB-GYN', 'gynecology': 'OB-GYN',
  'ent': 'ENT', 'ear nose throat': 'ENT', 'otolaryngology': 'ENT',
  'heart': 'Cardiology', 'cardio': 'Cardiology',
  'ortho': 'Orthopedic Surgery', 'orthopedics': 'Orthopedic Surgery', 'orthopaedics': 'Orthopedic Surgery',
  'mental health': 'Psychiatry', 'psychiatrist': 'Psychiatry',
  'skin': 'Dermatology', 'dermatologist': 'Dermatology',
  'eye': 'Ophthalmology', 'eyes': 'Ophthalmology', 'vision': 'Ophthalmology',
  'stomach': 'Gastroenterology', 'digestive': 'Gastroenterology',
  'brain': 'Neurology', 'nerve': 'Neurology', 'neurologist': 'Neurology',
  'cancer': 'Oncology', 'oncologist': 'Oncology',
  'lung': 'Pulmonology', 'lungs': 'Pulmonology', 'breathing': 'Pulmonology',
  'kidney': 'Nephrology', 'kidneys': 'Nephrology', 'blood': 'Hematology',
  'hormone': 'Endocrinology', 'diabetes': 'Endocrinology', 'thyroid': 'Endocrinology',
  'joint': 'Rheumatology', 'arthritis': 'Rheumatology',
  'bladder': 'Urology', 'urinary': 'Urology',
  'allergy': 'Allergy & Immunology', 'allergies': 'Allergy & Immunology', 'allergist': 'Allergy & Immunology',
  'sleep': 'Sleep Medicine', 'sports': 'Sports Medicine', 'pain': 'Pain Medicine',
  'np': 'Nurse Practitioner', 'nurse practitioner': 'Nurse Practitioner',
  'pa': 'Physician Assistant', 'physician assistant': 'Physician Assistant',
  'dentist': 'General Dentistry', 'dental': 'General Dentistry', 'dentistry': 'General Dentistry',
  'optometry': 'Optometry', 'optometrist': 'Optometry',
  'chiropractor': 'Chiropractic', 'chiropractic': 'Chiropractic',
  'podiatrist': 'Podiatry', 'foot': 'Podiatry', 'feet': 'Podiatry',
  'hearing': 'Audiology', 'audiologist': 'Audiology',
};

function resolveSpecialty(input) {
  if (!input || input === 'All Specialties') return null;
  const lower = input.toLowerCase().trim();
  return SPECIALTY_ALIASES[lower] || input;
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

function buildDoctor(row, claimed, reportCount, avgRating) {
  const firstName = toProperCase(row.first_name || '');
  const lastName = toProperCase(row.last_name || '');
  const credential = (row.credential || 'MD').replace(/\.$/, '');
  const name = `Dr. ${firstName} ${lastName}, ${credential}`.trim();
  return {
    id: row.npi, npi: row.npi, name,
    specialty: toProperCase(row.specialty || 'General Practice'),
    city: toProperCase(row.city || 'San Diego'),
    address: toProperCase(row.address || ''),
    zip: row.zip || null,
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
    reportCount: reportCount || 0,
    avgRating: avgRating || null,
  };
}

function scoreNameMatch(row, firstName, lastName) {
  let score = 0;
  const fn = (row.first_name || '').toLowerCase();
  const ln = (row.last_name || '').toLowerCase();
  if (firstName) {
    if (fn === firstName) score += 10;
    else if (fn.startsWith(firstName)) score += 6;
    else if (fn.includes(firstName)) score += 3;
  }
  if (lastName) {
    if (ln === lastName) score += 8;
    else if (ln.startsWith(lastName)) score += 4;
    else if (ln.includes(lastName)) score += 2;
  }
  return score;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { specialty, city, name, gender, lat, lng, radius = '5', limit = '20', offset = '0' } = req.query;

  try {
    const pageLimit = name ? 1000 : parseInt(limit);
    const pageOffset = parseInt(offset);

    let query = supabase
      .from('providers')
      .select('*', { count: 'exact' })
      .limit(pageLimit)
      .range(pageOffset, pageOffset + pageLimit - 1);

    const resolvedSpecialty = resolveSpecialty(specialty);
    if (resolvedSpecialty) query = query.ilike('specialty', `%${resolvedSpecialty}%`);

    if (name) {
      const cleanName = name.replace(/^dr\.?\s*/i, '').trim();
      const parts = cleanName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const first = parts[0];
        const last = parts.slice(1).join(' ');
        query = query.or(`first_name.ilike.%${first}%,last_name.ilike.%${last}%,first_name.ilike.%${last}%,last_name.ilike.%${first}%`);
      } else {
        query = query.or(`first_name.ilike.%${cleanName}%,last_name.ilike.%${cleanName}%`);
      }
    }

    // Near Me: filter by zip codes within radius
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusMiles = parseFloat(radius);
      const nearbyZips = getZipsWithinRadius(userLat, userLng, radiusMiles);
      if (nearbyZips.length > 0) {
        query = query.in('zip', nearbyZips);
      }
    } else if (city && city !== 'All of San Diego') {
      query = query.ilike('city', city);
    }

    if (!resolvedSpecialty && !name && !lat) {
      query = supabase
        .from('providers')
        .select('*', { count: 'exact' })
        .limit(pageLimit)
        .range(pageOffset, pageOffset + pageLimit - 1);
      if (city && city !== 'All of San Diego') query = query.ilike('city', city);
    }

    if (gender && gender !== '') query = query.eq('gender', gender);
    if (!name) query = query.order('last_name', { ascending: true });

    const { data: providers, error, count } = await query;
    if (error) throw error;

    const npis = (providers || []).map(p => p.npi);
    let claimedMap = {};
    let reportCountMap = {};
    let avgRatingMap = {};

    if (npis.length > 0) {
      const { data: claimed } = await supabase
        .from('claimed_listings').select('*').in('npi', npis).eq('verified', true);
      if (claimed) claimedMap = Object.fromEntries(claimed.map(c => [c.npi, c]));

      const { data: reportData } = await supabase
        .from('community_reports').select('npi, rating').in('npi', npis);
      if (reportData) {
        const grouped = {};
        for (const r of reportData) {
          if (!grouped[r.npi]) grouped[r.npi] = { count: 0, ratings: [] };
          grouped[r.npi].count++;
          if (r.rating != null) grouped[r.npi].ratings.push(r.rating);
        }
        for (const [npi, { count: c, ratings }] of Object.entries(grouped)) {
          reportCountMap[npi] = c;
          if (ratings.length > 0) {
            avgRatingMap[npi] = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
          }
        }
      }
    }

    let results = (providers || []).map(p =>
      buildDoctor(p, claimedMap[p.npi], reportCountMap[p.npi] || 0, avgRatingMap[p.npi] || null)
    );

    // For near me, sort by distance from user
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      results = results
        .map(r => {
          const zipCoords = r.zip && SD_ZIP_COORDS[r.zip];
          const dist = zipCoords ? haversine(userLat, userLng, zipCoords[0], zipCoords[1]) : 999;
          return { ...r, _dist: dist };
        })
        .sort((a, b) => a._dist - b._dist)
        .map(({ _dist, ...r }) => r);
    }

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
      offset: pageOffset,
      limit: pageLimit,
      hasMore: count ? pageOffset + pageLimit < count : false,
      query: { specialty: resolvedSpecialty, city, name, gender, lat, lng },
    });

  } catch (err) {
    console.error('Supabase query error:', err);
    return res.status(500).json({ error: 'Search failed. Please try again.' });
  }
}
