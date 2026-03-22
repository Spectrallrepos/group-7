const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum";
const API_KEY = "CG-QfzzKee6U8H41yNqvhsNuwnD";

/** All the main stuff **/
//Token list
const TOKENS = [
    "dogecoin", "eos", "ethereum", "iota", "litecoin", 
    "monero", "nem", "polkadot", "solana", "stellar", 
    "tether", "tron", "uniswap", "usd-coin", "wrapped-bitcoin", 
    "ripple", "crypto-com-chain", "cosmos", "chainlink", 
    "cardano", "bitcoin", "binancecoin", "aave"
];
const ids = TOKENS.join(",");
const OHLC_CACHE_KEY = "ohlcCache";
const OHLC_CACHE_TTL_MS = 5 * 60 * 1000;
// Fetching the market data for forecast
async function getTokenData(tokenId) {
    const cacheKey = `marketData_${tokenId}`;
    const cachedData = JSON.parse(localStorage.getItem(cacheKey));
    const now = Date.now();
    const DELAY_MS = 5 *60 * 1000;
    // CACHE CHECK: If data exists and is less than 5min old, return it immediately
    if (cachedData && (now - cachedData.lastUpdated < DELAY_MS)) {
        console.log(`Using cached data for ${tokenId}`);
        console.log(cachedData.data);
        return cachedData.data;
    }
    try {
        console.log(`Fetching fresh data for ${tokenId}...`);
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenId}&x_cg_demo_api_key=${API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        
        const data = await response.json();
        // CACHE SAVE: Store the new data with a timestamp
        localStorage.setItem(cacheKey, JSON.stringify({
            lastUpdated: now,
            data: data
        }));
        console.log(`Saved ${tokenId} to cache.`);
        return data;
    } catch (error) {
        console.error(`Error fetching ${tokenId}:`, error);
        // Fallback: If API fails (e.g., internet out), return stale cache if available
        return cachedData ? cachedData.data : null;
    }
}
//Cash formatter
function formatCash(n) {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
}
//Append the data to the table
function tableAppend(data) {
    const tBody = document.querySelector("tbody");
    tBody.innerHTML = ""; // Clear existing rows
    
    data.forEach(token => {
        const change24h = Number(token.price_change_percentage_24h) || 0;
        const changeColor = change24h >= 0 ? 'var(--c-color-green)' : 'var(--c-color-red)';
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${token.market_cap_rank || "N/A"}</td>
            <td>
                <img src="${token.image}" alt="${token.name}">
                ${token.name ? token.name: "N/A"}
                (${token.symbol ? token.symbol.toUpperCase() : "N/A"})
            </td>
            <td>$${Number(token.current_price || 0).toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
            <td style="color: ${changeColor}">
                ${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}%
            </td>
            <td>$${formatCash(Number(token.market_cap || 0))}</td>
            <td>$${formatCash(Number(token.total_volume || 0))}</td>
        `;
        tBody.appendChild(row);
    });
}
//async function to get the data via above fn
// We do need an async here cuz the fn above returns a promise (we need to wait)
async function marketForecastData() {
    const data = await getTokenData(ids);
    if (data && Array.isArray(data)) {
        tableAppend(data);
    }
}
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

/* chart w/ chart.js */
// Plot close price (index 4) against day label from timestamp (index 0).
let priceChartInstance = null;
function createChart(canvas, probability, ohlcRows) {
    if (!Array.isArray(ohlcRows) || ohlcRows.length === 0) {
        return null;
    }

    // API returns 4h candles; keep the latest candle close for each calendar day.
    const dailyCloseMap = new Map();
    ohlcRows.forEach((row) => {
        const d = new Date(row[0]);
        const dayKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        dailyCloseMap.set(dayKey, Number(row[4]) || 0);
    });

    const labels = [];
    const closeData = [];
    dailyCloseMap.forEach((close, dayKey) => {
        const [year, month, day] = dayKey.split("-").map(Number);
        labels.push(`${month}/${day}`);
        closeData.push(close);
    });

    if (priceChartInstance) {
        //destroys previous chart
        priceChartInstance.destroy();
    }

    priceChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: 'Price',
                data: closeData,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 5,
                fill: 'start',
                borderColor: probability >= 0.5 ? 'hsl(157, 80%, 55%)' : 'hsl(0, 80%, 55%)',
        // The gradient background
                backgroundColor: (context) => {
                    const { ctx, chartArea } = context.chart;
                    // If chartArea is not available, return a default color, due to loading time of dim
                    if (!chartArea) {
                        return 'hsla(157, 80%, 55%, 0.24)';
                    }
                    //the gradient
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    if (probability >= 0.5) {
                    gradient.addColorStop(0, 'hsla(157, 80%, 55%, 0.45)');
                    gradient.addColorStop(1, 'hsla(157, 80%, 55%, 0)');
                    } else {
                    gradient.addColorStop(0, 'hsla(0, 80%, 55%, 0.45)');
                    gradient.addColorStop(1, 'hsla(0, 80%, 55%, 0)');
                    }
                    return gradient;
                },
                tension: 0.3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'hsl(0, 0%, 72%)'
                    },
                    grid: {
                        color: 'hsla(0, 0%, 72%, 0.14)'
                    }
                },
                x: {
                    ticks: {
                        color: 'hsl(0, 0%, 72%)'
                    },
                    grid: {
                        color: 'hsla(0, 0%, 72%, 0.08)'
                    }
                }
            }
        }
    });

    return priceChartInstance;
}

/******************************************/
/* UI/UX Enhancements */
// Mobile search toggle
function searchToggleMob(searchFlag, searchToggle, header, searchInput) {
    if (searchToggle.style.display !== "none") {
        searchToggle.addEventListener("click", () => {
            searchFlag = !searchFlag;
            header.classList.toggle("head", searchFlag); //basically toggles the existence of head class
            if (searchFlag) {
                searchInput.focus();
            }
        });
    }
}
//changing the color and meter based on probability
function confidenceUpdater(probability, coin) {
    const accent = document.querySelector(".chartContainer");
    const meterfill = document.querySelector(".chartSection .meter .fill");
    const confidenceTxt = document.querySelector(".confidenceTxt p");
    const predictTxt = document.querySelector(".confidenceTxt h2");
    const head = document.querySelector(".confidenceTxt h1");

    head.textContent = `${coin} - Tomorrow's prediction`;
    if (probability >= 0.5) {
        predictTxt.innerHTML = '<img src="assets/triangle-up.svg" style = "height: 64px; transform: scaleX(0.8) scaleY(1.5); vertical-align: middle;" alt="Up Arrow">'+ "UP";
        predictTxt.style.color = "var(--c-color-green)";
        predictTxt.style.textShadow = "0 0 6px hsla(157, 80%, 43%, 0.75), 0 0 14px hsla(157, 80%, 43%, 0.55), 0 0 26px hsla(157, 80%, 43%, 0.35)";
        accent.style.borderLeft = "24px solid var(--c-color-green)";
        probability = (probability - 0.5) * 2; // Scale to 0-1
        hue = 20 + (probability * 100); // From yellow to green
    } else {
        predictTxt.innerHTML = '<img src="assets/triangle-down.svg" style = "height: 64px; transform: scaleX(0.8)scaleY(1.5);" alt="Down Arrow">' + "DOWN";
        predictTxt.style.color = "var(--c-color-red)";
        predictTxt.style.textShadow = "0 0 6px hsla(0, 81%, 57%, 0.57), 0 0 14px hsla(0, 81%, 57%, 0.3), 0 0 26px hsla(0, 81%, 57%, 0.35)";
        accent.style.borderLeft = "24px solid var(--c-color-red)";
        probability = (0.5 - probability) * 2; // Scale to 0-1
        hue = 50 - (probability * 50); // From orange to red
    }

    meterfill.style.backgroundColor = "hsl(" + hue + ", 60%, 64%)";
    meterfill.style.boxShadow = "0 0 10px hsl(" + hue + ", 80%, 55%)";
    meterfill.style.height = (probability * 100) + "%";
    confidenceTxt.textContent = `Confidence: ${(probability * 100).toFixed(1)}%`;
    confidenceTxt.style.color = "hsl(" + hue + ", 80%, 55%)";
    confidenceTxt.style.textShadow = `0 0 6px hsl(${hue}, 80%, 55%, 0.75), 0 0 14px hsl(${hue}, 80%, 55%, 0.55), 0 0 26px hsl(${hue}, 80%, 55%, 0.35)`;
}
//The top 4 tokens
function topTokens(data) {
    const leaderImg = document.querySelector("img.leader");
    const leaderName = document.querySelector("span.leader");
    const gainerImg = document.querySelector("img.gainer");
    const gainerName = document.querySelector("span.gainer");
    const volumeImg = document.querySelector("img.volumeLeader");
    const volumeName = document.querySelector("span.volumeLeader");
    const undervaluedImg = document.querySelector("img.underValued");
    const undervaluedName = document.querySelector("span.underValued");
    const details = document.querySelectorAll(".details_top p");

    const marketLeader = data.find(token => token.market_cap_rank === 1);
    if (marketLeader) {
        leaderImg.src = marketLeader.image;
        leaderName.textContent = marketLeader.name;
        details[0].textContent = `Price: $${Number(marketLeader.current_price || 0).toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
    }

    const gainer = data.find(token => token.price_change_percentage_24h === Math.max(...data.map(t => t.price_change_percentage_24h)));
    if (gainer) {
        gainerImg.src = gainer.image;
        gainerName.textContent = gainer.name;
        details[1].textContent = `24h Change: ${Number(gainer.price_change_percentage_24h || 0).toLocaleString("en-US", { maximumFractionDigits: 4 })}%`;
    }

    const volumeLeader = data.find(token => token.total_volume === Math.max(...data.map(t => t.total_volume)));
    if (volumeLeader) {
        volumeImg.src = volumeLeader.image;
        volumeName.textContent = volumeLeader.name;
        const volume = Number(volumeLeader.total_volume || 0);
        details[2].textContent = `Volume: $${formatCash(volume)}`;
    }

    const underValued = data.find(token => token.ath_change_percentage === Math.max(...data.map(t => t.ath_change_percentage)));
    if (underValued) {
        undervaluedImg.src = underValued.image;
        undervaluedName.textContent = underValued.name;
        details[3].textContent = `ATH Change: ${Number(underValued.ath_change_percentage || 0).toFixed(2)}%`;
    }
}
//Search and click functionality

function setupSearch(tokensArray, onSelect) {
    const input = document.querySelector("form input");
    const results = document.querySelector(".searchResults");
    const form = document.querySelector("form");

    // Helper to handle selection
    const handlePick = (token) => {
        input.value = token;
        results.style.display = "none";
        results.innerHTML = "";
        onSelect(token);
    };

    // 1. Enter Key
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = input.value.toLowerCase().trim();
        const match = tokensArray.find(t => t.toLowerCase() === query);
        if (match) handlePick(match);
        else {
            const first = results.querySelector("p:not([style*='pointer-events'])");
            if (first) handlePick(first.textContent);
        }
    });

    // 2. Input/Filter Logic
    input.addEventListener("input", () => {
        const query = input.value.toLowerCase().trim();
        results.innerHTML = "";
        if (!query) return results.style.display = "none";
        const filtered = tokensArray.filter(t => t.toLowerCase().includes(query));
        results.style.display = "block";
        if (filtered.length > 0) {
            filtered.forEach(token => {
                const p = document.createElement("p");
                p.textContent = token;
                p.style.cursor = "pointer";
                results.appendChild(p);
            });
        } else {
            results.innerHTML = `<p style="padding:8px 24px; pointer-events:none;">Token not found.</p>`;
        }
    });

    // 3. Click Logic
    results.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "P" && e.target.style.pointerEvents !== "none") {
            handlePick(e.target.textContent);
        }
    });
}

async function main() {
    const searchToggle = document.getElementById("searchToggle");
    const form = document.querySelector("form");
    const searchInput = form.querySelector("input");
    const header = document.querySelector("header");
    const canvas = document.getElementById('priceChart');
    let searchFlag = false;
    const probability = 0.9;
    const arr = [];

    searchToggleMob(searchFlag, searchToggle, header, searchInput);
    
    // Show/hide search results on input focus/blur
    const searchResults = form.querySelector(".searchResults");

    searchInput.addEventListener("focus", () => {
        searchResults.style.display = "block";
    });
    searchInput.addEventListener("blur", () => {
        // Delay hide so pointerdown on a result can run before the dropdown disappears.
        setTimeout(() => {
            if (!form.contains(document.activeElement)) {
                searchResults.style.display = "none";
            }
        }, 120);
    });
    
    marketForecastData();
    const data = await getTokenData(ids);
    console.log(data);

    const defaultOhlc = await ohlcData("bitcoin", 30);
    createChart(canvas, probability, defaultOhlc);
    confidenceUpdater(probability, "bitcoin");

    topTokens(data);
    setupSearch(TOKENS, async (coin) => {
        console.log("Selected:", coin);
        confidenceUpdater(probability, coin);
        const selectedOhlc = await ohlcData(coin, 30);
        createChart(canvas, probability, selectedOhlc);
        scrollTo({ top: document.querySelector(".chartSection").offsetTop-100, behavior: "smooth" });
    });
}

main();