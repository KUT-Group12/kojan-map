export function LoadingScreen() {
  return (
    <div
      data-testid="loading-screen"
      className="min-h-screen bg-white flex items-center justify-center"
    >
      <div className="text-center">
        <h1 className="text-gray-800 text-xl font-semibold mb-8">
          それまっこと？再発見！やまだの地
        </h1>
        <div className="flex justify-center space-x-2">
          <div
            className="w-3 h-3 bg-gray-800 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-3 h-3 bg-gray-800 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-3 h-3 bg-gray-800 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
