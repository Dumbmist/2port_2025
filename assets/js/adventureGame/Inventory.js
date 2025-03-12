let inventoryItems = [];

let imagePath;

const itemImages = {
    "spoon":  "/images/gamify/koy.png",
    "key":  "/images/gamify/key.png",
};

export function setPath(path){
    imagePath = path;
    console.log(imagePath);
}

function updateInventory() {
    const inventory = document.getElementById("inventory");
    if (!inventory) return;

    inventory.innerHTML = ""; // Clear old items

    // Create 4 slots, even if not all are filled
    for (let i = 0; i < 4; i++) {
        const slot = document.createElement("div");
        slot.className = "inventory-slot";

        // Consistent styling for all slots
        Object.assign(slot.style, {
            backgroundColor: "rgba(0, 0, 0, 0.7)", // Slightly transparent black
            border: "3px solid goldenrod", // More elegant border
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 5px", // Reduced vertical margin, kept horizontal spacing
            boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)" // Subtle glow effect
        });

        // Add item to slot if exists
        if (inventoryItems[i]) {
            const img = document.createElement("img");
            img.src = imagePath + itemImages[inventoryItems[i]] || imagePath + "/assets/images/default.png";
            img.alt = inventoryItems[i];
            img.style.width = "35px";
            img.style.height = "35px";
            slot.appendChild(img);
        }

        inventory.appendChild(slot);
    }
}

export function addItemToInventory(itemName) {
    if (inventoryItems.length < 4) { // Limit inventory slots
        inventoryItems.push(itemName);
        localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
    } else {
        alert("Inventory full!");
    }
    updateInventory();
}

export function removeItemFromInventory(itemName) {
    const index = inventoryItems.indexOf(itemName);
    if (index > -1) {
        inventoryItems.splice(index, 1); // Remove item from array
        localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems)); // Save updated inventory
        updateInventory(); // Update inventory UI
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const inventory = document.getElementById("inventory");
    if (!inventory) {
        console.error("Inventory container not found!");
        return;
    }

    // Improved inventory container styling
    Object.assign(inventory.style, {
        display: "flex", // Changed from grid to flex
        flexDirection: "row", // Horizontal layout
        justifyContent: "center", // Center slots horizontally
        alignItems: "flex-start", // Align to top of screen
        position: "fixed", // Position relative to viewport
        top: "10px", // Small padding from top
        left: "50%", // Center horizontally
        transform: "translateX(-50%)", // Adjust for true center
        padding: "10px",
        border: "4px solid goldenrod",
        borderRadius: "10px",
        backgroundColor: "rgba(50, 50, 50, 0.8)",
        zIndex: "10" // Ensure it's above other game elements
    });

    updateInventory();
});

document.addEventListener("keydown", function(event) {
    if (event.key === "q" || event.key === "Q") {
        removeItemFromInventory("spoon");
    }
});