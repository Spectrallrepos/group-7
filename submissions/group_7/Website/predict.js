function getSMA(arr, days) {
    let sum = 0;
    for(let i = arr.length - days; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum / days;
}

function getEMA(arr, days) {
    let k = 2 / (days + 1);
    let ema = arr[0];
    for(let i = 1; i < arr.length; i++) {
        ema = (arr[i] - ema) * k + ema;
    }
    return ema;
}

function getVol(arr) {
    let mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    let sumSq = 0;
    for(let x of arr) {
        sumSq += (x - mean) * (x - mean);
    }
    return Math.sqrt(sumSq / arr.length);
}

function getRSI(arr) {
    let gains = 0;
    let losses = 0;
    for(let i = arr.length - 14; i < arr.length; i++) {
        let diff = arr[i] - arr[i-1];
        if(diff > 0) gains += diff;
        else losses += Math.abs(diff);
    }
    let avgGain = gains / 14;
    let avgLoss = losses / 14;
    
    if(avgLoss === 0) return 100;
    let rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function makeFeatures(data) {
    let close = data.map(d => d.close);
    let today = data[data.length - 1];
    let yday = data[data.length - 2];

    let returns = [];
    for(let i = 1; i < close.length; i++) {
        returns.push((close[i] - close[i-1]) / close[i-1]);
    }

    return {
        Daily_Return: (today.close - yday.close) / yday.close,
        Moving_Avg_7: getSMA(close, 7),
        Moving_Avg_30: getSMA(close, 30),
        Volatility: getVol(returns.slice(-7)),
        Momentum: today.close - data[data.length - 6].close,
        Volume_Change: (today.volume - yday.volume) / yday.volume,
        Price_MAvg_7_ratio: today.close / getSMA(close, 7),
        Price_Change: today.close - today.open,
        RSI_14: getRSI(close),
        EMA_7: getEMA(close, 7),
        EMA_30: getEMA(close, 30),
        High_Low_Diff: today.high - today.low
    };
}

async function predict(coinData, btcData) {
    let res = await fetch('data.json');
    let model = await res.json();

    let c = makeFeatures(coinData);
    let b = makeFeatures(btcData);

    let raw = [
        c.Daily_Return, c.Moving_Avg_7, c.Moving_Avg_30, 
        c.Volatility, c.Momentum, c.Volume_Change, 
        c.Price_MAvg_7_ratio, c.Price_Change, c.RSI_14, 
        c.EMA_7, c.EMA_30, c.High_Low_Diff,
        b.Daily_Return, b.EMA_7, b.RSI_14
    ];

    let scaled = [];
    for(let i = 0; i < raw.length; i++) {
        let val = (raw[i] - model.scaling.mean[i]) / model.scaling.std[i];
        scaled.push(val);
    }

    let z = model.intercept;
    for(let i = 0; i < scaled.length; i++) {
        z += scaled[i] * model.weights[i];
    }

    let prob = 1 / (1 + Math.exp(-z));
    return prob;
}