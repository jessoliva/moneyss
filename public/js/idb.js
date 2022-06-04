let db;
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_money', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadMoney();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_money'], 'readwrite');
    const moneyObjectStore = transaction.objectStore('new_money');
    moneyObjectStore.add(record);
}

function uploadMoney() {
    const transaction = db.transaction(['new_money'], 'readwrite');
    const moneyObjectStore = transaction.objectStore('new_money');
    const allMoney = moneyObjectStore.allMoney();

    allMoney.onsuccess = function () {
        if (allMoney.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(allMoney.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    throw new Error(data);
                }

                const transaction = db.transaction(['new_money'], 'readwrite');
                const moneyObjectStore = transaction.objectStore('new_money');
                moneyObjectStore.clear();

                document.location.reload();
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

window.addEventListener('online', uploadMoney);