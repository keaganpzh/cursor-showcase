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
      <div 
        className="border-b p-3 flex items-center gap-2 flex-shrink-0"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)',
          borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: !canGoBack ? 'rgba(0, 0, 0, 0.05)' : '#007aff',
            color: !canGoBack ? '#666' : 'white',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (canGoBack) {
              e.currentTarget.style.background = '#0051d5';
            }
          }}
          onMouseLeave={(e) => {
            if (canGoBack) {
              e.currentTarget.style.background = '#007aff';
            }
          }}
          title="Back"
        >
          ←
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: !canGoForward ? 'rgba(0, 0, 0, 0.05)' : '#007aff',
            color: !canGoForward ? '#666' : 'white',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (canGoForward) {
              e.currentTarget.style.background = '#0051d5';
            }
          }}
          onMouseLeave={(e) => {
            if (canGoForward) {
              e.currentTarget.style.background = '#007aff';
            }
          }}
          title="Forward"
        >
          →
        </button>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isLoading ? 'rgba(0, 0, 0, 0.05)' : '#007aff',
            color: isLoading ? '#666' : 'white',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#0051d5';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#007aff';
            }
          }}
          title="Refresh"
        >
          ↻
        </button>
        
        <div className="flex-1 flex items-center gap-2 rounded-md px-3 py-1.5" style={{
          background: 'white',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL or search query"
            className="flex-1 outline-none text-sm bg-transparent"
            style={{ color: '#1d1d1f' }}
          />
          <button
            onClick={handleNavigate}
            disabled={isLoading}
            className="px-3 py-1 text-xs font-medium text-white rounded-md transition-all duration-150 disabled:opacity-50"
            style={{
              background: '#007aff',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#0051d5';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#007aff';
              }
            }}
          >
            Go
          </button>
        </div>

        <button
          onClick={handleBookmarkToggle}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
          style={{
            background: currentUrl && isBookmarked(currentUrl) ? '#ffd60a' : 'white',
            color: currentUrl && isBookmarked(currentUrl) ? '#1d1d1f' : '#666',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (currentUrl && isBookmarked(currentUrl)) {
              e.currentTarget.style.background = '#ffcc00';
            } else {
              e.currentTarget.style.background = '#f5f5f7';
            }
          }}
          onMouseLeave={(e) => {
            if (currentUrl && isBookmarked(currentUrl)) {
              e.currentTarget.style.background = '#ffd60a';
            } else {
              e.currentTarget.style.background = 'white';
            }
          }}
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
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
            style={{
              background: showBookmarks ? '#007aff' : 'white',
              color: showBookmarks ? 'white' : '#666',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (!showBookmarks) {
                e.currentTarget.style.background = '#f5f5f7';
              }
            }}
            onMouseLeave={(e) => {
              if (!showBookmarks) {
                e.currentTarget.style.background = 'white';
              }
            }}
            title="Bookmarks"
          >
            📑
          </button>
          {showBookmarks && (
            <div 
              className="absolute right-0 top-full mt-1 w-64 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.1)',
                border: '0.5px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="p-2 border-b border-gray-200 font-semibold text-sm" style={{ color: '#1d1d1f' }}>Bookmarks</div>
              {bookmarks.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No bookmarks yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookmarks.map((bookmark) => (
                    <button
                      key={bookmark.id}
                      onClick={() => handleBookmarkClick(bookmark.url)}
                      className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <span className="text-xs">{bookmark.favicon || '🌐'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: '#1d1d1f' }}>{bookmark.title}</div>
                        <div className="text-xs text-gray-500 truncate">{bookmark.url}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(bookmark.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-xs px-1 transition-colors"
                        style={{ color: '#ff3b30' }}
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
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
            style={{
              background: showHistory ? '#007aff' : 'white',
              color: showHistory ? 'white' : '#666',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (!showHistory) {
                e.currentTarget.style.background = '#f5f5f7';
              }
            }}
            onMouseLeave={(e) => {
              if (!showHistory) {
                e.currentTarget.style.background = 'white';
              }
            }}
            title="History"
          >
            🕐
          </button>
          {showHistory && (
            <div 
              className="absolute right-0 top-full mt-1 w-64 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.1)',
                border: '0.5px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="p-2 border-b border-gray-200 font-semibold text-sm" style={{ color: '#1d1d1f' }}>History</div>
              {browsingHistory.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No history yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {browsingHistory.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleHistoryClick(entry.url)}
                      className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: '#1d1d1f' }}>{entry.title}</div>
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
                        className="text-red-500 hover:text-red-700 text-xs px-1 transition-colors"
                        style={{ color: '#ff3b30' }}
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

      <div className="flex-1 relative overflow-hidden" style={{ background: '#f5f5f7' }}>
        {error && (
          <div 
            className="absolute top-0 left-0 right-0 border-b p-3 text-sm z-10 flex items-center justify-between"
            style={{
              background: 'rgba(255, 59, 48, 0.1)',
              borderBottom: '0.5px solid rgba(255, 59, 48, 0.2)',
              color: '#d70015',
            }}
          >
            <span className="font-medium">Error: {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition-colors px-2"
              style={{ color: '#ff3b30' }}
            >
              ×
            </button>
          </div>
        )}

        {isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-3 animate-spin">🌐</div>
              <div className="text-sm font-medium" style={{ color: '#1d1d1f' }}>Loading...</div>
            </div>
          </div>
        )}

        {!currentHtml && !isLoading && !error && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-6 filter drop-shadow-sm">🌐</div>
              <h2 className="text-3xl font-semibold mb-3" style={{ color: '#1d1d1f' }}>Welcome to Browser</h2>
              <p className="text-sm mb-6" style={{ color: '#666' }}>
                Enter a URL or search query to get started
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('https://www.google.com')}
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-md transition-all duration-150"
                  style={{
                    background: '#007aff',
                    border: '0.5px solid rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0051d5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#007aff';
                  }}
                >
                  Go to Google
                </button>
                <button
                  onClick={() => navigate('https://github.com')}
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-md transition-all duration-150"
                  style={{
                    background: '#1d1d1f',
                    border: '0.5px solid rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1d1d1f';
                  }}
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
