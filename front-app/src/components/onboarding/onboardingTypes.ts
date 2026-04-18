export type Step = 1 | 2 | 3;

export interface BusinessFields {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  description: string;
  currency: string;
}

export interface ServiceDraft {
  name: string;
  description: string;
  duration: string;
  price: string;
  categoryId: string;
}

export const EMPTY_SERVICE: ServiceDraft = {
  name: "",
  description: "",
  duration: "",
  price: "",
  categoryId: "",
};
