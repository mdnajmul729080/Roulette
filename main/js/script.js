class Player {
    constructor(money) {
        this.money = money
    }
}

let gambler = new Player(1000)

let roundResult = null;
let roundWinnings = 0;

const valueOfChips = document.getElementById("chipsValue")
if (valueOfChips) {
    valueOfChips.textContent = `Player Chips | Total Value: $${gambler.money}`
}

let chipWallet = gambler.money

const newGameAudio = document.getElementById("newGameAudio")
function newGameSound() {
    if (newGameAudio) newGameAudio.play().catch(() => {});
}

const clearBetsAudio = document.getElementById("clearBetsAudio")
function clearBetsSound() {
    if (clearBetsAudio) clearBetsAudio.play().catch(() => {});
}

const placeBetsAudio = document.getElementById("placeBetsAudio")
function placeBetsSound() {
    if (placeBetsAudio) placeBetsAudio.play().catch(() => {});
}

const chip1 = document.getElementById("chip_1")
const chip2 = document.getElementById("chip_5")
const chip3 = document.getElementById("chip_25")
const chip4 = document.getElementById("chip_100")
const chip5 = document.getElementById("chip_500")
const chips = document.querySelectorAll(".chips");

chips.forEach(chip => {
    chip.addEventListener("click", function () {
        chips.forEach(chip => {
            chip.classList.remove("betChoice");
            chip.style.filter = "grayscale(0)";
        })
        chip.classList.add("betChoice");
        chip.style.filter = "grayscale(0.85)";
    });
});


const rouletteBets = document.querySelectorAll(".topRowBet, .middleRowBet, .bottomRowBet, .spaceBet, .outsideTop, .outsideBottom")

const betAmountText = document.querySelector(".betAmountThisRound")

let betAmount = 0;

rouletteBets.forEach(rouletteBet => {
    rouletteBet.addEventListener("click", function () {

        if (chipWallet === 0) {
            // alert("You're out of money. Press new game to play again!");
            rouletteWheel.style.animation = "";
            modalContentNoMoney();
            openModal();
            // return;
        }
        const currentChip = document.querySelector(".betChoice")
        if (currentChip) {
            const chipValue = parseInt(currentChip.getAttribute("data-value"));
            if (betAmount + chipValue <= chipWallet) {
                betAmount += chipValue
                betAmountText.textContent = `Current Bet: ${betAmount}`;
                const chipImg = currentChip.getAttribute("src");
                const placeNewChip = document.createElement("img");
                placeNewChip.src = chipImg;
                placeNewChip.className = "temporaryBet playerBet"
                placeNewChip.style.width = "30px"
                placeNewChip.style.height = "30px"
                rouletteBet.appendChild(placeNewChip);
            } else {
                rouletteWheel.style.animation = "";
                modalContentBetExceed();
                openModal();
                // alert("Cannot make bet. Bet amount would exceed player money.")
            }
        }
    });
});


function removeChips() {
    const tempBets = document.querySelectorAll(".temporaryBet")
    tempBets.forEach(tempBet => {
        tempBet.remove();
    });
    betAmount = 0;
    betAmountText.textContent = `Current Bet: ${betAmount}`;
    gameHistory("You removed your bets.");
    clearBetsSound();
};
const clearBets = document.getElementById("removeBets")
clearBets.addEventListener("click", removeChips);

// Above is for pressing clear bets button
// Below is needed for the end of finalize bets to removeChips

function removeChipsAfterRound() {
    const tempBets = document.querySelectorAll(".temporaryBet")
    tempBets.forEach(tempBet => {
        tempBet.remove();
    });
    betAmount = 0;
    betAmountText.textContent = `Current Bet: ${betAmount}`;
};

function updateRound() {
    const roundTracker = document.getElementById("roundTracker")
    let round = Number(roundTracker.textContent.split(":")[1]);
    round += 1;
    roundTracker.textContent = `Round: ${round}`;
};

function newMoneyTotal() {
    chipWallet -= betAmount;
    valueOfChips.textContent = `Player Chips | Total Value: $${chipWallet}`;
};

