const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function dinero(valor) {
  return formatoCOP.format(Number(valor) || 0);
}
