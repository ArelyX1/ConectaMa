import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

export const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 4],
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  } else {
    throw new Error("No image selected");
  }
};

export const uploadImage = async (uri, userId) => {
  const storage = getStorage();
  const firestore = getFirestore();
  const userRef = doc(firestore, "Users", userId);
  
  const userDoc = await getDoc(userRef);
  const currentProfileImage = userDoc.data().profileImage;

  if (currentProfileImage) {
    const previousImageRef = ref(storage, currentProfileImage);
    try {
      await deleteObject(previousImageRef);
    } catch (error) {
      console.log("Error al eliminar la imagen anterior:", error);
    }
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `profileImage/${userId}`);
  await uploadBytes(storageRef, blob);

  const downloadURL = await getDownloadURL(storageRef);

  await updateDoc(userRef, {
    profileImage: downloadURL,
  });

  return downloadURL;
};
