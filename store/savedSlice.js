import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';

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
  if (list.tours.find(t => t.id === tour.id)) return { listId, tour };
  list.tours.push(tour);
  await updateDoc(docRef, { lists });
  return { listId, tour };
});

export const removeTourFromList = createAsyncThunk(
  'saved/remove',
  async ({ listId, tourId }, { getState }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const { lists } = getState().saved;
    const list = lists.find(l => l.id === listId);
    if (!list) throw new Error("List not found");

    const updatedTours = list.tours.filter(t => t.id !== tourId);
    const updatedList = { ...list, tours: updatedTours };

    const docRef = doc(db, "savedLists", user.uid);
    await updateDoc(docRef, {
      lists: lists.map(l => l.id === listId ? updatedList : l)
    });

    return { listId, tourId };
  }
);

export const deleteList = createAsyncThunk(
  'saved/delete',
  async (listId, { getState }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const { lists } = getState().saved;
    const updatedLists = lists.filter(l => l.id !== listId);

    const docRef = doc(db, "savedLists", user.uid);
    await updateDoc(docRef, { lists: updatedLists });

    return listId;
  }
);

const savedSlice = createSlice({
  name: 'saved',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedLists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavedLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
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
      })
      .addCase(removeTourFromList.fulfilled, (state, action) => {
        const { listId, tourId } = action.payload;
        const list = state.lists.find(l => l.id === listId);
        if (list) {
          list.tours = list.tours.filter(t => t.id !== tourId);
        }
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter(l => l.id !== action.payload);
      });
  },
});

export default savedSlice.reducer;