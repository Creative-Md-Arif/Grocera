import asyncHandler from "../middlewares/asyncHandler.js";
import Supplier from "../models/supplierModel.js";

const createSupplier = asyncHandler(async (req, res) => {
  const { name, companyName, email, phone, address } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and Phone are required" });
  }
  const supplier = await Supplier.create({
    name,
    companyName,
    email,
    phone,
    address,
  });
  res.status(201).json(supplier);
});

const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
  res.json(suppliers);
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ error: "Supplier not found" });

  supplier.name = req.body.name || supplier.name;
  supplier.companyName = req.body.companyName || supplier.companyName;
  supplier.email = req.body.email || supplier.email;
  supplier.phone = req.body.phone || supplier.phone;
  supplier.address = req.body.address || supplier.address;
  supplier.isActive =
    req.body.isActive !== undefined ? req.body.isActive : supplier.isActive;

  const updatedSupplier = await supplier.save();
  res.json(updatedSupplier);
});

export { createSupplier, getSuppliers, updateSupplier };
