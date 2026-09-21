/**
 * Products & Hardware Catalog Module Page
 */

"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Layers, Plus, Package, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { Enquiry } from "@/features/enquiries/types/enquiry.types";

interface ProductItem {
  id: string;
  name: string;
  category: string;
  specs: string;
}

const STORAGE_KEY = "crm_live_user_products";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Stores", specs: "" });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch {}
    }

    enquiryService
      .getEnquiries(
        {
          search: "",
          status: "All",
          group: "All",
          employee: "All",
          startDate: "",
          endDate: "",
          sortBy: "creation",
          sortOrder: "desc",
        },
        { page: 1, pageSize: 50 }
      )
      .then((res) => {
        setEnquiries(res.enquiries);
      })
      .catch(() => {});
  }, []);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const item: ProductItem = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      name: newProduct.name.trim(),
      category: newProduct.category,
      specs: newProduct.specs.trim(),
    };

    const updated = [item, ...products];
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewProduct({ name: "", category: "Stores", specs: "" });
    setIsAdding(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 mb-1">
              <span>CRM Workspace</span>
              <span>/</span>
              <span className="text-slate-500">Hardware & Products</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Product & Service Catalog</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold border border-violet-200">
                {products.length} Items
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Catalog specifications for commercial customer quotation items
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding((prev) => !prev)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {isAdding ? "Cancel" : "Add Product"}
          </Button>
        </div>

        {/* Add Product Form */}
        {isAdding && (
          <form onSubmit={handleCreateProduct} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Product / Service SKU</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product / Model Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Dell PowerEdge Server R750"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category / Group</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="e.g. Stores, DELL, Enterprise"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-violet-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Specifications</label>
              <textarea
                rows={2}
                value={newProduct.specs}
                onChange={(e) => setNewProduct({ ...newProduct, specs: e.target.value })}
                placeholder="Technical specifications, configuration details, warranty terms..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-violet-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Product
              </Button>
            </div>
          </form>
        )}

        {/* Product Items */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-card">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No product items registered yet</div>
            <div className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Add Product&quot; to catalog hardware configurations and equipment specifications.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{prod.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">{prod.id}</div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    {prod.category}
                  </span>
                </div>

                {prod.specs && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                    {prod.specs}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
