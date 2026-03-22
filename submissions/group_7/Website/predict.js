async function ohlcData(tokenId, days = 30) {
    const now = Date.now();
    const cache = JSON.parse(localStorage.getItem(OHLC_CACHE_KEY)) || [];
    const cachedEntry = cache.find((item) => item.token === tokenId && item.days === days);

    if (cachedEntry && now - cachedEntry.lastUpdated < OHLC_CACHE_TTL_MS) {
        console.log(`Using cached OHLC for ${tokenId}`);
        return cachedEntry.ohlc;
    }

    try {
        const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/ohlc?vs_currency=usd&days=${days}&x_cg_demo_api_key=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const data = await response.json();
        const ohlc = Array.isArray(data) ? data : [];

        const updatedEntry = {
            token: tokenId,
            days: days,
            ohlc: ohlc,
            lastUpdated: now
        };

        const existingIndex = cache.findIndex((item) => item.token === tokenId && item.days === days);
        if (existingIndex >= 0) {
            cache[existingIndex] = updatedEntry;
        } else {
            cache.push(updatedEntry);
        }

        localStorage.setItem(OHLC_CACHE_KEY, JSON.stringify(cache));
        console.log(`Fetched and cached OHLC for ${tokenId}`);
        return ohlc;
    } catch (error) {
        console.error(`Error fetching OHLC data for ${tokenId}:`, error);
        if (cachedEntry) {
            console.log(`Using stale cached OHLC for ${tokenId}`);
            return cachedEntry.ohlc;
        }
        return [];
    }
}
async function features(tokenId) {
    
}

function predict(tokenId) {

}