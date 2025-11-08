# Browser Backend Setup

## Installation

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill in your Browserbase API key:
```bash
cp .env.example .env
# Edit .env and add your BROWSERBASE_API_KEY
```

3. Run the backend server:
```bash
uvicorn main:app --reload --port 8000
```

## Browserbase Integration

This backend uses the [Browserbase Python SDK](https://docs.browserbase.com/introduction) for web page navigation and content fetching. The SDK provides:

- Native browser automation capabilities
- Session management
- Content extraction

Make sure you have a valid Browserbase API key. You can get one from [Browserbase Dashboard](https://www.browserbase.com).

## API Endpoints

- `POST /api/browser/navigate?url=<url>` - Navigate to a URL
- `GET /api/browser/bookmarks` - Get all bookmarks
- `POST /api/browser/bookmarks` - Add a bookmark
- `DELETE /api/browser/bookmarks/{id}` - Delete a bookmark
- `GET /api/browser/history` - Get browsing history
- `DELETE /api/browser/history/{id}` - Delete history entry
- `GET /api/browser/search?query=<query>` - Search the web

## Data Storage

- Bookmarks and history are stored in JSON files in the `backend/data/` directory
- `bookmarks.json` - Stores all bookmarks
- `history.json` - Stores browsing history
- These files are created automatically on first run

## Notes

- Make sure to set your Browserbase API key in the `.env` file
- The backend runs on port 8000 by default
- The Browserbase SDK is used for all web navigation operations

