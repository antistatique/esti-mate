export async function fetchAirtableData(table, settings) {
  const url = `https://api.airtable.com/v0/${settings.airtableWorkspace}/${table}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${settings.airtableKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.records;
}
