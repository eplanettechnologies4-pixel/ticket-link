/**
 * Supabase Client Integration for Link International Travels & Tours
 * Handles package submissions, fetching approved packages, and real-time polling.
 */

(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    url: 'https://zkyllgszozizaqkoqkgz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpreWxsZ3N6b3ppemFxa29xa2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4NjQ1NzAsImV4cCI6MjEwOTQ0MDU3MH0.2gunoJ1rEiHO7pWQnPGkRedp_jS5bYOuroj3BN_BFXU'
  };

  function getConfig() {
    return window.SUPABASE_CONFIG || DEFAULT_CONFIG;
  }

  function isConfigured() {
    const config = getConfig();
    return Boolean(
      config &&
      config.url &&
      config.anonKey &&
      !config.url.includes('your-project-id') &&
      !config.anonKey.includes('your-anon-public-key')
    );
  }

  /**
   * Safely parse formatted price strings like "2,000,000" or "PKR 250,000" into a valid Number
   */
  function parseNumeric(val, fallback) {
    if (val === null || val === undefined || val === '') return fallback;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    if (!cleaned) return fallback;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : fallback;
  }

  /**
   * Fetch approved packages (is_approved = true) from Supabase
   * @param {'umrah' | 'hajj'} type
   * @returns {Promise<Array|null>}
   */
  async function fetchApprovedPackages(type) {
    if (!isConfigured()) {
      return null;
    }

    const config = getConfig();
    const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/packages?type=eq.${encodeURIComponent(type)}&is_approved=eq.true&order=created_at.desc`;

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 12000) : null;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller ? controller.signal : undefined
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Supabase fetch failed:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Network error fetching from Supabase:', err.message);
      return null;
    }
  }

  /**
   * Insert a new package into Supabase `public.packages` with is_approved = false (pending admin review)
   * @param {Object} pkgData
   * @returns {Promise<{success: boolean, data?: any, error?: string, networkError?: boolean}>}
   */
  async function submitPackage(pkgData) {
    if (!isConfigured()) {
      return { success: false, error: 'Supabase credentials are not configured in assets/js/supabase-config.js' };
    }

    const config = getConfig();
    const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/packages`;

    const payload = {
      type: pkgData.type || 'umrah',
      name: pkgData.name || 'Custom Package',
      airline: pkgData.airline || 'Standard Airline',
      days: String(pkgData.days || '21 Days'),
      dates: pkgData.dates || '',
      city: pkgData.city || 'lhe',
      price: parseNumeric(pkgData.price !== undefined ? pkgData.price : pkgData.bedPrice, 0),
      makkah_hotel: pkgData.makkahHotel || '',
      madinah_hotel: pkgData.madinahHotel || '',
      luggage: pkgData.luggage || '23 kg + 7 kg Hand Carry',
      seats: pkgData.seats || '20 / 20 Seats Available',
      image_url: pkgData.image || '',
      maktab: pkgData.maktab || 'maktab-c',
      mina_schedule: pkgData.minaSchedule || '',
      quad_price: parseNumeric(pkgData.quadPrice, null),
      triple_price: parseNumeric(pkgData.triplePrice, null),
      double_price: parseNumeric(pkgData.doublePrice, null),
      hijri_dates: pkgData.hijriDates || '',
      is_approved: false // Always submitted as pending approval!
    };

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 15000) : null;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase insert failed:', response.status, errorText);
        return { success: false, error: errorText || `HTTP ${response.status}` };
      }

      // With Prefer: return=minimal, PostgREST returns HTTP 201 Created with empty body
      return { success: true, data: payload };
    } catch (err) {
      console.error('Network error submitting to Supabase:', err);
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Request timed out while contacting Supabase' : err.message,
        networkError: true
      };
    }
  }

  /**
   * Poll Supabase so when admin approves a package (is_approved = true) in Table Editor,
   * the client view displays it automatically!
   */
  function startPollingForApprovedPackages(type, onUpdate, intervalMs = 5000) {
    if (!isConfigured()) return null;

    let lastSignature = '';
    let failedAttempts = 0;

    const check = async () => {
      if (failedAttempts >= 5) {
        return;
      }

      const packages = await fetchApprovedPackages(type);
      if (packages === null) {
        failedAttempts++;
        return;
      }
      failedAttempts = 0;

      const signature = packages.map(p => `${p.id}_${p.name}_${p.price}_${p.is_approved}`).sort().join('|');
      if (signature !== lastSignature) {
        lastSignature = signature;
        if (typeof onUpdate === 'function') {
          onUpdate(packages);
        }
      }
    };

    // Run first check shortly after page load
    setTimeout(check, 800);

    const intervalId = setInterval(check, intervalMs);
    return () => clearInterval(intervalId);
  }

  // Export to window
  window.SupabasePackages = {
    isConfigured,
    fetchApprovedPackages,
    submitPackage,
    startPollingForApprovedPackages
  };

})();
