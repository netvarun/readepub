let xyz = "Outside";

try {
     let xyz = "Inside";

    throw new Error("Blah");
} catch (err) {
    console.log(xyz);
}

console.log(xyz);
