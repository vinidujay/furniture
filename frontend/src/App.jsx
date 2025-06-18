import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Card from "./components/Card";
import "./index.css"; // make sure Tailwind directives are inside

const PAGE_SIZE = 12;

export default function App() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);

  const userRole =
    new URLSearchParams(location.search).get("role") === "admin" ? "admin" : "buyer";

  // Fetch data once
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API}/items`).then(r => setItems(r.data));
  }, []);

  // Infinite‐scroll sentinel
  const lastCardRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setPage(p => p + 1);
    });
    if (node) observerRef.current.observe(node);
  }, []);

  const visible = items.slice(0, page * PAGE_SIZE);

  return (
    <div className="p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {visible.map((it, i) => (
        <Card
          key={it.RowID}
          ref={i === visible.length - 1 ? lastCardRef : null}
          item={it}
          isAdmin={userRole === "admin"}
        />
      ))}
    </div>
  );
}