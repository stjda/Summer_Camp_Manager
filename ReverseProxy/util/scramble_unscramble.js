function scrambleAddress(address, forwards = true, backwards = false) {
    if (forwards && !backwards) {
        // Scramble the address
        let scrambled = "";
        for (let i = 0; i < address.length; i++) {
            let charCode = address.charCodeAt(i);
            if (i % 2 === 0) {
                // Left shift for even indices
                charCode = ((charCode - 32 + 5) % 95 + 32);
            } else {
                // Right shift for odd indices
                charCode = ((charCode - 32 - 3 + 95) % 95 + 32);
            }
            scrambled += String.fromCharCode(charCode);
        }
        return scrambled;
    } else if (backwards && !forwards) {
        // Unscramble the address
        let unscrambled = "";
        for (let i = 0; i < address.length; i++) {
            let charCode = address.charCodeAt(i);
            if (i % 2 === 0) {
                // Right shift for even indices (reverse of left shift)
                charCode = ((charCode - 32 - 5 + 95) % 95 + 32);
            } else {
                // Left shift for odd indices (reverse of right shift)
                charCode = ((charCode - 32 + 3) % 95 + 32);
            }
            unscrambled += String.fromCharCode(charCode);
        }
        return unscrambled;
    } else {
        throw new Error("Either 'forwards' or 'backwards' must be true, but not both.");
    }
}

// Example usage:
const originalAddress = "https://34.132.190.248:3000/api/minioP";
// mqymx74,813.8/3.>-3/95?05-5,fmn,rfsftM
// mqymx74,813.8/3.>-3/95?05-5,fmn,rfsftM .. this is the minio password
// // Scramble the address
const scrambled = scrambleAddress(originalAddress, true);
console.log("Scrambled:", scrambled);

// Unscramble the address
const unscrambled = scrambleAddress(scrambled, false, true);
console.log("Unscrambled:", unscrambled);

// Verify if the unscrambled address matches the original
console.log("Matches original:", unscrambled === originalAddress);