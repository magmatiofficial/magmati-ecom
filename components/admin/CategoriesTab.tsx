'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Upload, 
  Trash, 
  FolderPlus, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  X, 
  Save,
  Layers,
  Image as ImageIcon,
  FolderTree,
  Tag,
  Check,
  RotateCcw
} from 'lucide-react';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { useCategoryStore, DEFAULT_CATEGORY_PLACEHOLDER } from '@/store/useCategoryStore';
import { SubCategoryItem } from '@/types';

interface Category {
  id: string;
  name: string;
  image: string;
  subcategories?: (string | SubCategoryItem)[];
}

interface Product {
  id: string;
  category: string;
}

interface CategoriesTabProps {
  categories: Category[];
  newCatName: string;
  setNewCatName: (val: string) => void;
  newCatImage: string;
  setNewCatImage: (val: string) => void;
  handleAddCategory: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, folder: string) => void;
  products: Product[];
  deleteCategory: (catId: string) => void;
  updateCategory?: (id: string, updatedFields: { name: string; image: string; slug?: string; subcategories?: (string | SubCategoryItem)[] }) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  newCatName,
  setNewCatName,
  newCatImage,
  setNewCatImage,
  handleAddCategory,
  handleImageUpload,
  products,
  deleteCategory,
  updateCategory: propUpdateCategory,
}) => {
  const { 
    updateCategory: storeUpdateCategory,
    addSubcategory,
    deleteSubcategory,
    resetCategories
  } = useCategoryStore();

  const [isAddCategoryOpenMobile, setIsAddCategoryOpenMobile] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Subcategory management state per category
  const [managingSubcatForId, setManagingSubcatForId] = useState<string | null>(null);
  const [newSubNameEn, setNewSubNameEn] = useState('');

  // Edit Category Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editSubcategories, setEditSubcategories] = useState<(string | SubCategoryItem)[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditImage(category.image);
    setEditSubcategories(category.subcategories ? [...category.subcategories] : []);
  };

  const handleCloseEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditImage('');
    setEditSubcategories([]);
    setIsSavingEdit(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setIsSavingEdit(true);
    const updatedData = {
      name: editName.trim(),
      image: editImage.trim() || editingCategory.image || DEFAULT_CATEGORY_PLACEHOLDER,
      slug: editName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      subcategories: editSubcategories,
    };

    if (propUpdateCategory) {
      propUpdateCategory(editingCategory.id, updatedData);
    } else {
      storeUpdateCategory(editingCategory.id, updatedData);
    }

    setIsSavingEdit(false);
    handleCloseEdit();
  };

  const handleAddSubcategoryDirect = (catId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubNameEn.trim()) return;
    addSubcategory(catId, {
      name: newSubNameEn.trim(),
    });
    setNewSubNameEn('');
  };

  const getSubName = (sub: string | SubCategoryItem) => {
    if (typeof sub === 'string') return sub;
    return sub.name;
  };

  const getSubId = (sub: string | SubCategoryItem) => {
    if (typeof sub === 'string') return sub;
    return sub.id;
  };

  return (
    <div className="space-y-3">
      {/* Top Banner explaining Nested Category System */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-blue-900">
          <FolderTree className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">
            {'Nested Category & Subcategory Hierarchy Active. You can manage subcategories for any parent category below.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {restoreSuccess && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-2xs font-bold animate-in fade-in">
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
              <span>{'Defaults Restored!'}</span>
            </span>
          )}

          {showRestoreConfirm ? (
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-red-200 shadow-2xs">
              <span className="text-2xs font-bold text-red-700">
                {'Reset to default?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  resetCategories();
                  setShowRestoreConfirm(false);
                  setRestoreSuccess(true);
                  setTimeout(() => setRestoreSuccess(false), 3000);
                }}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-2xs font-bold cursor-pointer transition-colors"
              >
                {'Yes, Reset'}
              </button>
              <button
                type="button"
                onClick={() => setShowRestoreConfirm(false)}
                className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-2xs font-bold cursor-pointer transition-colors"
              >
                {'Cancel'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowRestoreConfirm(true)}
              className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-2xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{'Restore Defaults'}</span>
            </button>
          )}
        </div>
      </div>

      {/* CREATE NEW PARENT CATEGORY CARD */}
      <div className="bg-white rounded-xl border border-neutral-200 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-primary" />
            <h3 className="font-sans text-xs sm:text-sm font-bold text-neutral-900">
              {'Create New Parent Category'}
            </h3>
          </div>
          {/* Mobile Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsAddCategoryOpenMobile(!isAddCategoryOpenMobile)}
            className="sm:hidden px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            {isAddCategoryOpenMobile ? (
              <>
                <span>{'Collapse'}</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>{'Add Category'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <div className={`${isAddCategoryOpenMobile ? 'block' : 'hidden sm:block'} mt-2.5`}>
          <form 
            onSubmit={(e) => {
              handleAddCategory(e);
              setNewCatName('');
              setNewCatImage('');
            }} 
            className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
          >
            <div>
              <label className="text-2xs font-bold text-neutral-700 block mb-0.5">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                }}
                placeholder="e.g. Headphone & Earphone"
                className="w-full h-8 px-2.5 border border-neutral-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-2xs font-bold text-neutral-700">
                  {'Category Image (Optional)'}
                </label>
                <span className="text-2xs font-semibold text-neutral-500">
                  {newCatImage ? ('Custom Image') : ('Default Placeholder')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Live Image Preview Thumbnail */}
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-300 bg-neutral-100 shrink-0 shadow-2xs">
                  <Image
                    src={newCatImage || DEFAULT_CATEGORY_PLACEHOLDER}
                    alt={newCatName ? `${newCatName} category image preview` : "New category placeholder preview"}
                    fill
                    sizes="32px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  placeholder={'Image URL or Upload...'}
                  className="w-full h-8 px-2.5 border border-neutral-200 rounded-lg text-xs focus:outline-hidden flex-1"
                />
                {newCatImage ? (
                  <button
                    type="button"
                    title={'Remove Image'}
                    onClick={() => setNewCatImage('')}
                    className="h-8 px-2 bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-500 border border-neutral-200 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
                <label className="h-8 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0 transition-colors">
                  <Upload className="w-3 h-3 text-primary" />
                  <span className="text-2xs">{'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, (url) => setNewCatImage(url), 'categories')}
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto h-8 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{'Add Category'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* EXISTING MARKETPLACE CATEGORIES TABLE WITH NESTED SUBCATEGORIES MANAGEMENT */}
      <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-1.5 pb-1 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="font-sans text-xs sm:text-sm font-bold text-neutral-900">
              {'Existing Categories & Nested Subcategories'}
            </h3>
            <span className="px-2 py-0.5 rounded-badge bg-neutral-100 text-neutral-700 text-2xs sm:text-xs font-bold">
              {categories.length} {'Total'}
            </span>
          </div>
        </div>

        {/* PURE RESPONSIVE TABLE VIEW */}
        <ResponsiveTableContainer showScrollCues={true}>
          <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[760px]">
            <thead className="bg-neutral-100 text-neutral-600 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <tr>
                <th className="px-3 py-2 border-b border-r border-neutral-200 bg-neutral-100 w-12 text-center">
                  {'Visual'}
                </th>
                <th className="px-3 py-2 border-b border-r border-neutral-200 bg-neutral-100">
                  {'Parent Category'}
                </th>
                <th className="px-3 py-2 border-b border-r border-neutral-200 bg-neutral-100">
                  {'Nested Subcategories'}
                </th>
                <th className="px-3 py-2 border-b border-r border-neutral-200 bg-neutral-100 text-center w-24">
                  {'Products'}
                </th>
                <th className="px-3 py-2 border-b border-r border-neutral-200 bg-neutral-100 text-center w-28">
                  {'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 border-b border-r border-neutral-200 text-neutral-400 font-bold text-xs uppercase tracking-wider">
                    {'No categories defined yet.'}
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const productCount = products.filter(p => p.category === cat.name).length;
                  const isManagingSubs = (managingSubcatForId === cat.id);
                  const subs = cat.subcategories || [];

                  return (
                    <React.Fragment key={cat.id}>
                      <tr className={`hover:bg-amber-50/40 transition-colors group ${isManagingSubs ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-3 py-2 border-b border-r border-neutral-200 text-center">
                          <div className="relative w-8 h-8 rounded-md overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100 mx-auto">
                            <Image
                              src={cat.image || DEFAULT_CATEGORY_PLACEHOLDER}
                              alt={cat.name ? `${cat.name} category thumbnail` : "Category thumbnail"}
                              fill
                              sizes="32px"
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2 border-b border-r border-neutral-200 font-bold text-neutral-900 group-hover:text-primary transition-colors text-xs">
                          <div>{cat.name}</div>
                        </td>

                        {/* Subcategories Pills and Quick Manage Button */}
                        <td className="px-3 py-2 border-b border-r border-neutral-200 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-md">
                            {subs.slice(0, 3).map((sub, i) => (
                              <span 
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-2xs font-medium border border-neutral-200"
                              >
                                <Tag className="w-2.5 h-2.5 text-blue-500" />
                                <span>{typeof sub === 'string' ? sub : sub.name}</span>
                              </span>
                            ))}
                            {subs.length > 3 && (
                              <span className="text-2xs font-bold text-neutral-500">
                                +{subs.length - 3} {'more'}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setManagingSubcatForId(isManagingSubs ? null : cat.id)}
                              className={`ml-1 px-2 py-0.5 rounded-md text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isManagingSubs 
                                  ? 'bg-blue-600 text-white shadow-xs' 
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              }`}
                            >
                              <FolderTree className="w-3 h-3" />
                              <span>{isManagingSubs ? ('Close') : (`Manage (${subs.length})`)}</span>
                            </button>
                          </div>
                        </td>

                        <td className="px-3 py-2 border-b border-r border-neutral-200 text-center text-xs">
                          <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-700 font-bold rounded-full text-2xs">
                            {productCount}
                          </span>
                        </td>

                        <td className="px-3 py-2 border-b border-r border-neutral-200 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* EDIT CATEGORY BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                              title={'Edit Category'}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* DELETE CATEGORY BUTTON */}
                            <button
                              type="button"
                              onClick={() => deleteCategory(cat.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title={'Delete Category'}
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* INLINE EXPANDED SUB-CATEGORIES MANAGER FOR SELECTED CATEGORY */}
                      {isManagingSubs && (
                        <tr className="bg-blue-50/20 border-b border-blue-100">
                          <td colSpan={5} className="p-4 bg-zinc-50 border-y border-zinc-200">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                                <div className="flex items-center gap-2">
                                  <FolderTree className="w-4 h-4 text-blue-600" />
                                  <h4 className="text-xs font-bold text-zinc-900">
                                    {`Manage Subcategories for "${cat.name}"`}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setManagingSubcatForId(null)}
                                  className="text-zinc-400 hover:text-zinc-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>{'Close'}</span>
                                </button>
                              </div>

                              {/* Form to add subcategory directly */}
                              <form 
                                onSubmit={(e) => handleAddSubcategoryDirect(cat.id, e)}
                                className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-zinc-200 shadow-2xs"
                              >
                                <input
                                  type="text"
                                  required
                                  value={newSubNameEn}
                                  onChange={(e) => {
                                    setNewSubNameEn(e.target.value);
                                  }}
                                  placeholder="Subcategory Name (e.g. Earbud Headphones) *"
                                  className="h-8 px-2.5 border border-zinc-200 rounded-lg text-xs flex-1 min-w-[220px] focus:outline-hidden focus:border-blue-500"
                                />
                                <button
                                  type="submit"
                                  className="h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Subcategory</span>
                                </button>
                              </form>

                              {/* List of existing subcategories with quick delete */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {subs.length === 0 ? (
                                  <p className="text-2xs text-zinc-400 py-1">
                                    {'No subcategories yet. Add using the form above.'}
                                  </p>
                                ) : (
                                  subs.map((sub, i) => {
                                    const subId = getSubId(sub);
                                    const displayName = getSubName(sub);
                                    return (
                                      <div
                                        key={subId || i}
                                        className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 bg-white border border-zinc-200 rounded-lg shadow-2xs text-xs font-medium text-zinc-800"
                                      >
                                        <span>{displayName}</span>
                                        <button
                                          type="button"
                                          onClick={() => deleteSubcategory(cat.id, subId)}
                                          className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                          title={'Remove'}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </ResponsiveTableContainer>
      </div>

      {/* EDIT CATEGORY MODAL (Including Subcategories list edit) */}
      {editingCategory && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[88dvh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                    {'Edit Category & Subcategories'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {editingCategory.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {'Category Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Headphone & Earphone"
                  className="w-full h-9 px-3 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-900 focus:outline-hidden focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {'Category Image (Optional / Default Placeholder)'}
                </label>

                {/* Current Image Preview & Upload Controls */}
                <div className="flex items-center gap-3 p-2 rounded-xl border border-neutral-200 bg-neutral-50 mb-2">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-white">
                    <Image
                      src={editImage || DEFAULT_CATEGORY_PLACEHOLDER}
                      alt={editName ? `${editName} category preview` : "Category image preview"}
                      fill
                      sizes="48px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-800 truncate">
                      {'Image Preview'}
                    </p>
                    <p className="text-2xs text-neutral-500 truncate">
                      {editImage || ('Using default category placeholder')}
                    </p>
                  </div>
                  {editImage ? (
                    <button
                      type="button"
                      title={'Remove image and use default'}
                      onClick={() => setEditImage('')}
                      className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="text-xs">{'Clear'}</span>
                    </button>
                  ) : null}
                  <label className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs">{'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (url) => setEditImage(url), 'categories')}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder={'Image URL (or leave blank for placeholder)...'}
                  className="w-full h-9 px-3 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-900 focus:outline-hidden focus:border-primary transition-colors"
                />
              </div>

              {/* Subcategories list inside edit modal */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {'Subcategories List'}
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar-thin p-1">
                  {editSubcategories.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                      <span>{typeof sub === 'string' ? sub : sub.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditSubcategories((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {editSubcategories.length === 0 && (
                    <p className="text-2xs text-neutral-400">{'No subcategories assigned'}</p>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-3.5 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? ('Saving...') : ('Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
