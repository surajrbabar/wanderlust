document.addEventListener("DOMContentLoaded", function () {
    let checkIn = document.getElementById("checkIn");
    let checkOut = document.getElementById("checkOut");
    let totalCostSpan = document.getElementById("totalCost");
    let hiddenTotalCost = document.getElementById("hiddenTotalCost");
    let pricePerNight = listingCost;

    function calculateCost() {
        let startDate = new Date(checkIn.value);
        let endDate = new Date(checkOut.value);
        let timeDiff = endDate - startDate;
        let nights = timeDiff / (1000 * 3600 * 24);

        if (nights > 0) {
            let totalCost = nights * pricePerNight;
            totalCostSpan.textContent = totalCost.toLocaleString("en-IN");
            hiddenTotalCost.value = totalCost.toLocaleString("en-IN");
        } else {
            totalCostSpan.textContent = "0";
            hiddenTotalCost.value = "0";
        }
    }

    checkIn.addEventListener("change", calculateCost);
    checkOut.addEventListener("change", calculateCost);
});