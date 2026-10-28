import { repairErpData } from "./db/repair";
import type {
  Buyer,
  Order,
  TaTask,
  Sample,
  Costing,
  Procurement,
  InventoryItem,
  StockLedgerEntry,
  CuttingJob,
  SewingLine,
  FinishingJob,
  PackingJob,
  QcRecord,
  Defect,
  Shipment,
  BuyerLedgerEntry,
  SupplierLedgerEntry,
  Expense,
  Payment,
  Pnl,
  Settings,
  Role,
  Employee,
  AttendanceLog,
  PayrollRecord,
  ErpData,
} from "./types";

/**
 * Dawat RMG SOFT — seed dataset.
 *
 * Models a realistic export-oriented knitwear/woven factory (Dawat
 * Garments Ltd., Ashulia, Savar, Dhaka) running 12 live buyer orders across
 * H&M, Zara, Primark, C&A, Tesco, Next, M&S and Decathlon, from order
 * confirmation through T&A, costing, procurement, production, QC and
 * shipment to accounts / P&L. All quantities, costs and ledger figures are
 * internally consistent (order value = qty × price, trims = $0.35/pc,
 * CM = $1.10/pc, P&L cost ratios 35% fabric / 28% CM / 23% margin, etc.).
 */

/* ------------------------------------------------------------------ */
/* Buyers                                                              */
/* ------------------------------------------------------------------ */

export const buyers: Buyer[] = [
  {
    id: "buyer-hm",
    name: "H&M",
    contactPerson: "Anna Karlsson",
    company: "H&M Hennes & Mauritz GBC AB",
    country: "Sweden",
    phone: "+46 8 796 55 00",
    email: "anna.karlsson@hm.com",
    address: "Mäster Samuelsgatan 46A, 106 38 Stockholm, Sweden",
    status: "Active",
    totalOrders: 2,
    totalAmount: 332400,
    paidAmount: 169524,
    dueAmount: 113016,
    createdAt: "2026-01-12T00:00:00.000Z",
  },
  {
    id: "buyer-zara",
    name: "Zara",
    contactPerson: "Carlos Ruiz",
    company: "Industria de Diseño Textil, S.A. (Inditex)",
    country: "Spain",
    phone: "+34 981 18 53 00",
    email: "carlos.ruiz@inditex.com",
    address: "Avenida de la Diputación, 15142 Arteixo, A Coruña, Spain",
    status: "Active",
    totalOrders: 2,
    totalAmount: 304800,
    paidAmount: 207264,
    dueAmount: 51816,
    createdAt: "2026-01-18T00:00:00.000Z",
  },
  {
    id: "buyer-primark",
    name: "Primark",
    contactPerson: "James O'Brien",
    company: "Primark Stores Limited",
    country: "Ireland",
    phone: "+353 1 466 0000",
    email: "james.obrien@primark.co.uk",
    address: "Mary Street, Dublin 1, D01 R2K9, Ireland",
    status: "Active",
    totalOrders: 2,
    totalAmount: 223200,
    paidAmount: 189720,
    dueAmount: 0,
    createdAt: "2026-01-22T00:00:00.000Z",
  },
  {
    id: "buyer-ca",
    name: "C&A",
    contactPerson: "Sophie Müller",
    company: "C&A Mode GmbH & Co. KG",
    country: "Germany",
    phone: "+49 211 9822 0",
    email: "sophie.muller@canda.com",
    address: "Hindenburgstraße 26, 40213 Düsseldorf, Germany",
    status: "Active",
    totalOrders: 1,
    totalAmount: 225000,
    paidAmount: 114750,
    dueAmount: 76500,
    createdAt: "2026-02-02T00:00:00.000Z",
  },
  {
    id: "buyer-tesco",
    name: "Tesco",
    contactPerson: "David Clarke",
    company: "Tesco Stores Limited",
    country: "United Kingdom",
    phone: "+44 1992 632 222",
    email: "david.clarke@tesco.com",
    address: "Tesco House, Shire Park, Kestrel Way, Welwyn Garden City AL7 1GA, UK",
    status: "Active",
    totalOrders: 2,
    totalAmount: 375000,
    paidAmount: 318750,
    dueAmount: 0,
    createdAt: "2026-02-05T00:00:00.000Z",
  },
  {
    id: "buyer-next",
    name: "Next",
    contactPerson: "Emma Wilson",
    company: "Next Sourcing Limited",
    country: "United Kingdom",
    phone: "+44 116 284 2000",
    email: "emma.wilson@next.co.uk",
    address: "Desford Road, Enderby, Leicester LE19 4AT, UK",
    status: "Active",
    totalOrders: 1,
    totalAmount: 138600,
    paidAmount: 94248,
    dueAmount: 23562,
    createdAt: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "buyer-ms",
    name: "M&S",
    contactPerson: "Richard Green",
    company: "Marks and Spencer plc",
    country: "United Kingdom",
    phone: "+44 20 7935 4422",
    email: "richard.green@marks-and-spencer.com",
    address: "Waterside House, 35 North Wharf Road, London W2 1NW, UK",
    status: "Active",
    totalOrders: 1,
    totalAmount: 147000,
    paidAmount: 74970,
    dueAmount: 49980,
    createdAt: "2026-02-14T00:00:00.000Z",
  },
  {
    id: "buyer-decathlon",
    name: "Decathlon",
    contactPerson: "Pierre Dubois",
    company: "Decathlon SE",
    country: "France",
    phone: "+33 3 20 33 12 12",
    email: "pierre.dubois@decathlon.com",
    address: "4 Boulevard de Mons, 59665 Villeneuve-d'Ascq, France",
    status: "Active",
    totalOrders: 1,
    totalAmount: 158000,
    paidAmount: 107440,
    dueAmount: 26860,
    createdAt: "2026-02-19T00:00:00.000Z",
  },
];

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export const orders: Order[] = [
  {
    id: "order-1",
    poNumber: "HM-2026-0142",
    style: "STY-2026001",
    buyerId: "buyer-hm",
    buyerName: "H&M",
    productName: "Men's Basic T-Shirt",
    colorway: "Navy / White",
    quantity: 48000,
    unitPrice: 3.85,
    orderValue: 184800,
    orderDate: "2026-07-07",
    shipDate: "2026-08-10",
    stage: "Sewing",
    progressPercent: 62,
    taStatus: "At Risk",
    paymentStatus: "partial",
    notes: "H&M — flagship basics program, second consecutive season.",
    createdAt: "2026-07-07T00:00:00.000Z",
  },
  {
    id: "order-2",
    poNumber: "ZARA-88421",
    style: "STY-2026002",
    buyerId: "buyer-zara",
    buyerName: "Zara",
    productName: "Ladies Leggings",
    colorway: "Black",
    quantity: 32000,
    unitPrice: 4.2,
    orderValue: 134400,
    orderDate: "2026-07-07",
    shipDate: "2026-08-17",
    stage: "Cutting",
    progressPercent: 28,
    taStatus: "On Track",
    paymentStatus: "paid",
    notes: "Zara — fast-fashion replenishment order.",
    createdAt: "2026-07-07T00:00:00.000Z",
  },
  {
    id: "order-3",
    poNumber: "PRM-55201",
    style: "STY-2026003",
    buyerId: "buyer-primark",
    buyerName: "Primark",
    productName: "Kids Hoodie",
    colorway: "Heather Grey",
    quantity: 24000,
    unitPrice: 5.1,
    orderValue: 122400,
    orderDate: "2026-07-08",
    shipDate: "2026-08-24",
    stage: "Finishing",
    progressPercent: 78,
    taStatus: "On Track",
    paymentStatus: "paid",
    notes: "Primark — kidswear back-to-school program.",
    createdAt: "2026-07-08T00:00:00.000Z",
  },
  {
    id: "order-4",
    poNumber: "CA-77102",
    style: "STY-2026004",
    buyerId: "buyer-ca",
    buyerName: "C&A",
    productName: "Denim Jacket",
    colorway: "Indigo Wash",
    quantity: 18000,
    unitPrice: 12.5,
    orderValue: 225000,
    orderDate: "2026-07-09",
    shipDate: "2026-08-31",
    stage: "Merchandising",
    progressPercent: 12,
    taStatus: "Delayed",
    paymentStatus: "partial",
    notes: "C&A — premium denim, tech pack revisions pending sign-off.",
    createdAt: "2026-07-09T00:00:00.000Z",
  },
  {
    id: "order-5",
    poNumber: "TSC-33018",
    style: "STY-2026005",
    buyerId: "buyer-tesco",
    buyerName: "Tesco",
    productName: "Polo Shirt",
    colorway: "Royal Blue",
    quantity: 56000,
    unitPrice: 4.75,
    orderValue: 266000,
    orderDate: "2026-07-08",
    shipDate: "2026-09-07",
    stage: "Packing",
    progressPercent: 91,
    taStatus: "On Track",
    paymentStatus: "paid",
    notes: "Tesco — F&F polo shirt export order.",
    createdAt: "2026-07-08T00:00:00.000Z",
  },
  {
    id: "order-6",
    poNumber: "NXT-11904",
    style: "STY-2026006",
    buyerId: "buyer-next",
    buyerName: "Next",
    productName: "Woven Shirt",
    colorway: "Blue Stripe",
    quantity: 22000,
    unitPrice: 6.3,
    orderValue: 138600,
    orderDate: "2026-07-10",
    shipDate: "2026-09-14",
    stage: "Shipment",
    progressPercent: 95,
    taStatus: "On Track",
    paymentStatus: "partial",
    notes: "Next — woven shirt export order, AIR shipment via DHL.",
    createdAt: "2026-07-10T00:00:00.000Z",
  },
  {
    id: "order-7",
    poNumber: "MS-44021",
    style: "STY-2026007",
    buyerId: "buyer-ms",
    buyerName: "M&S",
    productName: "Cargo Pant",
    colorway: "Khaki",
    quantity: 15000,
    unitPrice: 9.8,
    orderValue: 147000,
    orderDate: "2026-07-12",
    shipDate: "2026-09-28",
    stage: "Merchandising",
    progressPercent: 8,
    taStatus: "At Risk",
    paymentStatus: "partial",
    notes: "M&S — cargo pant export order, fit sample pending.",
    createdAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "order-8",
    poNumber: "DEC-22015",
    style: "STY-2026008",
    buyerId: "buyer-decathlon",
    buyerName: "Decathlon",
    productName: "Men's Basic T-Shirt",
    colorway: "Graphite",
    quantity: 40000,
    unitPrice: 3.95,
    orderValue: 158000,
    orderDate: "2026-07-11",
    shipDate: "2026-09-21",
    stage: "Sewing",
    progressPercent: 50,
    taStatus: "On Track",
    paymentStatus: "partial",
    notes: "Decathlon — men's basic t-shirt export order.",
    createdAt: "2026-07-11T00:00:00.000Z",
  },
  {
    id: "order-9",
    poNumber: "HM-2026-0188",
    style: "STY-2026009",
    buyerId: "buyer-hm",
    buyerName: "H&M",
    productName: "Polo Shirt",
    colorway: "White",
    quantity: 36000,
    unitPrice: 4.1,
    orderValue: 147600,
    orderDate: "2026-07-14",
    shipDate: "2026-10-05",
    stage: "Shipment",
    progressPercent: 88,
    taStatus: "On Track",
    paymentStatus: "partial",
    notes: "H&M — polo shirt export order, shipment documents in prep.",
    createdAt: "2026-07-14T00:00:00.000Z",
  },
  {
    id: "order-10",
    poNumber: "ZARA-88502",
    style: "STY-2026010",
    buyerId: "buyer-zara",
    buyerName: "Zara",
    productName: "Ladies Polo Shirt",
    colorway: "Dark Wash",
    quantity: 12000,
    unitPrice: 14.2,
    orderValue: 170400,
    orderDate: "2026-07-15",
    shipDate: "2026-10-19",
    stage: "Cutting",
    progressPercent: 25,
    taStatus: "On Track",
    paymentStatus: "partial",
    notes: "Zara — premium pique polo, small volume / high value order.",
    createdAt: "2026-07-15T00:00:00.000Z",
  },
  {
    id: "order-11",
    poNumber: "PRM-55310",
    style: "STY-2026011",
    buyerId: "buyer-primark",
    buyerName: "Primark",
    productName: "Kids T-Shirt",
    colorway: "White / Grey",
    quantity: 28000,
    unitPrice: 3.6,
    orderValue: 100800,
    orderDate: "2026-07-16",
    shipDate: "2026-10-08",
    stage: "Sewing",
    progressPercent: 55,
    taStatus: "On Track",
    paymentStatus: "paid",
    notes: "Primark — kids basics replenishment order.",
    createdAt: "2026-07-16T00:00:00.000Z",
  },
  {
    id: "order-12",
    poNumber: "TSC-33102",
    style: "STY-2026012",
    buyerId: "buyer-tesco",
    buyerName: "Tesco",
    productName: "Hooded Sweatshirt",
    colorway: "Grey Melange",
    quantity: 20000,
    unitPrice: 5.45,
    orderValue: 109000,
    orderDate: "2026-07-18",
    shipDate: "2026-10-26",
    stage: "Sewing",
    progressPercent: 60,
    taStatus: "On Track",
    paymentStatus: "paid",
    notes: "Tesco — fleece hooded sweatshirt, second order this season.",
    createdAt: "2026-07-18T00:00:00.000Z",
  },
];

