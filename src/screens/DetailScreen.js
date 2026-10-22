import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { SelectPicker } from '../components/SelectPicker';
import { useBooks } from '../context/BookContext';

const GENRE_OPTIONS = [
  { label: 'Choose genre', value: '' },
  { label: 'Fiction', value: 'Fiction' },
  { label: 'Non-Fiction', value: 'Non-Fiction' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Other', value: 'Other' },
];

const STATUS_OPTIONS = [
  { label: 'Choose status', value: '' },
  { label: 'To Read', value: 'To Read' },
  { label: 'Reading', value: 'Reading' },
  { label: 'Finished', value: 'Finished' },
];

export const DetailScreen = ({ route, navigation }) => {
  const { bookId } = route.params || {};
  const { books, updateBook, deleteBook, toggleFavorite } = useBooks();

  const currentBook = books.find((b) => b.id === bookId);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State for Edit
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editError, setEditError] = useState('');

  const handleStartEdit = () => {
    if (currentBook) {
      setTitle(currentBook.title || '');
      setAuthor(currentBook.author || '');
      setGenre(currentBook.genre || '');
      setStatus(currentBook.status || '');
      setRating(
        currentBook.rating !== null && currentBook.rating !== undefined
          ? String(currentBook.rating)
          : ''
      );
      setNotes(currentBook.notes || '');
    }
    setFormSubmitted(false);
    setFormErrors({});
    setEditError('');
    setIsEditing(true);
  };

  // If book was deleted or not found
  if (!currentBook) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Book not found or has been removed.</Text>
          <CustomButton
            title="Return to List"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const validateEditForm = (t, a, g, s, r, n) => {
    const errs = {};
    const tTrim = (t || '').trim();
    if (!tTrim) {
      errs.title = 'Title is required';
    } else if (t.length > 100) {
      errs.title = 'Title must be at most 100 characters';
    }

    const aTrim = (a || '').trim();
    if (!aTrim) {
      errs.author = 'Author is required';
    } else if (a.length > 60) {
      errs.author = 'Author must be at most 60 characters';
    }

    if (!g) {
      errs.genre = 'Please choose a genre';
    }

    if (!s) {
      errs.status = 'Please choose a status';
    }

    if (r !== '' && r !== null && r !== undefined) {
      const rTrim = String(r).trim();
      if (!/^[0-5]$/.test(rTrim)) {
        errs.rating = 'Rating must be a whole number from 0 to 5';
      }
    }

    if (n && n.length > 300) {
      errs.notes = 'Notes must be at most 300 characters';
    }

    return errs;
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      const trim = val.trim();
      if (!trim) {
        nextErrs.title = 'Title is required';
      } else if (val.length > 100) {
        nextErrs.title = 'Title must be at most 100 characters';
      } else {
        delete nextErrs.title;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleAuthorChange = (val) => {
    setAuthor(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      const trim = val.trim();
      if (!trim) {
        nextErrs.author = 'Author is required';
      } else if (val.length > 60) {
        nextErrs.author = 'Author must be at most 60 characters';
      } else {
        delete nextErrs.author;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleGenreChange = (val) => {
    setGenre(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      if (!val) {
        nextErrs.genre = 'Please choose a genre';
      } else {
        delete nextErrs.genre;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      if (!val) {
        nextErrs.status = 'Please choose a status';
      } else {
        delete nextErrs.status;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleRatingChange = (val) => {
    setRating(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      if (val !== '' && val !== null && val !== undefined) {
        if (!/^[0-5]$/.test(String(val).trim())) {
          nextErrs.rating = 'Rating must be a whole number from 0 to 5';
        } else {
          delete nextErrs.rating;
        }
      } else {
        delete nextErrs.rating;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleNotesChange = (val) => {
    setNotes(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      if (val && val.length > 300) {
        nextErrs.notes = 'Notes must be at most 300 characters';
      } else {
        delete nextErrs.notes;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleSave = async () => {
    setFormSubmitted(true);
    setEditError('');

    const errs = validateEditForm(title, author, genre, status, rating, notes);
    setFormErrors(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    try {
      setSaving(true);
      await updateBook(currentBook.id, {
        title,
        author,
        genre,
        status,
        rating,
        notes,
      });

      setIsEditing(false);
      setFormSubmitted(false);
      setFormErrors({});
    } catch (err) {
      setEditError(err.message || 'Failed to update book.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to current book values
    setTitle(currentBook.title || '');
    setAuthor(currentBook.author || '');
    setGenre(currentBook.genre || '');
    setStatus(currentBook.status || '');
    setRating(
      currentBook.rating !== null && currentBook.rating !== undefined
        ? String(currentBook.rating)
        : ''
    );
    setNotes(currentBook.notes || '');
    setFormSubmitted(false);
    setFormErrors({});
    setEditError('');
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${currentBook.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteBook(currentBook.id);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete book.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Book' : 'Book Details'}</Text>
        <TouchableOpacity
          onPress={() => toggleFavorite(currentBook.id, currentBook.favorite)}
          style={styles.starBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={currentBook.favorite ? 'star' : 'star-outline'}
            size={26}
            color={currentBook.favorite ? colors.starActive : colors.starInactive}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {/* Edit Error message */}
        {editError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorBannerText}>{editError}</Text>
          </View>
        ) : null}

        {isEditing ? (
          /* EDIT MODE */
          <View style={styles.card}>
            <CustomInput
              label="Title"
              placeholder="e.g. Dune"
              value={title}
              onChangeText={handleTitleChange}
              error={formErrors.title}
              testID="edit-title"
            />

            <CustomInput
              label="Author"
              placeholder="e.g. Frank Herbert"
              value={author}
              onChangeText={handleAuthorChange}
              error={formErrors.author}
              testID="edit-author"
            />

            <SelectPicker
              label="Genre"
              value={genre}
              onValueChange={handleGenreChange}
              options={GENRE_OPTIONS}
              placeholder="Choose genre"
              error={formErrors.genre}
              testID="edit-genre"
            />

            <SelectPicker
              label="Status"
              value={status}
              onValueChange={handleStatusChange}
              options={STATUS_OPTIONS}
              placeholder="Choose status"
              error={formErrors.status}
              testID="edit-status"
            />

            <CustomInput
              label="Rating (Optional, 0 to 5)"
              placeholder="e.g. 5"
              value={rating}
              onChangeText={handleRatingChange}
              keyboardType="number-pad"
              error={formErrors.rating}
              testID="edit-rating"
            />

            <CustomInput
              label="Notes (Optional, max 300 characters)"
              placeholder="Add your thoughts or favorite quotes..."
              value={notes}
              onChangeText={handleNotesChange}
              multiline
              numberOfLines={4}
              error={formErrors.notes}
              testID="edit-notes"
            />

            <View style={styles.editActionRow}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={handleCancel}
                style={styles.actionBtn}
              />
              <CustomButton
                title="Save"
                variant="primary"
                onPress={handleSave}
                loading={saving}
                style={styles.actionBtn}
                testID="edit-save-button"
              />
            </View>
          </View>
        ) : (
          /* VIEW MODE */
          <View style={styles.card}>
            <View style={styles.viewHeader}>
              <Text style={styles.viewTitle}>{currentBook.title}</Text>
              <Text style={styles.viewAuthor}>by {currentBook.author}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Genre</Text>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeText}>{currentBook.genre}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={[styles.badgeBox, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.badgeText, { color: colors.primaryDark }]}>
                  {currentBook.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rating</Text>
              <Text style={styles.detailValue}>
                {currentBook.rating !== null && currentBook.rating !== undefined
                  ? `${currentBook.rating} / 5 ⭐`
                  : 'No rating'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Favorite</Text>
              <Text style={styles.detailValue}>
                {currentBook.favorite ? 'Yes ⭐' : 'No'}
              </Text>
            </View>

            <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <Text style={[styles.detailLabel, { marginBottom: 6 }]}>Notes</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>
                  {currentBook.notes && currentBook.notes.trim()
                    ? currentBook.notes
                    : 'No notes added for this book.'}
                </Text>
              </View>
            </View>

            <View style={styles.viewActionRow}>
              <CustomButton
                title="Edit Book"
                variant="primary"
                icon={<Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />}
                onPress={handleStartEdit}
                style={styles.actionBtn}
                testID="button-edit-mode"
              />
              <CustomButton
                title="Delete Book"
                variant="danger"
                icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />}
                onPress={handleDelete}
                loading={deleting}
                style={styles.actionBtn}
                testID="button-delete-book"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  starBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#2D231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewHeader: {
    marginBottom: 16,
  },
  viewTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  viewAuthor: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  badgeBox: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  notesBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  viewActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
