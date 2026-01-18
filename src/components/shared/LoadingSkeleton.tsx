// src/components/shared/LoadingSkeleton.tsx
export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br bg-lavender-50 animate-pulse">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="h-32 bg-white rounded-2xl"></div>
        <div className="h-32 bg-white rounded-2xl"></div>
        <div className="h-32 bg-white rounded-2xl"></div>
      </div>
    </div>
  );
}