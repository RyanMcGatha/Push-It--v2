import { Metadata } from "next";
import SearchComponent from "./components/SearchComponent";

export const metadata: Metadata = {
  title: "Search",
  description: "Search through your content",
};

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Search</h1>
      <SearchComponent />
    </div>
  );
}
