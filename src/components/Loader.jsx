export default function Loader({ text = 'Loading...', className = '', fullPage = false }) {
  const loaderContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}
