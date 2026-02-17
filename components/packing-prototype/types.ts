export interface DemoProduct {
  id: string;
  title: string;
  sku: string;
  quantity: number;
  scannedQuantity: number;
  storageLocation: string;
  imageColor: string;
}

export interface DemoOrder {
  orderNumber: string;
  customerName: string;
  platform: string;
  shop: string;
  country: string;
  amount: string;
  items: DemoProduct[];
}

export type ScanState = "idle" | "success" | "error";