const playRound = document.getElementById("playRound")
playRound.addEventListener("click", function playRound() {
    newMoneyTotal();
    updateRound();
    roundResult = spinWheel();
    placeBetsSound();
    setTimeout(() => {
        checkCondition();
        removeChipsAfterRound();
        if (chipWallet === 0) {
            gameHistory(`Out of money. Press New Game to reset your wallet.`)
        };
    }, 0);
});

function moneyAfterWin() {
    chipWallet += roundWinnings;
    valueOfChips.textContent = `Player Chips | Total Value: $${chipWallet}`;
}

let payouts = {
    singleBetWin: {
        singleNumWinZero: ["0"],
        singleNumZeroZero: ["00"],
        singleNumOne: [1],
        singleNumTwo: [2],
        singleNumThree: [3],
        singleNumFour: [4],
        singleNumFive: [5],
        singleNumSix: [6],
        singleNumSeven: [7],
        singleNumEight: [8],
        singleNumNine: [9],
        singleNumTen: [10],
        singleNumEleven: [11],
        singleNumTwelve: [12],
        singleNumThirteen: [13],
        singleNumFourt: [14],
        singleNumFifth: [15],
        singleNumSixth: [16],
        singleNumSeventh: [17],
        singleNumEighteen: [18],
        singleNumnNineth: [19],
        singleNumTwenty: [20],
        singleNumTwentyOne: [21],
        singleNumTwentyTwo: [22],
        singleNumTwentyThree: [23],
        singleNumTwentyFour: [24],
        singleNumTwentyFive: [25],
        singleNumTwentySix: [26],
        singleNumTwentySeven: [27],
        singleNumTwentyEight: [28],
        singleNumTwentyNine: [29],
        singleNumThirty: [30],
        singleNumThirtyOne: [31],
        singleNumThirtyTwo: [32],
        singleNumThirtyThree: [33],
        singleNumThirtyFour: [34],
        singleNumThirtyFive: [35],
        singleNumThirtySix: [36],
    },
    doubleBet: {
        twoA: [1, 2],
        twoB: [1, 4],
        twoC: [2, 3],
        twoD: [2, 5],
        twoE: [3, 6],
        twoF: [4, 5],
        twoG: [4, 7],
        twoH: [5, 6],
        twoI: [5, 8],
        twoJ: [6, 9],
        twoK: [7, 8],
        twoL: [7, 10],
        twoM: [8, 9],
        twoN: [8, 11],
        twoO: [9, 12],
        twoP: [10, 11],
        twoQ: [10, 13],
        twoR: [11, 12],
        twoS: [11, 14],
        twoT: [12, 15],
        twoU: [13, 14],
        twoV: [13, 16],
        twoW: [14, 15],
        twoX: [14, 17],
        twoY: [15, 18],
        twoZ: [16, 17],
        twoAa: [16, 19],
        twoAb: [17, 18],
        twoAc: [17, 20],
        twoAd: [18, 21],
        twoAe: [19, 20],
        twoAf: [19, 22],
        twoAg: [20, 21],
        twoAh: [20, 23],
        twoAi: [21, 24],
        twoAj: [22, 23],
        twoAk: [22, 25],
        twoAl: [23, 24],
        twoAm: [23, 26],
        twoAn: [24, 27],
        twoAo: [25, 26],
        twoAp: [25, 28],
        twoAq: [26, 27],
        twoAr: [26, 29],
        twoAs: [27, 30],
        twoAt: [28, 29],
        twoAu: [28, 31],
        twoAv: [29, 30],
        twoAw: [29, 32],
        twoAx: [30, 33],
        twoAy: [31, 32],
        twoAz: [31, 34],
        twoBa: [32, 33],
        twoBb: [32, 35],
        twoBc: [33, 36],
        twoBd: [34, 35],
        twoBe: [35, 36],
    },
    threeBet: {
        threeA: [1, 2, 3],
        threeB: [4, 5, 6],
        threeC: [7, 8, 9],
        threeD: [10, 11, 12],
        threeE: [13, 14, 15],
        threeF: [16, 17, 18],
        threeG: [19, 20, 21],
        threeH: [22, 23, 24],
        threeI: [25, 26, 27],
        threeJ: [28, 29, 30],
        threeK: [31, 32, 33],
        threeL: [34, 35, 36]
    },
    fourBet: {
        fourA: [1, 2, 4, 5],
        fourB: [2, 3, 5, 6],
        fourC: [4, 5, 7, 8],
        fourD: [5, 6, 8, 9],
        fourE: [7, 8, 10, 11],
        fourF: [8, 9, 11, 12],
        fourG: [10, 11, 13, 14],
        fourH: [11, 12, 14, 15],
        fourI: [13, 14, 16, 17],
        fourJ: [14, 15, 17, 18],
        fourK: [16, 17, 19, 20],
        fourL: [17, 18, 20, 21],
        fourM: [19, 20, 22, 23],
        fourN: [20, 21, 23, 24],
        fourO: [22, 23, 25, 26],
        fourP: [23, 24, 26, 27],
        fourQ: [25, 26, 28, 29],
        fourR: [26, 27, 29, 30],
        fourS: [28, 29, 31, 32],
        fourT: [29, 30, 32, 33],
        fourU: [31, 32, 34, 35],
        fourV: [32, 33, 35, 36],
    },
    sixBet: {
        sixA: [1, 2, 3, 4, 5, 6],
        sixB: [4, 5, 6, 7, 8, 9],
        sixC: [7, 8, 9, 10, 11, 12],
        sixD: [10, 11, 12, 13, 14, 15],
        sixE: [13, 14, 15, 16, 17, 18, 19],
        sixF: [16, 17, 18, 19, 20, 21],
        sixG: [19, 20, 21, 22, 23, 24],
        sixH: [22, 23, 24, 25, 26, 27],
        sixI: [25, 26, 27, 28, 29, 30],
        sixJ: [28, 29, 30, 31, 32, 33],
        sixK: [31, 32, 33, 34, 35, 36]
    },
    outsideTopWin: {
        dozenOneWin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        dozenTwoWin: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        dozenThreeWin: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
        topRowWin: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
        middleRowWin: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
        bottomRowWin: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
    },
    outsideBottomWin: {
        firstHalfWin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        secondHalfWin: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
        redWin: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
        blackWin: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
        evenWin: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
        oddWin: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
    }
}


