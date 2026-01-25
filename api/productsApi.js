export const fetchProductByBarcodeAPI = async (barcode) => {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3500);

        const res = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
            { signal: controller.signal }
        );

        const data = await res.json();
        if (data.status !== 1) return null;

        return {
            name: data.product.product_name || '',
            brand: data.product.brands || '',
            image: data.product.image_url || '',
        };
    } catch (error) {
        console.log('API error:', error.message);
        return null;
    }
};
