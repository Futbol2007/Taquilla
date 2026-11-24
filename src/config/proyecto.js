const api = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

export const proyecto = {
  id: "taquilla",
  nombre: "taquilla",
  api,
};
