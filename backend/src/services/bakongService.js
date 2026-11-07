const crypto = require('crypto');

const GATEWAY_URL = (process.env.BAKONG_GATEWAY_URL || 'https://lorndavid.online').replace(/\/+$/, '');
const DEFAULT_ACCOUNT_ID = process.env.BAKONG_ACCOUNT_ID || 'udom_vathna@bkrt';
const DEFAULT_MERCHANT_NAME = process.env.BAKONG_MERCHANT_NAME || 'G-Zen Phone Store';
const DEFAULT_MERCHANT_CITY = process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh';
const DEFAULT_CURRENCY = process.env.BAKONG_CURRENCY || 'USD';

// Common HTTP headers for gateway calls
const REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 GZenBakong/1.0',
};

// In-memory settlement overrides for local testing / instant simulation
const localSettlementCache = new Map();

/**
 * Generate Bakong KHQR EMVCo string, MD5 hash, and QR Image
 */
async function generateKhqr({
  amount,
  currency = DEFAULT_CURRENCY,
  billNumber,
  storeLabel = 'G-Zen Flagship',
  terminalLabel = 'POS-01',
  accountId = DEFAULT_ACCOUNT_ID,
  merchantName = DEFAULT_MERCHANT_NAME,
  merchantCity = DEFAULT_MERCHANT_CITY,
}) {
  const numericAmount = parseFloat(parseFloat(amount).toFixed(2));
  const payload = {
    accountId,
    merchantName,
    merchantCity,
    amount: numericAmount,
    currency,
    billNumber: String(billNumber),
    storeLabel,
    terminalLabel,
  };

  try {
    const response = await fetch(`${GATEWAY_URL}/api/v1/khqr/generate`, {
      method: 'POST',
      headers: REQUEST_HEADERS,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data && (data.md5 || data.qrString || data.qrImage)) {
        return {
          success: true,
          gateway: GATEWAY_URL,
          accountId: data.accountId || accountId,
          merchantName: data.merchantName || merchantName,
          amount: data.amount !== undefined ? data.amount : numericAmount,
          currency: data.currency || currency,
          billNumber: data.billNumber || String(billNumber),
          md5: data.md5,
          qrString: data.qrString || data.qr,
          qrImage: data.qrImage || data.qrDataUrl,
          deeplink: data.deeplink,
          bakongScheme: data.bakongScheme,
          checkUrl: data.checkUrl || `/api/v1/check/${data.md5}`,
          expiresInSeconds: 180, // 3-minute payment window
          expiresAt: Date.now() + (180 * 1000),
          raw: data,
        };
      }
    }
    console.warn(`[Bakong Service] Gateway returned status ${response.status}. Using fallback generator.`);
  } catch (error) {
    console.warn('[Bakong Service] Gateway connection failed or timed out:', error.message);
  }

  // Resilient fallback generator if network or gateway is unavailable
  const fallbackMd5 = crypto.createHash('md5').update(`${billNumber}-${numericAmount}-${currency}-${Date.now()}`).digest('hex');
  const accSubtag = `00${accountId.length < 10 ? '0' + accountId.length : accountId.length}${accountId}`;
  const tag29 = `29${accSubtag.length < 10 ? '0' + accSubtag.length : accSubtag.length}${accSubtag}`;
  const fallbackQrString = `000201010212${tag29}5204599953038405404${numericAmount.toFixed(2)}5802KH59${merchantName.length < 10 ? '0' + merchantName.length : merchantName.length}${merchantName}6010Phnom Penh62160112${billNumber}99340013${Date.now()}6304`;
  const fallbackQrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fallbackQrString)}`;
  const fallbackDeeplink = `https://bakong.page.link/?link=${encodeURIComponent(fallbackQrString)}&apn=kh.gov.nbc.bakong&ibi=kh.gov.nbc.bakong&isi=1450098909`;

  return {
    success: true,
    isFallback: true,
    gateway: GATEWAY_URL,
    accountId,
    merchantName,
    amount: numericAmount,
    currency,
    billNumber: String(billNumber),
    md5: fallbackMd5,
    qrString: fallbackQrString,
    qrImage: fallbackQrImage,
    deeplink: fallbackDeeplink,
    bakongScheme: `bakong://qr?data=${encodeURIComponent(fallbackQrString)}`,
    checkUrl: `/api/v1/check/${fallbackMd5}`,
    expiresInSeconds: 180, // 3-minute payment window
    expiresAt: Date.now() + (180 * 1000),
  };
}

