import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../config/firebase';
import { UserProfile, userProfileConverter } from '../types';

export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid).withConverter(userProfileConverter);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp() as any,
    };
    await setDoc(userRef, newProfile);
    return {
      ...newProfile,
      createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    };
  }

  return userSnap.data();
}
