// api/search.js
// Queries our Supabase database of 40,000+ San Diego providers
// Much faster than calling the NPI registry directly

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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
  const credential = row.credential || 'MD';
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
    // Layer 2: claimed listing data on top of NPI base data
    accepting: claimed?.accepting_patients ?? null,
    telehealth: claimed?.telehealth ?? null,
    languages: claimed?.languages ?? ['English'],
    insurance: claimed?.insurance ?? [],
    hours: claimed?.hours ?? null,
    photo_url: claimed?.photo_url ?? null,
    bio: claimed?.bio ?? null,
    verified: claimed ? true : false,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { specialty, city, name, gender, limit = '50', offset = '0' } = req.query;

  if (!specialty && !name) {
    return res.status(400).json({ error: 'Please provide a specialty or name.' });
  }

  try {
    let query = supabase
      .from('providers')
      .select('*', { count: 'exact' })
      .limit(parseInt(limit))
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Specialty search
    if (specialty && specialty !== 'All Specialties') {
      query = query.ilike('specialty', `%${specialty}%`);
    }

    // Name search
    if (name) {
      const cleanName = name.replace(/^dr\.?\s*/i, '').trim();
      query = query.or(`first_name.ilike.%${cleanName}%,last_name.ilike.%${cleanName}%`);
    }

    // City filter
    if (city && city !== 'All of San Diego') {
      query = query.ilike('city', city);
    }

    // Gender filter
    if (gender && gender !== '') {
      query = query.eq('gender', gender);
    }

    // Sort by last name
    query = query.order('last_name', { ascending: true });

    const { data: providers, error, count } = await query;

    if (error) throw error;

    // Fetch any claimed listings for these providers
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

    const results = (providers || []).map(p => buildDoctor(p, claimedMap[p.npi]));

    return res.status(200).json({
      results,
      total: count || results.length,
      query: { specialty, city, name, gender },
    });

  } catch (err) {
    console.error('Supabase query error:', err);
    return res.status(500).json({ error: 'Search failed. Please try again.' });
  }
}
