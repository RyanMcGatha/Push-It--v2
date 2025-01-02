"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SearchResult = {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Search for anything..."
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                <a href={result.url} className="hover:underline text-primary">
                  {result.title}
                </a>
              </CardTitle>
              <CardDescription>{result.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{result.description}</p>
            </CardContent>
          </Card>
        ))}

        {query && !isLoading && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
