import { useState, useEffect, useRef } from 'react';
import { useBrowserStore } from '../../stores/browserStore';

export default function Browser() {
  const {
    currentUrl,
    currentTitle,
    currentHtml,
    isLoading,
    error,
    canGoBack,
    canGoForward,
    bookmarks,
    browsingHistory,
    navigate,
    goBack,
    goForward,
    refresh,
    loadBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    loadHistory,
    clearHistoryEntry,
    search,
    setError,
  } = useBrowserStore();

  const [urlInput, setUrlInput] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadBookmarks();
    loadHistory();
  }, [loadBookmarks, loadHistory]);

  useEffect(() => {
    setUrlInput(currentUrl);
  }, [currentUrl]);

  const handleNavigate = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    
    if (trimmed.includes(' ') || (!trimmed.includes('.') && !trimmed.startsWith('http'))) {
      await search(trimmed);
    } else {
      await navigate(trimmed);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const handleBookmarkToggle = async () => {
    if (!currentUrl) return;
    
    if (isBookmarked(currentUrl)) {
      const bookmark = bookmarks.find((b) => b.url === currentUrl);
      if (bookmark) {
        await removeBookmark(bookmark.id);
      }
    } else {
      try {
        await addBookmark(currentTitle || currentUrl, currentUrl);
      } catch (err) {
        console.error('Failed to add bookmark:', err);
      }
    }
  };

  const handleBookmarkClick = (url: string) => {
    navigate(url);
    setShowBookmarks(false);
  };

  const handleHistoryClick = (url: string) => {
    navigate(url);
    setShowHistory(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Back"
        >
          ←
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Forward"
        >
          →
        </button>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh"
        >
          ↻
        </button>
        
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL or search query"
            className="flex-1 outline-none text-sm"
          />
          <button
            onClick={handleNavigate}
            disabled={isLoading}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Go
          </button>
        </div>

        <button
          onClick={handleBookmarkToggle}
          className={`px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 ${
            currentUrl && isBookmarked(currentUrl) ? 'bg-yellow-100' : 'bg-white'
          }`}
          title="Bookmark"
        >
          {currentUrl && isBookmarked(currentUrl) ? '★' : '☆'}
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowBookmarks(!showBookmarks);
              setShowHistory(false);
            }}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Bookmarks"
          >
            📑
          </button>
          {showBookmarks && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-gray-200 font-semibold">Bookmarks</div>
              {bookmarks.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No bookmarks yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookmarks.map((bookmark) => (
                    <button
                      key={bookmark.id}
                      onClick={() => handleBookmarkClick(bookmark.url)}
                      className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-xs">{bookmark.favicon || '🌐'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{bookmark.title}</div>
                        <div className="text-xs text-gray-500 truncate">{bookmark.url}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(bookmark.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-xs px-1"
                      >
                        ×
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              setShowBookmarks(false);
            }}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="History"
          >
            🕐
          </button>
          {showHistory && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-gray-200 font-semibold">History</div>
              {browsingHistory.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No history yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {browsingHistory.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleHistoryClick(entry.url)}
                      className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{entry.title}</div>
                        <div className="text-xs text-gray-500 truncate">{entry.url}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(entry.visitedAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearHistoryEntry(entry.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-xs px-1"
                      >
                        ×
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-100 border-b border-red-300 p-2 text-sm text-red-700 z-10">
            Error: {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-spin">🌐</div>
              <div className="text-sm text-gray-600">Loading...</div>
            </div>
          </div>
        )}

        {!currentHtml && !isLoading && !error && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌐</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Browser</h2>
              <p className="text-gray-600 mb-4">
                Enter a URL or search query to get started
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => navigate('https://www.google.com')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Go to Google
                </button>
                <button
                  onClick={() => navigate('https://github.com')}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Go to GitHub
                </button>
              </div>
            </div>
          </div>
        )}

        {currentHtml && !isLoading && (
          <iframe
            ref={iframeRef}
            srcDoc={currentHtml}
            className="w-full h-full border-0"
            title={currentTitle || currentUrl}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        )}
      </div>
    </div>
  );
}
