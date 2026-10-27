import jsQR from 'jsqr';

export async function recognize(base64, language, options = {}) {
    let canvas = document.createElement('CANVAS');
    let ctx = canvas.getContext('2d');
    base64 = 'data:image/png;base64,' + base64;
    let img = new Image();
    img.crossOrigin = 'anonymous';
    let imgdata = await new Promise((resolve, reject) => {
        img.onload = () => {
            canvas.height = img.height;
            canvas.width = img.width;
            const height = img.height;
            const width = img.width;
            if (height === 0 || width === 0) {
                reject('Invalid image');
                return;
            }
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, width, height);
            resolve({ data, height, width });
        };
        img.onerror = () => {
            reject('Failed to load image');
        };
        img.src = base64;
    });

    const code = jsQR(imgdata.data.data, imgdata.width, imgdata.height);
    if (code) {
        return code.data;
    } else {
        throw 'QR code not recognized or multiple QR codes exist';
    }
}

export * from './Config';
export * from './info';
