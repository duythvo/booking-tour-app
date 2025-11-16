import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
  
  const newList = { 
    id: Date.now().toString(), 
    name, 
    tours: [],
    createdAt: new Date().toISOString()
  };
  
  const docRef = doc(db, "savedLists", user.uid);
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    // Đã có document, thêm list mới
    const currentLists = snap.data().lists || [];
    await updateDoc(docRef, { 
      lists: [...currentLists, newList] 
    });
  } else {
    // Chưa có document, tạo mới
    await setDoc(docRef, { 
      lists: [newList],
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  }
  
  return newList;
});

export const addTourToList = createAsyncThunk(
  'saved/add', 
  async ({ listId, tour }, { rejectWithValue }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    
    const docRef = doc(db, "savedLists", user.uid);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) {
      return rejectWithValue("Saved lists not found");
    }
    
    const lists = snap.data().lists || [];
    const listIndex = lists.findIndex(l => l.id === listId);
    
    if (listIndex === -1) {
      return rejectWithValue("List not found");
    }
    
  
    const existingTour = lists[listIndex].tours.find(t => t.id === tour.id);
    if (existingTour) {
      return rejectWithValue("Tour already exists in this list");
    }
    
    // Thêm tour vào list
    lists[listIndex].tours.push({
      ...tour,
      addedAt: new Date().toISOString()
    });
    
    await updateDoc(docRef, { lists });
    
    return { listId, tour };
  }
);

export const removeTourFromList = createAsyncThunk(
  'saved/remove',
  async ({ listId, tourId }, { getState }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const { lists } = getState().saved;
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          tours: list.tours.filter(t => t.id !== tourId)
        };
      }
      return list;
    });

    const docRef = doc(db, "savedLists", user.uid);
    await updateDoc(docRef, { lists: updatedLists });

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
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSavedLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
      })
      .addCase(fetchSavedLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create
      .addCase(createNewList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
      })
      
      // Add tour
      .addCase(addTourToList.fulfilled, (state, action) => {
        const { listId, tour } = action.payload;
        const list = state.lists.find(l => l.id === listId);
        if (list) {
          list.tours.push(tour);
        }
      })
      .addCase(addTourToList.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Remove tour
      .addCase(removeTourFromList.fulfilled, (state, action) => {
        const { listId, tourId } = action.payload;
        const list = state.lists.find(l => l.id === listId);
        if (list) {
          list.tours = list.tours.filter(t => t.id !== tourId);
        }
      })
      
      // Delete list
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter(l => l.id !== action.payload);
      });
  },
});

export const { clearError } = savedSlice.actions;
export default savedSlice.reducer;