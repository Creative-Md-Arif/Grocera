import mongoose from "mongoose";

const supplierSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, required: true },
    address: { type: String, default: "" },
    balance: { type: Number, default: 0 }, // সাপ্লায়ারকে দেওয়া বা পাওয়া টাকা
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
