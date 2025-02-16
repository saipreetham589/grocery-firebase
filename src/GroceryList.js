import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export default function GroceryList() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState("");

  // Fetch items from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "groceryItems"), (snapshot) => {
      const itemList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemList);

      // Check for items that were checked more than 2 minutes ago
      itemList.forEach((item) => {
        if (item.purchased && item.checkedAt) {
          const checkedTime = new Date(item.checkedAt).getTime();
          const currentTime = new Date().getTime();
          if (currentTime - checkedTime > 120000) {
            // Delete the item if it's been checked for more than 2 minutes
            deleteDoc(doc(db, "groceryItems", item.id));
          }
        }
      });
    });
    return () => unsubscribe();
  }, []);

  // Add a new item
  const addItem = async () => {
    if (!newItem) return;
    await addDoc(collection(db, "groceryItems"), {
      name: newItem,
      quantity: 1,
      purchased: false,
      createdAt: new Date().toISOString(),
    });
    setNewItem("");
  };

  // Remove an item
  const removeItem = async (id) => {
    await deleteDoc(doc(db, "groceryItems", id));
  };

  // Edit an item
  const editItem = (item) => {
    setEditingItem(item.id);
    setEditText(item.name);
  };

  // Save edited item
  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    await updateDoc(doc(db, "groceryItems", id), { name: editText });
    setEditingItem(null);
  };

  // Toggle purchased status
  const togglePurchased = async (id, purchased) => {
    if (!purchased) {
      // Item is being checked
      const checkedAt = new Date().toISOString();
      await updateDoc(doc(db, "groceryItems", id), {
        purchased: true,
        checkedAt: checkedAt,
      });

      // Set a timeout to delete the item after 2 minutes
      const timeoutId = setTimeout(async () => {
        await deleteDoc(doc(db, "groceryItems", id));
      }, 120000); // 2 minutes = 120,000 milliseconds

      // Store the timeout ID in the item (optional, for cleanup)
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, timeoutId } : item
        )
      );
    } else {
      // Item is being unchecked
      await updateDoc(doc(db, "groceryItems", id), {
        purchased: false,
        checkedAt: null,
      });

      // Clear the timeout if the item is unchecked
      const item = items.find((item) => item.id === id);
      if (item?.timeoutId) {
        clearTimeout(item.timeoutId);
      }
    }
  };

  return (
    <div className="container">
      <h1>Grocery List</h1>
      <div className="input-container">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add a new item"
        />
        <button onClick={addItem}>Add</button>
      </div>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {/* Left: Checkbox, Item Name, and Timestamp */}
            <div className="item-content">
              <input
                type="checkbox"
                checked={item.purchased}
                onChange={() => togglePurchased(item.id, item.purchased)}
              />
              <div className="item-details">
                {editingItem === item.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <span className={`grocery-item ${item.purchased ? "line-through" : ""}`}>
                    {item.name}
                  </span>
                )}
                <span className="text-xs">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Right: Edit and Delete Buttons */}
            <div className="item-actions">
              {editingItem === item.id ? (
                <button onClick={() => saveEdit(item.id)} className="bg-green-500">
                  ✅ Save
                </button>
              ) : (
                <button onClick={() => editItem(item)} className="bg-yellow-500">
                  ✏️ Edit
                </button>
              )}
              <button onClick={() => removeItem(item.id)} className="bg-red-500">
                🗑 Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}