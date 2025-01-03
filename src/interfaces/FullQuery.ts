interface FullQuery {
    operator: "AND" | "OR";
    value: string;
    property: "liquid_value";
}

export type { FullQuery };