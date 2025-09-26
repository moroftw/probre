import * as ImagePicker from 'expo-image-picker';
import { saveToAppDir } from './imageStore';

export async function pickAndSaveDogImage() {
  try {
    // verificăm permisiunea
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!current.granted) {
      const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!req.granted) {
        console.log('[pickAndSaveDogImage] Permission not granted');
        return null;
      }
    }

    // încercare cu crop
    try {
      const withCrop = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (withCrop.canceled || !withCrop.assets?.[0]?.uri) return null;
      return await saveToAppDir(withCrop.assets[0].uri);
    } catch (e) {
      console.log('[pickAndSaveDogImage] with crop failed, retrying without crop', e);
    }

    // fallback fără crop
    const noCrop = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (noCrop.canceled || !noCrop.assets?.[0]?.uri) return null;
    return await saveToAppDir(noCrop.assets[0].uri);
  } catch (err) {
    console.log('[pickAndSaveDogImage] fatal error', err);
    return null;
  }
}
