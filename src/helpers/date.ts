export function parseDate(dateString: string) {
    // Check if it's in DD/MM/YYYY format
    const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(ddmmyyyyPattern);

    if (match) {
        const [, day, month, year] = match;
        // Create date in YYYY-MM-DD format
        const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return new Date(isoString);
    }

    // Fall back to standard Date parsing
    return new Date(dateString);
}