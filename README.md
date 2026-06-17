# BigQuery Release Pulse 🌌

An interactive, responsive, and visually stunning web application designed to fetch, categorize, search, filter, and share Google Cloud BigQuery release notes in real-time. Built with a **Python Flask backend** and a **premium, glassmorphic Vanilla CSS/JS frontend**.

Live local server runs at: `http://127.0.0.1:5000`

---

## ✨ Features

- **Backend RSS Parser & CORS Bypass**: Fetches the official Google Cloud BigQuery RSS/Atom XML feed (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`) and parses it serverside, bypassing browser-level CORS blocks.
- **Granular Update Splitting**: Automatically parses daily entries containing multiple updates and splits them into distinct, individual release cards.
- **Categorization Badges**: Tags updates with glowing colors based on type:
  - 🟢 **Feature**: New features and releases.
  - 🔵 **Announcement**: General product updates and upcoming migrations.
  - 🔴 **Issue / Fix**: Restored features or current bugs.
  - 🟡 **Deprecation**: Deprecated tools or APIs.
  - 🟣 **Update**: Miscellaneous general updates.
- **Real-Time Client-Side Search & Filter**: Search keywords in the content or click category filter pills to find matching releases instantly.
- **Interactive Tweet Sharing**: Select any specific release and share it on Twitter/X. Includes a custom-built composer dialog that tracks character counts (280-character limit warning) and formats post templates.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+, Flask, Requests, XML ElementTree
- **Frontend**: Plain Vanilla HTML5, CSS3 (Custom Variables, Flexbox, Keyframe Animations), and ES6+ JavaScript

---

## 📂 Project Structure

```text
bq-releases/
├── static/
│   ├── app.js       # Search, filter, modal, and share logic
│   └── style.css    # Responsive layout, animations, and dark-theme design
├── templates/
│   └── index.html   # Main dashboard markup
├── .gitignore       # Ignore Python caches, logs, and venvs
├── app.py           # Flask server & backend XML parsers
├── requirements.txt # Python package dependencies
└── README.md        # Project overview & guide (this file)
```

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine:

### 1. Prerequisites
Ensure you have Python 3.10 or higher installed. Check your version with:
```bash
python --version
```

### 2. Install Dependencies
Navigate to the project directory and install the required packages:
```bash
pip install -r requirements.txt
```

### 3. Run the Server
Start the Flask application:
```bash
python app.py
```

By default, the server will start in debug mode on:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to open issues or pull requests on [Mohanapriyajk07/BQ-Release-Pulse](https://github.com/Mohanapriyajk07/BQ-Release-Pulse).
