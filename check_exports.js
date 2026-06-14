import * as ck from 'ckeditor5';
console.log(Object.keys(ck).filter(k => k.includes('FileRepository') || k.includes('ImageUpload') || k.includes('uploadImage') || k.includes('Adapter')));
