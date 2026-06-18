import { db } from './packages/web/src/config/firebase.js';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';

async function test() {
    try {
        console.log("Adding doc...");
        const docRef = await addDoc(collection(db, 'agenda_surat'), {
            subject: 'Test agenda',
            date: new Date().toISOString()
        });
        const id = docRef.id;
        console.log("Added doc with ID:", id);
        
        // Wait a bit just in case
        await new Promise(r => setTimeout(r, 1000));

        const snap = await getDoc(doc(db, 'agenda_surat', id));
        console.log("Does it exist immediately?", snap.exists());
    } catch (e) {
        console.error(e);
    }
}
test();
