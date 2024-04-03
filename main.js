(() => {

    const state = {};

    function shuffle(lst) {
        return lst
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    function round(value) {
        return Math.floor(value * 100) / 100;
    }

    function bankerPercent() {
        return 0.7 - (0.18 * Math.random());
    }

    function setBtns(next, accept, counter) {
        if (next) {
            state.btn.next.classList.remove('deactive');
        } else {
            state.btn.next.classList.add('deactive');
        }
        
        if (accept) {
            state.btn.accept.classList.remove('deactive');
        } else {
            state.btn.accept.classList.add('deactive');
        }

        if (counter) {
            state.btn.counter.classList.remove('deactive');
        } else {
            state.btn.counter.classList.add('deactive');
        }
    }

    function createCase() {
        const bc = document.createElement("div");
        bc.className = "case";
        return bc;
    }

    function createRow() {
        const bc = document.createElement("div");
        bc.className = "row";
        return bc;
    }

    function pushBankRow() {
        const row = createRow();
        const casesLeft = state.selected.reduce((a, c) => a + (c?0:1), 0);
        const caseTotal = Array(26).fill(null).map((e, i) => i).reduce((a, i) => {
            return a + ((state.selected[i]) ? 0 : state.values[i]);
        }, 0);
        const ev = round(caseTotal / casesLeft);
        const offer = round(bankerPercent() * ev);
        state.offer = offer;
        row.innerHTML = `Expected value: $${ev}<br>Banker offer: $${offer}`;
        state.log.appendChild(row);
        state.log.scrollTo(0, state.log.scrollHeight);
    }

    function pushCaseRow() {
        const row = createRow();
        state.selected.forEach((isSelected, index) => {
            const bc = createCase(isSelected);
            if (isSelected) {
                bc.classList.add("selected");
            }
            bc.innerHTML = state.display[index];
            row.appendChild(bc);
        });
        state.log.appendChild(row);
        state.log.scrollTo(0, state.log.scrollHeight);
    }

    function handleNext(e) {
        setBtns(false, false, false);

        if (state.step === state.stepType.CHOOSE) {
            const casesLeft = state.selected.reduce((a, c) => a + (c?0:1), 0);
            const choose = state.caseLookup[casesLeft];

            let count = choose;
            while (count > 0) {
                const bc = state.order.pop();
                state.selected[bc] = true;
                count -= 1;
            }

            pushCaseRow();
            pushBankRow();

            setBtns(true, true, true);

            if (state.selected.reduce((a, c) => a + (c?0:1), 0) === 1) {
                for (let i = 0; i < state.selected.length; i++) {
                    if (!state.selected[i]) {
                        notifyWin(state.values[i]);
                        state.done = true;
                        setBtns(false, false, false);
                        removeEventListeners();
                        break;
                    }
                }
            } else {
                state.step = state.stepType.BANKER;
            }

        } else { // state.stepType.BANKER
            notifyNextSelection();
            state.step = state.stepType.CHOOSE;
            setBtns(true, false, false);

        }
    }

    function handleAccept(e) {
        if (state.step === state.stepType.BANKER) {
            notifyWin(state.offer);
            state.done = true;
            setBtns(false, false, false);
            removeEventListeners();
        }
    }

    function handleCounter(e) {
        if (state.step === state.stepType.BANKER) {
            const counter = window.prompt("Enter counter offer", 1000000);
            const casesLeft = state.selected.reduce((a, c) => a + (c?0:1), 0);
            const caseTotal = Array(26).fill(null).map((e, i) => i).reduce((a, i) => {
                return a + ((state.selected[i]) ? 0 : state.values[i]);
            }, 0);
            const ev = round(caseTotal / casesLeft);
            if (counter === null) {
                setBtns(true, false, false);
                notifyNextSelection();
                state.step = state.stepType.CHOOSE;

            } else if (counter <= 0.75 * ev) {
                notifyWin(round(counter));
                state.done = true;
                setBtns(false, false, false);
                removeEventListeners();

            } else {
                const msg = `Offer of $${round(counter)} refused.`;
                const row = createRow();
                row.innerHTML = msg;
                state.log.appendChild(row);
                notifyNextSelection();
                state.step = state.stepType.CHOOSE;
            }
        }
    }

    function removeEventListeners() {
        state.btn.next.removeEventListener("click", handleNext);
        state.btn.accept.removeEventListener("click", handleAccept);
        state.btn.counter.removeEventListener("click", handleCounter);
    }

    function addEventListeners() {
        state.btn.next.addEventListener("click", handleNext);
        state.btn.accept.addEventListener("click", handleAccept);
        state.btn.counter.addEventListener("click", handleCounter);
    }

    function notifyWin(value) {
        const msg = `You won $${value}!<br>Happy for you, or sorry that happended.`;
        const row = createRow();
        row.innerHTML = msg;
        state.log.appendChild(row);
        state.log.scrollTo(0, state.log.scrollHeight);
    }

    function notifyNextSelection() {
        const casesLeft = state.selected.reduce((a, c) => a + (c?0:1), 0);
        const n = state.caseLookup[casesLeft];
        const msg = `Open ${n} case${(n > 1 ) ? 's' : ''}`;
        const row = createRow();
        row.innerHTML = msg;
        state.log.appendChild(row);
        state.log.scrollTo(0, state.log.scrollHeight);
    }

    function start() {
        state.log = document.querySelector(".log");
        state.info = document.querySelector(".info-area");
        state.btn = {};
        state.btn.next = document.querySelector(".next.btn");
        state.btn.accept = document.querySelector(".accept.btn");
        state.btn.counter = document.querySelector(".counter.btn");

        state.done = false;

        state.selected = Array(26).fill(false);

        // Display numbers for cases
        state.display = [
            '1c', '1', '5', '10', '25', '50', '75', '100', '200', '300', '400', '500', '750', 
            '1k', '5k', '10k', '25k', '50k', '75k', '100k', '200k', '300k', 
            '400k', '500k', '750k', '1M'
        ];

        // Case values
        state.values = [
            0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 750, 
            1000, 5000, 10000, 25000, 50000, 75000, 100000, 200000, 300000, 
            400000, 500000, 750000, 1000000
        ];

        state.caseLookup = { 26: 6, 20: 5, 15: 4, 11: 3, 8: 2, 6: 1, 5: 1, 4: 1, 3: 1, 2: 1 };

        // Order in which to select cases
        state.order = shuffle(Array(26).fill(null).map((e, i) => i));

        state.stepType = { CHOOSE: 0, BANKER: 1};
        state.step = state.stepType.CHOOSE;
        
        setBtns(true, false, false);

        pushCaseRow();

        addEventListeners();

        notifyNextSelection();

    }
    start();
})();