import Subscriber from "@savanapoint/pub-sub";
import { firebaseConfig } from "./firebase";



export const sub = new Subscriber(firebaseConfig)