let wheel = ["0", "00", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]

function spinWheel() {
    let randomWheel = Math.floor(Math.random() * wheel.length)
    return wheel[randomWheel];
};


let restartGame = document.getElementById("newGameButton");
restartGame.addEventListener("click", newGame);

function newGame() {
    chipWallet = 1000;
    valueOfChips.textContent = `Player Chips | Total Value: $${chipWallet}`;
    betAmount = 0;
    betAmountText.textContent = `Current Bet: ${betAmount}`;
    roundTracker.textContent = `Round: 0`;
    newGameSound();
    gameHistory("New game started!");
};

function gameHistory(text, historyLimit = 7) {
    let gameMessage = document.createElement("p");
    gameMessage.textContent = text;
    let textHistory = document.getElementById("textHistory");
    if (textHistory.children.length >= historyLimit) {
        textHistory.removeChild(textHistory.children[0]);
    }
    textHistory.appendChild(gameMessage);
    textHistory.scrollTop = textHistory.scrollHeight;
};


const betNumbers = {
    "0": ["singleNumWinZero"],
    "00": ["singleNumZeroZero"],
    1: ['singleNumOne','twoA','twoB','threeA','fourA','sixA','dozenOneWin','bottomRowWin','firstHalfWin','redWin','oddWin'],
    2: ['singleNumTwo','twoA','twoC','twoD','threeA','fourA','fourB','sixA','dozenOneWin','middleRowWin','firstHalfWin','blackWin','evenWin'],
    3: ['singleNumThree','twoC','twoE','threeA','fourB','sixA','dozenOneWin','topRowWin','firstHalfWin','redWin','oddWin'],
    4: ['singleNumFour','singleNumThirtyFour','twoB','twoF','twoG','threeB','fourA','fourC','sixA','sixB','dozenOneWin','bottomRowWin','firstHalfWin','blackWin','evenWin'],
    5: ['singleNumFive','twoD','twoF','twoH','twoI','threeB','fourA','fourB','fourC','fourD','sixA','sixB','dozenOneWin','middleRowWin','firstHalfWin','redWin','oddWin'],
    6: ['singleNumSix','twoE','twoH','twoJ','threeB','fourB','fourD','sixA','sixB','dozenOneWin','topRowWin','firstHalfWin','blackWin','evenWin'],
    7: ['singleNumSeven','twoG','twoK','twoL','threeC','fourC','fourE','sixB','sixC','dozenOneWin','bottomRowWin','firstHalfWin','redWin','oddWin'],
    8: ['singleNumEight','twoI','twoK','twoM','twoN','threeC', 'fourC','fourD','fourE','fourF','sixB','sixC','dozenOneWin','middleRowWin','firstHalfWin','blackWin','evenWin'],
    9: ['singleNumNine','twoJ','twoM','twoO','threeC','fourD','fourF','sixB','sixC','dozenOneWin','topRowWin','firstHalfWin','redWin','oddWin'],
    10: ['singleNumTen','twoL','twoP','twoQ','threeD','fourE','fourG','sixC','sixD','dozenOneWin','bottomRowWin','firstHalfWin','blackWin','evenWin'],
    11: ['singleNumEleven','twoN','twoP','twoR','twoS','threeD','fourE','fourF','fourG','fourH','sixC','sixD','dozenOneWin', 'middleRowWin','firstHalfWin','blackWin','oddWin'],
    12: ['singleNumTwelve','twoO','twoR','twoT','threeD','fourF','fourH','sixC','sixD','dozenOneWin','topRowWin','firstHalfWin','redWin','evenWin'],
    13: ['singleNumThirteen','twoQ','twoU','twoV','threeE','fourG','fourI','sixD','sixE','dozenTwoWin','bottomRowWin','firstHalfWin','blackWin','oddWin'],
    14: ['singleNumFourt','twoS','twoU','twoW','twoX','threeE','fourG','fourH','fourI','fourJ','sixD','sixE','dozenTwoWin','middleRowWin','firstHalfWin','redWin','evenWin'],
    15: ['singleNumFifth','twoT','twoW','twoY','threeE','fourH','fourJ','sixD','sixE','dozenTwoWin','topRowWin','firstHalfWin','blackWin','oddWin'],
    16: ['singleNumSixth','twoV','twoZ','twoAa','threeF','fourI','fourK','sixE','sixF','dozenTwoWin','bottomRowWin','firstHalfWin','redWin','evenWin'],
    17: ['singleNumSeventh','twoX','twoZ','twoAb','twoAc','threeF','fourI','fourJ','fourK','fourL','sixE','sixF','dozenTwoWin','middleRowWin','firstHalfWin','blackWin','oddWin'],
    18: ['singleNumEighteen','twoY','twoAb','twoAd','threeF','fourJ','fourL','sixE','sixF','dozenTwoWin','topRowWin','firstHalfWin','redWin','evenWin'],
    19: ['singleNumnNineth','twoAa','twoAe','twoAf','threeG','fourK','fourM','sixE','sixF','sixG','dozenTwoWin','bottomRowWin','secondHalfWin','redWin','oddWin'],
    20: ['singleNumTwenty','twoAc','twoAe','twoAg','twoAh','threeG','fourK','fourL','fourM','fourN','sixF','sixG','dozenTwoWin','middleRowWin','secondHalfWin','blackWin','evenWin'],
    21: ['singleNumTwentyOne','twoAd','twoAg','twoAi','threeG','fourL','fourN','sixF','sixG','dozenTwoWin','topRowWin','secondHalfWin','redWin','oddWin'],
    22: ['singleNumTwentyTwo','twoAf','twoAj','twoAk','threeH','fourM','fourO','sixG','sixH','dozenTwoWin','bottomRowWin','secondHalfWin','blackWin','evenWin'],
    23: ['singleNumTwentyThree','twoAh','twoAj','twoAl','twoAm','threeH','fourM','fourN','fourO','fourP','sixG','sixH','dozenTwoWin','middleRowWin','secondHalfWin','redWin','oddWin'],
    24: ['singleNumTwentyFour','twoAi','twoAl','twoAn','threeH','fourN','fourP','sixG', 'sixH','dozenTwoWin','topRowWin','secondHalfWin','blackWin','evenWin'],
    25: ['singleNumTwentyFive','twoAk','twoAo','twoAp','threeI','fourO','fourQ','sixH','sixI','dozenThreeWin','bottomRowWin','secondHalfWin','redWin','oddWin'],
    26: ['singleNumTwentySix','twoAm','twoAo','twoAq','twoAr','threeI','fourO','fourP','fourQ','fourR','sixH','sixI','dozenThreeWin','middleRowWin','secondHalfWin','blackWin','evenWin'],
    27: ['singleNumTwentySeven','twoAn','twoAq','twoAs','threeI','fourP','fourR','sixH','sixI','dozenThreeWin','topRowWin','secondHalfWin','redWin','oddWin'],
    28: ['singleNumTwentyEight','twoAp','twoAt','twoAu','threeJ','fourQ','fourS','sixI','sixJ','dozenThreeWin','bottomRowWin','secondHalfWin','blackWin','evenWin'],
    29: ['singleNumTwentyNine','twoAr','twoAt','twoAv','twoAw','threeJ','fourQ','fourR','fourS','fourT','sixI','sixJ','dozenThreeWin','middleRowWin','secondHalfWin','blackWin','oddWin'],
    30: ['singleNumThirty','twoAs','twoAv','twoAx','threeJ','fourR','fourT','sixI','sixJ','dozenThreeWin','topRowWin','secondHalfWin','redWin','evenWin'],
    31: ['singleNumThirtyOne','twoAu','twoAy','twoAz','threeK','fourS','fourU','sixJ','sixK','dozenThreeWin','bottomRowWin','secondHalfWin','blackWin','oddWin'],
    32: ['singleNumThirtyTwo','twoAw','twoAy','twoBa','twoBb','threeK','fourS','fourT','fourU','fourV','sixJ','sixK','dozenThreeWin','middleRowWin', 'secondHalfWin','redWin','evenWin'],
    33: ['singleNumThirtyThree','twoAx','twoBa','twoBc','threeK','fourT','fourV','sixJ','sixK','dozenThreeWin','topRowWin','secondHalfWin','blackWin','oddWin'],
    34: ['twoAz','twoBd','threeL','fourU','sixK','dozenThreeWin','bottomRowWin','secondHalfWin','redWin','evenWin'],
    35: ['singleNumThirtyFive','twoBb','twoBd','twoBe','threeL','fourU','fourV','sixK','dozenThreeWin','middleRowWin','secondHalfWin','blackWin','oddWin'],
    36: ['singleNumThirtySix','twoBc','twoBe','threeL','fourV','sixK','dozenThreeWin','topRowWin','secondHalfWin','redWin','evenWin'],
}

