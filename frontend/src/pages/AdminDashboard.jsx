import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, Scissors, Users, FileSpreadsheet,
  RefreshCw, LogOut, Search, Plus, Pencil, Trash2, Download, X,
  CheckCircle2, AlertTriangle, Store, Clock3, TrendingUp, UserCircle,
  Phone, Mail, MapPin, Ruler, CalendarDays, Image as ImageIcon, Eye
} from "lucide-react";

const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")}/api`
  : "http://localhost:5000/api";
const BACKEND_ORIGIN = API.replace(/\/api\/?$/, "");
const resolveUploadUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url)) return url;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const inputClass = "w-full rounded-xl border border-[#d9d0c2] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#aaa08f] focus:border-[#a88555] focus:ring-4 focus:ring-[#c9a566]/10";

function Modal({ modal, onClose, onConfirm }) {
  if (!modal) return null;
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#180f0d]/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div role="dialog" aria-modal="true" className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.96 }} transition={{ type: "spring", stiffness: 320, damping: 26 }} onMouseDown={(event) => event.stopPropagation()}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7eddf] text-[#9b743e]">
          {modal.type === "danger" ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
        </div>
        <h2 className="mt-5 text-center font-serifFancy text-2xl font-bold text-brand-navy">{modal.title}</h2>
        <p className="mt-2 text-center text-sm leading-6 text-[#746a61]">{modal.message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="rounded-xl border border-[#d9d0c2] px-4 py-3 text-sm font-bold text-[#51483f] transition hover:bg-[#f7f4ef]">Cancel</button>
          <button onClick={onConfirm} className={`rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition ${modal.type === "danger" ? "bg-[#8d3030] hover:bg-[#702424]" : "bg-brand-navy hover:bg-[#5b0c0c]"}`}>{modal.confirmLabel || "Confirm"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [productForm, setProductForm] = useState({ title: "", category: "", price: "", stock: "", img: "", description: "", section: "discover" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [exportDataType, setExportDataType] = useState("customers");
  const [exportSheetName, setExportSheetName] = useState("Customers");
  const [workbook, setWorkbook] = useState(null);
  const [selectedCustomOrder, setSelectedCustomOrder] = useState(null);

  const token = localStorage.getItem("token");
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__adminToastTimer);
    window.__adminToastTimer = window.setTimeout(() => setToast(null), 3200);
  };

  const authFetch = async (path, options = {}) => {
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
    const response = await fetch(`${API}/admin${path}`, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      throw new Error("Your admin session has expired.");
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Request failed");
    }
    return response;
  };

  const loadAll = async () => {
    if (!token) { navigate("/login", { replace: true }); return; }
    setLoading(true); setError("");
    try {
      const requests = [
        authFetch("/overview"), authFetch("/products"), authFetch("/orders"),
        authFetch("/custom-orders"), authFetch("/users")
      ];
      const responses = await Promise.all(requests);
      const [summary, productData, orderData, customData, userData] = await Promise.all(responses.map((response) => response.json()));
      setOverview(summary); setProducts(productData); setOrders(orderData); setCustomOrders(customData); setUsers(userData);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const saveProduct = async (event) => {
    event.preventEvent?.();
    event.preventDefault();
    try {
      if (!editingProduct && !productImageFile) {
        showToast("Please upload a product photo", "error");
        return;
      }
      const formData = new FormData();
      Object.entries({ ...productForm, price: Number(productForm.price), stock: Number(productForm.stock || 0) }).forEach(([key, value]) => {
        if (key !== "img") formData.append(key, value);
      });
      if (productImageFile) formData.append("image", productImageFile);
      await authFetch(editingProduct ? `/products/${editingProduct}` : "/products", {
        method: editingProduct ? "PUT" : "POST",
        body: formData,
      });
      showToast(editingProduct ? "Product updated successfully" : "Product created successfully");
      setProductForm({ title: "", category: "", price: "", stock: "", img: "", description: "", section: "discover" });
      setEditingProduct(null); loadAll();
      setProductImageFile(null);
      setProductImagePreview("");
    } catch (err) { showToast(err.message, "error"); }
  };

  const editProduct = (product) => {
    setEditingProduct(product._id);
    setProductForm({ title: product.title || "", category: product.category || "", price: product.price || "", stock: product.stock || "", img: product.img || "", description: product.description || "", section: product.section || "discover" });
    setProductImageFile(null);
    setProductImagePreview(product.img || "");
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = (product) => setModal({
    type: "danger", title: "Delete product?", message: `"${product.title}" will be permanently removed from the catalogue.`,
    confirmLabel: "Delete product", action: async () => {
      await authFetch(`/products/${product._id}`, { method: "DELETE" });
      showToast("Product deleted"); loadAll();
    }
  });

  const updateOrderStatus = async (id, status) => {
    await authFetch(`/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    showToast(`Order marked ${status.toLowerCase()}`); loadAll();
  };

  const exportExcel = async () => {
    try {
      const form = new FormData();
      form.append("dataType", exportDataType);
      if (exportDataType !== "all") {
        form.append("sheetName", exportSheetName.trim() || (exportDataType === "customers" ? "Customers" : "Orders"));
      }
      if (workbook) form.append("workbook", workbook);
      const response = await authFetch("/orders/export-excel", { method: "POST", body: form });
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url; link.download = `Khan-Couture-${exportDataType}-${Date.now()}.xlsx`; link.click();
      URL.revokeObjectURL(url); setWorkbook(null); showToast("Workbook exported successfully"); loadAll();
    } catch (err) { showToast(err.message, "error"); }
  };

  const logout = () => {
    setModal({
      type: "danger",
      title: "Sign out?",
      message: `You are signed in as ${user.email || "an administrator"}. You will need to log in again to return to this panel.`,
      confirmLabel: "Sign out",
      action: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      },
    });
  };

  const nav = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "custom", label: "Custom Orders", icon: Scissors },
    { key: "users", label: "Customers", icon: Users },
    { key: "excel", label: "Excel Export", icon: FileSpreadsheet },
  ];
  const current = nav.find((item) => item.key === tab);
  const filteredProducts = products.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
  const filteredOrders = orders.filter((item) => `${item.customer?.name} ${item.customer?.email}`.toLowerCase().includes(search.toLowerCase()));

  const confirmModal = async () => {
    try {
      await modal?.action?.();
      setModal(null);
    } catch (err) {
      showToast(err.message, "error");
      setModal(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] font-sansTrend text-brand-charcoal md:flex">
      <aside className="relative z-40 bg-[#271713] text-white md:sticky md:top-0 md:h-screen md:w-[280px] md:flex-none md:p-7">
        <div className="flex items-center justify-between px-5 py-4 md:block md:px-0 md:py-0">
          <button onClick={() => navigate("/")} className="text-left">
            <span className="block font-serifFancy text-[22px] font-bold tracking-[0.04em]">Khan's Couture</span>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.38em] text-[#d7bc82]">Administration</span>
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:mt-9 md:block md:space-y-1 md:overflow-visible md:px-0 md:pb-0">
          {nav.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTab(key); setSearch(""); }} className={`flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all md:w-full ${tab === key ? "bg-[#d7bc82] font-bold text-[#271713] shadow-[0_8px_24px_rgba(215,188,130,.18)]" : "text-white/65 hover:bg-white/[0.07] hover:text-white"}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="hidden md:absolute md:bottom-7 md:left-7 md:right-7">
          <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Signed in</p>
            <p className="mt-1 truncate text-sm font-medium">{user.email || "Administrator"}</p>
          </div>
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-sm text-white/75 transition hover:bg-white hover:text-[#271713]"><LogOut size={16} />Sign out</button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <header className="mb-7 flex items-end justify-between border-b border-[#ddd3c3] pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#9b743e]">Management console</p>
            <motion.h1 key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 font-serifFancy text-3xl font-bold text-brand-navy md:text-[42px]">{current?.label}</motion.h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-[#ddd3c2] bg-white px-3 py-2 lg:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4ecdf] text-[#92703d]"><UserCircle size={17} /></span>
              <div className="max-w-[180px]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#a18457]">Logged in as</p>
                <p className="truncate text-xs font-bold">{user.email || "Administrator"}</p>
              </div>
            </div>
            <button onClick={loadAll} title="Refresh" className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d5c8b3] bg-white text-sm font-bold transition hover:border-[#271713] hover:bg-[#271713] hover:text-white"><RefreshCw size={16} /></button>
            <button onClick={logout} title="Sign out" className="flex h-11 items-center gap-2 rounded-xl border border-[#d5c8b3] bg-white px-3 text-sm font-bold text-[#7f3434] transition hover:border-[#7f3434] hover:bg-[#7f3434] hover:text-white"><LogOut size={16} /><span className="inline sm:hidden lg:inline">Sign out</span></button>
          </div>
        </header>
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[#dfd5c4] bg-white px-3 py-2.5 lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#f4ecdf] text-[#92703d]"><UserCircle size={16} /></span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#a18457]">Logged in as</p>
              <p className="truncate text-xs font-bold">{user.email || "Administrator"}</p>
            </div>
          </div>
          <button onClick={logout} className="ml-3 flex h-8 flex-none items-center gap-1.5 rounded-lg border border-[#e7d3d3] px-2.5 text-xs font-bold text-[#7f3434]"><LogOut size={14} /><span className="sm:hidden">Out</span></button>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -12, x: 12 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -8 }} className={`fixed right-4 top-4 z-[110] flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl ${toast.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-white text-emerald-800"}`}>
              {toast.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span className="font-semibold">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 opacity-60"><X size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"><AlertTriangle size={18} />{error}</div>}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0,1,2,3,4,5].map((item)=><div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.24 }}>
              {tab === "overview" && <Overview overview={overview} orders={orders} setTab={setTab} />}
              {tab === "products" && (
                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                  <motion.form onSubmit={saveProduct} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="h-fit rounded-[22px] border border-[#dfd5c4] bg-white p-5 shadow-[0_14px_40px_rgba(71,7,7,.05)] sm:p-6">
                    <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4ecdf] text-[#8e6938]">{editingProduct ? <Pencil size={18}/> : <Plus size={18}/>}</div><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#a18457]">{editingProduct ? "Editing" : "Catalogue"}</p><h2 className="font-serifFancy text-xl font-bold">{editingProduct ? "Update product" : "Add product"}</h2></div></div>
                    <div className="space-y-3">
                      <input required placeholder="Product name" value={productForm.title} onChange={(e)=>setProductForm({...productForm,title:e.target.value})} className={inputClass}/>
                      <input required placeholder="Category" value={productForm.category} onChange={(e)=>setProductForm({...productForm,category:e.target.value})} className={inputClass}/>
                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#92703d]">Product photo</label>
                        <label className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#d9cdb9] bg-[#faf7f1] text-[#746a61] transition hover:border-[#92703d]">
                          {productImagePreview
                            ? <img src={productImagePreview} alt="Product preview" className="h-48 w-full object-cover"/>
                            : <div className="flex h-32 flex-col items-center justify-center"><ImageIcon size={24}/><span className="mt-2 text-xs font-bold">Upload product photo</span></div>}
                          <input type="file" accept="image/*" className="hidden" onChange={(event)=>{
                            const file=event.target.files?.[0];
                            if (!file) return;
                            setProductImageFile(file);
                            setProductImagePreview(URL.createObjectURL(file));
                          }}/>
                        </label>
                        {productImageFile && <button type="button" onClick={()=>{setProductImageFile(null);setProductImagePreview(editingProduct?productForm.img:"")}} className="mt-2 text-xs font-bold text-red-600">Remove selected photo</button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3"><input type="number" min="0" required placeholder="Price" value={productForm.price} onChange={(e)=>setProductForm({...productForm,price:e.target.value})} className={inputClass}/><input type="number" min="0" placeholder="Stock" value={productForm.stock} onChange={(e)=>setProductForm({...productForm,stock:e.target.value})} className={inputClass}/></div>
                      <select value={productForm.section} onChange={(e)=>setProductForm({...productForm,section:e.target.value})} className={inputClass}><option value="kurti">Kurti</option><option value="wedding">Wedding</option><option value="signature">Signature</option><option value="discover">Discover</option></select>
                      <textarea placeholder="Description" value={productForm.description} onChange={(e)=>setProductForm({...productForm,description:e.target.value})} className={`${inputClass} min-h-24 resize-none`}/>
                      <button className="w-full rounded-xl bg-brand-navy py-3.5 text-sm font-bold text-white shadow-lg shadow-[#470707]/10 transition hover:-translate-y-0.5 hover:bg-[#5b0c0c]">{editingProduct ? "Save changes" : "Create product"}</button>
                      {editingProduct && <button type="button" onClick={()=>{setEditingProduct(null);setProductForm({title:"",category:"",price:"",stock:"",img:"",description:"",section:"discover"});setProductImageFile(null);setProductImagePreview("")}} className="w-full rounded-xl border border-[#d9d0c2] py-3 text-sm font-bold">Cancel editing</button>}
                    </div>
                  </motion.form>
                  <section className="min-w-0 rounded-[22px] border border-[#dfd5c4] bg-white shadow-[0_14px_40px_rgba(71,7,7,.05)]">
                    <TableToolbar value={search} onChange={setSearch} placeholder="Search products" count={filteredProducts.length}/>
                    <ProductTable products={filteredProducts} editProduct={editProduct} deleteProduct={deleteProduct} />
                  </section>
                </div>
              )}
              {tab === "orders" && <section className="overflow-hidden rounded-[22px] border border-[#dfd5c4] bg-white shadow-[0_14px_40px_rgba(71,7,7,.05)]"><TableToolbar value={search} onChange={setSearch} placeholder="Search customer or email" count={filteredOrders.length}/><OrderTable orders={filteredOrders} updateStatus={updateOrderStatus}/></section>}
              {tab === "custom" && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{customOrders.map((order)=><CustomCard key={order._id} order={order} authFetch={authFetch} refresh={loadAll} showToast={showToast} openDetails={setSelectedCustomOrder}/>)}</div>}
              {tab === "users" && <section className="overflow-hidden rounded-[22px] border border-[#dfd5c4] bg-white shadow-[0_14px_40px_rgba(71,7,7,.05)]"><TableToolbar value={search} onChange={setSearch} placeholder="Search customers" count={users.length}/><UserTable users={users.filter((u)=>`${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase()))} updateRole={async(id,role)=>{await authFetch(`/users/${id}/role`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({role})});showToast("Customer role updated");loadAll()}}/></section>}
              {tab === "excel" && <ExcelPanel exportDataType={exportDataType} setExportDataType={setExportDataType} exportSheetName={exportSheetName} setExportSheetName={setExportSheetName} workbook={workbook} setWorkbook={setWorkbook} exportExcel={exportExcel}/>}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <AnimatePresence><Modal modal={modal} onClose={()=>setModal(null)} onConfirm={confirmModal}/></AnimatePresence>
      <AnimatePresence>
        {selectedCustomOrder && (
          <CustomOrderDetailsModal
            order={selectedCustomOrder}
            onClose={() => setSelectedCustomOrder(null)}
            updateStatus={async (status) => {
              await authFetch(`/custom-orders/${selectedCustomOrder._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
              });
              showToast("Custom order updated");
              await loadAll();
              setSelectedCustomOrder((current) => current ? { ...current, status } : current);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Overview({ overview, orders, setTab }) {
  const cards = [
    ["Revenue", money(overview.revenue), TrendingUp, "bg-brand-navy text-white"],
    ["Orders", overview.orders, ShoppingBag, "bg-white"],
    ["Pending", overview.pendingOrders, Clock3, "bg-white"],
    ["Products", overview.products, Package, "bg-white"],
    ["Customers", overview.users, Users, "bg-white"],
    ["Custom orders", overview.customOrders, Scissors, "bg-white"],
  ];
  return <div className="space-y-5">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">{cards.map(([label,value,Icon,style],index)=><motion.div key={label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:index*.05}} className={`rounded-[20px] border border-[#e0d6c5] p-5 shadow-[0_12px_30px_rgba(71,7,7,.04)] ${style}`}><Icon size={18} className={index===0?"text-[#d7bc82]":"text-[#a18457]"}/><p className={`mt-5 text-[10px] font-bold uppercase tracking-widest ${index===0?"text-white/55":"text-[#918678]"}`}>{label}</p><p className="mt-2 font-serifFancy text-2xl font-bold">{value}</p></motion.div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
      <section className="overflow-hidden rounded-[22px] border border-[#dfd5c4] bg-white shadow-[0_14px_40px_rgba(71,7,7,.04)]"><div className="flex items-center justify-between border-b border-[#eee7dc] px-5 py-4"><div><p className="text-[9px] font-bold uppercase tracking-widest text-[#a18457]">Latest activity</p><h2 className="mt-1 font-serifFancy text-xl font-bold">Recent orders</h2></div><button onClick={()=>setTab("orders")} className="text-xs font-bold text-[#92703d] underline-offset-4 hover:underline">View all</button></div>
        <div className="divide-y divide-[#f0ebe2]">{orders.slice(0,5).map((order)=><button key={order._id} onClick={()=>setTab("orders")} className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-[#faf8f4]"><div><p className="font-bold">{order.customer?.name||"Customer"}</p><p className="mt-1 text-xs text-[#918678]">{order.items?.length||0} item(s) · {new Date(order.createdAt).toLocaleDateString()}</p></div><div className="text-right"><p className="font-bold">{money(order.totalINR)}</p><p className="mt-1 text-xs text-[#92703d]">{order.status}</p></div></button>)}</div>
      </section>
      <section className="rounded-[22px] bg-brand-navy p-6 text-white shadow-[0_18px_45px_rgba(71,7,7,.16)]"><Store size={22} className="text-[#d7bc82]"/><h2 className="mt-5 font-serifFancy text-xl font-bold">Quick actions</h2><div className="mt-5 grid gap-2"><button onClick={()=>setTab("products")} className="rounded-xl bg-[#d7bc82] px-4 py-3 text-left text-sm font-bold text-brand-navy">Add or edit product</button><button onClick={()=>setTab("orders")} className="rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-bold">Manage orders</button><button onClick={()=>setTab("excel")} className="rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-bold">Export to Excel</button></div></section>
    </div>
  </div>;
}

function TableToolbar({ value, onChange, placeholder, count }) {
  return <div className="flex items-center justify-between border-b border-[#eee7dc] px-5 py-4"><div className="relative w-full max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a69b89]"/><input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-[#ddd3c2] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#a88555]"/></div><span className="hidden text-xs font-bold text-[#a69b89] sm:block">{count} records</span></div>;
}

function ProductTable({products,editProduct,deleteProduct}) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="bg-[#faf7f1] text-left text-[10px] uppercase tracking-wider text-[#928778]"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Section</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#f0ebe2]">{products.map((product)=><tr key={product._id} className="transition hover:bg-[#fcfaf6]"><td className="px-5 py-4"><div className="flex items-center gap-3">{product.img?<img src={product.img} alt="" className="h-12 w-12 rounded-xl object-cover"/>:<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1eadf]"><Package size={18}/></div>}<span className="font-bold">{product.title}</span></div></td><td className="px-5 py-4 capitalize">{product.section}</td><td className="px-5 py-4 font-bold">{money(product.price)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${Number(product.stock)>0?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{product.stock||0}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={()=>editProduct(product)} className="rounded-lg p-2 text-[#92703d] transition hover:bg-[#f3ecdf]" title="Edit"><Pencil size={16}/></button><button onClick={()=>deleteProduct(product)} className="rounded-lg p-2 text-red-600 transition hover:bg-red-50" title="Delete"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>;
}

function OrderTable({orders,updateStatus}) {
  const statusClass={Ordered:"bg-blue-50 text-blue-700",Processing:"bg-amber-50 text-amber-700",Shipped:"bg-violet-50 text-violet-700",Delivered:"bg-emerald-50 text-emerald-700"};
  return <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-sm"><thead className="bg-[#faf7f1] text-left text-[10px] uppercase tracking-wider text-[#928778]"><tr><th className="px-5 py-3">Order / Customer ID</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#f0ebe2]">{orders.map((order)=><tr key={order._id} className="hover:bg-[#fcfaf6]"><td className="px-5 py-4"><p className="font-bold text-brand-navy">{order.orderId||"—"}</p><p className="mt-1 text-xs text-[#92703d]">{order.customer?.customerId||"—"}</p></td><td className="px-5 py-4"><p className="font-bold">{order.customer?.name||"Customer"}</p><p className="mt-1 text-xs text-[#918678]">{order.customer?.email}</p></td><td className="max-w-[260px] px-5 py-4 text-xs leading-5">{order.items?.map((item)=>`${item.title} ×${item.quantity}`).join(", ")}</td><td className="px-5 py-4 font-bold">{money(order.totalINR)}</td><td className="px-5 py-4 text-xs text-[#918678]">{new Date(order.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><select value={order.status} onChange={(e)=>updateStatus(order._id,e.target.value)} className={`rounded-full border-0 px-3 py-2 text-xs font-bold outline-none ${statusClass[order.status]||"bg-gray-100 text-gray-700"}`}><option>Ordered</option><option>Processing</option><option>Shipped</option><option>Delivered</option></select></td></tr>)}</tbody></table></div>;
}

function CustomOrderDetailsModal({order,onClose,updateStatus}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, []);

  const measurements = order.measurements ? Object.entries(order.measurements).filter(([,value]) => value !== undefined && value !== null && value !== "") : [];
  const label = (key) => key.replace(/([A-Z])/g," $1").replace(/^./,(char)=>char.toUpper());
  const emailSubject = encodeURIComponent(`Regarding your custom order ${order.orderId || ""}`);
  const emailBody = encodeURIComponent(`Hello ${order.fullName},\n\nWe are contacting you about your Khan's Couture custom order ${order.orderId || ""}.\n\n`);

  const Detail = ({title,value}) => value ? <div className="rounded-xl border border-[#eee7dc] bg-[#fcfaf6] p-3"><p className="text-[9px] font-bold uppercase tracking-widest text-[#a18457]">{title}</p><p className="mt-1 text-sm leading-6 text-[#5e554b]">{value}</p></div> : null;

  return <motion.div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#180f0d]/65 p-2 backdrop-blur-sm sm:p-5" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={onClose}>
    <motion.section role="dialog" aria-modal="true" aria-label="Custom order details" onMouseDown={(event)=>event.stopPropagation()} initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:16,scale:.98}} className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[24px] bg-[#fffdf9] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#eee7dc] bg-[#fffdf9]/95 px-5 py-4 backdrop-blur sm:px-7">
        <div><p className="text-[9px] font-bold uppercase tracking-widest text-[#a18457]">Custom order enquiry</p><h2 className="mt-1 font-serifFancy text-2xl font-bold text-brand-navy">{order.fullName}</h2><p className="mt-1 text-xs font-bold text-[#92703d]">{order.orderId||"Order ID pending"} · {order.customerId||"Customer ID pending"}</p></div>
        <button onClick={onClose} className="rounded-full border border-[#e4dac8] p-2 text-[#746a61] transition hover:bg-[#f5efe5]" aria-label="Close details"><X size={18}/></button>
      </div>

      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-5">
          <section className="rounded-[20px] bg-brand-navy p-5 text-white"><p className="text-[9px] font-bold uppercase tracking-widest text-[#d7bc82]">Customer contact</p><div className="mt-4 space-y-3"><p className="text-lg font-bold">{order.fullName}</p><p className="flex items-start gap-2 text-sm text-white/75"><MapPin size={16} className="mt-0.5 flex-none"/>{order.address||"No address provided"}</p></div><div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1"><a href={`tel:${order.phone}`} className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-navy transition hover:bg-[#d7bc82]"><Phone size={16}/>Call customer</a><a href={`mailto:${order.email}?subject=${emailSubject}&body=${emailBody}`} className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"><Mail size={16}/>Email customer</a></div><div className="mt-4 space-y-1 text-xs text-white/70"><p>{order.phone||"No phone number"}</p><p className="break-all">{order.email||"No email address"}</p></div></section>

          <section><div className="mb-3 flex items-center justify-between"><p className="text-[9px] font-bold uppercase tracking-widest text-[#a18457]">Uploaded references</p><span className="text-xs text-[#918678]">{order.designImages?.length||0} image(s)</span></div>{order.designImages?.length ? <div className="grid grid-cols-2 gap-3">{order.designImages.map((image,index)=>{const imageUrl=resolveUploadUrl(image); return <a key={`${image}-${index}`} href={imageUrl} target="_blank" rel="noreferrer" className="group relative overflow-hidden rounded-xl border border-[#e7dfd2] bg-[#eee6da]"><img src={imageUrl} alt={`Customer reference ${index+1}`} className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-brand-navy">View full size</span></a>})}</div> : <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-[#d9cdb9] bg-[#faf7f1] text-[#918678]"><ImageIcon size={22}/><span className="ml-2 text-xs">No images uploaded</span></div>}</section>
        </div>

        <div className="space-y-5">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Detail title="Order type" value={order.orderType}/><Detail title="Outfit type" value={order.outfitType}/><Detail title="Preferred color" value={order.color}/><Detail title="Budget" value={order.budget}/><Detail title="Delivery date" value={order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : ""}/><Detail title="Submitted" value={order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}/></section>

          <section className="rounded-[20px] border border-[#e2d8c8] bg-white p-5"><div className="flex items-center gap-2"><Ruler size={18} className="text-[#92703d]"/><h3 className="font-serifFancy text-lg font-bold">Measurements</h3></div>{measurements.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{measurements.map(([key,value])=><div key={key} className="rounded-xl bg-[#f7f3ec] px-3 py-3"><p className="text-[9px] font-bold uppercase tracking-wider text-[#918678]">{label(key)}</p><p className="mt-1 font-bold text-brand-navy">{value}</p></div>)}</div> : <p className="mt-4 text-sm text-[#918678]">No measurements were provided.</p>}</section>

          <section className="grid gap-3"><Detail title="Fabric preference" value={order.fabricPreference}/><Detail title="Embroidery details" value={order.embroideryDetails}/><Detail title="Special instructions" value={order.specialInstructions}/>{order.orderType==="Wedding Order" && <><Detail title="Wedding pieces" value={order.weddingPieces}/><Detail title="Wedding notes" value={order.weddingNotes}/></>}</section>

          <section className="flex flex-col gap-3 rounded-[20px] border border-[#e2d8c8] bg-white p-5 sm:flex-row sm:items-center"><CalendarDays size={18} className="text-[#92703d]"/><div className="flex-1"><p className="text-[9px] font-bold uppercase tracking-widest text-[#a18457]">Order status</p><p className="mt-1 text-xs text-[#918678]">Update the current custom-order progress.</p></div><select value={order.status} onChange={(event)=>updateStatus(event.target.value)} className="rounded-xl border border-[#ddd3c2] px-3 py-3 text-sm font-bold outline-none"><option>Pending</option><option>In Progress</option><option>Completed</option></select></section>
        </div>
      </div>
    </motion.section>
  </motion.div>;
}

function CustomCard({order,authFetch,refresh,showToast,openDetails}) {
  const firstImage = order.designImages?.[0];
  const firstImageUrl = resolveUploadUrl(firstImage);
  return <motion.article initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="overflow-hidden rounded-[22px] border border-[#dfd5c4] bg-white shadow-[0_14px_40px_rgba(71,7,7,.04)]">
    <button onClick={()=>openDetails(order)} className="block w-full bg-[#eee6da] text-left">
      {firstImageUrl ? <img src={firstImageUrl} alt={order.fullName} className="h-48 w-full object-cover transition duration-500 hover:scale-[1.02]" /> : <div className="flex h-48 items-center justify-center text-[#a18457]"><ImageIcon size={34}/><span className="ml-2 text-xs font-bold uppercase tracking-widest">No reference uploaded</span></div>}
    </button>
    <div className="p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-widest text-[#a18457]">{order.orderType||"Custom order"} · {order.outfitType||"Custom outfit"}</p><h3 className="mt-1 font-serifFancy text-xl font-bold">{order.fullName}</h3></div><span className="rounded-full bg-[#f4ecdf] px-2.5 py-1 text-[10px] font-bold text-[#92703d]">{order.status}</span></div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold"><span className="rounded-lg bg-brand-navy px-2.5 py-1.5 text-white">Order: {order.orderId||"—"}</span><span className="rounded-lg bg-[#f4ecdf] px-2.5 py-1.5 text-[#92703d]">Customer: {order.customerId||"—"}</span></div>
      <div className="mt-4 space-y-2 text-sm"><a href={`mailto:${order.email}`} className="flex items-center gap-2 text-[#71675d] hover:text-brand-navy"><Mail size={15}/>{order.email}</a><a href={`tel:${order.phone}`} className="flex items-center gap-2 text-[#71675d] hover:text-brand-navy"><Phone size={15}/>{order.phone}</a></div>
      <div className="mt-5 flex gap-2">
        <button onClick={()=>openDetails(order)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-navy px-3 py-3 text-xs font-bold text-white transition hover:bg-[#5b0c0c]"><Eye size={15}/>View full details</button>
        <select aria-label="Custom order status" value={order.status} onChange={async(e)=>{await authFetch(`/custom-orders/${order._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:e.target.value})});showToast("Custom order updated");refresh()}} className="w-[118px] rounded-xl border border-[#ddd3c2] px-2 py-2 text-xs font-bold outline-none"><option>Pending</option><option>In Progress</option><option>Completed</option></select>
      </div>
    </div>
  </motion.article>;
}

function UserTable({users,updateRole}) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-[#faf7f1] text-left text-[10px] uppercase tracking-wider text-[#928778]"><tr><th className="px-5 py-3">Customer ID</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Role</th></tr></thead><tbody className="divide-y divide-[#f0ebe2]">{users.map((user)=><tr key={user._id} className="hover:bg-[#fcfaf6]"><td className="px-5 py-4 font-bold text-[#92703d]">{user.customerId||"—"}</td><td className="px-5 py-4 font-bold">{user.username}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4">{user.phone||"—"}</td><td className="px-5 py-4"><select value={user.role||"customer"} onChange={(e)=>updateRole(user._id,e.target.value)} className="rounded-lg border border-[#ddd3c2] px-3 py-2 text-xs font-bold outline-none"><option value="customer">Customer</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table></div>;
}

function ExcelPanel({exportDataType,setExportDataType,exportSheetName,setExportSheetName,workbook,setWorkbook,exportExcel}) {
  return <motion.section initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="mx-auto max-w-2xl rounded-[24px] border border-[#dfd5c4] bg-white p-6 shadow-[0_18px_45px_rgba(71,7,7,.06)] sm:p-8"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-[#d7bc82]"><FileSpreadsheet size={26}/></div><h2 className="mt-5 font-serifFancy text-3xl font-bold">Export business report</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#746a61]">Choose customer or order data, enter the target sheet name, and optionally upload an existing workbook. Existing matching sheets are appended; missing sheets are created automatically.</p>
    <label className="mt-7 block text-[10px] font-bold uppercase tracking-widest text-[#92703d]">Sheet to export</label>
    <select value={exportDataType} onChange={(e)=>{const type=e.target.value; setExportDataType(type); setExportSheetName(type==="customers"?"Customers":type==="orders"?"Orders":"");}} className={`${inputClass} mt-2`}><option value="customers">Customers</option><option value="orders">Orders</option><option value="all">Export All Data</option></select>
    <label className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-[#92703d]">Sheet name</label>
    {exportDataType==="all"
      ? <div className={`${inputClass} mt-2 flex items-center bg-[#f7f4ef] text-[#746a61]`}>Automatic: Customers + Orders</div>
      : <input value={exportSheetName} maxLength={31} onChange={(e)=>setExportSheetName(e.target.value)} placeholder="Customers or Orders" className={`${inputClass} mt-2`}/>}
    <label className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-[#92703d]">Existing workbook <span className="normal-case tracking-normal text-[#aaa08f]">(optional)</span></label><input type="file" accept=".xlsx,.xls" onChange={(e)=>setWorkbook(e.target.files?.[0]||null)} className={`${inputClass} mt-2 file:mr-4 file:rounded-lg file:border-0 file:bg-[#f1eadf] file:px-3 file:py-2 file:text-xs file:font-bold file:text-brand-navy`}/>
    <button onClick={exportExcel} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy py-4 text-sm font-bold text-white shadow-lg shadow-brand-navy/10 transition hover:-translate-y-0.5 hover:bg-[#5b0c0c]"><Download size={17}/>{workbook?"Update selected workbook":"Download new workbook"}</button>
  </motion.section>;
}
