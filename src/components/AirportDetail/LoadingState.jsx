import Header from "@/components/Header";

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#468BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading airport information...
          </p>
        </div>
      </div>
    </div>
  );
}
