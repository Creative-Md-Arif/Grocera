/* eslint-disable react/prop-types */



const PurchaseInvoicePrint = ({ po }) => {
  if (!po) return null;

  return (
    <div className="invoice-print-area">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-area, .invoice-print-area * {
            visibility: visible;
          }
          .invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
        .invoice-container {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto;
          background: white;
          box-sizing: border-box;
          color: black;
          font-family: 'Courier New', Courier, monospace;
        }
      `}</style>

      <div className="invoice-container text-sm">
        <div className="flex justify-between border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase">Purchase Invoice</h1>
            <p className="text-gray-600 mt-1">PO ID: {po.poId}</p>
            {po.invoiceNumber && <p className="text-gray-600">Invoice No: {po.invoiceNumber}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">Grocera</h2>
            <p className="text-gray-600">123 Business Street, Dhaka</p>
            <p className="text-gray-600">support@grocera.com</p>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h3 className="font-bold uppercase mb-1 border-b border-gray-400 inline-block">Supplier</h3>
            <p className="font-bold">{po.supplier?.name}</p>
            <p>{po.supplier?.companyName}</p>
            <p>{po.supplier?.phone}</p>
            <p>{po.supplier?.address}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold uppercase mb-1 border-b border-gray-400 inline-block">Details</h3>
            <p><strong>Date:</strong> {new Date(po.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {po.status}</p>
            <p><strong>Payment:</strong> {po.paymentStatus}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-black mb-8">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left">Product Name</th>
              <th className="border border-black p-2 text-center">Variant</th>
              <th className="border border-black p-2 text-center">Qty</th>
              <th className="border border-black p-2 text-right">Unit Cost</th>
              <th className="border border-black p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {po.orderItems.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2">{item.name}</td>
                <td className="border border-black p-2 text-center">
                  {item.variantInfo?.hasVariants ? `${item.variantInfo.colorName} / ${item.variantInfo.sizeName}` : 'N/A'}
                </td>
                <td className="border border-black p-2 text-center">{item.qty}</td>
                <td className="border border-black p-2 text-right">৳{item.unitCost.toFixed(2)}</td>
                <td className="border border-black p-2 text-right">৳{(item.unitCost * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/3">
            <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2">
              <span>Total Cost:</span>
              <span>৳{po.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Paid Amount:</span>
              <span>৳{po.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-red-600 mt-1">
              <span>Due:</span>
              <span>৳{(po.totalCost - po.paidAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
          This is a computer generated invoice. No signature required.
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoicePrint;