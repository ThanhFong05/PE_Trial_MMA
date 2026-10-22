import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const BookContext = createContext({});

export const BookProvider = ({ children }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to user's books in Firestore
  useEffect(() => {
    if (!user) return;

    const booksRef = collection(db, 'books');
    const q = query(booksRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookList = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          bookList.push({
            ...data,
            id: docSnap.id,
          });
        });

        // Alphabetical order by title (case-insensitive; equal titles ordered by author)
        bookList.sort((a, b) => {
          const titleA = (a.title || '').trim().toLowerCase();
          const titleB = (b.title || '').trim().toLowerCase();
          const titleCmp = titleA.localeCompare(titleB);
          if (titleCmp !== 0) return titleCmp;

          const authorA = (a.author || '').trim().toLowerCase();
          const authorB = (b.author || '').trim().toLowerCase();
          return authorA.localeCompare(authorB);
        });

        setBooks(bookList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching books:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Check duplicate title + author (case-insensitive) for current user
  const isDuplicateBook = (title, author, excludeId = null) => {
    const tNorm = title.trim().toLowerCase();
    const aNorm = author.trim().toLowerCase();
    return books.some((b) => {
      if (excludeId && b.id === excludeId) return false;
      return (
        (b.title || '').trim().toLowerCase() === tNorm &&
        (b.author || '').trim().toLowerCase() === aNorm
      );
    });
  };

  // Add a book
  const addBook = async ({ title, author, genre, status, rating, notes }) => {
    if (!user) throw new Error('You must be logged in to add a book.');

    const tTrim = title.trim();
    const aTrim = author.trim();

    // Check duplicate
    if (isDuplicateBook(tTrim, aTrim)) {
      throw new Error('A book with this title and author already exists.');
    }

    // Deterministic doc ID to enforce uniqueness at Firestore Security Rules level
    const sanitizedTitle = tTrim.toLowerCase().replace(/[\/\s]+/g, '_');
    const sanitizedAuthor = aTrim.toLowerCase().replace(/[\/\s]+/g, '_');
    const docId = `${user.uid}_${sanitizedTitle}_${sanitizedAuthor}`;

    const bookDocRef = doc(db, 'books', docId);

    const newBookData = {
      id: docId,
      userId: user.uid,
      title: tTrim,
      author: aTrim,
      genre: genre,
      status: status,
      favorite: false,
      createdAt: serverTimestamp(),
    };

    if (rating !== undefined && rating !== null && rating !== '') {
      newBookData.rating = parseInt(rating, 10);
    } else {
      newBookData.rating = null;
    }

    if (notes !== undefined && notes !== null && notes !== '') {
      newBookData.notes = notes.trim();
    } else {
      newBookData.notes = '';
    }

    await setDoc(bookDocRef, newBookData);
  };

  // Toggle favorite
  const toggleFavorite = async (bookId, currentFavorite) => {
    if (!user) return;
    const bookDocRef = doc(db, 'books', bookId);
    await updateDoc(bookDocRef, {
      favorite: !currentFavorite,
    });
  };

  // Update a book
  const updateBook = async (bookId, { title, author, genre, status, rating, notes }) => {
    if (!user) throw new Error('You must be logged in to update a book.');

    const tTrim = title.trim();
    const aTrim = author.trim();

    if (isDuplicateBook(tTrim, aTrim, bookId)) {
      throw new Error('A book with this title and author already exists.');
    }

    const bookDocRef = doc(db, 'books', bookId);

    const updateData = {
      title: tTrim,
      author: aTrim,
      genre: genre,
      status: status,
    };

    if (rating !== undefined && rating !== null && rating !== '') {
      updateData.rating = parseInt(rating, 10);
    } else {
      updateData.rating = null;
    }

    if (notes !== undefined && notes !== null && notes !== '') {
      updateData.notes = notes.trim();
    } else {
      updateData.notes = '';
    }

    await updateDoc(bookDocRef, updateData);
  };

  // Delete a book
  const deleteBook = async (bookId) => {
    if (!user) throw new Error('You must be logged in to delete a book.');
    const bookDocRef = doc(db, 'books', bookId);
    await deleteDoc(bookDocRef);
  };

  const activeBooks = user ? books : [];
  const activeLoading = user ? loading : false;

  return (
    <BookContext.Provider
      value={{
        books: activeBooks,
        loading: activeLoading,
        addBook,
        toggleFavorite,
        updateBook,
        deleteBook,
        isDuplicateBook,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => useContext(BookContext);
