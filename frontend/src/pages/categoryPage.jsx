import { useParams } from "react-router-dom";

export default function CategoryPage() {
  const { name } = useParams();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">
        {name} Collection
      </h1>

      {/* Later we’ll fetch products from backend */}
      <p className="text-lg text-gray-600">
        Showing products for <strong>{name}</strong>.
      </p>
    </div>
  );
}
