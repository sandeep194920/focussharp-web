"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, CATEGORY_COLORS, FREE_CATEGORY_LIMIT } from "@/lib/store";
import Link from "next/link";

export default function CategoriesPage() {
  const { categories, isPro, addCategory, updateCategory, deleteCategory } =
    useStore();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const canAdd = isPro || categories.length < FREE_CATEGORY_LIMIT;

  const openAdd = () => {
    setEditId(null);
    setName("");
    setColor(CATEGORY_COLORS[0]);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setEditId(id);
    setName(cat.name);
    setColor(cat.color);
    setShowForm(true);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editId) {
      updateCategory(editId, trimmed, color);
    } else {
      addCategory(trimmed, color);
    }
    setShowForm(false);
    setEditId(null);
    setName("");
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    setConfirmDelete(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isPro
              ? `${categories.length} categories`
              : `${categories.length} / ${FREE_CATEGORY_LIMIT} (free plan)`}
          </p>
        </div>
        {canAdd ? (
          <button onClick={openAdd} className="btn-primary text-sm px-3 py-2">
            + New
          </button>
        ) : (
          <Link href="/pricing" className="btn-secondary text-sm px-3 py-2">
            Upgrade
          </Link>
        )}
      </div>

      {/* Pro upsell */}
      {!isPro && categories.length >= FREE_CATEGORY_LIMIT && (
        <div className="card p-4 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            Free plan limit reached
          </p>
          <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
            Upgrade to Pro for unlimited categories.
          </p>
          <Link
            href="/pricing"
            className="inline-block mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            See plans →
          </Link>
        </div>
      )}

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card p-4 flex flex-col gap-4"
          >
            <h2 className="font-medium text-gray-900 dark:text-white">
              {editId ? "Edit category" : "New category"}
            </h2>
            <div>
              <label className="label-sm block mb-1.5">Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Deep Work"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
                maxLength={32}
              />
            </div>
            <div>
              <label className="label-sm block mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-95 relative"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                {editId ? "Save changes" : "Add category"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-4 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0"
                style={{ backgroundColor: cat.color + "22" }}
              >
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {cat.name}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(cat.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {confirmDelete === cat.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(cat.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {categories.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">🏷</p>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              No categories yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
              Create your first category to start tracking focus time.
            </p>
            <button onClick={openAdd} className="btn-primary mt-4 text-sm">
              + Create category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
