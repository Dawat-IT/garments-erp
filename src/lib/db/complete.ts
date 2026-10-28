import type {
  AccEstimation,
  AccRmBooking,
  AccessoriesBooking,
  ConfirmOrder,
  Costing,
  FabricBooking,
  Order,
  OrderStatus,
  PiRegister,
  Procurement,
  Quotation,
} from "@/lib/types";

export function isPlaceholderOrder(order: Order): boolean {
  const po = order.poNumber.trim();
  const style = order.style.trim();
  const realPo = /^(HM|ZARA|PRM|CA|TSC|NXT|MS|DEC)-/i.test(po);
  const realStyle = /^STY-\d+/.test(style);
  return !realPo && !realStyle;
}

function dmy(iso: string | null | undefined): string {
  const day = (iso || "").slice(0, 10);
  const [year, month, date] = day.split("-");
  if (!year || !month || !date) return "";
  return `${date}/${month}/${year.slice(2)}`;
}

function bookingStatus(status: Procurement["status"]): AccessoriesBooking["status"] {
  if (status === "in house") return "In-House";
  if (status === "booked" || status === "ordered" || status === "partial received") return "Booked";
  return "Pending";
}

export function buildLinkedRegisters(orders: Order[], procurements: Procurement[]) {
  const ordersById = new Map(orders.map((order) => [order.id, order]));
  const quotations: Quotation[] = [];
  const confirmOrders: ConfirmOrder[] = [];
  const orderStatuses: OrderStatus[] = [];
  const fabricBookings: FabricBooking[] = [];
  const accessoriesBookings: AccessoriesBooking[] = [];
  const piRegisters: PiRegister[] = [];
  const accEstimations: AccEstimation[] = [];
  const accRmBookings: AccRmBooking[] = [];

  orders.forEach((order, index) => {
    quotations.push({
      id: `qtn-${order.id}`,
      orderId: order.id,
      buyerId: order.buyerId,
      qtnDt: dmy(order.orderDate),
      delDt: dmy(order.shipDate),
      option: "1",
      quotationNo: `Q-${order.poNumber}`,
      amend: "0",
      ourRef: order.style,
      buyer: order.buyerName,
      buyerRef: order.poNumber,
      gi: order.productName,
      mp: "",
      smv: "",
      pph: "",
      eff: "",
      qty: String(order.quantity),
      gCm: "",
      aCm: "",
      nFob: String(order.unitPrice),
      fFob: String(order.unitPrice),
      oMer: "",
      appStatus: "Confirmed",
    });
    confirmOrders.push({
      id: `co-${order.id}`,
      orderId: order.id,
      buyerId: order.buyerId,
      lot: String(index + 1),
      po: order.poNumber,
      lcContact: "",
      bs: order.style,
      size: "",
      qty: String(order.quantity),
      rate: String(order.unitPrice),
      value: String(order.orderValue),
      poDate: dmy(order.orderDate),
      orgDelDt: dmy(order.shipDate),
      agreedDt: dmy(order.shipDate),
      exFactDt: dmy(order.shipDate),
      cuttableQty: String(order.quantity),
      delMode: "Sea",
      delPort: "",
    });
    orderStatuses.push({
      id: `os-${order.id}`,
      orderId: order.id,
      buyerId: order.buyerId,
      chDt: dmy(order.orderDate),
      v: "CH",
      mer: "",
      buyer: order.buyerName,
      ordDt: dmy(order.orderDate),
      ref: order.style,
      buyerRef: order.poNumber,
      ordQty: String(order.quantity),
      poNo: order.poNumber,
      poQty: String(order.quantity),
      a: "1",
      pct: "0",
      cuttable: String(order.quantity),
      fab: order.colorway,
      colorQty: String(order.quantity),
      lt: "1",
      lotQty: String(order.quantity),
      delD: dmy(order.shipDate),
      status: order.stage,
    });
  });

  for (const row of procurements) {
    const order = ordersById.get(row.orderId);
    if (!order) continue;
    const perDozen = order.quantity > 0 ? Math.round((row.required / (order.quantity / 12)) * 100) / 100 : 0;
    piRegisters.push({
      id: `pi-${row.id}`,
      orderId: order.id,
      buyerId: order.buyerId,
      piNo: `PI-${row.id.replace(/^proc-/, "").toUpperCase()}`,
      date: dmy(row.expectedDate),
      ref: order.style,
      buyer: order.buyerName,
      supplier: row.supplier,
      type: row.type,
      qty: row.required,
      val: 0,
      pt: "Credit",
      lcNo: "",
      lcDate: "",
      st: "FOB",
      status: row.status,
    });
    if (row.type === "fabric") {
      fabricBookings.push({
        id: `fb-${row.id}`,
        orderId: order.id,
        buyerId: order.buyerId,
        color: order.colorway || row.item,
        consump: order.quantity > 0 ? Math.round((row.required / order.quantity) * 1000) / 1000 : 0,
        unit: "Kg",
        w: 0,
        req: row.required,
        booked: row.received,
        bal: row.balance,
        mill: row.supplier,
        labDip: row.status === "in house" ? "Approved" : "Pending",
        pi: `PI-${row.id.replace(/^proc-/, "").toUpperCase()}`,
        etd: dmy(row.expectedDate),
        eta: dmy(row.receivedDate),
        rate: 0,
        amt: 0,
      });
    } else {
      const status = bookingStatus(row.status);
      accessoriesBookings.push({
        id: `ab-${row.id}`,
        orderId: order.id,
        buyerId: order.buyerId,
        orderNo: order.poNumber,
        item: row.item,
        name: row.item,
        color: order.colorway,
        size: "",
        reqQty: row.required,
        est: row.required,
        allowance: 0,
        bookQty: row.received,
        booked: row.received,
        amt: 0,
        delDate: dmy(row.expectedDate),
        payment: "Credit",
        unit: "Pcs",
        rate: 0,
        supplier: row.supplier,
        targetDate: row.expectedDate,
        status,
      });
      accEstimations.push({
        id: `ae-${row.id}`,
        orderId: order.id,
        buyerId: order.buyerId,
        name: row.item,
        status: row.received > 0 ? "C" : "N",
        place: "Body",
        desc: row.item,
        qty: perDozen,
        unit: "Pcs",
        wastage: 0,
        rel: 1,
        rate: 0,
        amt: 0,
        nominee: "",
        supplier: row.supplier,
      });
      accRmBookings.push({
        id: `arm-${row.id}`,
        orderId: order.id,
        buyerId: order.buyerId,
        buyer: order.buyerName,
        c: row.received > 0 ? "Y" : "N",
        s: row.status === "in house" ? "E" : "N",
        ref: order.poNumber,
        lot: "1",
        delDt: dmy(order.shipDate),
        pcd: dmy(row.expectedDate),
        lotQty: String(order.quantity),
        eiPid: row.id,
        bomItem: row.item,
        details: row.item,
        bi: "N",
        conDz: `${perDozen} Pcs`,
        w: "0",
        ttlCon: `${row.required} Pcs`,
        rate: "0",
        value: "0",
        nob: ".",
        bQty: String(row.received),
        bValue: "0",
        blnQty: String(row.balance),
        blnVal: "0",
        status: row.balance === 0 ? "Complete" : row.received > 0 ? "Partial" : "Pending",
        bg: row.balance === 0 ? "" : "bg-orange-500 text-white",
      });
    }
  }

  return {
    quotations,
    confirmOrders,
    orderStatuses,
    fabricBookings,
    accessoriesBookings,
    piRegisters,
    accEstimations,
    accRmBookings,
  };
}

