const LoadingScreen = () => {
  return (
    <div
      aria-label="Loading screen"
      role="progressbar"
      className="grid min-h-screen place-items-center px-4"
    >
      <div
        className="aspect-square w-20 animate-spin rounded-full border-y-4 border-solid border-gray-50 border-t-transparent"
        aria-hidden="true"
      />
    </div>
  );
};

export default LoadingScreen;