function checkCondition() {
    let win = false;
    let lastClass = null;
    let winningBet = null;
    let losingBet = null;

    document.querySelectorAll(".playerBet").forEach(bet => {
        lastClass = bet.parentElement.classList[bet.parentElement.classList.length - 1];
        let betSectionName = betNumbers[roundResult];
        if (betSectionName && betSectionName.includes(lastClass)) {
            win = true;
            winningBet = bet;
        } else {
            losingBet = bet;
        }
    });

    if (win) {
        if (Object.keys(payouts.singleBetWin).includes(lastClass)) {
            modalContentWinThirtyFive();
            openModal();
            spinRouletteWheel();
            // alert(`The ball landed on ${roundResult}. You won 35 to 1`);
            roundWinnings = (betAmount * 36);
            gameHistory(`Dealer: The ball lands on ${roundResult}`);
            gameHistory(`You bet $${betAmount} on '${winningBet.parentElement.innerText.trim()}' and won $${roundWinnings}`);
            moneyAfterWin();
        }
        else if (Object.keys(payouts.doubleBet).includes(lastClass)) {
            modalContentWinSeventeen();
            openModal();
            spinRouletteWheel();
            // alert(`The ball landed on ${roundResult}. You won 17 to 1`);
            roundWinnings = (betAmount * 18);
            gameHistory(`Dealer: The ball lands on ${roundResult}`);
            gameHistory(`You bet $${betAmount} on '${winningBet.parentElement.innerText.trim()}' and won $${roundWinnings}`);
            moneyAfterWin();
        }
        else if (Object.keys(payouts.threeBet).includes(lastClass)) {
            modalContentWinEleven();
            openModal();
            spinRouletteWheel();
            // alert(`The ball landed on ${roundResult}. You won 11 to 1`);
            roundWinnings = (betAmount * 12);
            gameHistory(`Dealer: The ball lands on ${roundResult}`);
            gameHistory(`You bet $${betAmount} on '${winningBet.parentElement.innerText.trim()}' and won $${roundWinnings}`);
            moneyAfterWin();
        }
        else if (Object.keys(payouts.fourBet).includes(lastClass)) {
            modalContentWinEight();
            openModal();
            spinRouletteWheel();
            // alert(`The ball landed on ${roundResult}. You won 8 to 1`);
            roundWinnings = (betAmount * 9);
            gameHistory(`Dealer: The ball lands on ${roundResult}`);
            gameHistory(`You bet $${betAmount} on '${winningBet.parentElement.innerText.trim()}' and won $${roundWinnings}`);
            moneyAfterWin();
        }
        else if (Object.keys(payouts.sixBet).includes(lastClass)) {
            modalContentWinFive();
            openModal();
            spinRouletteWheel();
            // alert(`The ball landed on ${roundResult}. You won 5 to 1`);
            roundWinnings = (betAmount * 6);
            gameHistory(`Dealer: The ball lands on ${roundResult}`);
            gameHistory(`You bet $${betAmount} on '${winningBet.parentElement.innerText.trim()}' and won $${roundWinnings}`);
            moneyAfterWin();
        }
        else if (Object.keys(payouts.outsideTopWin).includes(lastClass)) {
            modalContentWinTwo();
            openModal();
            spinRouletteWheel();
            // alert(`The ball landed on ${roundResult}. You won 2 to 1`);
            roundWinnings = (betAmount * 3);
            gameHistory(`Dealer: The ball lands on ${roundResult}`);
            gameHistory(`You bet $${betAmount} on '${winningBet.parentElement.innerText.trim()}' and won $${roundWinnings}`);
            moneyAfterWin();
        }
        else if (Object.keys(payouts.outsideBottomWin).includes(lastClass)) {
            modalContentWinOne();
            openModal();
            spinRouletteWheel();
            // alert(`The ball landed on ${roundResult}. You won 1 to 1`);
            roundWinnings = (betAmount * 2);
            gameHistory(`Dealer: The ball lands on ${roundResult}`);
            gameHistory(`You bet $${betAmount} on '${winningBet.parentElement.innerText.trim()}' and won $${roundWinnings}`);
            moneyAfterWin();
        }
    } else {
        modalContentLose();
        openModal();
        spinRouletteWheel();
        // alert(`The ball landed on ${roundResult}. You lost the round.`);
        gameHistory(`Dealer: The ball lands on ${roundResult}`);
        gameHistory(`You bet $${betAmount} on '${losingBet.parentElement.innerText.trim()}' and lost.`);
    }
};

