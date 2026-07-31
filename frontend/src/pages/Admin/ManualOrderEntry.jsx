import { useAllProductsQuery } from "@redux/api/productApiSlice";
import { useCreateManualOrderMutation } from "@redux/api/orderApiSlice";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaCartPlus, FaSave, FaUser, FaBoxOpen, FaCreditCard, FaSearch } from "react-icons/fa";
import AdminMenu from "./AdminMenu";
import { useState } from "react";

const ManualOrderEntry = () => {
  const { data: products } = useAllProductsQuery();
  const [createManualOrder, { isLoading }] = useCreateManualOrderMutation();

  // Customer & Shipping Info
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [shippingAddress, setShippingAddress] = useState({ address: "", city: "", thana: "" });
  
  // Order Info
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [paymentStatus, setPaymentStatus] = useState("due");
  const [shippingPrice, setShippingPrice] = useState(0);
  
  // Discount Info
  const [discountType, setDiscountType] = useState("amount"); // "amount" or "percentage"
  const [discountValue, setDiscountValue] = useState(0);
  
  const [cartItems, setCartItems] = useState([]);

  // Product Selection & Search State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [selectedVariant, setSelectedVariant] = useState("");
  const [qty, setQty] = useState(1);

  // Reusable Styles matching SeoSettings
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass = "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  // Filtered Products based on Search Query
  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 10); // সর্বোচ্চ ১০টি রেজাল্ট দেখাবে

  const handleProductSelect = (product) => {
    setSelectedProductId(product._id);
    setSearchQuery(product.name); // ইনপুটে প্রোডাক্টের নাম বসে যাবে
    setIsDropdownOpen(false);
    setSelectedVariant(""); // নতুন প্রোডাক্ট সিলেক্ট হলে ভ্যারিয়েন্ট রিসেট
  };

  // Add to Cart Logic
  const handleAddToCart = () => {
    if (!selectedProductId) return toast.error("Please select a product");
    
    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    let variantInfo = { hasVariants: false };
    let itemPrice = product.price;
    let itemName = product.name;

    if (product.hasVariants && selectedVariant) {
      const [colorIndex, sizeIndex] = selectedVariant.split("-").map(Number);
      const variant = product.variants[colorIndex];
      const size = variant.sizes[sizeIndex];
      
      variantInfo = {
        hasVariants: true,
        colorName: variant.color.name,
        sizeName: size.size,
      };
      itemPrice = size.price;
      itemName = `${product.name} (${variant.color.name}/${size.size})`;
    }

    setCartItems([...cartItems, { productId: selectedProductId, name: itemName, qty: Math.max(1, Number(qty)), price: itemPrice, variantInfo }]);
    
    // কার্টে অ্যাড করার পর সার্চ রিসেট করে দেওয়া হলো
    setSelectedProductId("");
    setSearchQuery("");
    setSelectedVariant("");
    setQty(1);
  };

  const handleRemoveItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  // Safe calculation to prevent negative values
  const safeDiscountValue = Math.max(0, Number(discountValue) || 0);
  let calculatedDiscountAmount = 0;
  let calculatedDiscountPercentage = 0;

  if (discountType === "amount") {
    calculatedDiscountAmount = Math.min(safeDiscountValue, itemsPrice); 
    calculatedDiscountPercentage = itemsPrice > 0 ? (calculatedDiscountAmount / itemsPrice) * 100 : 0;
  } else if (discountType === "percentage") {
    const safePercentage = Math.min(safeDiscountValue, 100); 
    calculatedDiscountAmount = (itemsPrice * safePercentage) / 100;
    calculatedDiscountPercentage = safePercentage;
  }

  const safeShippingPrice = Math.max(0, Number(shippingPrice) || 0);
  const totalPrice = Number(itemsPrice) - Number(calculatedDiscountAmount) + Number(safeShippingPrice);

  // Submit Order
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !shippingAddress.address) {
      return toast.error("Customer name, phone, and address are required");
    }
    if (cartItems.length === 0) {
      return toast.error("Please add at least one product");
    }

    try {
      await createManualOrder({
        customer,
        shippingAddress,
        items: cartItems,
        paymentMethod,
        paymentStatus,
        shippingPrice: Number(safeShippingPrice),
        discountAmount: Number(calculatedDiscountAmount.toFixed(2)),
        discountPercentage: Number(calculatedDiscountPercentage.toFixed(2)),
      }).unwrap();

      toast.success("Order created successfully!");
      
      // Reset Form
      setCustomer({ name: "", phone: "", email: "" });
      setShippingAddress({ address: "", city: "", thana: "" });
      setCartItems([]);
      setShippingPrice(0);
      setDiscountValue(0);
      setSearchQuery("");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to create order");
    }
  };

  // Prevent negative inputs on change
  const handleNumberChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === "") return setter("");
    if (Number(value) >= 0) setter(value);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 border-l-4 border-black pl-6 py-2">
            <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-black tracking-tight flex items-center gap-3">
              <FaCartPlus /> Manual Order <span className="text-red-600">/ Entry</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
              Create orders manually for WhatsApp, Messenger, or Phone calls
            </p>
          </header>

          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Customer & Product Selection */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Section 1: Customer Info */}
              <section className="bg-white border border-gray-200 p-6 rounded-sm">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
                  <FaUser size={14} /> Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Customer Name *</label>
                    <input type="text" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number (WhatsApp) *</label>
                    <input type="text" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className={inputClass} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Email Address (Optional)</label>
                    <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Full Address *</label>
                    <input type="text" value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Thana / Upazila</label>
                    <input type="text" value={shippingAddress.thana} onChange={(e) => setShippingAddress({ ...shippingAddress, thana: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>District / City</label>
                    <input type="text" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </section>

              {/* Section 2: Add Product */}
              <section className="bg-white border border-gray-200 p-6 rounded-sm">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
                  <FaBoxOpen size={14} /> Add Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  
                  {/* Product Search Input */}
                  <div className="md:col-span-5 relative">
                    <label className={labelClass}>Search Product</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaSearch size={12} />
                      </span>
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedProductId(""); // টাইপ করলে আগের সিলেকশন বাতিল
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // ক্লিক করার সুযোগ দেওয়ার জন্য ডিলে
                        className={`${inputClass} pl-8`}
                        placeholder="Type name or brand..."
                        autoComplete="off"
                      />
                    </div>
                    
                    {/* Search Dropdown */}
                    {isDropdownOpen && searchQuery && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto rounded-sm">
                        {filteredProducts && filteredProducts.length > 0 ? (
                          filteredProducts.map(p => (
                            <div 
                              key={p._id} 
                              onMouseDown={() => handleProductSelect(p)}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                            >
                              <p className="text-sm font-medium text-gray-800">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.brand || 'No Brand'} - ৳{p.price}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-gray-400">No products found</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4">
                    <label className={labelClass}>Variant</label>
                    <select 
                      value={selectedVariant} 
                      onChange={(e) => setSelectedVariant(e.target.value)} 
                      disabled={!selectedProductId || !products?.find(p => p._id === selectedProductId)?.hasVariants} 
                      className={`${inputClass} disabled:bg-gray-100`}
                    >
                      <option value="">N/A</option>
                      {selectedProductId && products?.find(p => p._id === selectedProductId)?.hasVariants && (
                        products.find(p => p._id === selectedProductId).variants.map((vc, cIdx) =>
                          vc.sizes.map((s, sIdx) => <option key={`${cIdx}-${sIdx}`} value={`${cIdx}-${sIdx}`}>{vc.color.name} / {s.size}</option>)
                        )
                      )}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={labelClass}>Qty</label>
                    <input type="number" min="1" value={qty} onChange={handleNumberChange(setQty)} className={inputClass} />
                  </div>
                  
                  <div className="md:col-span-1">
                    <button type="button" onClick={handleAddToCart} className="w-full h-[42px] bg-black text-white hover:bg-red-600 transition-colors flex items-center justify-center rounded-sm">
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </section>

              {/* Section 3: Cart Items */}
              <section className="bg-white border border-gray-200 p-6 rounded-sm">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
                  Order Items
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Product</th>
                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Price</th>
                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Qty</th>
                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider">Subtotal</th>
                        <th className="p-3 font-bold text-gray-600 uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-3 font-medium text-gray-800">{item.name}</td>
                          <td className="p-3 text-gray-600">৳{item.price.toFixed(2)}</td>
                          <td className="p-3 text-gray-600">{item.qty}</td>
                          <td className="p-3 font-bold text-gray-800">৳{(item.price * item.qty).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 transition-colors">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {cartItems.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center p-8 text-gray-400 uppercase tracking-widest text-xs font-bold">
                            Cart is empty
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Side: Payment & Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 p-6 rounded-sm sticky top-24">
                <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-6 pb-3 border-b border-gray-100 flex items-center gap-2 font-['Playfair_Display']">
                  <FaCreditCard size={14} /> Payment & Summary
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Payment Method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Payment Status</label>
                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={inputClass}>
                      <option value="due">Due</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Shipping Cost (৳)</label>
                    <input type="number" min="0" value={shippingPrice} onChange={handleNumberChange(setShippingPrice)} className={inputClass} />
                  </div>

                  {/* Discount Section */}
                  <div>
                    <label className={labelClass}>Discount</label>
                    <div className="flex gap-2">
                      <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className={`${inputClass} w-1/2`}>
                        <option value="amount">Amount (৳)</option>
                        <option value="percentage">Percent (%)</option>
                      </select>
                      <input 
                        type="number" 
                        min="0" 
                        value={discountValue} 
                        onChange={handleNumberChange(setDiscountValue)} 
                        className={`${inputClass} w-1/2`}
                        placeholder={discountType === "amount" ? "0.00" : "0"}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3 font-['Trebuchet_MS']">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-bold">৳{itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span className="font-bold">৳{safeShippingPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount {discountType === 'percentage' ? `(${calculatedDiscountPercentage.toFixed(2)}%)` : ''}</span>
                      <span className="font-bold">- ৳{calculatedDiscountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-3 font-['Playfair_Display']">
                      <span>Total</span>
                      <span className="text-black">৳{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full px-8 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <FaSave size={14} /> Confirm Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ManualOrderEntry;