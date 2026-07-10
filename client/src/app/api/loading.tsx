// app/loading.tsx
export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      {/* A sleek, spinning red circle */}
      <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-[#e3000f] rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse font-headline">
        Loading News...
      </p>
    </div>
  );
}