/**
 * Check real-time settlement state of a transaction MD5 against NBC ledger
 */
async function checkSettlement(md5) {
  if (!md5 || typeof md5 !== 'string' || md5.trim().length !== 32) {
    return {
      success: false,
      paid: false,
      message: 'Invalid 32-character MD5 transaction hash.',
    };
  }

  const cleanMd5 = md5.trim().toLowerCase();

  // 1. Check local cache (e.g. for simulated test payments)
  if (localSettlementCache.has(cleanMd5)) {
    const cached = localSettlementCache.get(cleanMd5);
    return {
      success: true,
      paid: true,
      status: 'PAID',
      message: 'Settlement confirmed (Local/Test verified)',
      data: cached,
      source: 'local_cache',
    };
  }

  // 2. Query gateway API
  try {
    const response = await fetch(`${GATEWAY_URL}/api/v1/check/${cleanMd5}`, {
      method: 'GET',
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (response.ok) {
      const result = await response.json();
      if (result.responseCode === 0) {
        // Confirmed on National Bank of Cambodia ledger!
        return {
          success: true,
          paid: true,
          status: 'PAID',
          responseCode: 0,
          responseMessage: result.responseMessage || 'Success',
          data: result.data || { hash: cleanMd5, md5: cleanMd5, settledAt: new Date().toISOString() },
          raw: result,
          source: 'nbc_gateway',
        };
      }

      // Pending payment (responseCode === 1 or unconfirmed)
      return {
        success: true,
        paid: false,
        status: 'PENDING',
        responseCode: result.responseCode !== undefined ? result.responseCode : 1,
        responseMessage: result.responseMessage || 'Waiting for payer transfer...',
        data: result.data || null,
        raw: result,
        source: 'nbc_gateway',
      };
    }

    return {
      success: false,
      paid: false,
      status: 'ERROR',
      message: `Gateway returned HTTP ${response.status}`,
    };
  } catch (error) {
    console.error(`[Bakong Service] Error checking MD5 ${cleanMd5}:`, error.message);
    return {
      success: false,
      paid: false,
      status: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to Bakong verification gateway.',
    };
  }
}

/**
 * Record a manual / simulated settlement (useful for tests, POS simulation, and offline mode)
 */
function recordLocalSettlement(md5, details = {}) {
  const cleanMd5 = md5.trim().toLowerCase();
  const settlementRecord = {
    hash: details.hash || `nbc_settled_${cleanMd5.slice(0, 12)}`,
    md5: cleanMd5,
    amount: details.amount || 0,
    currency: details.currency || 'USD',
    fromAccountId: details.fromAccountId || 'customer@bkrt',
    settledAt: new Date().toISOString(),
    channel: 'BAKONG_KHQR',
    ...details,
  };
  localSettlementCache.set(cleanMd5, settlementRecord);
  return settlementRecord;
}

/**
 * Gateway Health Check
 */
async function checkGatewayHealth() {
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/khqr/generate`, {
      method: 'OPTIONS',
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    return {
      online: res.status < 500,
      status: res.status,
      gateway: GATEWAY_URL,
    };
  } catch (e) {
    return {
      online: false,
      error: e.message,
      gateway: GATEWAY_URL,
    };
  }
}

module.exports = {
  generateKhqr,
  checkSettlement,
  recordLocalSettlement,
  checkGatewayHealth,
  GATEWAY_URL,
  DEFAULT_ACCOUNT_ID,
  DEFAULT_MERCHANT_NAME,
};
