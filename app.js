let flights = [];
 
document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
};

document.getElementById('csvUpload').addEventListener('change', function (e) {
    Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(),
        complete: (results) => {
            flights = results.data.filter(f =>
                (f['Carrier'] || '').toString().trim() === 'AA' ||
                (f['Arr. Type'] || '').toString().toUpperCase().includes('TERM')
            ).map(f => {
                return {
                    flight: f['Arr. Flt.']?.toString().trim() || '',
                    eta: f['ETA/Actual']?.toString().trim() || '',
                    gate: f['ETA/Actual Gate']?.toString().trim() || '',
                    tail: f['Tail #']?.toString().trim() || '',
                    type: f['Equip.']?.toString().trim() || '',
                    carrier: f['Carrier']?.toString().trim() || '',
                    arrType: f['Arr. Type']?.toString().trim() || ''
                };
            });
            renderFlights();
        }
    });
});

function renderFlights() {
    const zones = [
        'Pending', 'CXL', 'Delayed', 'Holding', 'Serviced',
        'hour-15','hour-16','hour-17','hour-18','hour-19',
        'hour-20','hour-21','hour-22','hour-23','hour-24','hour-01'
    ];
    zones.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    flights.forEach((f, idx) => {
        const flightTypeLabel = (f.arrType || '').toUpperCase() === 'TERM' ? 'TF' : 'QT';

        const card = document.createElement('div');
        card.className = `flight-card ${f.carrier === 'AA' ? 'mainline' : 'regional'}`;
        card.setAttribute('draggable', 'true');
        card.dataset.index = idx;

        card.innerHTML = `
            <strong>${f.flight}</strong> (${f.type}) [${flightTypeLabel}]<br>
            ETA: ${f.eta}<br>
            Gate: <input type="text" value="${f.gate}" onchange="updateFlight(${idx}, 'gate', this.value)"><br>
            Tail: <input type="text" value="${f.tail}" onchange="updateFlight(${idx}, 'tail', this.value)">
        `;

        const hourBlockId = getHourBlockIdFromETA(f.eta);
        const dropTarget = document.getElementById(hourBlockId) || document.getElementById('Holding');
        dropTarget.appendChild(card);
    });

    makeSortable();
}

function getHourBlockIdFromETA(eta) {
    if (!eta || !eta.includes(':')) return null;
    const hour = parseInt(eta.split(':')[0], 10);
    if (isNaN(hour)) return null;
    if (hour >= 15 && hour <= 24) return `hour-${hour}`;
    if (hour === 0 || hour === 1) return 'hour-01';
    return null;
}

function updateFlight(index, field, value) {
    flights[index][field] = value;
}

function makeSortable() {
    const zoneIds = [
        'Pending', 'CXL', 'Delayed', 'Holding', 'Serviced',
        'hour-15','hour-16','hour-17','hour-18','hour-19',
        'hour-20','hour-21','hour-22','hour-23','hour-24','hour-01'
    ];

    zoneIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            new Sortable(el, {
                group: 'flights',
                animation: 150,
                onAdd: (evt) => {
                    if (evt.to.id === 'Serviced') {
                        const now = new Date();
                        const hrs = String(now.getHours()).padStart(2, '0');
                        const mins = String(now.getMinutes()).padStart(2, '0');
                        evt.item.innerHTML += `<br><small>Serviced at ${hrs}:${mins}</small>`;
                    }
                }
            });
        }
    });
}
