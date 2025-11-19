
export const exportToCsv = (filename: string, data: any[]) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => {
      return headers.map(fieldName => {
        const value = row[fieldName];
        // Handle arrays (like PAA questions) or objects by converting to string
        const stringValue = value === null || value === undefined ? '' : String(value);
        
        // Escape double quotes by replacing " with ""
        const escapedValue = stringValue.replace(/"/g, '""');
        
        // Wrap in quotes if it contains comma, newline or double quote to preserve CSV structure
        if (escapedValue.includes(',') || escapedValue.includes('\n') || escapedValue.includes('"')) {
            return `"${escapedValue}"`;
        }
        return escapedValue;
      }).join(',');
    })
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
