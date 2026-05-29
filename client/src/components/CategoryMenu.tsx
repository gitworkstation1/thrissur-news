// client/src/components/CategoryMenu.tsx
const categories = ["News", "Crime", "Politics", "Sports", "Business", "Education", "Local", "Health"];

export default function CategoryMenu() {
  return (
    <div className="flex gap-6 overflow-x-auto whitespace-nowrap px-4 py-3 border-b bg-black text-white text-sm font-semibold [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {categories.map((item) => (
        <button key={item} className="hover:text-red-400 transition-colors">
          {item}
        </button>
      ))}
    </div>
  );
}