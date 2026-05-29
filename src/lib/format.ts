export const money = (n: number) => `$${n.toFixed(2)}`;

let _id = 0;
export const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}_${_id++}`;
