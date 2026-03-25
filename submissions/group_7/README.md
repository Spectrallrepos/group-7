## ML Engine & Technical Implementation
The backbone of TokenTrend is a universal predictive engine trained on 23 distinct crypto assets. Instead of a "one-size-fits-all" model, we built a pipeline that treats the market as a high-dimensional time-series problem.

### 1. Feature Engineering (The "Alpha")
We transformed raw price/volume into 30+ predictive signals using a custom add_enhanced_features pipeline:

**Trend & Momentum: MACD (Signal/Hist), RSI, and EMA crossovers.**
**Volatility/Risk: ATR (14-day) and Bollinger Band width to scale predictions against market noise.**
**Statistical Edge: Included Return Skewness and Kurtosis to model "fat-tail" risks (sudden pumps/dumps).**
**Market Correlation: Integrated Bitcoin Lags (BTC Price/RSI) to capture the "leader-follower" dynamic in altcoins.**

### 2. The Model Tournament
We ran a competitive evaluation using TimeSeriesSplit (3-fold) to avoid data leakage. We compared four architectures:

**Logistic Regression: Weighted baseline for class balance.**
**Random Forest: For capturing non-linear interactions.**
**Gradient Boosting: Optimized via RandomizedSearchCV.**
**Stacking Ensemble: A multi-layered model combining the trees with a meta-learner.**

### 3. Training Logic & Metrics
**Validation: 80/20 Chronological split to maintain temporal integrity.**
**Normalization: Applied StandardScaler to ensure price parity across different market caps.**
**Optimization: We prioritized F1-Score (0.6533) over simple Accuracy. In trading, balancing Precision (avoiding fake signals) and Recall (catching the move) is the only way to remain profitable.**

### 4. Deployment (data.json)
The learned "intelligence" is compressed into a 100% portable data.json. This contains scaling parameters, feature importances, and model weights, allowing the frontend to run instant inference without a live Python backend.

