let flights = [];

document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
};

document.getElementById('csvUpload').addEventListener('change', function(e) {
    Papa.parse(e.target.files[0], {
        header: true,
        complete: (results) => {
            flights = results.data.filter(f => 
                f['Carrier'] === 'AA' || f['Arr. Type'] === 'Term'
            ).map(f => ({
                flight: f['Arr. Flt.'],
                eta: f['ETA/Actual'],
                gate: f['ETA/Actual Gate'],
                tail: f['Tail #'],
                type: f['Equip.'],
                carrier: f['Carrier'],
                arrType: f['Arr. Type']
            }));
            renderFlights();
        }
    });
});

function renderFlights() {
    document.getElementById('Pending').innerHTML = '';
    flights.forEach((f, idx) => {
        const flightTypeLabel = (f.arrType === 'Term') ? 'TF' : 'QT';

        let card = document.createElement('div');
        card.className = `flight-card ${f.carrier === 'AA' ? 'mainline' : 'regional'}`;
        card.innerHTML = `
            <strong>${f.flight}</strong> (${f.type}) [${flightTypeLabel}]<br>
            ETA: ${f.eta}<br>
            Gate: <input type="text" value="${f.gate}" onchange="updateFlight(${idx}, 'gate', this.value)"><br>
            Tail: <input type="text" value="${f.tail}" onchange="updateFlight(${idx}, 'tail', this.value)">
        `;
        card.dataset.index = idx;
        document.getElementById('Pending').appendChild(card);
    });
    makeSortable();
}

function updateFlight(index, field, value) {
    flights[index][field] = value;
}

function makeSortable() {
    const containers = [
        'Pending','CXL','Delayed','Holding','Serviced',
        'hour-15','hour-16','hour-17','hour-18','hour-19',
        'hour-20','hour-21','hour-22','hour-23','hour-24','hour-01'
    ];

    containers.forEach(id => {
        new Sortable(document.getElementById(id), {
            group: 'flights',
            animation: 150,
            onAdd: function(evt) {
                if (evt.to.id === 'Serviced') {
                    const now = new Date();
                    const hrs = now.getHours().toString().padStart(2, '0');
                    const mins = now.getMinutes().toString().padStart(2, '0');
                    evt.item.innerHTML += `<br><small>Serviced at ${hrs}:${mins}</small>`;
                }
            }
        });
    });
}
