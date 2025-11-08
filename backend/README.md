# Browser Backend Setup

## Installation

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the backend server:
```bash
uvicorn main:app --reload --port 8000
```

## Browser Functionality

The browser uses direct iframe loading for webpage rendering. Pages are loaded directly in the browser without backend fetching.

**Note:** Many modern websites (Twitter, Facebook, GitHub, etc.) block iframe embedding due to X-Frame-Options headers and CORS policies. This approach works best for simple sites, documentation pages, and sites that allow iframe embedding.

## API Endpoints

- `GET /api/browser/bookmarks` - Get all bookmarks
- `POST /api/browser/bookmarks` - Add a bookmark
- `DELETE /api/browser/bookmarks/{id}` - Delete a bookmark
- `GET /api/browser/history` - Get browsing history
- `POST /api/browser/history` - Add a history entry
- `DELETE /api/browser/history/{id}` - Delete history entry

## Data Storage

- Bookmarks and history are stored in JSON files in the `backend/data/` directory
- `bookmarks.json` - Stores all bookmarks
- `history.json` - Stores browsing history
- These files are created automatically on first run

## Notes

- The backend runs on port 8000 by default
- Webpage navigation is handled client-side using direct iframe loading