const rouletteWheel = document.getElementById("rouletteWheel");

function spinRouletteWheel() {
    rouletteWheel.style.animation = "spinwheel 5s 1"
};


let modal = document.querySelector(".modal-background");
let closeModal = document.querySelector(".close-modal");
let modalMessage = document.querySelector(".gameProgress");

function modalContentWinOne() {
    modalMessage.innerText = `The ball landed on ${roundResult}. You won 1 to 1.`
};
function modalContentWinTwo() {
    modalMessage.innerText = `The ball landed on ${roundResult}. You won 2 to 1.`
};
function modalContentWinFive() {
    modalMessage.innerText = `The ball landed on ${roundResult}. You won 5 to 1.`
};
function modalContentWinEight() {
    modalMessage.innerText = `The ball landed on ${roundResult}. You won 8 to 1.`
};
function modalContentWinEleven() {
    modalMessage.innerText = `The ball landed on ${roundResult}. You won 11 to 1.`
};
function modalContentWinSeventeen() {
    modalMessage.innerText = `The ball landed on ${roundResult}. You won 17 to 1.`
};
function modalContentWinThirtyFive() {
    modalMessage.innerText = `The ball landed on ${roundResult}. You won 35 to 1.`
};

function modalContentLose() {
    modalMessage.innerText = `The ball landed on ${roundResult}. You lost the round.`
};

function modalContentNoMoney() {
    modalMessage.innerText = "You're out of money. Press new game to play again!"
};

function modalContentBetExceed() {
    modalMessage.innerText = "Cannot make bets that would exceed your cash"
};

function openModal() {
    modal.style.display = "";
};

closeModal.addEventListener("click", function () {
    modal.style.display = "none";
});

window.addEventListener("click", function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});