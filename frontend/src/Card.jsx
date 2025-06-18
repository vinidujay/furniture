import { forwardRef, useState } from "react";
import { Tab } from "@headlessui/react";
import axios from "axios";


const Card = forwardRef(function Card({ item, isAdmin }, ref) {
  const images = item.Images ? item.Images.split(",").map(s => s.trim()) : [];

  const [price, setPrice] = useState(item.Price);
  const [saving, setSaving] = useState(false);

  async function handleUpdate() {
    try {
      setSaving(true);
      await axios.put(
        `${import.meta.env.VITE_API}/items/${item.RowID}`,
        { ...item, Price: price },
        { headers: { "x-admin-key": import.meta.env.VITE_ADMIN } }
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={ref} className="border rounded-xl p-4 shadow bg-white dark:bg-zinc-900">
      {/* Image carousel */}
      {images.length ? (
        <Tab.Group>
          <Tab.Panels>
            {images.map(url => (
              <Tab.Panel key={url}>
                <img src={url} alt={item.Title} className="h-48 w-full object-cover rounded-md" />
              </Tab.Panel>
            ))}
          </Tab.Panels>
          <Tab.List className="flex justify-center gap-1 mt-2">
            {images.map(url => (
              <Tab
                key={url}
                className={({ selected }) =>
                  `h-2 w-2 rounded-full ${selected ? "bg-blue-600" : "bg-gray-400/60"}`
                }
              />
            ))}
          </Tab.List>
        </Tab.Group>
      ) : (
        <div className="h-48 w-full bg-gray-100 grid place-content-center text-gray-400">No image</div>
      )}

      {/* Text */}
      <h2 className="mt-3 text-lg font-bold">{item.Title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">{item.Dimensions}</p>

      {/* Price */}
      {isAdmin ? (
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="mt-2 w-full border rounded px-2 py-1 text-sm"
        />
      ) : (
        <p className="mt-2 font-medium">${item.Price}</p>
      )}

      {/* Action */}
      {isAdmin ? (
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="mt-3 w-full bg-green-600 text-white rounded py-1 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Update listing"}
        </button>
      ) : (
        <a
          href={`mailto:viniduj01@gmail.com?subject=${encodeURIComponent("Interested in " + item.Title)}`}
          className="mt-3 inline-block w-full bg-blue-600 text-white text-center rounded py-1"
        >
          Message seller
        </a>
      )}
    </div>
  );
});

export default Card;