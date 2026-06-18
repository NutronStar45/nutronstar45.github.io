try {
    const response = await fetch("/src/math/metadata.json");
    if (!response.ok) {
        throw new Error(`Error fetching metadata.json: HTTP ${response.status}`);
    }
    const metadata = await response.json();
    console.log(metadata);
}
catch (e) {
    console.error(e);
}
export {};
