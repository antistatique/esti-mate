export async function fetchAirtableData(table, settings) {
  let allRecords = [];
  let offset = null;
  
  do {
    const url = new URL(`https://api.airtable.com/v0/${settings.airtableWorkspace}/${table}`);
    if (offset) {
      url.searchParams.append('offset', offset);
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${settings.airtableKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset; // Will be undefined if no more pages
    
    // Optional: Log pagination progress (remove if too verbose)
    if (data.records.length === 100) {
      console.log(`🔄 Fetched ${data.records.length} records from ${table}, total so far: ${allRecords.length}`);
    }
    
  } while (offset); // Continue while there's an offset (more pages)
  
  if (allRecords.length > 100) {
    console.log(`✅ Finished fetching ${allRecords.length} total records from ${table} (paginated)`);
  }
  return allRecords;
}
