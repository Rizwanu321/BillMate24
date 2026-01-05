/**
 * Currency formatting utility for Indian Rupee (INR)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Compact currency format for large numbers
 */
export function formatCompactCurrency(amount: number): string {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
}
