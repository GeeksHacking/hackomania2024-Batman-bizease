import { Storage } from "@google-cloud/storage";
import fs from 'fs';

export async function downloadDocument(fileKey: string) {
  try {
    const storage = new Storage();
    const folder = '/tmp/'
    const fileDestination = `/tmp/${fileKey}`;

    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder, {recursive: true});
    }

    const options = {
      destination: fileDestination,
    };

    // Downloads the file
    await storage.bucket("every-document").file(fileKey).download(options);
    return fileDestination
  } catch (error) {
    console.error(error);
  }
}

export async function getDocumentUrl(fileKey: string) {
  try {
    const storage = new Storage();
    const url = storage.bucket("every-document").file(fileKey).publicUrl();

    return url
  } catch (error) {
    console.error(error);
  }
}
