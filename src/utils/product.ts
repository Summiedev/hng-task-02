import { Product, UnitOption } from '../types/index.js';

export function getUnitOptions(product: Product): UnitOption[] {
  return product.unit_options?.length
    ? product.unit_options
    : [{ label: product.weight || '1 pack', price: product.price }];
}

export function getSelectedUnit(product: Product, label?: string): UnitOption {
  const options = getUnitOptions(product);
  return options.find((option) => option.label === label) || options[0];
}
