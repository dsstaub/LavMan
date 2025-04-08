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
  const zone = document.getElementById('hour-18');
  const fallback = document.getElementById('Holding');

  flights.forEach((f, idx) => {
    const flightTypeLabel = (f.arrType || '').toUpperCase() === 'TERM' ? 'TF' : 'QT';

    const card = document.createElement('div');
    card.className = `flight-card`;
    card.innerHTML = `
      <strong>${f.flight}</strong> (${f.type}) [${flightTypeLabel}]<br>
      ETA: ${f.eta}<br>
      Gate: <input type="text" value="${f.gate}"><br>
      Tail: <input type="text" value="${f.tail}">
    `;

    const hour = f.eta.split(':')[0];
    if (hour === '18') {
      zone.appendChild(card);
    } else {
      fallback.appendChild(card);
    }
  });
}
