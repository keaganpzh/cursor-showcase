export default function Browser() {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center gap-2">
        <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
          ←
        </button>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
          →
        </button>
        <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
          ↻
        </button>
        <div className="flex-1 bg-white border border-gray-300 rounded px-3 py-1 text-sm">
          webos://localhost
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="text-2xl font-bold mb-2">No Internet Connection</h2>
          <p className="text-gray-600">
            This is a simulated browser environment.<br />
            Internet access is not available in WebOS Simulator.
          </p>
        </div>
      </div>
    </div>
  );
}

