
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

const initialState = {
  lists: [],
  loading: false,
  error: null,
};

// ✅ FIX 1: Fetch saved lists
export const fetchSavedLists = createAsyncThunk('saved/fetch', async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  
  const docRef = doc(db, "savedLists", user.uid);
  const snap = await getDoc(docRef);
  
  return snap.exists() ? snap.data().lists : [];
});

// ✅ FIX 2: Create new list - SỬA ĐỂ KHÔNG BỊ ĐƠ
export const createNewList = createAsyncThunk(
  'saved/create',
  async (name, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      
      const newList = { 
        id: Date.now().toString(), 
        name: name.trim(), 
        tours: [],
        createdAt: new Date().toISOString()
      };
      
      const docRef = doc(db, "savedLists", user.uid);
      
      try {
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          // Document đã tồn tại - dùng arrayUnion
          await updateDoc(docRef, { 
            lists: arrayUnion(newList)
          });
        } else {
          // Document chưa tồn tại - tạo mới
          await setDoc(docRef, { 
            lists: [newList],
            userId: user.uid,
            createdAt: new Date().toISOString()
          });
        }
        
        return newList;
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        return rejectWithValue(firestoreError.message);
      }
    } catch (error) {
      console.error("Create list error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// ✅ FIX 3: Add tour to list - KIỂM TRA TRÙNG LẶP
export const addTourToList = createAsyncThunk(
  'saved/add', 
  async ({ listId, tour }, { rejectWithValue }) => {
    try {
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
      
      // ✅ KIỂM TRA TOUR ĐÃ CÓ CHƯA
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
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove tour from list
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

// Delete list
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
      .addCase(createNewList.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists.push(action.payload);
      })
      .addCase(createNewList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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