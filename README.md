
# JETs IntraSoc Hackathon
## TokenTrend (AI Crypto Predictor)

Since cryptocurrency markets never sleep, and they are incredibly volatile, heavily sentiment-driven and shift in the blink of an eye. Relying solely on manual chart reading to catch short-term price action is exhausting and prone to human error. Even traders struggle to consistently predict what a token will do in the next few hours.
As we explore the intersection of Web3 and data science, we need better tooling.

## The Challenge:

Your task is to build **TokenTrend** - an intelligent, web-based crypto tracking dashboard. We aren't just looking for another [CoinMarketCap](https://coinmarketcap.com/) clone; we want a platform that actively uses historical data and machine learning to predict short-term market trends. The goal is to give users an edge by serving up real-time analytics and an AI-driven "UP/DOWN" daily forecast directly in the browser.

## Core Deliverables

### 1. Data Pipeline & Feature Engineering
* **Data Processing:** Crunch the provided historical cryptocurrency datasets using Python (`pandas`, `numpy`).
* **Feature Extraction:** Extract and engineer meaningful features that actually impact price action (e.g., 7-day Moving Averages, Volatility indexes, Daily Returns).

### 2. The Machine Learning Engine
* **Model Training:** Train a lightweight classification model to predict whether a specific token's daily close will be UP or DOWN for the next day.
* **Model Export:** Export your trained model's parameters/weights into a static format (like `data.json`). We want the frontend to handle the inference, meaning your web app will load these weights and make predictions on the fly without needing a heavy Python backend running 24/7.

### 3. Interactive Web Dashboard
* **Frontend UI:** Build a clean, responsive UI. You can stick to vanilla HTML/CSS/JS or spin up a React/Next.js frontend.
* **Live Data Integration:** Hook up a live data feed (we recommend the CoinGecko API) to pull in current prices and 24-hour volume changes.
* **Client-Side Inference:** Fetch your exported ML model data via JavaScript to run and display the trend predictions live on the dashboard.

---

## Resources
* **Historical Datasets:** [Google Drive Link](https://drive.google.com/drive/folders/1Q-S7JqnDO2ZlZVlkzf41AqOa_kEJQNwQ?usp=sharing) 
* **Live Data API:** [CoinGecko API Documentation](https://docs.coingecko.com/docs/setting-up-your-api-key) 

### Teams
You can find your team here: [ View Teams](./TEAMS.md)

---

## Guidelines & Rules

* **Open Source Libraries:** Feel free to use any standard open-source libraries or frameworks that help you get the job done efficiently.
* **Collaboration & Version Control:** All work must be managed using Git. Each team member must work on a dedicated feature branch, merge changes into the `main` branch of their fork, and finally open a PR by following the submission steps below.
* **AI Tools:** You can use AI coding assistants. *Note: Failing to explain anything related to your project code will lead to disqualification.*
---

## Evaluation Rubric
* **Technical Implementation (35 points):** Does it actually work? We're looking at the accuracy of your ML model, the efficiency of your data pipeline, clean code practices, and how well you handle the API requests. Passing the model weights from Python to JS effectively is a major plus here.
* **User Experience & UI (25 points):** Financial data can get messy. Your dashboard needs to be intuitive, visually sharp, and responsive. It should look like a tool a crypto trader would actually want to use.
* **Innovation & Originality (20 points):** Did you go beyond the baseline? This could be unique feature engineering, an interesting way to visualize the prediction confidence, or adding a novel metric that helps explain the "why" behind the AI's guess.
* **Final Presentation (20 points):** Be ready to defend your technical choices. We want to hear how you processed the data, why you chose your specific ML architecture, and how you handled the frontend integration.



## How to Submit

**Deadline:** Wednesday, Mar 25 .

1. **Fork** this repository.
2. Create a folder: `submissions/YOUR_TEAM_NAME`.
3. Include your **Code**.
4. Add a `README.md` using the [Submission Template](./SUBMISSION_TEMPLATE.md).
5. Open a **Pull Request (PR)** to the `main` branch.

---

## Detailed Scoring Breakdown (100 Points)

### 1. Technical Implementation — 35 Points
| Criteria | Points |
|---|---|
| Data pipeline & preprocessing | 10 |
| Feature engineering quality | 10 |
| ML model performance & prediction accuracy | 10 |
| Model export & frontend inference integration | 5 |

### 2. User Experience & UI — 25 Points
| Criteria | Points |
|---|---|
| Dashboard design & responsiveness | 10 |
| Data visualization & charts | 5 |
| Usability & interaction flow | 5 |
| Performance & API handling | 5 |

### 3. Innovation & Originality — 20 Points
| Criteria | Points |
|---|---|
| Unique features beyond baseline | 10 |
| Creative visualization or metrics | 5 |
| Explanation of AI predictions | 5 |

### 4. Final Presentation — 20 Points
| Criteria | Points |
|---|---|
| Clarity of explanation | 5 |
| Understanding of technical choices | 5 |
| Demo quality | 5 |
| Ability to answer questions | 5 |
---
## Important Dates

| Event | Date | Time |
| :--- | :--- | :--- |
| **Hackathon Start** | 15th March 2026 | 11:59 PM |
| **Submission Deadline** | 25th March 2026 | 11:59 PM |
| **Final Presentations** | TBD | TBD |
