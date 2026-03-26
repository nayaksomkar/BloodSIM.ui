/**
 * BloodSIM Dashboard JavaScript
 * Handles data loading, UI updates, and CSV export
 */

// Path to the JSON data file
const FILE = 'blooddata.json';

/**
 * Load blood inventory data from server and update UI
 */
async function loadData() {
    try {
        const response = await fetch('/blooddata.json');
        const data = await response.json();
        updateTable(data);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

/**
 * Update the HTML table with blood inventory data
 * @param {Object} data - Blood inventory data from JSON
 */
function updateTable(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    let totalA = 0, totalB = 0, totalC = 0;

    // Iterate through each blood type and create table rows
    for (const [bloodType, hospitals] of Object.entries(data)) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${bloodType}</strong></td>
            <td>${hospitals["Hospital A"]}</td>
            <td>${hospitals["Hospital B"]}</td>
            <td>${hospitals["Hospital C"]}</td>
        `;
        tbody.appendChild(row);

        // Accumulate totals
        totalA += hospitals["Hospital A"] || 0;
        totalB += hospitals["Hospital B"] || 0;
        totalC += hospitals["Hospital C"] || 0;
    }

    // Update all stat displays
    const total = totalA + totalB + totalC;
    document.getElementById('total').textContent = total;
    document.getElementById('hospital-a').textContent = totalA;
    document.getElementById('hospital-b').textContent = totalB;
    document.getElementById('hospital-c').textContent = totalC;
    document.getElementById('total-a').textContent = totalA;
    document.getElementById('total-b').textContent = totalB;
    document.getElementById('total-c').textContent = totalC;
}

/**
 * Send modify request to server (add or remove blood)
 * @param {string} action - 'add' or 'remove'
 */
async function modifyData(action) {
    try {
        const response = await fetch('/api/modify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        
        if (response.ok) {
            loadData();  // Reload data after modification
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Add random blood units to all hospitals
 */
function addBlood() {
    modifyData('add');
}

/**
 * Remove random blood units from all hospitals
 */
function removeBlood() {
    modifyData('remove');
}

/**
 * Download current inventory data as CSV file
 * Filename includes current date
 */
function downloadCSV() {
    fetch('/blooddata.json')
        .then(response => response.json())
        .then(data => {
            let csv = 'Blood Group,Hospital A,Hospital B,Hospital C\n';
            
            // Build CSV rows from data
            for (const [bloodType, hospitals] of Object.entries(data)) {
                csv += `${bloodType},${hospitals["Hospital A"]},${hospitals["Hospital B"]},${hospitals["Hospital C"]}\n`;
            }

            // Add totals row
            const totalA = document.getElementById('total-a').textContent;
            const totalB = document.getElementById('total-b').textContent;
            const totalC = document.getElementById('total-c').textContent;
            csv += `Total,${totalA},${totalB},${totalC}\n`;

            // Generate filename with current date
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            
            // Trigger download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `blood_inventory_${dateStr}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        });
}

// Load data on page initialization
loadData();