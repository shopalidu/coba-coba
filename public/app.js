document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const addBtn = document.getElementById('addBtn');
    const searchInput = document.getElementById('searchInput');
    const searchDirection = document.getElementById('searchDirection');
    const resultsContainer = document.getElementById('results');

    // Search Function
    searchBtn.addEventListener('click', async () => {
        const term = searchInput.value.trim();
        const direction = searchDirection.value;

        if (!term) {
            alert('Silakan masukkan kata kunci pencarian.');
            return;
        }

        try {
            const response = await fetch(`/api/search?term=${encodeURIComponent(term)}&direction=${direction}`);
            const data = await response.json();

            displayResults(data, direction);
        } catch (error) {
            console.error('Error searching:', error);
            resultsContainer.innerHTML = '<p class="error">Terjadi kesalahan saat mencari.</p>';
        }
    });

    // Add Word Function
    addBtn.addEventListener('click', async () => {
        const indonesian = document.getElementById('newIndonesian').value.trim();
        const tae = document.getElementById('newTae').value.trim();
        const messageEl = document.getElementById('addMessage');

        if (!indonesian || !tae) {
            messageEl.textContent = 'Harap isi kedua kolom.';
            messageEl.className = 'message error';
            return;
        }

        try {
            const response = await fetch('/api/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ indonesian, tae })
            });

            const result = await response.json();

            if (response.ok) {
                messageEl.textContent = 'Kata berhasil ditambahkan!';
                messageEl.className = 'message success';
                // Clear inputs
                document.getElementById('newIndonesian').value = '';
                document.getElementById('newTae').value = '';
            } else {
                messageEl.textContent = result.message || 'Gagal menambahkan kata.';
                messageEl.className = 'message error';
            }
        } catch (error) {
            console.error('Error adding word:', error);
            messageEl.textContent = 'Terjadi kesalahan jaringan.';
            messageEl.className = 'message error';
        }
    });

    function displayResults(data, direction) {
        resultsContainer.innerHTML = '';

        if (data.length === 0) {
            resultsContainer.innerHTML = '<p>Tidak ada hasil ditemukan.</p>';
            return;
        }

        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-item';

            // Determine display order based on direction
            const fromLang = direction === 'id-tae' ? 'Indonesia' : "Tae'";
            const toLang = direction === 'id-tae' ? "Tae'" : 'Indonesia';
            const fromWord = direction === 'id-tae' ? item.indonesian : item.tae;
            const toWord = direction === 'id-tae' ? item.tae : item.indonesian;

            const strongFrom = document.createElement('strong');
            strongFrom.textContent = fromWord;

            const strongTo = document.createElement('strong');
            strongTo.textContent = toWord;

            div.appendChild(strongFrom);
            div.appendChild(document.createTextNode(` (${fromLang}) -> `));
            div.appendChild(strongTo);
            div.appendChild(document.createTextNode(` (${toLang})`));

            resultsContainer.appendChild(div);
        });
    }
});
