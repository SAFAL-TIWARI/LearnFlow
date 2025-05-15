import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const fetchResources = async () => {
  const querySnapshot = await getDocs(collection(db, "resources"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
