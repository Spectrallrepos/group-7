const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum";
const API_KEY = "CG-QfzzKee6U8H41yNqvhsNuwnD";


// Fetching data from the API
const TOKENS = [
    "dogecoin", "eos", "ethereum", "iota", "litecoin", 
    "monero", "nem", "polkadot", "solana", "stellar", 
    "tether", "tron", "uniswap", "usd-coin", "wrapped-bitcoin", 
    "ripple", "crypto-com-chain", "cosmos", "chainlink", 
    "cardano", "bitcoin", "binancecoin", "aave"
];
const ids = TOKENS.join(","); // "dogecoin,eos,ethereum,..."


//Function for marketForecast data with cache
async function getTokenData(tokenId) {
    const cacheKey = `ohlcv_${tokenId}`;
    const cachedData = JSON.parse(localStorage.getItem(cacheKey));
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // 1. CACHE CHECK: If data exists and is less than 24h old, return it immediately
    if (cachedData && (now - cachedData.lastUpdated < ONE_DAY_MS)) {
        console.log(`Using cached data for ${tokenId}`);
        console.log(cachedData.data);
        return cachedData.data;
    }

    try {
        console.log(`Fetching fresh data for ${tokenId}...`);
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenId}&x_cg_demo_api_key=${API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        
        const freshData = await response.json();

        // CACHE SAVE: Store the new data with a timestamp
        localStorage.setItem(cacheKey, JSON.stringify({
            lastUpdated: now,
            data: freshData
        }));

        console.log(`Saved ${tokenId} to cache.`);
        console.log(freshData);
        return freshData;

    } catch (error) {
        console.error(`❌ Error fetching ${tokenId}:`, error);
        // Fallback: If API fails (e.g., internet out), return stale cache if available
        return cachedData ? cachedData.data : null;
    }
}

//DOM elements
const themeToggle = document.getElementById("themeToggle");
const searchToggle = document.getElementById("searchToggle");
const logo = document.querySelector(".logo");
const form = document.querySelector("form");
const random = document.getElementById("random");
const searchInput = form.querySelector("input");
const header = document.querySelector("header");
let searchFlag = false;
const probability = 0.7; //


//A simple search toggle for mobile view
if (searchToggle.style.display != "none") {
    searchToggle.addEventListener("click", () => {
        searchFlag = !searchFlag;
        header.classList.toggle("head", searchFlag); //basically toggles the existence of head class
        if (searchFlag) {
            searchInput.focus();
        }
    });
}


//The chart area
//Std chart.js library
const ctx = document.getElementById('priceChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // Time labels will be added here
        datasets: [{
            label: 'Price',
            data: [100, 150, 200, 180, 250, 220, 280, 100, 150, 200, 180, 250, 220, 280], // Price data will be added here
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
                display: false
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

//changing the accent color based on probability
const accent = document.querySelector(".chartContainer");
if (probability >= 0.5) {
    accent.style.borderLeft = "24px solid var(--c-color-green)";
} else { 
    accent.style.borderLeft = "24px solid var(--c-color-red)";
}


//Appending data to the table
function formatCash(n) {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
}

function tableAppend(data) {
    const tBody = document.querySelector("tbody");
    tBody.innerHTML = ""; // Clear existing rows
    
    data.forEach(token => {
        const change24h = Number(token.price_change_percentage_24h) || 0;
        const change7d = Number(token.price_change_percentage_7d_in_currency) || 0;
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
async function marketForecastData() {
    const data = await getTokenData(ids);
    if (data && Array.isArray(data)) {
        tableAppend(data);
    }
}

function main() {
    marketForecastData();
}

main();