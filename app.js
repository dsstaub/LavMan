let flights = [];

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
        const flight = f['Arr. Flt.']?.trim() || '';
        const eta = f['ETA/Actual']?.trim() || '';
        const gate = f['ETA/Actual Gate']?.trim() || '';
        const tail = f['Tail #']?.trim() || '';
        const type = f['Equip.']?.trim() || '';

        console.log(`Parsed flight ${flight}: tail="${tail}", type="${type}"`);

        return {
          flight,
          eta,
          gate,
          tail,
          type,
          carrier: f['Carrier']?.trim() || '',
          arrType: f['Arr. Type']?.trim() || ''
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

        // Log to confirm which field is being used
        console.log(`>> CARD BUILD >> flight: ${f.flight}, tail: ${f.tail}, type: ${f.type}`);

        const card = document.createElement('div');
        card.className = `flight-card ${f.carrier === 'AA' ? 'mainline' : 'regional'}`;
        card.setAttribute('draggable', 'true');
        card.dataset.index = idx;

        // Temporary visual debugger: red if it's showing tail instead of type
        const debugDisplay = `<span style="color: red; font-weight: bold;">(${f.type})</span>`;

card.innerHTML = `
    <strong>${f.flight}</strong> <span style="color: red;">(TYPE: ${f.type})</span> [${flightTypeLabel}]<br>
    ETA: ${f.eta}<br>
    Gate: <input type="text" value="${f.gate}" onchange="updateFlight(${idx}, 'gate', this.value)"><br>
    Tail: <input type="text" value="${f.tail}" onchange="updateFlight(${idx}, 'tail', this.value)"><br>
    <div style="margin-top: 6px; font-size: 12px; color: yellow;">
        DEBUG — TAIL: ${f.tail} | TYPE: ${f.type}
    </div>
`;

        const hourBlockId = getHourBlockIdFromETA(f.eta);
        const dropTarget = document.getElementById(hourBlockId) || document.getElementById('Holding');
        dropTarget.appendChild(card);
    });

    makeSortable();
}