/* ------------------------------------------------------------------ */
/* T&A Tasks                                                           */
/* ------------------------------------------------------------------ */

export const taTasks: TaTask[] = [
  // H&M — HM-2026-0142 / STY-2026001 — full 12-step template (order confirmed 07-07)
  { id: "ta-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-07", actualDate: "2026-07-09", status: "Completed", riskLevel: "On Time" },
  { id: "ta-2", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Tech Pack Review", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-08", actualDate: "2026-07-10", status: "Completed", riskLevel: "On Time" },
  { id: "ta-3", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Fabric Booking", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-09", actualDate: "2026-07-11", status: "Completed", riskLevel: "On Time" },
  { id: "ta-4", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Trims Booking", department: "QC", owner: "Imran Ahmed", plannedDate: "2026-07-10", actualDate: "2026-07-12", status: "Completed", riskLevel: "On Time" },
  { id: "ta-5", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Lab Dip Approval", department: "Commercial", owner: "Farhana Akter", plannedDate: "2026-07-11", actualDate: "2026-07-13", status: "Completed", riskLevel: "On Time" },
  { id: "ta-6", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Strike-off Approval", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-12", actualDate: null, status: "In Progress", riskLevel: "Medium Risk" },
  { id: "ta-7", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Fit Sample Approval", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-13", actualDate: null, status: "Pending", riskLevel: "Low Risk" },
  { id: "ta-8", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "PP Sample Approval", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-14", actualDate: null, status: "Delayed", riskLevel: "High Risk", delayDays: 10 },
  { id: "ta-9", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Fabric In-house", department: "QC", owner: "Imran Ahmed", plannedDate: "2026-07-15", actualDate: null, status: "Pending", riskLevel: "Low Risk" },
  { id: "ta-10", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Trims In-house", department: "Commercial", owner: "Farhana Akter", plannedDate: "2026-07-16", actualDate: null, status: "Pending", riskLevel: "Low Risk" },
  { id: "ta-11", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Fabric Relaxation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-17", actualDate: null, status: "Pending", riskLevel: "Low Risk" },
  { id: "ta-12", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Cutting Start", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-18", actualDate: "2026-07-22", status: "Completed", riskLevel: "On Time" },
  { id: "ta-13", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Sewing Line Load-in", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-24", actualDate: "2026-07-26", status: "Completed", riskLevel: "On Time" },
  { id: "ta-14", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", taskName: "Inline QC Inspection", department: "QC", owner: "Sabina Yasmin", plannedDate: "2026-07-27", actualDate: "2026-07-27", status: "Completed", riskLevel: "On Time" },

  // Zara — ZARA-88421 / STY-2026002
  { id: "ta-15", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-07", actualDate: "2026-07-09", status: "Completed", riskLevel: "On Time" },
  { id: "ta-16", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "Tech Pack Review", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-08", actualDate: "2026-07-10", status: "Completed", riskLevel: "On Time" },
  { id: "ta-17", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "Fabric Booking", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-09", actualDate: "2026-07-11", status: "Completed", riskLevel: "On Time" },
  { id: "ta-18", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "Trims Booking", department: "QC", owner: "Imran Ahmed", plannedDate: "2026-07-10", actualDate: "2026-07-12", status: "Completed", riskLevel: "On Time" },
  { id: "ta-19", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "Lab Dip Approval", department: "Commercial", owner: "Farhana Akter", plannedDate: "2026-07-11", actualDate: "2026-07-13", status: "Completed", riskLevel: "On Time" },
  { id: "ta-20", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "Strike-off Approval", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-12", actualDate: "2026-07-14", status: "Completed", riskLevel: "On Time" },
  { id: "ta-21", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "Fit Sample Approval", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-13", actualDate: null, status: "In Progress", riskLevel: "Medium Risk" },
  { id: "ta-22", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "PP Sample Approval", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-14", actualDate: null, status: "Delayed", riskLevel: "High Risk", delayDays: 10 },
  { id: "ta-23", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", taskName: "Cutting Start", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-20", actualDate: "2026-07-23", status: "Completed", riskLevel: "On Time" },

  // Primark — PRM-55201 / STY-2026003 (on track, finishing 78%)
  { id: "ta-24", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-08", actualDate: "2026-07-09", status: "Completed", riskLevel: "On Time" },
  { id: "ta-25", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", taskName: "PP Sample Approval", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-15", actualDate: "2026-07-16", status: "Completed", riskLevel: "On Time" },
  { id: "ta-26", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", taskName: "Cutting Start", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-21", actualDate: "2026-07-24", status: "Completed", riskLevel: "On Time" },
  { id: "ta-27", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", taskName: "Finishing & Iron", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-27", actualDate: "2026-07-27", status: "Completed", riskLevel: "On Time" },
  { id: "ta-28", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", taskName: "Final Inspection", department: "QC", owner: "Priya Saha", plannedDate: "2026-07-29", actualDate: null, status: "Pending", riskLevel: "Low Risk" },

  // C&A — CA-77102 / STY-2026004 — Delayed order, several critical/delayed tasks
  { id: "ta-29", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-09", actualDate: "2026-07-15", status: "Completed", riskLevel: "Medium Risk", delayDays: 6 },
  { id: "ta-30", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", taskName: "Tech Pack Review", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-10", actualDate: null, status: "Delayed", riskLevel: "Critical", delayDays: 14 },
  { id: "ta-31", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", taskName: "Fabric Booking", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-12", actualDate: null, status: "Delayed", riskLevel: "Critical", delayDays: 12 },
  { id: "ta-32", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", taskName: "Lab Dip Approval", department: "Commercial", owner: "Farhana Akter", plannedDate: "2026-07-14", actualDate: null, status: "Pending", riskLevel: "High Risk" },

  // Tesco — TSC-33018 / STY-2026005 (packing 91%)
  { id: "ta-33", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-08", actualDate: "2026-07-09", status: "Completed", riskLevel: "On Time" },
  { id: "ta-34", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", taskName: "Cutting Start", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-19", actualDate: "2026-07-22", status: "Completed", riskLevel: "On Time" },
  { id: "ta-35", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", taskName: "Endline QC", department: "QC", owner: "Mahmud Hasan", plannedDate: "2026-07-26", actualDate: "2026-07-27", status: "Completed", riskLevel: "On Time" },
  { id: "ta-36", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", taskName: "Packing & Carton", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-27", actualDate: "2026-07-27", status: "In Progress", riskLevel: "Low Risk" },
  { id: "ta-37", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", taskName: "Shipment Booking", department: "Commercial", owner: "Farhana Akter", plannedDate: "2026-09-01", actualDate: null, status: "Pending", riskLevel: "Low Risk" },

  // Next — NXT-11904 / STY-2026006 (near shipment)
  { id: "ta-38", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-10", actualDate: "2026-07-11", status: "Completed", riskLevel: "On Time" },
  { id: "ta-39", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", taskName: "PP Sample Approval", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-18", actualDate: null, status: "Pending", riskLevel: "Medium Risk" },
  { id: "ta-40", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", taskName: "Shipment Booking", department: "Commercial", owner: "Farhana Akter", plannedDate: "2026-09-08", actualDate: "2026-09-08", status: "Completed", riskLevel: "On Time" },
  { id: "ta-41", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", taskName: "Export Documentation", department: "Commercial", owner: "Farhana Akter", plannedDate: "2026-09-12", actualDate: null, status: "In Progress", riskLevel: "Low Risk" },

  // M&S — MS-44021 / STY-2026007 — At Risk, still in sampling
  { id: "ta-42", orderId: "order-7", poNumber: "MS-44021", buyerName: "M&S", style: "STY-2026007", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-12", actualDate: "2026-07-14", status: "Completed", riskLevel: "On Time" },
  { id: "ta-43", orderId: "order-7", poNumber: "MS-44021", buyerName: "M&S", style: "STY-2026007", taskName: "Fit Sample Approval", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-20", actualDate: null, status: "Delayed", riskLevel: "High Risk", delayDays: 7 },
  { id: "ta-44", orderId: "order-7", poNumber: "MS-44021", buyerName: "M&S", style: "STY-2026007", taskName: "PP Sample Approval", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-27", actualDate: null, status: "Pending", riskLevel: "High Risk" },

  // Decathlon — DEC-22015 / STY-2026008 (sewing 50%)
  { id: "ta-45", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-11", actualDate: "2026-07-12", status: "Completed", riskLevel: "On Time" },
  { id: "ta-46", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", taskName: "Cutting Start", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-21", actualDate: "2026-07-24", status: "Completed", riskLevel: "On Time" },
  { id: "ta-47", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", taskName: "Sewing Line Load-in", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-25", actualDate: "2026-07-27", status: "Completed", riskLevel: "On Time" },
  { id: "ta-48", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", taskName: "Inline QC Inspection", department: "QC", owner: "Sabina Yasmin", plannedDate: "2026-08-02", actualDate: null, status: "Pending", riskLevel: "Low Risk" },

  // H&M — HM-2026-0188 / STY-2026009 (shipment prepared)
  { id: "ta-49", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-14", actualDate: "2026-07-15", status: "Completed", riskLevel: "On Time" },
  { id: "ta-50", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", taskName: "Final Inspection", department: "QC", owner: "Priya Saha", plannedDate: "2026-07-26", actualDate: "2026-07-27", status: "Completed", riskLevel: "On Time" },
  { id: "ta-51", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", taskName: "Export Documentation", department: "Commercial", owner: "Farhana Akter", plannedDate: "2026-09-28", actualDate: null, status: "In Progress", riskLevel: "Medium Risk" },

  // Zara — ZARA-88502 / STY-2026010
  { id: "ta-52", orderId: "order-10", poNumber: "ZARA-88502", buyerName: "Zara", style: "STY-2026010", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-15", actualDate: "2026-07-16", status: "Completed", riskLevel: "On Time" },
  { id: "ta-53", orderId: "order-10", poNumber: "ZARA-88502", buyerName: "Zara", style: "STY-2026010", taskName: "Fabric Booking", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-22", actualDate: "2026-07-23", status: "Completed", riskLevel: "On Time" },
  { id: "ta-54", orderId: "order-10", poNumber: "ZARA-88502", buyerName: "Zara", style: "STY-2026010", taskName: "Cutting Start", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-28", actualDate: null, status: "Pending", riskLevel: "Low Risk" },

  // Primark — PRM-55310 / STY-2026011 (sewing 55%)
  { id: "ta-55", orderId: "order-11", poNumber: "PRM-55310", buyerName: "Primark", style: "STY-2026011", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-16", actualDate: "2026-07-17", status: "Completed", riskLevel: "On Time" },
  { id: "ta-56", orderId: "order-11", poNumber: "PRM-55310", buyerName: "Primark", style: "STY-2026011", taskName: "Cutting Start", department: "Procurement", owner: "Karim Hossain", plannedDate: "2026-07-21", actualDate: "2026-07-23", status: "Completed", riskLevel: "On Time" },
  { id: "ta-57", orderId: "order-11", poNumber: "PRM-55310", buyerName: "Primark", style: "STY-2026011", taskName: "Sewing Line Load-in", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-26", actualDate: "2026-07-27", status: "Completed", riskLevel: "On Time" },

  // Tesco — TSC-33102 / STY-2026012 (sewing 60%)
  { id: "ta-58", orderId: "order-12", poNumber: "TSC-33102", buyerName: "Tesco", style: "STY-2026012", taskName: "Order Confirmation", department: "Merchandising", owner: "Rashida Begum", plannedDate: "2026-07-18", actualDate: "2026-07-19", status: "Completed", riskLevel: "On Time" },
  { id: "ta-59", orderId: "order-12", poNumber: "TSC-33102", buyerName: "Tesco", style: "STY-2026012", taskName: "Sewing Line Load-in", department: "Production", owner: "Nusrat Jahan", plannedDate: "2026-07-26", actualDate: "2026-07-27", status: "Completed", riskLevel: "On Time" },
  { id: "ta-60", orderId: "order-12", poNumber: "TSC-33102", buyerName: "Tesco", style: "STY-2026012", taskName: "Inline QC Inspection", department: "QC", owner: "Sabina Yasmin", plannedDate: "2026-08-01", actualDate: null, status: "Pending", riskLevel: "Low Risk" },
];

/* ------------------------------------------------------------------ */
/* Samples / Merchandising                                            */
/* ------------------------------------------------------------------ */

export const samples: Sample[] = [
  { id: "sample-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", fitSampleStatus: "Approved", ppSampleStatus: "Approved", productionApprovalStatus: "Approved", riskLevel: "Medium Risk", notes: "H&M — Men's Basic T-Shirt export order" },
  { id: "sample-2", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", fitSampleStatus: "Approved", ppSampleStatus: "Approved", productionApprovalStatus: "Approved", riskLevel: "Low Risk", notes: "Zara — Ladies Leggings export order" },
  { id: "sample-3", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", fitSampleStatus: "Approved", ppSampleStatus: "Approved", productionApprovalStatus: "Approved", riskLevel: "Low Risk", notes: "Primark — Kids Hoodie export order" },
  { id: "sample-4", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", fitSampleStatus: "Pending", ppSampleStatus: "Pending", productionApprovalStatus: "Pending", riskLevel: "High Risk", notes: "C&A — Denim Jacket export order" },
  { id: "sample-5", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", fitSampleStatus: "Approved", ppSampleStatus: "Pending", productionApprovalStatus: "Pending", riskLevel: "Low Risk", notes: "Tesco — Polo Shirt export order" },
  { id: "sample-6", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", fitSampleStatus: "Approved", ppSampleStatus: "Pending", productionApprovalStatus: "Pending", riskLevel: "Low Risk", notes: "Next — Woven Shirt export order" },
  { id: "sample-7", orderId: "order-7", poNumber: "MS-44021", buyerName: "M&S", style: "STY-2026007", fitSampleStatus: "Pending", ppSampleStatus: "Pending", productionApprovalStatus: "Pending", riskLevel: "High Risk", notes: "M&S — Cargo Pant export order" },
  { id: "sample-8", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", fitSampleStatus: "Pending", ppSampleStatus: "Pending", productionApprovalStatus: "Pending", riskLevel: "Medium Risk", notes: "Decathlon — Men's Basic T-Shirt export order" },
  { id: "sample-9", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", fitSampleStatus: "Pending", ppSampleStatus: "Pending", productionApprovalStatus: "Pending", riskLevel: "Medium Risk", notes: "H&M — Polo Shirt export order" },
  { id: "sample-10", orderId: "order-10", poNumber: "ZARA-88502", buyerName: "Zara", style: "STY-2026010", fitSampleStatus: "Pending", ppSampleStatus: "Pending", productionApprovalStatus: "Pending", riskLevel: "Low Risk", notes: "Zara — Ladies Polo Shirt export order" },
  { id: "sample-11", orderId: "order-11", poNumber: "PRM-55310", buyerName: "Primark", style: "STY-2026011", fitSampleStatus: "Approved", ppSampleStatus: "Approved", productionApprovalStatus: "Approved", riskLevel: "Low Risk", notes: "Primark — Kids T-Shirt export order" },
  { id: "sample-12", orderId: "order-12", poNumber: "TSC-33102", buyerName: "Tesco", style: "STY-2026012", fitSampleStatus: "Approved", ppSampleStatus: "Pending", productionApprovalStatus: "Pending", riskLevel: "Low Risk", notes: "Tesco — Hooded Sweatshirt export order" },
];

/* ------------------------------------------------------------------ */
/* Costing & Consumption                                              */
/* ------------------------------------------------------------------ */

export const costings: Costing[] = [
  { id: "cost-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", fabricType: "Single Jersey 160 GSM", fabricGsm: 120, fabricConsumptionYdPc: 1.2, trimsCost: 16800, cmCost: 52800, totalCost: 163620, pricePerPc: 3.85, marginPercent: 11.5 },
  { id: "cost-2", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", fabricType: "Fleece 280 GSM", fabricGsm: 160, fabricConsumptionYdPc: 1.35, trimsCost: 11200, cmCost: 35200, totalCost: 93200, pricePerPc: 4.2, marginPercent: 30.7 },
  { id: "cost-3", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", fabricType: "Denim 12oz", fabricGsm: 200, fabricConsumptionYdPc: 1.5, trimsCost: 8400, cmCost: 26400, totalCost: 80580, pricePerPc: 5.1, marginPercent: 34.2 },
  { id: "cost-4", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", fabricType: "Poplin 120 GSM", fabricGsm: 240, fabricConsumptionYdPc: 1.2, trimsCost: 6300, cmCost: 19800, totalCost: 64575, pricePerPc: 12.5, marginPercent: 71.3 },
  { id: "cost-5", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", fabricType: "Pique 200 GSM", fabricGsm: 280, fabricConsumptionYdPc: 1.35, trimsCost: 19600, cmCost: 61600, totalCost: 191730, pricePerPc: 4.75, marginPercent: 27.9 },
  { id: "cost-6", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", fabricType: "Single Jersey 160 GSM", fabricGsm: 120, fabricConsumptionYdPc: 1.5, trimsCost: 7700, cmCost: 24200, totalCost: 70345, pricePerPc: 6.3, marginPercent: 49.2 },
  { id: "cost-7", orderId: "order-7", poNumber: "MS-44021", buyerName: "M&S", style: "STY-2026007", fabricType: "Fleece 280 GSM", fabricGsm: 160, fabricConsumptionYdPc: 1.2, trimsCost: 5250, cmCost: 16500, totalCost: 54525, pricePerPc: 9.8, marginPercent: 62.9 },
  { id: "cost-8", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", fabricType: "Denim 12oz", fabricGsm: 200, fabricConsumptionYdPc: 1.35, trimsCost: 14000, cmCost: 44000, totalCost: 115750, pricePerPc: 3.95, marginPercent: 26.7 },
  { id: "cost-9", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", fabricType: "Poplin 120 GSM", fabricGsm: 240, fabricConsumptionYdPc: 1.5, trimsCost: 12600, cmCost: 39600, totalCost: 126090, pricePerPc: 4.1, marginPercent: 14.6 },
  { id: "cost-10", orderId: "order-10", poNumber: "ZARA-88502", buyerName: "Zara", style: "STY-2026010", fabricType: "Pique 200 GSM", fabricGsm: 280, fabricConsumptionYdPc: 1.2, trimsCost: 4200, cmCost: 13200, totalCost: 44580, pricePerPc: 14.2, marginPercent: 73.8 },
  { id: "cost-11", orderId: "order-11", poNumber: "PRM-55310", buyerName: "Primark", style: "STY-2026011", fabricType: "Single Jersey 160 GSM", fabricGsm: 120, fabricConsumptionYdPc: 1.35, trimsCost: 9800, cmCost: 30800, totalCost: 87290, pricePerPc: 3.6, marginPercent: 13.4 },
  { id: "cost-12", orderId: "order-12", poNumber: "TSC-33102", buyerName: "Tesco", style: "STY-2026012", fabricType: "Fleece 280 GSM", fabricGsm: 160, fabricConsumptionYdPc: 1.5, trimsCost: 7000, cmCost: 22000, totalCost: 62675, pricePerPc: 5.45, marginPercent: 42.5 },
];

/* ------------------------------------------------------------------ */
/* Procurement (6 fabric + 9 trims = 15 records, 3 delayed)           */
/* ------------------------------------------------------------------ */

export const procurements: Procurement[] = [
  // Fabric bookings
  { id: "proc-f1", type: "fabric", supplier: "DBL Textiles", item: "Single Jersey Fabric", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", required: 62400, received: 62400, balance: 0, expectedDate: "2026-08-01", receivedDate: "2026-07-27", status: "in house" },
  { id: "proc-f2", type: "fabric", supplier: "Envoy Textiles", item: "Rib 1x1 Fabric", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", required: 62400, received: 62400, balance: 0, expectedDate: "2026-08-02", receivedDate: "2026-07-26", status: "partial received" },
  { id: "proc-f3", type: "fabric", supplier: "DBL Textiles", item: "Single Jersey Fabric", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", required: 41600, received: 24960, balance: 16640, expectedDate: "2026-08-01", receivedDate: "2026-07-27", status: "partial received" },
  { id: "proc-f4", type: "fabric", supplier: "Envoy Textiles", item: "Rib 1x1 Fabric", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", required: 41600, received: 24960, balance: 16640, expectedDate: "2026-08-02", receivedDate: "2026-07-26", status: "ordered" },
  { id: "proc-f5", type: "fabric", supplier: "DBL Textiles", item: "Single Jersey Fabric", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", required: 31200, received: 18720, balance: 12480, expectedDate: "2026-08-01", receivedDate: "2026-07-27", status: "ordered" },
  { id: "proc-f6", type: "fabric", supplier: "Envoy Textiles", item: "Rib 1x1 Fabric", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", required: 31200, received: 18720, balance: 12480, expectedDate: "2026-08-02", receivedDate: "2026-07-26", status: "booked" },

  // Trims bookings
  { id: "proc-t1", type: "trims", supplier: "Mondol Trims", item: "Woven Main Label", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", required: 2400, received: 1920, balance: 0, expectedDate: "2026-08-03", receivedDate: "2026-07-25", status: "ordered" },
  { id: "proc-t2", type: "trims", supplier: "Pacific Accessories", item: "Polyester Thread", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", required: 2400, received: 1920, balance: 0, expectedDate: "2026-08-04", receivedDate: "2026-07-24", status: "booked" },
  { id: "proc-t3", type: "trims", supplier: "YKK Bangladesh", item: "YKK Zipper #5", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", required: 2400, received: 1920, balance: 0, expectedDate: "2026-08-05", receivedDate: "2026-07-23", status: "delayed" },
  { id: "proc-t4", type: "trims", supplier: "Mondol Trims", item: "Woven Main Label", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", required: 1600, received: 768, balance: 512, expectedDate: "2026-08-03", receivedDate: "2026-07-25", status: "booked" },
  { id: "proc-t5", type: "trims", supplier: "Pacific Accessories", item: "Polyester Thread", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", required: 1600, received: 768, balance: 512, expectedDate: "2026-08-04", receivedDate: "2026-07-24", status: "delayed" },
  { id: "proc-t6", type: "trims", supplier: "YKK Bangladesh", item: "YKK Zipper #5", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", required: 1600, received: 768, balance: 512, expectedDate: "2026-08-05", receivedDate: "2026-07-23", status: "in house" },
  { id: "proc-t7", type: "trims", supplier: "Mondol Trims", item: "Woven Main Label", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", required: 1200, received: 576, balance: 384, expectedDate: "2026-08-03", receivedDate: "2026-07-25", status: "delayed" },
  { id: "proc-t8", type: "trims", supplier: "Pacific Accessories", item: "Polyester Thread", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", required: 1200, received: 576, balance: 384, expectedDate: "2026-08-04", receivedDate: "2026-07-24", status: "in house" },
  { id: "proc-t9", type: "trims", supplier: "YKK Bangladesh", item: "YKK Zipper #5", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", required: 1200, received: 576, balance: 384, expectedDate: "2026-08-05", receivedDate: "2026-07-23", status: "partial received" },
];

/* ------------------------------------------------------------------ */
/* Inventory (10 fabric + 10 trims = 20 items, total balance 125,250)  */
/* ------------------------------------------------------------------ */

export const inventory: InventoryItem[] = [
  { id: "inv-f1", category: "fabric", itemName: "Single Jersey — Navy", colorSpec: "Navy / White", unitType: "Roll", unit: "Kg", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", received: 3000, issued: 2000, balance: 6000, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-27" },
  { id: "inv-f2", category: "fabric", itemName: "Single Jersey — Black", colorSpec: "Black", unitType: "Roll", unit: "Kg", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", received: 3500, issued: 2400, balance: 6900, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-26" },
  { id: "inv-f3", category: "fabric", itemName: "Single Jersey — Heather Grey", colorSpec: "Heather Grey", unitType: "Roll", unit: "Kg", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", received: 4000, issued: 2800, balance: 7800, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-25" },
  { id: "inv-f4", category: "fabric", itemName: "Single Jersey — Indigo Wash", colorSpec: "Indigo Wash", unitType: "Roll", unit: "Kg", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", received: 4500, issued: 3200, balance: 8700, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-24" },
  { id: "inv-f5", category: "fabric", itemName: "Single Jersey — Royal Blue", colorSpec: "Royal Blue", unitType: "Roll", unit: "Kg", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", received: 5000, issued: 3600, balance: 9600, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-23" },
  { id: "inv-f6", category: "fabric", itemName: "Single Jersey — Stripe", colorSpec: "Stripe", unitType: "Roll", unit: "Kg", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", received: 5500, issued: 4000, balance: 10500, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-27" },
  { id: "inv-f7", category: "fabric", itemName: "Single Jersey — Olive", colorSpec: "Olive", unitType: "Roll", unit: "Kg", orderId: "order-7", poNumber: "MS-44021", buyerName: "M&S", style: "STY-2026007", received: 6000, issued: 4400, balance: 11400, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-26" },
  { id: "inv-f8", category: "fabric", itemName: "Single Jersey — Red", colorSpec: "Red", unitType: "Roll", unit: "Kg", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", received: 6500, issued: 4800, balance: 12300, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-25" },
  { id: "inv-f9", category: "fabric", itemName: "Single Jersey — White", colorSpec: "White", unitType: "Roll", unit: "Kg", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", received: 7000, issued: 5200, balance: 13200, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-24" },
  { id: "inv-f10", category: "fabric", itemName: "Single Jersey — Dark Wash", colorSpec: "Dark Wash", unitType: "Roll", unit: "Kg", orderId: "order-10", poNumber: "ZARA-88502", buyerName: "Zara", style: "STY-2026010", received: 7500, issued: 5600, balance: 14100, location: "Unit 01 — Fabric Store", lastUpdated: "2026-07-23" },

  { id: "inv-t1", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", received: 1500, issued: 800, balance: 2700, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-27" },
  { id: "inv-t2", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", received: 1500, issued: 850, balance: 2650, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-26" },
  { id: "inv-t3", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", received: 1500, issued: 900, balance: 2600, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-25" },
  { id: "inv-t4", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", received: 1500, issued: 950, balance: 2550, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-27" },
  { id: "inv-t5", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", received: 1500, issued: 1000, balance: 2500, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-26" },
  { id: "inv-t6", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", received: 1500, issued: 1050, balance: 2450, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-25" },
  { id: "inv-t7", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-7", poNumber: "MS-44021", buyerName: "M&S", style: "STY-2026007", received: 1500, issued: 1100, balance: 2400, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-27" },
  { id: "inv-t8", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", received: 1500, issued: 1150, balance: 2350, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-26" },
  { id: "inv-t9", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", received: 1500, issued: 1200, balance: 2300, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-25" },
  { id: "inv-t10", category: "trims", itemName: "Care Label + Hang Tag Set", colorSpec: "N/A", unitType: "Set", unit: "Pcs", orderId: "order-10", poNumber: "ZARA-88502", buyerName: "Zara", style: "STY-2026010", received: 1500, issued: 1250, balance: 2250, location: "Unit 01 — Trims Store", lastUpdated: "2026-07-27" },
];

/* ------------------------------------------------------------------ */
/* Stock Ledger (12 entries)                                          */
/* ------------------------------------------------------------------ */

export const stockLedger: StockLedgerEntry[] = [
  { id: "ledger-1", itemName: "Single Jersey Fabric", date: "2026-07-16", ref: "GRN-1020", inQty: 1200, outQty: 0, balance: 15000, remarks: "Fabric received from DBL Textiles" },
  { id: "ledger-2", itemName: "Woven Main Label", date: "2026-07-17", ref: "ISS-2041", inQty: 0, outQty: 850, balance: 15200, remarks: "Issued to Cutting Section" },
  { id: "ledger-3", itemName: "Single Jersey Fabric", date: "2026-07-18", ref: "GRN-1022", inQty: 1400, outQty: 0, balance: 15400, remarks: "Fabric received from DBL Textiles" },
  { id: "ledger-4", itemName: "Woven Main Label", date: "2026-07-19", ref: "ISS-2043", inQty: 0, outQty: 950, balance: 15600, remarks: "Issued to Cutting Section" },
  { id: "ledger-5", itemName: "Single Jersey Fabric", date: "2026-07-20", ref: "GRN-1024", inQty: 1600, outQty: 0, balance: 15800, remarks: "Fabric received from DBL Textiles" },
  { id: "ledger-6", itemName: "Woven Main Label", date: "2026-07-21", ref: "ISS-2045", inQty: 0, outQty: 1050, balance: 16000, remarks: "Issued to Cutting Section" },
  { id: "ledger-7", itemName: "Single Jersey Fabric", date: "2026-07-22", ref: "GRN-1026", inQty: 1800, outQty: 0, balance: 16200, remarks: "Fabric received from DBL Textiles" },
  { id: "ledger-8", itemName: "Woven Main Label", date: "2026-07-23", ref: "ISS-2047", inQty: 0, outQty: 1150, balance: 16400, remarks: "Issued to Cutting Section" },
  { id: "ledger-9", itemName: "Single Jersey Fabric", date: "2026-07-24", ref: "GRN-1028", inQty: 2000, outQty: 0, balance: 16600, remarks: "Fabric received from DBL Textiles" },
  { id: "ledger-10", itemName: "Woven Main Label", date: "2026-07-25", ref: "ISS-2049", inQty: 0, outQty: 1250, balance: 16800, remarks: "Issued to Cutting Section" },
  { id: "ledger-11", itemName: "Single Jersey Fabric", date: "2026-07-26", ref: "GRN-1030", inQty: 2200, outQty: 0, balance: 17000, remarks: "Fabric received from DBL Textiles" },
  { id: "ledger-12", itemName: "Woven Main Label", date: "2026-07-27", ref: "ISS-2051", inQty: 0, outQty: 1350, balance: 17200, remarks: "Issued to Cutting Section" },
];

/* ------------------------------------------------------------------ */
/* Cutting Jobs (8 active jobs, total cut qty 197,820)                 */
/* ------------------------------------------------------------------ */

export const cuttingJobs: CuttingJob[] = [
  { id: "cut-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", fabricIssued: 60000, cutQty: 29760, reject: 576, balance: 18240, cuttingDate: "2026-07-22", status: "Completed" },
  { id: "cut-2", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", fabricIssued: 40000, cutQty: 8960, reject: 384, balance: 23040, cuttingDate: "2026-07-23", status: "In Progress" },
  { id: "cut-3", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", fabricIssued: 30000, cutQty: 18720, reject: 288, balance: 5280, cuttingDate: "2026-07-24", status: "Completed" },
  { id: "cut-4", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", fabricIssued: 70000, cutQty: 50960, reject: 672, balance: 5040, cuttingDate: "2026-07-22", status: "Completed" },
  { id: "cut-5", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", fabricIssued: 27500, cutQty: 18700, reject: 264, balance: 3300, cuttingDate: "2026-07-23", status: "Completed" },
  { id: "cut-6", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", fabricIssued: 50000, cutQty: 22000, reject: 480, balance: 18000, cuttingDate: "2026-07-24", status: "Completed" },
  { id: "cut-7", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", fabricIssued: 45000, cutQty: 35280, reject: 432, balance: 720, cuttingDate: "2026-07-22", status: "Completed" },
  { id: "cut-8", orderId: "order-11", poNumber: "PRM-55310", buyerName: "Primark", style: "STY-2026011", fabricIssued: 35000, cutQty: 13440, reject: 336, balance: 14560, cuttingDate: "2026-07-23", status: "In Progress" },
];

/* ------------------------------------------------------------------ */
/* Sewing Lines (8 entries across 3 active lines, today's output 7,920)*/
/* ------------------------------------------------------------------ */

export const sewingLines: SewingLine[] = [
  { id: "sew-1", lineName: "Sewing Line 01", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", target: 1200, output: 900, defect: 23, efficiencyPercent: 75, operators: 42, status: "Below Target" },
  { id: "sew-2", lineName: "Sewing Line 02", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", target: 1200, output: 960, defect: 24, efficiencyPercent: 80, operators: 46, status: "Below Target" },
  { id: "sew-3", lineName: "Sewing Line 03", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", target: 1200, output: 1020, defect: 26, efficiencyPercent: 85, operators: 50, status: "On Target" },
  { id: "sew-4", lineName: "Sewing Line 01", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", target: 1200, output: 1080, defect: 27, efficiencyPercent: 90, operators: 42, status: "On Target" },
  { id: "sew-5", lineName: "Sewing Line 02", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", target: 1200, output: 900, defect: 23, efficiencyPercent: 75, operators: 46, status: "Below Target" },
  { id: "sew-6", lineName: "Sewing Line 03", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", target: 1200, output: 960, defect: 24, efficiencyPercent: 80, operators: 50, status: "Below Target" },
  { id: "sew-7", lineName: "Sewing Line 01", orderId: "order-11", poNumber: "PRM-55310", buyerName: "Primark", style: "STY-2026011", target: 1200, output: 1020, defect: 26, efficiencyPercent: 85, operators: 42, status: "On Target" },
  { id: "sew-8", lineName: "Sewing Line 02", orderId: "order-12", poNumber: "TSC-33102", buyerName: "Tesco", style: "STY-2026012", target: 1200, output: 1080, defect: 27, efficiencyPercent: 90, operators: 46, status: "On Target" },
];

/* ------------------------------------------------------------------ */
/* Finishing Jobs (5)                                                  */
/* ------------------------------------------------------------------ */

export const finishingJobs: FinishingJob[] = [
  { id: "fin-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", fromSewing: 33600, iron: 33096, finish: 33096, reject: 504, readyForPacking: 33096, date: "2026-07-27" },
  { id: "fin-2", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", fromSewing: 16800, iron: 16548, finish: 16548, reject: 252, readyForPacking: 16548, date: "2026-07-27" },
  { id: "fin-3", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", fromSewing: 39200, iron: 38612, finish: 38612, reject: 588, readyForPacking: 38612, date: "2026-07-27" },
  { id: "fin-4", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", fromSewing: 15400, iron: 15169, finish: 15169, reject: 231, readyForPacking: 15169, date: "2026-07-27" },
  { id: "fin-5", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", fromSewing: 25200, iron: 24822, finish: 24822, reject: 378, readyForPacking: 24822, date: "2026-07-27" },
];

/* ------------------------------------------------------------------ */
/* Packing Jobs (3)                                                    */
/* ------------------------------------------------------------------ */

export const packingJobs: PackingJob[] = [
  { id: "pack-1", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", color: "Royal Blue", size: "S", cartons: 120, packed: 47600, ready: 45920, date: "2026-07-27" },
  { id: "pack-2", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", color: "Stripe", size: "M", cartons: 130, packed: 18700, ready: 18040, date: "2026-07-27" },
  { id: "pack-3", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", color: "White", size: "L", cartons: 140, packed: 30600, ready: 29520, date: "2026-07-27" },
];

/* ------------------------------------------------------------------ */
/* QC Records (5 inline + 5 endline + 5 final = 15)                    */
/* ------------------------------------------------------------------ */

export const qcRecords: QcRecord[] = [
  // Inline QC
  { id: "qc-in-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", type: "inline", inspector: "QC — Sabina Yasmin", checked: 500, passed: 487, defectQty: 10, rejected: 3, defectType: "Broken Stitch", result: "passed" },
  { id: "qc-in-2", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", type: "inline", inspector: "QC — Sabina Yasmin", checked: 600, passed: 584, defectQty: 12, rejected: 4, defectType: "Measurement Problem", result: "passed" },
  { id: "qc-in-3", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", type: "inline", inspector: "QC — Sabina Yasmin", checked: 700, passed: 682, defectQty: 14, rejected: 4, defectType: "Oil Spot", result: "passed" },
  { id: "qc-in-4", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", type: "inline", inspector: "QC — Sabina Yasmin", checked: 800, passed: 779, defectQty: 16, rejected: 5, defectType: "Shade Variation", result: "passed" },
  { id: "qc-in-5", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", type: "inline", inspector: "QC — Sabina Yasmin", checked: 900, passed: 877, defectQty: 18, rejected: 5, defectType: "Needle Mark", result: "passed" },

  // Endline QC
  { id: "qc-end-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", type: "endline", inspector: "QC — Mahmud Hasan", checked: 500, passed: 480, defectQty: 15, rejected: 5, defectType: "Measurement Problem", result: "rework" },
  { id: "qc-end-2", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", type: "endline", inspector: "QC — Mahmud Hasan", checked: 600, passed: 577, defectQty: 18, rejected: 5, defectType: "Oil Spot", result: "rework" },
  { id: "qc-end-3", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", type: "endline", inspector: "QC — Mahmud Hasan", checked: 700, passed: 673, defectQty: 21, rejected: 6, defectType: "Shade Variation", result: "rework" },
  { id: "qc-end-4", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", type: "endline", inspector: "QC — Mahmud Hasan", checked: 800, passed: 769, defectQty: 24, rejected: 7, defectType: "Needle Mark", result: "rework" },
  { id: "qc-end-5", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", type: "endline", inspector: "QC — Mahmud Hasan", checked: 900, passed: 865, defectQty: 27, rejected: 8, defectType: "Button Missing", result: "rework" },

  // Final QC
  { id: "qc-fin-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", type: "final", inspector: "QC — Priya Saha", checked: 500, passed: 474, defectQty: 20, rejected: 6, defectType: "Oil Spot", result: "passed" },
  { id: "qc-fin-2", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", type: "final", inspector: "QC — Priya Saha", checked: 600, passed: 569, defectQty: 24, rejected: 7, defectType: "Shade Variation", result: "passed" },
  { id: "qc-fin-3", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", type: "final", inspector: "QC — Priya Saha", checked: 700, passed: 664, defectQty: 28, rejected: 8, defectType: "Needle Mark", result: "passed" },
  { id: "qc-fin-4", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", type: "final", inspector: "QC — Priya Saha", checked: 800, passed: 728, defectQty: 32, rejected: 40, defectType: "Button Missing", result: "failed" },
  { id: "qc-fin-5", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", type: "final", inspector: "QC — Priya Saha", checked: 900, passed: 853, defectQty: 36, rejected: 11, defectType: "Label Mistake", result: "passed" },
];

/* ------------------------------------------------------------------ */
/* Defects (7 defect types)                                            */
/* ------------------------------------------------------------------ */

export const defects: Defect[] = [
  { id: "defect-1", defectType: "Broken Stitch", occurrences: 1, totalDefectQty: 10 },
  { id: "defect-2", defectType: "Measurement Problem", occurrences: 2, totalDefectQty: 27 },
  { id: "defect-3", defectType: "Oil Spot", occurrences: 3, totalDefectQty: 52 },
  { id: "defect-4", defectType: "Shade Variation", occurrences: 3, totalDefectQty: 61 },
  { id: "defect-5", defectType: "Needle Mark", occurrences: 3, totalDefectQty: 70 },
  { id: "defect-6", defectType: "Button Missing", occurrences: 2, totalDefectQty: 59 },
  { id: "defect-7", defectType: "Label Mistake", occurrences: 1, totalDefectQty: 36 },
];

/* ------------------------------------------------------------------ */
/* Shipments (4)                                                       */
/* ------------------------------------------------------------------ */

export const shipments: Shipment[] = [
  {
    id: "ship-1",
    orderId: "order-3",
    poNumber: "PRM-55201",
    buyerName: "Primark",
    style: "STY-2026003",
    orderQty: 24000,
    packedQty: 21600,
    cartons: 180,
    shipDate: "2026-08-24",
    forwarder: "Kuehne+Nagel Dhaka",
    mode: "SEA",
    status: "shipped",
    customsStatus: "Cleared",
    documents: { invoice: true, packing: true, exp: true, coo: true, bl: true, gsp: true, buyer: true },
  },
  {
    id: "ship-2",
    orderId: "order-5",
    poNumber: "TSC-33018",
    buyerName: "Tesco",
    style: "STY-2026005",
    orderQty: 56000,
    packedQty: 50400,
    cartons: 195,
    shipDate: "2026-09-07",
    forwarder: "Expeditors Bangladesh",
    mode: "SEA",
    status: "approved",
    customsStatus: "Cleared",
    documents: { invoice: true, packing: true, exp: true, coo: true, bl: true, gsp: true, buyer: true },
  },
  {
    id: "ship-3",
    orderId: "order-6",
    poNumber: "NXT-11904",
    buyerName: "Next",
    style: "STY-2026006",
    orderQty: 22000,
    packedQty: 19800,
    cartons: 210,
    shipDate: "2026-09-14",
    forwarder: "DHL Global Forwarding",
    mode: "AIR",
    status: "submitted",
    customsStatus: "Cleared",
    documents: { invoice: true, packing: true, exp: true, coo: true, bl: true, gsp: true, buyer: true },
  },
  {
    id: "ship-4",
    orderId: "order-9",
    poNumber: "HM-2026-0188",
    buyerName: "H&M",
    style: "STY-2026009",
    orderQty: 36000,
    packedQty: 32400,
    cartons: 225,
    shipDate: "2026-10-05",
    forwarder: "Bolloré Logistics",
    mode: "SEA",
    status: "prepared",
    customsStatus: "Under Review",
    documents: { invoice: true, packing: true, exp: false, coo: false, bl: false, gsp: true, buyer: true },
  },
];

/* ------------------------------------------------------------------ */
/* Accounts — Buyer Ledger (8 buyers)                                  */
/* ------------------------------------------------------------------ */

export const buyerLedger: BuyerLedgerEntry[] = [
  { id: "bl-1", buyerId: "buyer-hm", buyerName: "H&M", orderValue: 332400, invoiceValue: 282540, receivedValue: 169524, dueValue: 113016, status: "partial" },
  { id: "bl-2", buyerId: "buyer-zara", buyerName: "Zara", orderValue: 304800, invoiceValue: 259080, receivedValue: 207264, dueValue: 51816, status: "partial" },
  { id: "bl-3", buyerId: "buyer-primark", buyerName: "Primark", orderValue: 223200, invoiceValue: 189720, receivedValue: 189720, dueValue: 0, status: "paid" },
  { id: "bl-4", buyerId: "buyer-ca", buyerName: "C&A", orderValue: 225000, invoiceValue: 191250, receivedValue: 114750, dueValue: 76500, status: "partial" },
  { id: "bl-5", buyerId: "buyer-tesco", buyerName: "Tesco", orderValue: 375000, invoiceValue: 318750, receivedValue: 318750, dueValue: 0, status: "paid" },
  { id: "bl-6", buyerId: "buyer-next", buyerName: "Next", orderValue: 138600, invoiceValue: 117810, receivedValue: 94248, dueValue: 23562, status: "partial" },
  { id: "bl-7", buyerId: "buyer-ms", buyerName: "M&S", orderValue: 147000, invoiceValue: 124950, receivedValue: 74970, dueValue: 49980, status: "partial" },
  { id: "bl-8", buyerId: "buyer-decathlon", buyerName: "Decathlon", orderValue: 158000, invoiceValue: 134300, receivedValue: 107440, dueValue: 26860, status: "partial" },
];

/* ------------------------------------------------------------------ */
/* Accounts — Supplier Ledger (6 suppliers)                            */
/* ------------------------------------------------------------------ */

export const supplierLedger: SupplierLedgerEntry[] = [
  { id: "sl-1", supplierName: "DBL Textiles", purchaseValue: 850000, paidValue: 637500, dueValue: 212500, status: "partial" },
  { id: "sl-2", supplierName: "Envoy Textiles", purchaseValue: 970000, paidValue: 970000, dueValue: 0, status: "paid" },
  { id: "sl-3", supplierName: "ACS Textiles", purchaseValue: 1090000, paidValue: 817500, dueValue: 272500, status: "partial" },
  { id: "sl-4", supplierName: "Pacific Accessories", purchaseValue: 1210000, paidValue: 1210000, dueValue: 0, status: "paid" },
  { id: "sl-5", supplierName: "YKK Bangladesh", purchaseValue: 1330000, paidValue: 997500, dueValue: 332500, status: "partial" },
  { id: "sl-6", supplierName: "Mondol Trims", purchaseValue: 620000, paidValue: 465000, dueValue: 155000, status: "partial" },
];

/* ------------------------------------------------------------------ */
/* Expenses                                                            */
/* ------------------------------------------------------------------ */

export const expenses: Expense[] = [
  { id: "exp-1", title: "Electricity — Unit 01", category: "utility", date: "2026-07-25", amount: 285000, notes: "DESCO bill March 2026" },
  { id: "exp-2", title: "Sewing Line Wages", category: "salary", date: "2026-07-22", amount: 1250000, notes: "Fortnightly payroll" },
  { id: "exp-3", title: "C&F Port Handling", category: "transport", date: "2026-07-26", amount: 45000, notes: "Chittagong port charges" },
  { id: "exp-4", title: "Factory Rent — Ashulia", category: "rent", date: "2026-07-01", amount: 620000, notes: "Monthly rent, Unit 01 & Unit 02" },
  { id: "exp-5", title: "Generator Fuel & Maintenance", category: "maintenance", date: "2026-07-18", amount: 96000, notes: "Diesel refill and quarterly service" },
  { id: "exp-6", title: "Office & Compliance Audit Fee", category: "office", date: "2026-07-15", amount: 65000, notes: "Buyer compliance audit — third party" },
];

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export const payments: Payment[] = [
  { id: "pay-1", party: "H&M", partyType: "buyer", date: "2026-07-24", amount: 185000, method: "bank", reference: "TT-H&M-0724" },
  { id: "pay-2", party: "DBL Textiles", partyType: "supplier", date: "2026-07-22", amount: 420000, method: "bank", reference: "PAY-DBL-0722" },
  { id: "pay-3", party: "Zara", partyType: "buyer", date: "2026-07-20", amount: 95000, method: "bank", reference: "TT-ZARA-0720" },
  { id: "pay-4", party: "Primark", partyType: "buyer", date: "2026-07-18", amount: 189720, method: "LC", reference: "LC-PRM-0718" },
  { id: "pay-5", party: "Tesco", partyType: "buyer", date: "2026-07-19", amount: 318750, method: "LC", reference: "LC-TSC-0719" },
  { id: "pay-6", party: "Envoy Textiles", partyType: "supplier", date: "2026-07-21", amount: 970000, method: "bank", reference: "PAY-ENV-0721" },
  { id: "pay-7", party: "Pacific Accessories", partyType: "supplier", date: "2026-07-23", amount: 1210000, method: "bank", reference: "PAY-PAC-0723" },
];

/* ------------------------------------------------------------------ */
/* Profit & Loss (per order — fabric 35% / CM 28% / cost 77% / 23% mgn)*/
/* ------------------------------------------------------------------ */

export const pnl: Pnl[] = [
  { id: "pnl-1", orderId: "order-1", poNumber: "HM-2026-0142", buyerName: "H&M", style: "STY-2026001", orderValue: 184800, fabricCost: 64680, cmCost: 51744, totalCost: 142296, profit: 42504, marginPercent: 23 },
  { id: "pnl-2", orderId: "order-2", poNumber: "ZARA-88421", buyerName: "Zara", style: "STY-2026002", orderValue: 134400, fabricCost: 47040, cmCost: 37632, totalCost: 103488, profit: 30912, marginPercent: 23 },
  { id: "pnl-3", orderId: "order-3", poNumber: "PRM-55201", buyerName: "Primark", style: "STY-2026003", orderValue: 122400, fabricCost: 42840, cmCost: 34272, totalCost: 94248, profit: 28152, marginPercent: 23 },
  { id: "pnl-4", orderId: "order-4", poNumber: "CA-77102", buyerName: "C&A", style: "STY-2026004", orderValue: 225000, fabricCost: 78750, cmCost: 63000, totalCost: 173250, profit: 51750, marginPercent: 23 },
  { id: "pnl-5", orderId: "order-5", poNumber: "TSC-33018", buyerName: "Tesco", style: "STY-2026005", orderValue: 266000, fabricCost: 93100, cmCost: 74480, totalCost: 204820, profit: 61180, marginPercent: 23 },
  { id: "pnl-6", orderId: "order-6", poNumber: "NXT-11904", buyerName: "Next", style: "STY-2026006", orderValue: 138600, fabricCost: 48510, cmCost: 38808, totalCost: 106722, profit: 31878, marginPercent: 23 },
  { id: "pnl-7", orderId: "order-7", poNumber: "MS-44021", buyerName: "M&S", style: "STY-2026007", orderValue: 147000, fabricCost: 51450, cmCost: 41160, totalCost: 113190, profit: 33810, marginPercent: 23 },
  { id: "pnl-8", orderId: "order-8", poNumber: "DEC-22015", buyerName: "Decathlon", style: "STY-2026008", orderValue: 158000, fabricCost: 55300, cmCost: 44240, totalCost: 121660, profit: 36340, marginPercent: 23 },
  { id: "pnl-9", orderId: "order-9", poNumber: "HM-2026-0188", buyerName: "H&M", style: "STY-2026009", orderValue: 147600, fabricCost: 51660, cmCost: 41328, totalCost: 113652, profit: 33948, marginPercent: 23 },
  { id: "pnl-10", orderId: "order-10", poNumber: "ZARA-88502", buyerName: "Zara", style: "STY-2026010", orderValue: 170400, fabricCost: 59640, cmCost: 47712, totalCost: 131208, profit: 39192, marginPercent: 23 },
  { id: "pnl-11", orderId: "order-11", poNumber: "PRM-55310", buyerName: "Primark", style: "STY-2026011", orderValue: 100800, fabricCost: 35280, cmCost: 28224, totalCost: 77616, profit: 23184, marginPercent: 23 },
  { id: "pnl-12", orderId: "order-12", poNumber: "TSC-33102", buyerName: "Tesco", style: "STY-2026012", orderValue: 109000, fabricCost: 38150, cmCost: 30520, totalCost: 68670, profit: 25070, marginPercent: 23 },
];

/* ------------------------------------------------------------------ */
/* Settings & Roles                                                    */
/* ------------------------------------------------------------------ */

export const settings: Settings = {
  companyName: "DAWAT GARMENTS LTD.",
  tagline: "From order confirmation to shipment — all in one ERP.",
  taglineBn: "From order confirmation to shipment — everything in one ERP.",
  address: "Ashulia, Savar, Dhaka-1341, Bangladesh",
  phone: "+880 1713-224488",
  email: "info@samedawatgarments.com",
  units: ["Unit 01", "Unit 02", "Cutting Section", "Finishing Section"],
  currentPanel: "super_admin",
  website: "www.dawatrmgsoft.com",
};

export const roles: Role[] = [
  { id: "super_admin", name: "Super Admin", nameBn: "Super Admin", description: "Full ERP overview across all modules and operations", focusModules: ["all"], defaultRoute: "/dashboard" },
  { id: "owner_director", name: "Owner / Director", nameBn: "Owner / Director", description: "Executive overview, KPI, shipment and profit status", focusModules: ["dashboard", "shipment", "accounts"], defaultRoute: "/dashboard/executive" },
  { id: "merchandiser", name: "Merchandiser", nameBn: "Merchandiser", description: "Buyers, orders, T&A, samples and costing", focusModules: ["buyers", "orders", "ta-calendar", "samples", "costing"], defaultRoute: "/buyers" },
  { id: "production_manager", name: "Production Manager", nameBn: "Production Manager", description: "Cutting, sewing, finishing and packing", focusModules: ["production"], defaultRoute: "/production/cutting" },
  { id: "qc_manager", name: "QC Manager", nameBn: "QC Manager", description: "Inline QC, endline QC and final inspection", focusModules: ["quality-control"], defaultRoute: "/quality-control" },
  { id: "store_manager", name: "Store Manager", nameBn: "Store Manager", description: "Fabric, trims, inventory and in-house status", focusModules: ["inventory", "procurement"], defaultRoute: "/inventory" },
  { id: "accounts_manager", name: "Accounts Manager", nameBn: "Accounts Manager", description: "Buyer ledger, supplier ledger and profit/loss", focusModules: ["accounts"], defaultRoute: "/accounts" },
];

/* ------------------------------------------------------------------ */
/* HR & Admin (Auto-Generated 100 Employees)                          */
/* ------------------------------------------------------------------ */

function generateHrData() {
  const departments = [
    { name: "Sewing", roles: ["Operator", "Helper", "Line Supervisor"], baseSalary: 12500, count: 40 },
    { name: "Cutting", roles: ["Cutter", "Helper", "Master"], baseSalary: 13000, count: 10 },
    { name: "Finishing", roles: ["Iron Man", "Folder", "Quality Checker"], baseSalary: 12000, count: 15 },
    { name: "Knitting", roles: ["Machine Operator", "Technician"], baseSalary: 14000, count: 10 },
    { name: "Dyeing", roles: ["Dyeing Master", "Helper"], baseSalary: 14500, count: 10 },
    { name: "HR & Admin", roles: ["HR Executive", "Admin Officer", "Security"], baseSalary: 18000, count: 5 },
    { name: "Quality Control", roles: ["QC Inspector", "QC Manager"], baseSalary: 15000, count: 5 },
    { name: "Merchandising", roles: ["Merchandiser", "Sr. Merchandiser"], baseSalary: 25000, count: 3 },
    { name: "Management", roles: ["Production Manager", "General Manager"], baseSalary: 50000, count: 2 },
  ];

  const firstNames = ["Md. Rahim", "Kamrul", "Sumon", "Raju", "Hasan", "Arif", "Tarik", "Mizan", "Rafiq", "Jalal", "Aminul", "Babu", "Faruk", "Nazmul", "Shohag", "Liton", "Ripon", "Sharif", "Jewel", "Rubel", "Mamun", "Al-Amin", "Sagor", "Tuhin", "Ashik", "Mehedi", "Rakib", "Shakil", "Imran", "Sujon", "Monir", "Tariqul", "Mostofa", "Habib", "Jamal", "Kamal", "Zahir", "Shafiq", "Kawsar", "Nayan", "Faisal", "Mahmud", "Sabbir", "Nahid", "Sazzad", "Akash", "Riaz"];
  const lastNames = ["Islam", "Ali", "Mia", "Hossain", "Uddin", "Rahman", "Sikder", "Khan", "Chowdhury", "Talukder", "Molla", "Sheikh"];

  const employees: Employee[] = [];
  const attendance: AttendanceLog[] = [];
  const payroll: PayrollRecord[] = [];

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.substring(0, 7);
  let empCounter = 1;

  for (const dept of departments) {
    for (let i = 0; i < dept.count; i++) {
      const id = `EMP-${empCounter.toString().padStart(3, "0")}`;
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${fName} ${lName}`;
      const role = dept.roles[Math.floor(Math.random() * dept.roles.length)];
      const variance = Math.floor(Math.random() * 3000) - 1000;
      const salary = dept.baseSalary + variance;

      employees.push({
        id,
        name,
        department: dept.name,
        designation: role,
        basicSalary: salary,
        status: "Active",
        joiningDate: "2025-01-15",
        contactNumber: `017${Math.floor(10000000 + Math.random() * 90000000)}`,
      });

      // Generate Attendance for today
      const isLate = Math.random() > 0.8;
      const isAbsent = Math.random() > 0.95;
      
      let inTime = "07:55 AM";
      let outTime = "05:05 PM";
      let status: "Present" | "Absent" | "Late" | "Half Day" | "On Leave" = "Present";
      
      if (isAbsent) {
        inTime = "-";
        outTime = "-";
        status = "Absent";
      } else if (isLate) {
        inTime = `08:${Math.floor(15 + Math.random() * 30)} AM`;
        status = "Late";
      }

      attendance.push({
        id: `ATT-${today}-${id}`,
        date: today,
        empId: id,
        name,
        inTime: inTime === "-" ? null : inTime,
        outTime: outTime === "-" ? null : outTime,
        status,
        source: "ZKTeco",
      });

      // Generate Payroll for the month
      const attendanceDays = isAbsent ? 25 : 26;
      const lateDeduction = isLate ? 500 : 0;
      const overtimeAmount = (dept.name === "Sewing" || dept.name === "Finishing") ? Math.floor(Math.random() * 3000) : 0;
      const netPayable = salary - lateDeduction + overtimeAmount;

      payroll.push({
        id: `PR-${currentMonth}-${id}`,
        month: currentMonth,
        empId: id,
        name,
        department: dept.name,
        basicSalary: salary,
        attendanceDays,
        lateDeduction,
        overtimeAmount,
        netPayable,
        status: "Draft",
      });

      empCounter++;
    }
  }

  return { employees, attendance, payroll };
}

const hrData = generateHrData();

/* ------------------------------------------------------------------ */
/* Aggregate export                                                    */
/* ------------------------------------------------------------------ */

export function buildSeedData(): ErpData {
  return repairErpData({
    buyers,
    orders,
    taTasks,
    samples,
    costings,
    procurements,
    inventory,
    stockLedger,
    cuttingJobs,
    sewingLines,
    finishingJobs,
    packingJobs,
    qcRecords,
    defects,
    shipments,
    buyerLedger,
    supplierLedger,
    expenses,
    payments,
    pnl,
    settings,
    roles,
    employees: hrData.employees,
    attendance: hrData.attendance,
    payroll: hrData.payroll,
    quotations: [],
    confirmOrders: [],
    orderStatuses: [],
    accRmBookings: [],
    fabricBookings: [],
    accessoriesBookings: [],
    piRegisters: [],
    accEstimations: [],
  });
}

export const seedData: ErpData = buildSeedData();

export default seedData;
