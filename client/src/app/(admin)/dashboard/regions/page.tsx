import RegionManager from "@/components/admin/RegionManager";

export const metadata = {
  title: "Territory Manager | Fides Admin",
};

export default function RegionsAdminPage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Territory Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your state, district, and local ward hierarchies here.
        </p>
      </div>
      
      <RegionManager />
    </div>
  );
}