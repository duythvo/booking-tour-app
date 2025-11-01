
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const initialState = {
  lists: [],
  loading: false,
  error: null,
};

export const fetchSavedLists = createAsyncThunk('saved/fetch', async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const docRef = doc(db, "savedLists", user.uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().lists : [];
});

export const createNewList = createAsyncThunk('saved/create', async (name) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const newList = { id: Date.now().toString(), name, tours: [] };
  const docRef = doc(db, "savedLists", user.uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await updateDoc(docRef, { lists: arrayUnion(newList) });
  } else {
    await setDoc(docRef, { lists: [newList] });
  }
  return newList;
});

export const addTourToList = createAsyncThunk('saved/add', async ({ listId, tour }) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const docRef = doc(db, "savedLists", user.uid);
  const snap = await getDoc(docRef);
  const lists = snap.data().lists;
  const list = lists.find(l => l.id === listId);
  if (list.tours.find(t => t.id === tour.id)) return list;
  list.tours.push(tour);
  await updateDoc(docRef, { lists });
  return { listId, tour };
});

const savedSlice = createSlice({
  name: 'saved',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedLists.fulfilled, (state, action) => {
        state.lists = action.payload;
        state.loading = false;
      })
      .addCase(fetchSavedLists.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
      })
      .addCase(addTourToList.fulfilled, (state, action) => {
        const { listId, tour } = action.payload;
        const list = state.lists.find(l => l.id === listId);
        if (list && !list.tours.find(t => t.id === tour.id)) {
          list.tours.push(tour);
        }
      });
  },
});

export default savedSlice.reducer;