export function costingByOrder(costings: Costing[], orderId: string) {
  return costings.find((row) => row.orderId === orderId);
}

function parseDmyOrIso(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return new Date().toISOString().slice(0, 10);
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

export function syncQuotationsToOrders(erpData: {
  orders: Order[];
  quotations: Quotation[];
  confirmOrders: ConfirmOrder[];
  orderStatuses: OrderStatus[];
}) {
  const orders = [...erpData.orders];
  const confirmOrders = [...erpData.confirmOrders];
  const orderStatuses = [...erpData.orderStatuses];

  const ordersById = new Map(orders.map((o) => [o.id, o]));
  const ordersByPo = new Map(orders.map((o) => [o.poNumber.trim().toLowerCase(), o]));
  const confirmByOrder = new Map(confirmOrders.map((co) => [co.orderId, co]));
  const confirmByQuotation = new Map(confirmOrders.map((co) => [co.quotationId, co]));
  const statusByOrder = new Map(orderStatuses.map((os) => [os.orderId, os]));

  let ordersChanged = false;
  let confirmOrdersChanged = false;
  let orderStatusesChanged = false;

  for (const q of erpData.quotations) {
    const poNum = (q.buyerRef || q.quotationNo || "").trim();
    if (!poNum) continue;

    let order = (q.orderId ? ordersById.get(q.orderId) : undefined) ?? ordersByPo.get(poNum.toLowerCase());
    const qty = parseFloat(q.qty) || (order ? order.quantity : 1000);
    const unitPrice = parseFloat(q.fFob || q.nFob || "") || (order ? order.unitPrice : 0);
    const orderValue = Math.round((qty * unitPrice + Number.EPSILON) * 100) / 100;
    const orderDate = q.entry?.submitDate || parseDmyOrIso(q.qtnDt);
    const shipDate = q.entry?.delivery || parseDmyOrIso(q.delDt);
    const buyerName = q.buyer || order?.buyerName || "Default Buyer";
    const buyerId = q.buyerId || order?.buyerId || `buyer-${buyerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown"}`;
    const style = (q.ourRef || q.entry?.ourRef || q.buyerRef || "STYLE").trim();
    const productName = (q.gi || q.entry?.gi || order?.productName || "Garments").trim();

    if (!order) {
      const orderId = q.orderId || `order-${q.id || Date.now().toString(36)}`;
      order = {
        id: orderId,
        poNumber: poNum,
        style,
        buyerId,
        buyerName,
        productName,
        colorway: "Assorted",
        quantity: qty,
        unitPrice,
        orderValue,
        orderDate,
        shipDate,
        stage: "Merchandising",
        progressPercent: 10,
        taStatus: "On Track",
        paymentStatus: "unpaid",
        notes: `Created from quotation ${q.quotationNo || q.id}`,
        createdAt: new Date().toISOString(),
      };
      orders.push(order);
      ordersById.set(order.id, order);
      ordersByPo.set(order.poNumber.trim().toLowerCase(), order);
      q.orderId = order.id;
      ordersChanged = true;
    } else {
      q.orderId = order.id;
      let dirty = false;
      if (qty > 0 && order.quantity !== qty) {
        order.quantity = qty;
        dirty = true;
      }
      if (unitPrice > 0 && order.unitPrice !== unitPrice) {
        order.unitPrice = unitPrice;
        dirty = true;
      }
      if (dirty) {
        order.orderValue = orderValue;
        ordersChanged = true;
      }
    }

    // Ensure ConfirmOrder entry exists for this quotation / order
    let co = confirmByQuotation.get(q.id) ?? (order ? confirmByOrder.get(order.id) : undefined);
    if (!co) {
      const coId = `co-${q.id || order.id}`;
      co = {
        id: coId,
        orderId: order.id,
        quotationId: q.id,
        quotationNo: q.quotationNo,
        buyerId,
        buyerName,
        bs: style,
        ourRef: style,
        buyerStyle: q.buyerRef || style,
        po: poNum,
        lot: "1",
        lcContact: "",
        size: "",
        qty: String(qty),
        rate: String(unitPrice),
        value: String(orderValue),
        poDate: dmy(orderDate),
        orgDelDt: dmy(shipDate),
        agreedDt: dmy(shipDate),
        exFactDt: dmy(shipDate),
        cuttableQty: String(qty),
        delMode: "Sea",
        delPort: "",
        orderStatus: q.appStatus === "Confirmed" ? "Confirm" : "Pending",
        entryDt: dmy(orderDate),
        gmtItem: productName,
      };
      confirmOrders.push(co);
      confirmByQuotation.set(q.id, co);
      confirmByOrder.set(order.id, co);
      confirmOrdersChanged = true;
    }

    // Ensure OrderStatus register entry exists
    let os = statusByOrder.get(order.id);
    if (!os) {
      os = {
        id: `os-${order.id}`,
        orderId: order.id,
        buyerId,
        chDt: dmy(orderDate),
        v: "CH",
        mer: q.oMer || "",
        buyer: buyerName,
        ordDt: dmy(orderDate),
        ref: style,
        buyerRef: poNum,
        ordQty: String(qty),
        poNo: poNum,
        poQty: String(qty),
        a: "1",
        pct: "0",
        cuttable: String(qty),
        fab: order.colorway,
        colorQty: String(qty),
        lt: "1",
        lotQty: String(qty),
        delD: dmy(shipDate),
        status: order.stage,
      };
      orderStatuses.push(os);
      statusByOrder.set(order.id, os);
      orderStatusesChanged = true;
    }
  }

  return {
    orders,
    confirmOrders,
    orderStatuses,
    ordersChanged,
    confirmOrdersChanged,
    orderStatusesChanged,
  };
}
