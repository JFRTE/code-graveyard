export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-t-[50%] rounded-b-lg p-6 border border-gray-300 dark:border-gray-600">
        <div className="mt-8 text-center space-y-3">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto" />
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
